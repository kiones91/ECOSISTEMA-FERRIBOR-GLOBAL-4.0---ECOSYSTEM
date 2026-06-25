import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { directAIComplete, isAIGloballyEnabled, parseJsonFromAI, resolveDirectAI } from "./direct-ai.ts";
import {
  loadGlobalAgent,
  runCoordinator,
  type CoordinatorDecision,
  type CourseAgentRow,
  type OperatorType,
} from "./coordinator.ts";
import { searchCourseRAG } from "./rag.ts";

export type AgentType = OperatorType;

export interface BotTurnResult {
  reply: string;
  leadUpdated: boolean;
  stageMoved: string | null;
  agentType?: AgentType;
  ticketCreated?: number | null;
  coordinatorCourse?: string | null;
  needsHuman?: boolean;
  skipped?: string;
}

interface LeadUpdates {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  empresa?: string | null;
  curso_interesse?: string | null;
  curso_interesse_slug?: string | null;
  tags?: string[] | null;
}

interface AIResponse {
  reply?: string;
  lead_updates?: LeadUpdates;
  pipeline_stage_slug?: string | null;
  open_ticket?: { assunto?: string; prioridade?: string } | null;
  request_human?: boolean;
  human_reason?: string | null;
}

const SDR_STAGES = new Set(["novo", "contato"]);
const CLOSER_STAGES = new Set(["contato", "proposta"]);
const SITE_BASE = "https://inforhealth.buffallos.com.br";
const WHATSAPP = "+55 19 99777-3084";

const PUBLIC_IDENTITY = `IDENTIDADE (frente ao cliente):
- Você fala em nome da Inforhealth — uma equipe só.
- NUNCA diga "sou o SDR", "Closer", "transferindo" ou "outro departamento".
- Transições internas são invisíveis.`;

function buildOperatorPrompt(
  agent: CourseAgentRow,
  agentType: OperatorType,
  extras: {
    stages: Array<{ slug: string; nome: string }>;
    courses: Array<{ slug: string; titulo: string }>;
    salesContext: string;
    ragContext: string;
    checkoutInfo: string;
    coordinatorNote: string;
    courseFocus: string;
  },
): string {
  const stageList = extras.stages.map((s) => `- ${s.slug}: ${s.nome}`).join("\n");
  const courseList = extras.courses.slice(0, 60).map((c) => `- ${c.slug}: ${c.titulo}`).join("\n");

  let crmBlock = "";
  let jsonShape = `{
  "reply": "texto para o visitante",
  "lead_updates": { "nome": null, "email": null, "telefone": null, "empresa": null, "curso_interesse": null, "curso_interesse_slug": null, "tags": null },
  "pipeline_stage_slug": null,
  "request_human": false,
  "human_reason": null
}`;

  if (agentType === "closer") {
    crmBlock = `PIPELINE: estágios permitidos contato, proposta. Use "proposta" ao enviar proposta/checkout.
${extras.checkoutInfo}
Envie links de curso, checkout, in-company ou catálogo quando relevante.`;
  } else if (agentType === "support") {
    crmBlock = `SUPORTE: use RAG. open_ticket se não resolver. Envie links (portal, curso, contato).
Não venda cursos novos — se houver interesse comercial, responda brevemente e deixe o fluxo natural.`;
    jsonShape = `{
  "reply": "texto para o visitante",
  "open_ticket": null,
  "request_human": false,
  "human_reason": null
}`;
  } else {
    crmBlock = `CRM: qualifique e atualize lead. Pipeline só até contato. Envie links de curso/catálogo/in-company.
Se pedir preço/checkout, responda com empatia e informe que detalha condições — o coordenador pode rotear ao closer no próximo turno.`;
  }

  return `Você é um consultor da Inforhealth Educação (${agent.name} — uso interno apenas).

OBJETIVO:
${agent.primary_objective}

PODE:
${(agent.can_do || []).map((x) => `- ${x}`).join("\n")}

NÃO PODE:
${(agent.cannot_do || []).map((x) => `- ${x}`).join("\n")}

HANDOFF HUMANO:
${(agent.handoff_triggers || []).map((x) => `- ${x}`).join("\n")}

TOM: ${agent.tone_style} · Mensagens: ${agent.message_style}

${PUBLIC_IDENTITY}

LINKS:
- Catálogo: ${SITE_BASE}/cursos.html
- In-company: ${SITE_BASE}/in-company.html
- Contato: ${SITE_BASE}/contato.html
- Portal aluno: https://edu.inforhealth.com.br/aluno
- Curso: ${SITE_BASE}/cursos/{slug}.html
- Checkout: ${SITE_BASE}/checkout.html?curso={slug}
- WhatsApp: ${WHATSAPP}

${crmBlock}

${extras.courseFocus}
${extras.coordinatorNote ? `NOTA DO COORDENADOR (interno): ${extras.coordinatorNote}` : ""}

ESTÁGIOS:
${stageList}

CURSOS:
${courseList}

${extras.salesContext}
${extras.ragContext}

${agent.additional_prompt || ""}

JSON (sem markdown):
${jsonShape}`;
}

