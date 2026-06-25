import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { runAgentTurn } from "../_shared/agent-chat-runtime.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const auth = req.headers.get("Authorization");
    const token = auth?.replace("Bearer ", "") ?? "";
    if (token !== serviceKey) {
      return jsonResponse({ error: "Não autorizado" }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const conversationId = String(body.conversation_id ?? "");
    if (!conversationId) {
      return jsonResponse({ error: "conversation_id obrigatório" }, 400);
    }

    const result = await runAgentTurn(admin, conversationId);
    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("webchat-agente:", message);
    return jsonResponse({ error: message }, 500);
  }
});
