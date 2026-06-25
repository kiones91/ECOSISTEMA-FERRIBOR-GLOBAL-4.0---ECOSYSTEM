import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Método não permitido" }, 405);
  }

  const sb = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const body = await req.json();
    const nome = String(body.nome ?? "").trim();
    const email = String(body.email ?? "").trim();
    const assunto = String(body.assunto ?? "Contato site").trim();
    const mensagem = String(body.mensagem ?? "").trim();

    if (!nome || !email || !mensagem) {
      return jsonResponse({ error: "nome, email e mensagem são obrigatórios" }, 400);
    }

    const { data: stage } = await sb
      .from("pipeline_stages")
      .select("id")
      .eq("slug", "novo")
      .maybeSingle();

    let leadId: string;
    const { data: existing } = await sb
      .from("leads")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (existing) {
      leadId = existing.id;
      await sb
        .from("leads")
        .update({ nome, atualizado_em: new Date().toISOString() })
        .eq("id", leadId);
    } else {
      const { data: created, error } = await sb
        .from("leads")
        .insert({
          nome,
          email,
          origem: "formulario",
          curso_interesse: assunto,
          pipeline_stage_id: stage?.id ?? null,
        })
        .select("id")
        .single();
      if (error) throw error;
      leadId = created.id;
    }

    await sb.from("interactions").insert({
      lead_id: leadId,
      tipo: "formulario",
      canal: "site",
      conteudo: `Assunto: ${assunto}\n\n${mensagem}`,
    });

    await sb.from("lead_notes").insert({
      lead_id: leadId,
      conteudo: `[Formulário contato] ${assunto}: ${mensagem}`,
    });

    return jsonResponse({ ok: true, lead_id: leadId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