async function resolveCourseId(admin: SupabaseClient, slug: string | null | undefined): Promise<string | null> {
  if (!slug?.trim()) return null;
  const { data } = await admin.from("lms_courses").select("id").eq("slug", slug.trim()).maybeSingle();
  return data?.id ?? null;
}

async function getStageSlug(admin: SupabaseClient, stageId: string | null | undefined): Promise<string> {
  if (!stageId) return "novo";
  const { data } = await admin.from("pipeline_stages").select("slug").eq("id", stageId).maybeSingle();
  return data?.slug || "novo";
}

async function applyLeadTags(admin: SupabaseClient, leadId: string, tagNames: string[]): Promise<void> {
  for (const raw of tagNames.slice(0, 5)) {
    const nome = raw.trim().slice(0, 40);
    if (!nome) continue;
    let tagId: string | null = null;
    const { data: existing } = await admin.from("lead_tags").select("id").eq("nome", nome).maybeSingle();
    if (existing?.id) tagId = existing.id;
    else {
      const { data: created } = await admin.from("lead_tags").insert({ nome }).select("id").single();
      tagId = created?.id ?? null;
    }
    if (tagId) {
      await admin.from("lead_tag_assignments").upsert(
        { lead_id: leadId, tag_id: tagId },
        { onConflict: "lead_id,tag_id", ignoreDuplicates: true },
      );
    }
  }
}

async function loadSalesContext(admin: SupabaseClient, courseId: string | null): Promise<string> {
  if (!courseId) return "";
  const [{ data: profile }, { data: objections }, { data: course }] = await Promise.all([
    admin.from("course_sales_profile").select("*").eq("course_id", courseId).maybeSingle(),
    admin.from("course_objections").select("objection, response").eq("course_id", courseId).order("ordem").limit(8),
    admin.from("lms_courses").select("titulo, slug, resumo, preco_brl, preco_parcelas, checkout_ativo, modalidade").eq("id", courseId).maybeSingle(),
  ]);
  if (!profile && !course) return "";
  const lines = ["CONTEXTO DO CURSO EM FOCO:"];
  if (course) {
    lines.push(`Curso: ${course.titulo} (${course.slug})`);
    if (course.preco_brl) lines.push(`Preço: R$ ${course.preco_brl}`);
    if (course.preco_parcelas) lines.push(`Parcelamento: ${course.preco_parcelas}`);
    lines.push(`Modalidade: ${course.modalidade}`);
  }
  if (profile?.short_description) lines.push(`Pitch: ${profile.short_description}`);
  if (profile?.icp) lines.push(`ICP: ${profile.icp}`);
  if (profile?.pitch_30s) lines.push(`Pitch 30s: ${profile.pitch_30s}`);
  if (objections?.length) {
    lines.push("Objeções:");
    for (const o of objections) lines.push(`- "${o.objection}" → ${o.response}`);
  }
  return lines.join("\n");
}

