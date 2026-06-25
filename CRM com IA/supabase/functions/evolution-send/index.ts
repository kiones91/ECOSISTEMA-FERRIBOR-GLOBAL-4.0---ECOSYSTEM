import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { loadEvolutionSettings } from "../_shared/evolution.ts";

async function evoSend(url: string, apikey: string, path: string, body: Record<string, unknown>) {
  const res = await fetch(`${url}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed: unknown = text;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    /* texto */
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Não autorizado" }, 401);

  const supabaseUser = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: userData } = await supabaseUser.auth.getUser();
  if (!userData.user) return jsonResponse({ error: "Não autorizado" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { conversation_id, text, phone } = await req.json();
  if (!conversation_id || !text?.trim()) {
    return jsonResponse({ error: "conversation_id e text obrigatórios" }, 400);
  }

  const { data: conv } = await supabase
    .from("inbox_conversations")
    .select("*")
    .eq("id", conversation_id)
    .single();

  if (!conv) return jsonResponse({ error: "Conversa não encontrada" }, 404);

  let evolutionSent = false;
  const targetPhone = phone ?? conv.contact_phone;

  if (conv.channel === "whatsapp" && targetPhone) {
    const settings = await loadEvolutionSettings(supabase);
    const { data: instance } = await supabase
      .from("evolution_instances")
      .select("instance_name, instance_token, status")
      .order("criado_em", { ascending: true })
      .limit(1)
      .maybeSingle();

    const connected = instance?.status === "connected" || instance?.status === "paired";
    if (settings.apiUrl && instance?.instance_token && connected) {
      const number = String(targetPhone).replace(/\D/g, "");
      const res = await evoSend(settings.apiUrl, instance.instance_token, "/send/text", {
        number,
        text: text.trim(),
      });
      evolutionSent = res.ok;
      if (!res.ok) console.warn("evolution send:", res.body);
    }
  }

  const { data: msg, error } = await supabase
    .from("inbox_messages")
    .insert({
      conversation_id,
      direction: "outbound",
      body: text.trim(),
      sender_type: "agent",
      sender_user_id: userData.user.id,
    })
    .select("id")
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  await supabase
    .from("inbox_conversations")
    .update({ unread_count: 0, status: "open" })
    .eq("id", conversation_id);

  return jsonResponse({ ok: true, message_id: msg.id, evolution_sent: evolutionSent });
});
