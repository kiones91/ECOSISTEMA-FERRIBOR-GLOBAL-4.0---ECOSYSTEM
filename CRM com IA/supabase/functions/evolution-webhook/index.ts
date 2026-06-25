import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { extractConnectionState, isConnectedState } from "../_shared/evolution.ts";

function parseInbound(payload: Record<string, unknown>) {
  const event = String(payload.event ?? "").toLowerCase();
  const data = (payload.data ?? payload) as Record<string, unknown>;

  if (event.includes("connection")) {
    return { type: "connection" as const, state: extractConnectionState(data) };
  }

  const key = (data.key ?? {}) as Record<string, unknown>;
  const fromMe = Boolean(key.fromMe ?? data.fromMe);
  if (fromMe) return { type: "skip" as const };

  const remoteJid = String(key.remoteJid ?? data.remoteJid ?? "");
  const phone = remoteJid.replace(/@.*/, "").replace(/\D/g, "");
  const msg = (data.message ?? {}) as Record<string, unknown>;
  const text =
    (msg.conversation as string) ??
    ((msg.extendedTextMessage as Record<string, unknown>)?.text as string) ??
    (data.body as string) ??
    "";

  const contactName = String(data.pushName ?? payload.pushName ?? `WhatsApp ${phone.slice(-4)}`);

  if (!phone || !text) return { type: "skip" as const };
  return { type: "message" as const, phone, text, contactName, externalId: String(key.id ?? "") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const payload = (await req.json()) as Record<string, unknown>;
    const parsed = parseInbound(payload);

    if (parsed.type === "connection") {
      const open = parsed.state === "open" || parsed.state === "connected";
      const status = open ? "connected" : "disconnected";
      if (open) {
        await supabase
          .from("evolution_instances")
          .update({ status, qr_code_base64: null })
          .neq("id", "00000000-0000-0000-0000-000000000000");
      } else {
        await supabase
          .from("evolution_instances")
          .update({ status: "qr_pending" })
          .eq("status", "connected");
      }
      return jsonResponse({ ok: true, connection: parsed.state });
    }

    if (parsed.type === "skip") {
      return jsonResponse({ ok: true, ignored: true });
    }

    const { phone, text, contactName, externalId } = parsed;

    let { data: conv } = await supabase
      .from("inbox_conversations")
      .select("id")
      .eq("channel", "whatsapp")
      .eq("external_id", phone)
      .maybeSingle();

    if (!conv) {
      const { data: lead } = await supabase
        .from("leads")
        .select("id, nome")
        .or(`telefone.ilike.%${phone.slice(-8)}%`)
        .limit(1)
        .maybeSingle();

      const { data: created, error } = await supabase
        .from("inbox_conversations")
        .insert({
          channel: "whatsapp",
          lead_id: lead?.id ?? null,
          contact_name: lead?.nome ?? contactName,
          contact_phone: phone,
          status: "open",
          external_id: phone,
        })
        .select("id")
        .single();

      if (error) throw error;
      conv = created;
    }

    await supabase.from("inbox_messages").insert({
      conversation_id: conv.id,
      direction: "inbound",
      body: text,
      sender_type: "contact",
      external_id: externalId || null,
    });

    return jsonResponse({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
