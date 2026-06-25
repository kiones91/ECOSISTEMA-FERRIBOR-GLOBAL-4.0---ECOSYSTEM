import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

type VerifyKind = "ai" | "payment";

async function requireAuth(req: Request, supabaseUrl: string) {
  const auth = req.headers.get("Authorization");
  if (!auth) return false;
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const userClient = createClient(supabaseUrl, anon, { global: { headers: { Authorization: auth } } });
  const { data } = await userClient.auth.getUser();
  return !!data?.user;
}

async function verifyAI(provider: string, apiKey: string) {
  if (provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`OpenAI: ${res.status}`);
    return { ok: true };
  }

  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/models", {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
    });
    if (!res.ok) throw new Error(`Anthropic: ${res.status}`);
    return { ok: true };
  }

  if (provider === "perplexity") {
    const res = await fetch("https://api.perplexity.ai/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) throw new Error(`Perplexity: ${res.status}`);
    return { ok: true };
  }

  throw new Error("Provider IA não suportado para verificação");
}

async function verifyPayment(provider: string, payload: Record<string, unknown>) {
  if (provider === "stripe") {
    const secretKey = String(payload.secret_key ?? "");
    if (!secretKey) throw new Error("Informe a Stripe Secret Key");
    const res = await fetch("https://api.stripe.com/v1/account", {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) throw new Error(`Stripe: ${res.status}`);
    return { ok: true };
  }

  if (provider === "asaas") {
    const apiKey = String(payload.api_key ?? "");
    if (!apiKey) throw new Error("Informe a API key do Asaas");
    const res = await fetch("https://www.asaas.com/api/v3/myAccount", {
      headers: { access_token: apiKey },
    });
    if (!res.ok) throw new Error(`Asaas: ${res.status}`);
    return { ok: true };
  }

  if (provider === "pagarme") {
    const apiKey = String(payload.api_key ?? "");
    if (!apiKey) throw new Error("Informe a API key do Pagar.me");
    const basic = btoa(`${apiKey}:`);
    const res = await fetch("https://api.pagar.me/core/v5/companies", {
      headers: { Authorization: `Basic ${basic}` },
    });
    if (!res.ok) throw new Error(`Pagar.me: ${res.status}`);
    return { ok: true };
  }

  if (provider === "pix_direto") {
    // Integração varia por banco — validação é apenas estrutural por enquanto.
    const bank = String(payload.bank ?? "");
    if (!bank) throw new Error("Informe o banco (ex.: Sicredi, Bradesco, etc.)");
    return { ok: true, note: "Validação estrutural (PIX Direto) — conexão depende do banco" };
  }

  throw new Error("Provider pagamento não suportado para verificação");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    if (!(await requireAuth(req, supabaseUrl))) return jsonResponse({ error: "Não autorizado" }, 401);

    const { kind, provider, api_key, ...rest } = (await req.json()) as {
      kind: VerifyKind;
      provider: string;
      api_key?: string;
      [k: string]: unknown;
    };

    if (!kind || !provider) return jsonResponse({ error: "kind e provider são obrigatórios" }, 400);

    let result: Record<string, unknown> = {};
    if (kind === "ai") {
      const key = String(api_key ?? "");
      if (!key) return jsonResponse({ error: "api_key é obrigatório" }, 400);
      result = await verifyAI(provider, key);

      await admin
        .from("ai_credentials")
        .upsert({ provider, api_key: key, model_default: null, is_active: true, atualizado_em: new Date().toISOString() });
    }

    if (kind === "payment") {
      result = await verifyPayment(provider, rest);
      await admin
        .from("payment_credentials")
        .upsert({ provider, ...(rest as any), is_active: true, atualizado_em: new Date().toISOString() });
    }

    return jsonResponse({ ok: true, ...result });
  } catch (err) {
    return jsonResponse({ error: err instanceof Error ? err.message : String(err) }, 400);
  }
});