async function loadCheckoutInfo(admin: SupabaseClient, courseId: string | null): Promise<string> {
  if (!courseId) return "";
  const { data: course } = await admin
    .from("lms_courses")
    .select("slug, checkout_ativo, modalidade")
    .eq("id", courseId)
    .maybeSingle();
  if (!course?.slug) return "";
  const landing = `${SITE_BASE}/cursos/${course.slug}.html`;
  if (course.checkout_ativo && course.modalidade === "gravado") {
    return `Checkout: ${SITE_BASE}/checkout.html?curso=${course.slug} · Landing: ${landing}`;
  }
  return `Landing: ${landing} · In-company: ${SITE_BASE}/in-company.html`;
}

async function createSupportTicket(
  admin: SupabaseClient,
  conv: { contact_name?: string | null; contact_email?: string | null },
  lead: Record<string, unknown> | null,
  ticket: { assunto?: string; prioridade?: string },
  transcript: string,
): Promise<number | null> {
  const assunto = ticket.assunto?.trim();
  if (!assunto) return null;
  const prioridades = new Set(["baixa", "normal", "alta", "urgente"]);
  const prioridade = prioridades.has(ticket.prioridade || "") ? ticket.prioridade! : "normal";
  const email = (lead?.email as string)?.trim() || conv.contact_email?.trim() || "sem-email@webchat.local";
  const nome = (lead?.nome as string)?.trim() || conv.contact_name || "Visitante";

  const { data, error } = await admin
    .from("support_tickets")
    .insert({ assunto: assunto.slice(0, 200), aluno_email: email, aluno_nome: nome, status: "open", prioridade })
    .select("id, numero")
    .single();
  if (error || !data) return null;

  await admin.from("support_messages").insert({
    ticket_id: data.id,
    body: `Ticket automático IA.\n\n${transcript.slice(0, 500)}`,
    direction: "inbound",
  });
  return data.numero as number;
}

async function flagHumanHandoff(
  admin: SupabaseClient,
  conversationId: string,
  leadId: string | null,
  reason: string,
): Promise<void> {
  await admin
    .from("inbox_conversations")
    .update({ needs_human: true, atualizado_em: new Date().toISOString() })
    .eq("id", conversationId);

  if (leadId) {
    await admin.from("interactions").insert({
      lead_id: leadId,
      tipo: "nota",
      canal: "webchat",
      conteudo: `[HANDOFF HUMANO] ${reason.slice(0, 400)}`,
    });
  }
}

function buildCourseFocus(decision: CoordinatorDecision, courses: Array<{ slug: string; titulo: string }>): string {
  const lines: string[] = [];
  if (decision.primary_course_slug) {
    const c = courses.find((x) => x.slug === decision.primary_course_slug);
    lines.push(`CURSO EM FOCO: ${c?.titulo || decision.primary_course_slug} (${decision.primary_course_slug})`);
  }
  if (decision.secondary_course_slugs.length) {
    const names = decision.secondary_course_slugs
      .map((s) => courses.find((c) => c.slug === s)?.titulo || s)
      .join(", ");
    lines.push(`OUTROS CURSOS MENCIONADOS: ${names}`);
  }
  return lines.join("\n");
}

