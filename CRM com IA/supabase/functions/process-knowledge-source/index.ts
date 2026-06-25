import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { isAIGloballyEnabled } from "../_shared/direct-ai.ts";
import { ingestKnowledgeSource } from "../_shared/rag.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const auth = req.headers.get("Authorization");
    const token = auth?.replace("Bearer ", "") ?? "";
    const isService = token === serviceKey;

    if (!isService) {
      const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
      const userClient = createClient(supabaseUrl, anon, {
        global: { headers: { Authorization: auth || "" } },
      });
      const { data: ud } = await userClient.auth.getUser();
      if (!ud?.user) return jsonResponse({ error: "Não autorizado" }, 401);
    }

    if (!(await isAIGloballyEnabled(admin))) {
      return jsonResponse({ error: "IA desligada no painel admin." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const sourceId = String(body.source_id ?? "");
    if (!sourceId) return jsonResponse({ error: "source_id obrigatório" }, 400);

    const result = await ingestKnowledgeSource(admin, sourceId);
    return jsonResponse({ ok: true, chunk_count: result.chunkCount });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return jsonResponse({ error: message }, 500);
  }
});
