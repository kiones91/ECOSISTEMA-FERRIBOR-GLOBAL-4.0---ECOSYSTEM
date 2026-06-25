/**
 * Catálogo de provedores BYOK — cada empresa usa sua própria chave.
 * Sem gateway Lovable: tudo roteia direto para a API do provedor escolhido.
 */

export type AIProviderId =
  | 'openai'
  | 'gemini'
  | 'anthropic'
  | 'perplexity'
  | 'groq'
  | 'deepseek'
  | 'mistral'
  | 'together'
  | 'openrouter'
  | 'qwen'
  | 'elevenlabs'
  | 'veo'
  | 'banana'
  | 'cerebras'
  | 'fireworks'
  | 'xai'
  | 'cohere'
  | 'replicate'
  | 'runway'
  | 'stability';

export type PricingTier = 'free_tier' | 'paid' | 'low_cost';

export interface AIProviderInfo {
  id: AIProviderId;
  name: string;
  shortName: string;
  description: string;
  docsUrl: string;
  docsLabel: string;
  /** Página de cobrança/recarga do provedor — usada no alerta de esgotamento. */
  billingUrl: string;
  keyPlaceholder: string;
  keyHint: string;
  pricingTier: PricingTier;
  /** Resumo de custo para o admin (referência, não é cobrança do CRM). */
  pricingSummary: string;
  /** Limites do free tier — null se só pago. */
  freeTierLimits: string | null;
  /** Ordem sugerida ao detectar primeira chave da org. */
  setupPriority: number;
}

