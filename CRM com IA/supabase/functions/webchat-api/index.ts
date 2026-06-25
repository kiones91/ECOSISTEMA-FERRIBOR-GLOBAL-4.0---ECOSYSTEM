import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

function supabaseAdmin() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
}

async function getSession(sb: ReturnType<typeof createClient>, token: string) {
  const { data, error } = await sb
    .from("webchat_sessions")
    .select("id, conversation_id, visitor_name, visitor_email")
    .eq("session_token", token)
    .maybeSingle();
  if (error) throw error;
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const sb = supabaseAdmin();

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("session_token");
      if (!token) return jsonResponse({ error: "session_token obrigatório" }, 400);

      const session = await getSession(sb, token);
      if (!session) return jsonResponse({ error: "sessão inválida" }, 404);

      const { data: messages } = await sb
        .from("inbox_messages")
        .select("id, direction, body, sender_type, criado_em")
        .eq("conversation_id", session.conversation_id)
        .order("criado_em", { ascending: true });

      return jsonResponse({ messages: messages ?? [] });
    }

    const body = await req.json();
    const action = body.action as string;

    if (action === "start") {
      const name = String(body.name ?? "Visitante").trim() || "Visitante";
      const email = body.email ? String(body.email).trim() : null;

      let leadId: string | null = null;
      if (email) {
        const { data: lead } = await sb
          .from("leads")
          .select("id")
          .ilike("email", email)
          .maybeSingle();
        if (lead) {
          leadId = lead.id;
        } else {
          const { data: stage } = await sb
            .from("pipeline_stages")
            .select("id")
            .eq("slug", "novo")
            .maybeSingle();
          const { data: novo } = await sb
            .from("leads")
            .insert({
              nome: name,
              email,
              origem: "webchat",
              pipeline_stage_id: stage?.id ?? null,
            })
            .select("id")
            .single();
          leadId = novo?.id ?? null;
        }
      }

      const { data: conv, error: convErr } = await sb
        .from("inbox_conversations")
        .insert({
          channel: "webchat",
          lead_id: leadId,
          contact_name: name,
          contact_email: email,
          status: "open",
          external_id: crypto.randomUUID(),
        })
        .select("id")
        .single();

      if (convErr) throw convErr;

      const { data: session, error: sessErr } = await sb
        .from("webchat_sessions")
        .insert({
          conversation_id: conv.id,
          visitor_name: name,
          visitor_email: email,
        })
        .select("session_token, conversation_id")
        .single();

      if (sessErr) throw sessErr;

      await sb.from("inbox_messages").insert({
        conversation_id: conv.id,
        direction: "inbound",
        body: `Conversa iniciada no site por ${name}.`,
        sender_type: "system",
      });

      return jsonResponse({
        session_token: session.session_token,
        conversation_id: session.conversation_id,
      });
    }

    if (action === "send") {
      const token = String(body.session_token ?? "");
      const text = String(body.text ?? "").trim();
      if (!token || !text) return jsonResponse({ error: "session_token e text obrigatórios" }, 400);

      const session = await getSession(sb, token);
      if (!session) return jsonResponse({ error: "sessão inválida" }, 404);

      const { error } = await sb.from("inbox_messages").insert({
        conversation_id: session.conversation_id,
        direction: "inbound",
        body: text,
        sender_type: "contact",
      });
      if (error) throw error;

      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: "action inválida" }, 400);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
