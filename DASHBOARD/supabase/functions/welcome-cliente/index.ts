import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type WelcomePayload = {
  user_id?: string;
  nome?: string;
  email?: string;
  whatsapp?: string;
  empresa?: string;
  cargo?: string;
};

function onlyDigits(v: string): string {
  return (v || "").replace(/\D/g, "");
}

async function sendWelcomeEmail(to: string, nome: string): Promise<string> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("WELCOME_EMAIL_FROM");
  if (!apiKey || !from) return "skip:email_nao_configurado";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Bem-vindo(a) ao Portal do Cliente FerriBor",
      html: `<p>Olá ${nome || "cliente"},</p>
<p>Sua conta no Portal do Cliente FerriBor foi criada com sucesso.</p>
<p>Acesse para acompanhar pedidos, recompra, créditos e suporte.</p>
<p>Equipe FerriBor.</p>`,
    }),
  });
  return res.ok ? "ok" : `erro:${res.status}`;
}

async function sendWelcomeWhatsapp(numero: string, nome: string): Promise<string> {
  const apiUrl = (Deno.env.get("EVOLUTION_API_URL") || "").replace(/\/$/, "");
  const apiKey = Deno.env.get("EVOLUTION_API_KEY");
  const instance = Deno.env.get("EVOLUTION_INSTANCE_NAME");
  const phone = onlyDigits(numero);
  if (!apiUrl || !apiKey || !instance || !phone) return "skip:whatsapp_nao_configurado";

  const res = await fetch(`${apiUrl}/message/sendText/${instance}`, {
    method: "POST",
    headers: { apikey: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      number: phone,
      text: `Olá ${nome || "cliente"}! Sua conta no Portal do Cliente FerriBor foi criada com sucesso. Bem-vindo(a)!`,
    }),
  });
  return res.ok ? "ok" : `erro:${res.status}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Método não permitido" }, 405);

  try {
    const body = (await req.json().catch(() => ({}))) as WelcomePayload;
    const nome = String(body.nome ?? "");
    const email = String(body.email ?? "");
    const whatsapp = String(body.whatsapp ?? "");

    const [emailStatus, whatsappStatus] = await Promise.all([
      email ? sendWelcomeEmail(email, nome) : Promise.resolve("skip:sem_email"),
      whatsapp ? sendWelcomeWhatsapp(whatsapp, nome) : Promise.resolve("skip:sem_whatsapp"),
    ]);

    return jsonResponse({ ok: true, email: emailStatus, whatsapp: whatsappStatus });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("welcome-cliente:", message);
    return jsonResponse({ error: message }, 500);
  }
});