export const AI_PROVIDERS: Record<AIProviderId, AIProviderInfo> = {
  gemini: {
    id: 'gemini',
    name: 'Google Gemini',
    shortName: 'Gemini',
    description: 'Multimodal com free tier generoso no Google AI Studio — ótimo custo-benefício.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Criar chave Gemini',
    billingUrl: 'https://aistudio.google.com/app/plan_information',
    keyPlaceholder: 'AIza...',
    keyHint: 'Google AI Studio → Create API Key. Free tier com limites por modelo (RPM/RPD).',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier disponível; pago conforme uso no Google AI.',
    freeTierLimits:
      'Free: ~15 req/min e ~1.500 req/dia (Flash); Pro com limites menores. Consulte ai.google.dev/pricing.',
    setupPriority: 1,
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (ChatGPT)',
    shortName: 'OpenAI',
    description: 'GPT-5, GPT-4o, Whisper e embeddings — referência em qualidade.',
    docsUrl: 'https://platform.openai.com/api-keys',
    docsLabel: 'Criar chave OpenAI',
    billingUrl: 'https://platform.openai.com/settings/organization/billing/overview',
    keyPlaceholder: 'sk-...',
    keyHint: 'platform.openai.com → API Keys. Cobrança por token; exige cartão.',
    pricingTier: 'paid',
    pricingSummary: 'Pago por token (ex.: GPT-4o mini ~US$0,15/1M entrada).',
    freeTierLimits: null,
    setupPriority: 2,
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    shortName: 'Groq',
    description: 'Inferência ultrarrápida (Llama, Mixtral) com free tier no console.',
    docsUrl: 'https://console.groq.com/keys',
    docsLabel: 'Criar chave Groq',
    billingUrl: 'https://console.groq.com/settings/billing',
    keyPlaceholder: 'gsk_...',
    keyHint: 'console.groq.com → API Keys. Free tier com rate limit por modelo.',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier + planos pagos por token.',
    freeTierLimits:
      'Free: limites por modelo (ex. 30 req/min Llama 3). Ver console.groq.com/docs/rate-limits.',
    setupPriority: 3,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    shortName: 'DeepSeek',
    description: 'Modelos de raciocínio com custo muito baixo — bom para volume.',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    docsLabel: 'Criar chave DeepSeek',
    billingUrl: 'https://platform.deepseek.com/top_up',
    keyPlaceholder: 'sk-...',
    keyHint: 'platform.deepseek.com → API Keys. Créditos iniciais; depois pay-as-you-go.',
    pricingTier: 'low_cost',
    pricingSummary: 'Muito barato (ex.: DeepSeek-V3 ~US$0,27/1M entrada).',
    freeTierLimits: 'Créditos de boas-vindas; sem free tier permanente amplo.',
    setupPriority: 4,
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    shortName: 'Mistral',
    description: 'Modelos europeus eficientes — experimentação com créditos gratuitos.',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    docsLabel: 'Criar chave Mistral',
    billingUrl: 'https://console.mistral.ai/billing/',
    keyPlaceholder: '...',
    keyHint: 'console.mistral.ai → API Keys. Plano Experiment com créditos limitados.',
    pricingTier: 'free_tier',
    pricingSummary: 'Experiment (créditos free) ou Scale (pago por token).',
    freeTierLimits: 'Experiment: créditos limitados/mês. Ver mistral.ai/pricing.',
    setupPriority: 5,
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    shortName: 'Claude',
    description: 'Claude Sonnet/Opus — excelente para código, agentes e análise longa.',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    docsLabel: 'Criar chave Claude',
    billingUrl: 'https://console.anthropic.com/settings/billing',
    keyPlaceholder: 'sk-ant-...',
    keyHint: 'console.anthropic.com → API Keys. Somente pago.',
    pricingTier: 'paid',
    pricingSummary: 'Pago por token (ex.: Sonnet ~US$3/1M entrada).',
    freeTierLimits: null,
    setupPriority: 6,
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    shortName: 'Perplexity',
    description: 'Busca na web + LLM — ideal para insights e dados atualizados.',
    docsUrl: 'https://www.perplexity.ai/settings/api',
    docsLabel: 'Criar chave Perplexity',
    billingUrl: 'https://www.perplexity.ai/settings/api',
    keyPlaceholder: 'pplx-...',
    keyHint: 'perplexity.ai → API. Modelos Sonar com busca online.',
    pricingTier: 'paid',
    pricingSummary: 'Pago por request/token conforme modelo Sonar.',
    freeTierLimits: null,
    setupPriority: 7,
  },
  together: {
    id: 'together',
    name: 'Together AI',
    shortName: 'Together',
    description: 'Centenas de modelos open-source — flexível para experimentação.',
    docsUrl: 'https://api.together.xyz/settings/api-keys',
    docsLabel: 'Criar chave Together',
    billingUrl: 'https://api.together.xyz/settings/billing',
    keyPlaceholder: '...',
    keyHint: 'api.together.xyz → API Keys. Créditos iniciais; depois pay-as-you-go.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pago por token; preços variam por modelo no catálogo.',
    freeTierLimits: 'Créditos iniciais na conta; sem free tier ilimitado.',
    setupPriority: 8,
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    shortName: 'OpenRouter',
    description: 'Gateway unificado — acesso a centenas de modelos (Gemini, Llama, Claude, etc.) numa única chave.',
    docsUrl: 'https://openrouter.ai/keys',
    docsLabel: 'Criar chave OpenRouter',
    billingUrl: 'https://openrouter.ai/credits',
    keyPlaceholder: 'sk-or-...',
    keyHint: 'openrouter.ai → Keys. Créditos gratuitos iniciais + modelos free disponíveis.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pay-per-token via créditos; muitos modelos free disponíveis (ex: Gemini Flash, Llama).',
    freeTierLimits: 'Modelos marcados ":free" não consomem créditos.',
    setupPriority: 9,
  },
  qwen: {
    id: 'qwen',
    name: 'Qwen (Alibaba)',
    shortName: 'Qwen',
    description: 'Modelos da Alibaba Cloud — alta performance em múltiplos idiomas incluindo PT-BR.',
    docsUrl: 'https://dashscope.console.aliyun.com/apiKey',
    docsLabel: 'Criar chave Qwen',
    billingUrl: 'https://dashscope.console.aliyun.com/',
    keyPlaceholder: 'sk-...',
    keyHint: 'DashScope Console → API Key. Free tier generoso para Qwen-Turbo.',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier para Qwen-Turbo; pago para modelos maiores (Qwen-Plus, Qwen-Max).',
    freeTierLimits: 'Qwen-Turbo: ~1M tokens/mês grátis. Qwen-Plus: limites menores.',
    setupPriority: 10,
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    shortName: 'ElevenLabs',
    description: 'Voz ultra-realista — text-to-speech, clonagem de voz e agentes de voz.',
    docsUrl: 'https://elevenlabs.io/app/settings/api-keys',
    docsLabel: 'Criar chave ElevenLabs',
    billingUrl: 'https://elevenlabs.io/subscription',
    keyPlaceholder: 'sk_...',
    keyHint: 'elevenlabs.io → Profile → API Keys. Free tier com ~10k caracteres/mês.',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier com limites; planos pagos a partir de $5/mês.',
    freeTierLimits: '~10.000 caracteres/mês no free. Vozes pré-definidas apenas.',
    setupPriority: 11,
  },
  veo: {
    id: 'veo',
    name: 'Veo (Google)',
    shortName: 'Veo',
    description: 'Geração de vídeo por IA do Google DeepMind — alta qualidade e consistência.',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    docsLabel: 'Criar chave (mesma do Gemini)',
    billingUrl: 'https://aistudio.google.com/app/plan_information',
    keyPlaceholder: 'AIza...',
    keyHint: 'Usa a mesma chave do Google AI Studio (Gemini). Acesso via Vertex AI ou API direta.',
    pricingTier: 'paid',
    pricingSummary: 'Pago por vídeo gerado. Preço varia por duração e resolução.',
    freeTierLimits: null,
    setupPriority: 12,
  },
  banana: {
    id: 'banana',
    name: 'Banana.dev',
    shortName: 'Banana',
    description: 'GPU serverless — rode qualquer modelo ML com inferência escalável.',
    docsUrl: 'https://app.banana.dev/settings',
    docsLabel: 'Criar chave Banana',
    billingUrl: 'https://app.banana.dev/billing',
    keyPlaceholder: '...',
    keyHint: 'app.banana.dev → Settings → API Key. Pay-per-second de GPU.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pago por segundo de GPU. Modelos customizados via deploy de container.',
    freeTierLimits: 'Créditos iniciais para teste.',
    setupPriority: 13,
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    shortName: 'Cerebras',
    description: 'Inferência ultrarrápida — até 2000 tokens/s com free tier generoso.',
    docsUrl: 'https://cloud.cerebras.ai/platform/api-keys',
    docsLabel: 'Criar chave Cerebras',
    billingUrl: 'https://cloud.cerebras.ai/platform',
    keyPlaceholder: 'csk-...',
    keyHint: 'cloud.cerebras.ai → API Keys. Free tier com limites por minuto.',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier generoso; pago por token após limites.',
    freeTierLimits: 'Free: 30 req/min, 1M tokens/dia. Llama 3.3 70B disponível.',
    setupPriority: 14,
  },
  fireworks: {
    id: 'fireworks',
    name: 'Fireworks AI',
    shortName: 'Fireworks',
    description: 'Inferência otimizada — modelos open-source com latência muito baixa.',
    docsUrl: 'https://fireworks.ai/account/api-keys',
    docsLabel: 'Criar chave Fireworks',
    billingUrl: 'https://fireworks.ai/account/billing',
    keyPlaceholder: 'fw_...',
    keyHint: 'fireworks.ai → Account → API Keys. Créditos iniciais grátis.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pago por token; preços competitivos para Llama, Mixtral, etc.',
    freeTierLimits: '$1 em créditos iniciais.',
    setupPriority: 15,
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    shortName: 'Grok',
    description: 'Free tier generoso — bom raciocínio e acesso a dados em tempo real.',
    docsUrl: 'https://console.x.ai/team/default/api-keys',
    docsLabel: 'Criar chave xAI',
    billingUrl: 'https://console.x.ai/team/default/billing',
    keyPlaceholder: 'xai-...',
    keyHint: 'console.x.ai → API Keys. Free tier com $25/mês em créditos.',
    pricingTier: 'free_tier',
    pricingSummary: 'Free tier com $25/mês; pago após esgotamento.',
    freeTierLimits: '$25/mês em créditos gratuitos. Grok-2 e Grok-2-mini.',
    setupPriority: 16,
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    shortName: 'Cohere',
    description: 'Embeddings e RAG otimizados — ideal para busca semântica enterprise.',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    docsLabel: 'Criar chave Cohere',
    billingUrl: 'https://dashboard.cohere.com/billing',
    keyPlaceholder: '...',
    keyHint: 'dashboard.cohere.com → API Keys. Trial key gratuita disponível.',
    pricingTier: 'free_tier',
    pricingSummary: 'Trial key gratuita com limites; produção paga por token.',
    freeTierLimits: 'Trial: 1000 req/mês. Embed, Rerank e Command disponíveis.',
    setupPriority: 17,
  },
  replicate: {
    id: 'replicate',
    name: 'Replicate',
    shortName: 'Replicate',
    description: 'Rode qualquer modelo open-source por API — Flux, Whisper, SDXL, etc.',
    docsUrl: 'https://replicate.com/account/api-tokens',
    docsLabel: 'Criar token Replicate',
    billingUrl: 'https://replicate.com/account/billing',
    keyPlaceholder: 'r8_...',
    keyHint: 'replicate.com → Account → API Tokens. Pago por predição.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pago por predição; preço varia por modelo e hardware.',
    freeTierLimits: null,
    setupPriority: 18,
  },
  runway: {
    id: 'runway',
    name: 'Runway',
    shortName: 'Runway',
    description: 'Geração e edição de vídeo por IA — Gen-3 Alpha para clips profissionais.',
    docsUrl: 'https://app.runwayml.com/settings/api-keys',
    docsLabel: 'Criar chave Runway',
    billingUrl: 'https://app.runwayml.com/settings/billing',
    keyPlaceholder: 'key_...',
    keyHint: 'app.runwayml.com → Settings → API Keys. Créditos por segundo de vídeo.',
    pricingTier: 'paid',
    pricingSummary: 'Pago por segundo de vídeo gerado. Plans a partir de $12/mês.',
    freeTierLimits: null,
    setupPriority: 19,
  },
  stability: {
    id: 'stability',
    name: 'Stability AI',
    shortName: 'Stability',
    description: 'Geração de imagens — Stable Diffusion 3, SDXL, imagens por API.',
    docsUrl: 'https://platform.stability.ai/account/keys',
    docsLabel: 'Criar chave Stability',
    billingUrl: 'https://platform.stability.ai/account/billing',
    keyPlaceholder: 'sk-...',
    keyHint: 'platform.stability.ai → Account → API Keys. Créditos por imagem.',
    pricingTier: 'low_cost',
    pricingSummary: 'Pago por imagem gerada. ~$0.01-0.06 por imagem.',
    freeTierLimits: '25 créditos iniciais grátis.',
    setupPriority: 20,
  },
};

export const AI_PROVIDER_IDS = Object.keys(AI_PROVIDERS) as AIProviderId[];

export const PRICING_TIER_LABELS: Record<PricingTier, { label: string; className: string }> = {
  free_tier: {
    label: 'Free tier',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  },
  low_cost: {
    label: 'Baixo custo',
    className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/25',
  },
  paid: {
    label: 'Pago',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
  },
};

export function getProviderInfo(id: AIProviderId): AIProviderInfo {
  return AI_PROVIDERS[id];
}
