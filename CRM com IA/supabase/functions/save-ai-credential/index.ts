import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

function maskKey(key: string): string {
  if (key.length <= 8) return "****";
  return key.slice(0, 4) + "..." + key.slice(-4);
}

async function verifyKey(provider: string, apiKey: string): Promise<{ ok: boolean; error?: string }> {
  try {
    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      );
      if (!res.ok) return { ok: false, error: `Gemini ${res.status}` };
      return { ok: true };
    }

    if (provider === "groq") {
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `Groq ${res.status}` };
      return { ok: true };
    }

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `OpenAI ${res.status}` };
      return { ok: true };
    }

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1,
          messages: [{ role: "user", content: "hi" }],
        }),
      });
      if (res.status === 401) return { ok: false, error: "Chave inválida" };
      return { ok: true };
    }

    if (provider === "perplexity") {
      const res = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
        }),
      });
      if (res.status === 401) return { ok: false, error: "Chave inválida" };
      return { ok: true };
    }

    if (provider === "deepseek") {
      const res = await fetch("https://api.deepseek.com/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `DeepSeek ${res.status}` };
      return { ok: true };
    }

    if (provider === "mistral") {
      const res = await fetch("https://api.mistral.ai/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `Mistral ${res.status}` };
      return { ok: true };
    }

    if (provider === "together") {
      const res = await fetch("https://api.together.xyz/v1/models", {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `Together ${res.status}` };
      return { ok: true };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user's organization
    const userClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Não autenticado" }, 401);

    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .maybeSingle();
    const orgId = profile?.organization_id;

    const body = await req.json();
    const { provider, api_key, model_default, action } = body;

    if (!provider) return jsonResponse({ error: "Provider obrigatório" }, 400);

    // DELETE action
    if (action === "delete") {
      await admin
        .from("ai_credentials")
        .update({ is_active: false, api_key: "" })
        .eq("provider", provider);

      if (orgId) {
        await admin
          .from("org_ai_credentials")
          .delete()
          .eq("organization_id", orgId)
          .eq("provider", provider);
      }

      return jsonResponse({ success: true, action: "deleted" });
    }

    // SAVE action
    if (!api_key) return jsonResponse({ error: "API key obrigatória" }, 400);

    // Verify the key works
    const verification = await verifyKey(provider, api_key);

    // Save to ai_credentials (runtime table - single tenant)
    await admin.from("ai_credentials").upsert(
      {
        provider,
        api_key,
        model_default: model_default || null,
        is_active: verification.ok,
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "provider" },
    );

    // Save to org_ai_credentials (admin UI table - multi tenant)
    if (orgId) {
      await admin.from("org_ai_credentials").upsert(
        {
          organization_id: orgId,
          provider,
          api_key_encrypted: api_key,
          api_key_masked: maskKey(api_key),
          model_default: model_default || null,
          last_verified_at: verification.ok ? new Date().toISOString() : null,
          last_error: verification.error || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organization_id,provider" },
      );
    }

    // Also mark as configured in integration_settings
    if (orgId) {
      await admin.from("integration_settings").upsert(
        {
          organization_id: orgId,
          integration_type: provider,
          is_configured: verification.ok,
          settings: { api_key_masked: maskKey(api_key) },
        },
        { onConflict: "organization_id,integration_type" },
      );
    }

    return jsonResponse({
      success: true,
      verified: verification.ok,
      error: verification.error || null,
      masked: maskKey(api_key),
    });
  } catch (e) {
    return jsonResponse({ error: (e as Error).message }, 500);
  }
});