export async function runAgentTurn(admin: SupabaseClient, conversationId: string): Promise<BotTurnResult> {
  const { data: setting } = await admin
    .from("integration_settings")
    .select("value")
    .eq("key", "ai_webchat_auto")
    .maybeSingle();
  if (setting?.value === "false") {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "webchat_auto_off" };
  }
  if (!(await isAIGloballyEnabled(admin))) {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "ai_global_off" };
  }

  const coordinator = await loadGlobalAgent(admin, "orchestrator");
  if (!coordinator) {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "no_coordinator" };
  }

  const { data: conv } = await admin
    .from("inbox_conversations")
    .select("id, lead_id, contact_name, contact_email, active_agent_type, active_course_slug, needs_human")
    .eq("id", conversationId)
    .maybeSingle();
  if (!conv) return { reply: "", leadUpdated: false, stageMoved: null, skipped: "no_conversation" };

  const { data: messages } = await admin
    .from("inbox_messages")
    .select("direction, body, sender_type, criado_em")
    .eq("conversation_id", conversationId)
    .neq("sender_type", "system")
    .order("criado_em", { ascending: true })
    .limit(40);

  const transcript = (messages || [])
    .map((m) => `${m.direction === "outbound" ? "Inforhealth" : "Visitante"}: ${m.body}`)
    .join("\n");
  if (!transcript.trim()) {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "empty_transcript" };
  }

  const lastVisitor = [...(messages || [])].reverse().find((m) => m.direction === "inbound")?.body || "";

  let lead: Record<string, unknown> | null = null;
  if (conv.lead_id) {
    const { data } = await admin
      .from("leads")
      .select("id, nome, email, telefone, empresa, curso_interesse, curso_interesse_id, pipeline_stage_id")
      .eq("id", conv.lead_id)
      .maybeSingle();
    lead = data;
  }

  const [{ data: stages }, { data: courses }] = await Promise.all([
    admin.from("pipeline_stages").select("slug, nome").order("ordem"),
    admin.from("lms_courses").select("slug, titulo").eq("status", "published").order("titulo").limit(100),
  ]);

  const stageSlug = await getStageSlug(admin, lead?.pipeline_stage_id as string | undefined);
  const leadContext = lead
    ? `Lead: nome=${lead.nome} email=${lead.email ?? "—"} empresa=${lead.empresa ?? "—"} curso=${lead.curso_interesse ?? "—"}`
    : `Lead não vinculado. Contato: ${conv.contact_name ?? "Visitante"}`;

  const { data: aiRoute } = await admin
    .from("ai_routing")
    .select("provider, model")
    .eq("capability", "agent_chat")
    .maybeSingle();
  const ai = await resolveDirectAI(admin, aiRoute?.provider as "gemini" | "openrouter" | null);
  if (aiRoute?.model) ai.model = aiRoute.model as string;

  const decision = await runCoordinator(admin, ai, coordinator, {
    transcript,
    lastVisitor,
    leadContext,
    stageSlug,
    activeAgent: conv.active_agent_type,
    activeCourseSlug: conv.active_course_slug,
    courses: courses || [],
  });

  let agentType = decision.agent;
  let agent = await loadGlobalAgent(admin, agentType);
  if (!agent) {
    agentType = "sdr";
    agent = await loadGlobalAgent(admin, "sdr");
  }
  if (!agent) {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "no_operator" };
  }

  const courseSlug =
    decision.primary_course_slug ||
    conv.active_course_slug ||
    (courses || []).find((c) => lead?.curso_interesse_id && c.slug)?.slug ||
    null;
  const courseId = await resolveCourseId(admin, courseSlug);

  const [salesContext, ragContext, checkoutInfo] = await Promise.all([
    loadSalesContext(admin, courseId),
    searchCourseRAG(admin, courseId, lastVisitor || transcript.slice(-400)),
    agentType === "closer" ? loadCheckoutInfo(admin, courseId) : Promise.resolve(""),
  ]);

  const systemPrompt = buildOperatorPrompt(agent, agentType, {
    stages: stages || [],
    courses: courses || [],
    salesContext,
    ragContext,
    checkoutInfo,
    coordinatorNote: decision.focus_note,
    courseFocus: buildCourseFocus(decision, courses || []),
  });

  const userPrompt = `${leadContext}

Histórico:
${transcript}

Responda ao visitante (operador: ${agentType}).`;

  const raw = await directAIComplete(ai, systemPrompt, userPrompt);
  let parsed: AIResponse;
  try {
    parsed = parseJsonFromAI(raw) as AIResponse;
  } catch {
    parsed = { reply: raw.replace(/^```[\s\S]*?```$/m, "").trim() };
  }

  let reply = (parsed.reply || "").trim();
  const needsHuman = decision.request_human || parsed.request_human === true;
  const humanReason = parsed.human_reason || decision.human_reason || "Solicitação de atendimento humano";

  if (needsHuman && !reply.toLowerCase().includes("consultor")) {
    reply = `${reply}\n\nUm consultor da nossa equipe vai dar continuidade em breve. Se preferir, fale conosco no WhatsApp ${WHATSAPP}.`.trim();
  }

  if (!reply) {
    return { reply: "", leadUpdated: false, stageMoved: null, skipped: "empty_reply" };
  }

  let leadId = conv.lead_id as string | null;
  let leadUpdated = false;
  let stageMoved: string | null = null;
  let ticketCreated: number | null = null;

  if (agentType !== "support") {
    const updates = parsed.lead_updates || {};
    const leadPatch: Record<string, unknown> = { atualizado_em: new Date().toISOString() };

    if (updates.nome?.trim() && updates.nome.trim() !== "Visitante") leadPatch.nome = updates.nome.trim();
    if (updates.email?.trim()) leadPatch.email = updates.email.trim();
    if (updates.telefone?.trim()) leadPatch.telefone = updates.telefone.trim();
    if (updates.empresa?.trim()) leadPatch.empresa = updates.empresa.trim();
    if (updates.curso_interesse?.trim()) leadPatch.curso_interesse = updates.curso_interesse.trim();

    const slugForLead = updates.curso_interesse_slug || courseSlug;
    const resolvedCourseId = await resolveCourseId(admin, slugForLead);
    if (resolvedCourseId) {
      leadPatch.curso_interesse_id = resolvedCourseId;
      if (!updates.curso_interesse?.trim()) {
        const match = (courses || []).find((c) => c.slug === slugForLead);
        if (match) leadPatch.curso_interesse = match.titulo;
      }
    }

    const stageSlugUpdate = parsed.pipeline_stage_slug?.trim().toLowerCase();
    const allowed = agentType === "closer" ? CLOSER_STAGES : SDR_STAGES;
    if (stageSlugUpdate && allowed.has(stageSlugUpdate) && agent.tool_flags?.can_update_pipeline !== false) {
      const { data: stageRow } = await admin.from("pipeline_stages").select("id").eq("slug", stageSlugUpdate).maybeSingle();
      if (stageRow?.id) {
        leadPatch.pipeline_stage_id = stageRow.id;
        stageMoved = stageSlugUpdate;
      }
    }

    if (Object.keys(leadPatch).length > 1) {
      if (!leadId) {
        const { data: novoStage } = await admin.from("pipeline_stages").select("id").eq("slug", "novo").maybeSingle();
        const { data: created } = await admin
          .from("leads")
          .insert({
            nome: (leadPatch.nome as string) || conv.contact_name || "Visitante",
            email: (leadPatch.email as string) || conv.contact_email || null,
            telefone: leadPatch.telefone || null,
            empresa: leadPatch.empresa || null,
            curso_interesse: leadPatch.curso_interesse || null,
            curso_interesse_id: leadPatch.curso_interesse_id || null,
            pipeline_stage_id: leadPatch.pipeline_stage_id || novoStage?.id || null,
            origem: "webchat",
          })
          .select("id")
          .single();
        if (created?.id) {
          leadId = created.id;
          await admin.from("inbox_conversations").update({ lead_id: leadId }).eq("id", conversationId);
          leadUpdated = true;
        }
      } else {
        await admin.from("leads").update(leadPatch).eq("id", leadId);
        leadUpdated = true;
      }
    }

    if (leadId && updates.tags?.length && agent.tool_flags?.can_apply_tags !== false) {
      await applyLeadTags(admin, leadId, updates.tags.filter((t): t is string => !!t?.trim()));
      leadUpdated = true;
    }
  }

  if (agentType === "support" && parsed.open_ticket?.assunto && agent.tool_flags?.can_open_ticket !== false) {
    ticketCreated = await createSupportTicket(admin, conv, lead, parsed.open_ticket, transcript);
  }

  if (needsHuman) {
    await flagHumanHandoff(admin, conversationId, leadId, humanReason);
  }

  if (leadId) {
    await admin.from("interactions").insert({
      lead_id: leadId,
      tipo: "nota",
      canal: "webchat",
      conteudo: `[${agentType.toUpperCase()}] ${reply.slice(0, 400)}`,
    });
  }

  await admin.from("inbox_messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    body: reply,
    sender_type: "agent",
  });

  await admin
    .from("inbox_conversations")
    .update({
      active_agent_type: agentType,
      active_course_slug: courseSlug,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return {
    reply,
    leadUpdated,
    stageMoved,
    agentType,
    ticketCreated,
    coordinatorCourse: courseSlug,
    needsHuman,
  };
}

export async function runSdrTurn(admin: SupabaseClient, conversationId: string): Promise<BotTurnResult> {
  return runAgentTurn(admin, conversationId);
}
