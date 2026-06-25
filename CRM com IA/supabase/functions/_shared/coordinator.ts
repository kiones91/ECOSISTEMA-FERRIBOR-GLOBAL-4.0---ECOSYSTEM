import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { directAIComplete, parseJsonFromAI, resolveDirectAI } from "./direct-ai.ts";
import { searchCourseRAG } from "./rag.ts";

export type OperatorType = "sdr" | "closer" | "support";

export interface CoordinatorDecision {
  agent: OperatorType;
  primary_course_slug: string | null;
  secondary_course_slugs: string[];
  focus_note: string;
  request_human: boolean;
  human_reason: string | null;
}

export interface CourseAgentRow {
  id: string;
  name: string;
  agent_type: string;
  primary_objective: string | null;
  can_do: string[];
  cannot_do: string[];
  handoff_triggers: string[];
  tone_style: string;
  message_style: string;
  additional_prompt: string | null;
  tool_flags: Record<string, boolean>;
}

const AGENT_SELECT =
  "id, name, agent_type, primary_objective, can_do, cannot_do, handoff_triggers, tone_style, message_style, additional_prompt, tool_flags";

export async function loadGlobalAgent(
  admin: SupabaseClient,
  agentType: "orchestrator" | OperatorType,
): Promise<CourseAgentRow | null> {
  const { data } = await admin
    .from("course_agents")
    .select(AGENT_SELECT)
    .eq("agent_type", agentType)
    .is("course_id", null)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as CourseAgentRow | null;
}

export async function runCoordinator(
  admin: SupabaseClient,
  ai: Awaited<ReturnType<typeof resolveDirectAI>>,
  coordinator: CourseAgentRow,
  input: {
    transcript: string;
    lastVisitor: string;
    leadContext: string;
    stageSlug: string;
    activeAgent: string | null;
    activeCourseSlug: string | null;
    courses: Array<{ slug: string; titulo: string }>;
  },
): Promise<CoordinatorDecision> {
  const courseList = input.courses
    .slice(0, 80)
    .map((c) => `- ${c.slug}: ${c.titulo}`)
    .join("\n");

  const companyRag = await searchCourseRAG(admin, null, input.lastVisitor || input.transcript.slice(-500));

  const systemPrompt = `Você é o ${coordinator.name} — coordenador interno da equipe comercial Inforhealth.
Você NÃO fala com o visitante. Sua única função é analisar a conversa e decidir qual especialista responde no próximo turno.

OBJETIVO:
${coordinator.primary_objective}

REGRAS:
- Transição entre agentes é SILENCIOSA para o visitante (nunca mencionar transferência).
- Se o visitante mencionar MAIS DE UM CURSO, escolha primary_course_slug do curso em discussão AGORA; liste outros em secondary_course_slugs.
- Se mudou de assunto (ex.: de DRG para portal do aluno), troque o agente adequadamente.
- agent "sdr": qualificação, primeiro contato, curiosidade, múltiplos cursos sem intenção de compra.
- agent "closer": preço, matrícula, checkout, proposta, objeções comerciais, lead em contato/proposta.
- agent "support": portal, certificado, acesso, aluno matriculado, problema técnico.
- request_human: true para in-company com agenda de docentes, negociação complexa, reclamação grave, pedido explícito de humano.

Estágio pipeline atual: ${input.stageSlug}
Agente ativo anterior: ${input.activeAgent ?? "nenhum"}
Curso em foco anterior: ${input.activeCourseSlug ?? "nenhum"}

CATÁLOGO (slug → título):
${courseList}

${companyRag}

${coordinator.additional_prompt || ""}

Responda APENAS JSON:
{
  "agent": "sdr" | "closer" | "support",
  "primary_course_slug": "slug-ou-null",
  "secondary_course_slugs": [],
  "focus_note": "nota interna curta para o operador",
  "request_human": false,
  "human_reason": null
}`;

  const userPrompt = `${input.leadContext}

Histórico:
${input.transcript}

Última mensagem do visitante:
${input.lastVisitor}

Decida o roteamento interno.`;

  const raw = await directAIComplete(ai, systemPrompt, userPrompt);
  let parsed: CoordinatorDecision;
  try {
    const j = parseJsonFromAI(raw) as Record<string, unknown>;
    const agent = String(j.agent || "sdr").toLowerCase();
    const valid: OperatorType[] = ["sdr", "closer", "support"];
    parsed = {
      agent: valid.includes(agent as OperatorType) ? (agent as OperatorType) : "sdr",
      primary_course_slug: j.primary_course_slug ? String(j.primary_course_slug) : null,
      secondary_course_slugs: Array.isArray(j.secondary_course_slugs)
        ? j.secondary_course_slugs.map(String).slice(0, 5)
        : [],
      focus_note: String(j.focus_note || ""),
      request_human: j.request_human === true,
      human_reason: j.human_reason ? String(j.human_reason) : null,
    };
  } catch {
    parsed = {
      agent: "sdr",
      primary_course_slug: input.activeCourseSlug,
      secondary_course_slugs: [],
      focus_note: "",
      request_human: false,
      human_reason: null,
    };
  }

  if (parsed.primary_course_slug) {
    const ok = input.courses.some((c) => c.slug === parsed.primary_course_slug);
    if (!ok) parsed.primary_course_slug = input.activeCourseSlug;
  }

  return parsed;
}
