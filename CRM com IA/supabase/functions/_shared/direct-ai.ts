import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export type DirectAIProvider =
  | "gemini"
  | "groq"
  | "deepseek"
  | "mistral"
  | "together"
  | "openai"
  | "anthropic"
  | "perplexity"
  | "openrouter";

export interface ResolvedDirectAI {
  provider: DirectAIProvider;
  apiKey: string;
  model: string;
  source: "credential" | "platform_secret";
}

const DEFAULT_MODELS: Record<DirectAIProvider, string> = {
  gemini: "gemini-2.0-flash",
  groq: "llama-3.3-70b-versatile",
  deepseek: "deepseek-chat",
  mistral: "mistral-small-latest",
  together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
  openai: "gpt-4o-mini",
  anthropic: "claude-sonnet-4-20250514",
  perplexity: "sonar",
  openrouter: "google/gemini-2.0-flash-exp:free",
};

// Hierarquia: free-tier primeiro, depois low-cost, depois paid
const FREE_TIER_ORDER: DirectAIProvider[] = ["gemini", "groq"];
const LOW_COST_ORDER: DirectAIProvider[] = ["deepseek", "mistral", "together"];
const PAID_ORDER: DirectAIProvider[] = ["openai", "anthropic", "perplexity"];
const FULL_FALLBACK_ORDER: DirectAIProvider[] = [...FREE_TIER_ORDER, ...LOW_COST_ORDER, ...PAID_ORDER];

/** Resolve credentials com hierarquia free → low-cost → paid. */
export async function resolveDirectAI(
  admin: SupabaseClient,
  preferredProvider?: DirectAIProvider | null,
): Promise<ResolvedDirectAI> {
  const order: DirectAIProvider[] = preferredProvider
    ? [preferredProvider, ...FULL_FALLBACK_ORDER.filter((p) => p !== preferredProvider)]
    : [...FULL_FALLBACK_ORDER];

  const seen = new Set<DirectAIProvider>();
  for (const provider of order) {
    if (seen.has(provider)) continue;
    seen.add(provider);
    const { data } = await admin
      .from("ai_credentials")
      .select("api_key, model_default, is_active")
      .eq("provider", provider)
      .maybeSingle();
    if (data?.is_active && data.api_key) {
      return {
        provider,
        apiKey: data.api_key as string,
        model: (data.model_default as string) || DEFAULT_MODELS[provider],
        source: "credential",
      };
    }
  }

  // Fallback para env vars
  const geminiEnv =
    Deno.env.get("GEMINI_API_KEY")?.trim() || Deno.env.get("GOOGLE_AI_API_KEY")?.trim();
  if (geminiEnv) {
    return { provider: "gemini", apiKey: geminiEnv, model: DEFAULT_MODELS.gemini, source: "platform_secret" };
  }

  const groqEnv = Deno.env.get("GROQ_API_KEY")?.trim();
  if (groqEnv) {
    return { provider: "groq", apiKey: groqEnv, model: DEFAULT_MODELS.groq, source: "platform_secret" };
  }

  const openaiEnv = Deno.env.get("OPENAI_API_KEY")?.trim();
  if (openaiEnv) {
    return { provider: "openai", apiKey: openaiEnv, model: DEFAULT_MODELS.openai, source: "platform_secret" };
  }

  const anthropicEnv = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
  if (anthropicEnv) {
    return { provider: "anthropic", apiKey: anthropicEnv, model: DEFAULT_MODELS.anthropic, source: "platform_secret" };
  }

  throw new Error(
    "IA não configurada. Cadastre ao menos Gemini ou Groq (gratuitos) em Integrações → Inteligência Artificial.",
  );
}

export async function isAIGloballyEnabled(admin: SupabaseClient): Promise<boolean> {
  const { data } = await admin
    .from("integration_settings")
    .select("value")
    .eq("key", "ai_global_enabled")
    .maybeSingle();
  return data?.value === "true";
}

/** Fallback silencioso: se o provider atual falha com rate-limit, tenta o próximo. */
export async function directAICompleteWithFallback(
  admin: SupabaseClient,
  systemPrompt: string,
  userPrompt: string,
  preferredProvider?: DirectAIProvider | null,
): Promise<string> {
  const order: DirectAIProvider[] = preferredProvider
    ? [preferredProvider, ...FULL_FALLBACK_ORDER.filter((p) => p !== preferredProvider)]
    : [...FULL_FALLBACK_ORDER];

  const seen = new Set<DirectAIProvider>();
  for (const provider of order) {
    if (seen.has(provider)) continue;
    seen.add(provider);
    const { data } = await admin
      .from("ai_credentials")
      .select("api_key, model_default, is_active")
      .eq("provider", provider)
      .maybeSingle();
    if (!data?.is_active || !data.api_key) continue;

    const ai: ResolvedDirectAI = {
      provider,
      apiKey: data.api_key as string,
      model: (data.model_default as string) || DEFAULT_MODELS[provider],
      source: "credential",
    };

    try {
      return await directAIComplete(ai, systemPrompt, userPrompt);
    } catch (e) {
      const msg = (e as Error).message || "";
      const isRateLimit = msg.includes("429") || msg.includes("rate") || msg.includes("quota");
      if (isRateLimit) continue; // silencioso → tenta próximo provider
      throw e;
    }
  }

  throw new Error("Todos os provedores de IA falharam ou nenhum está configurado.");
}

export async function directAIComplete(
  ai: ResolvedDirectAI,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (ai.provider === "gemini") {
    const model = ai.model.includes("gemini") ? ai.model : DEFAULT_MODELS.gemini;
    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${ai.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: { temperature: 0.35, maxOutputTokens: 4096 },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ?? "";
    if (!text.trim()) throw new Error("Gemini retornou resposta vazia");
    return text.trim();
  }

  if (ai.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ai.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ai.model || DEFAULT_MODELS.anthropic,
        max_tokens: 4096,
        temperature: 0.35,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    const text = data?.content?.[0]?.text ?? "";
    if (!text.trim()) throw new Error("Anthropic retornou resposta vazia");
    return text.trim();
  }

  if (ai.provider === "perplexity") {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ai.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ai.model || DEFAULT_MODELS.perplexity,
        temperature: 0.35,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(`Perplexity ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
    const text = data?.choices?.[0]?.message?.content ?? "";
    if (!text.trim()) throw new Error("Perplexity retornou resposta vazia");
    return text.trim();
  }

  // OpenAI-compatible: openai, groq, deepseek, mistral, together, openrouter
  const endpoints: Record<string, string> = {
    openai: "https://api.openai.com/v1/chat/completions",
    groq: "https://api.groq.com/openai/v1/chat/completions",
    deepseek: "https://api.deepseek.com/chat/completions",
    mistral: "https://api.mistral.ai/v1/chat/completions",
    together: "https://api.together.xyz/v1/chat/completions",
    openrouter: "https://openrouter.ai/api/v1/chat/completions",
  };

  const baseUrl = endpoints[ai.provider] ?? endpoints.openai;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ai.apiKey}`,
  };

  const res = await fetch(baseUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: ai.model || DEFAULT_MODELS[ai.provider],
      temperature: 0.35,
      max_tokens: 4096,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${ai.provider} ${res.status}: ${JSON.stringify(data).slice(0, 300)}`);
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error(`${ai.provider} retornou resposta vazia`);
  return text.trim();
}

export function parseJsonFromAI(raw: string): Record<string, unknown> {
  const trimmed = raw.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fence ? fence[1].trim() : trimmed;
  return JSON.parse(jsonText);
}
