import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { directAIComplete, isAIGloballyEnabled, parseJsonFromAI, resolveDirectAI } from "../_shared/direct-ai.ts";

interface GeneratedObjection {
  objection: string;
  response: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    if (!(await isAIGloballyEnabled(admin))) {
      return jsonResponse({ error: "IA desligada no painel admin." }, 403);
    }

    const auth = req.headers.get("Authorization");
    if (auth) {
      const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const userClient = createClient(supabaseUrl, anon, {
        global: { headers: { Authorization: auth } },
      });
      const { data: ud } = await userClient.auth.getUser();
      if (!ud?.user) return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const { course_id, courseContext } = await req.json();
    if (!course_id) return jsonResponse({ error: "course_id obrigatório" }, 400);

    const { data: route } = await admin
      .from("ai_routing")
      .select("provider, model")
      .eq("capability", "content_generation")
      .maybeSingle();

    const ai = await resolveDirectAI(admin, route?.provider as "gemini" | "openrouter" | null);
    if (route?.model) ai.model = route.model as string;

    const ctx = courseContext || {};
    const systemPrompt = `Você é especialista em vendas B2B de educação em saúde (Inforhealth).
Gere objeções comuns de matrícula e respostas consultivas para o curso.`;

    const userPrompt = `Curso: ${ctx.titulo || "—"}
Modalidade: ${ctx.modalidade || "—"}
Resumo: ${ctx.resumo || "—"}

Gere 6 objeções típicas (preço, tempo, aprovação RH, etc.) com respostas curtas e profissionais.

Retorne APENAS JSON:
{"objections":[{"objection":"...","response":"..."}]}`;

    const raw = await directAIComplete(ai, systemPrompt, userPrompt);
    let parsed: { objections: GeneratedObjection[] };
    try {
      parsed = parseJsonFromAI(raw) as { objections: GeneratedObjection[] };
    } catch {
      return jsonResponse({ error: "IA retornou formato inválido" }, 500);
    }

    const items = (parsed.objections || []).filter((o) => o.objection?.trim() && o.response?.trim());
    if (!items.length) return jsonResponse({ error: "Nenhuma objeção gerada" }, 500);

    await admin.from("course_objections").delete().eq("course_id", course_id);

    const rows = items.map((o, i) => ({
      course_id,
      objection: o.objection.trim(),
      response: o.response.trim(),
      ordem: i,
    }));

    const { data: inserted, error: insErr } = await admin
      .from("course_objections")
      .insert(rows)
      .select();

    if (insErr) return jsonResponse({ error: insErr.message }, 500);

    return jsonResponse({ objections: inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return jsonResponse({ error: message }, 500);
  }
});
