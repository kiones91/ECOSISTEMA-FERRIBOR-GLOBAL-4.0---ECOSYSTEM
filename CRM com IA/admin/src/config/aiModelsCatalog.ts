import type { AIProviderId } from '@/config/aiProvidersCatalog';
import type { AICapability } from '@/hooks/useAIRouting';

export type ModelTag = 'recommended' | 'cheapest' | 'most_powerful' | 'fastest' | 'new' | 'vision' | 'audio' | 'free_tier';

export interface AIModelInfo {
  id: string;
  label: string;
  description: string;
  tags: ModelTag[];
  supports: AICapability[];
  /** Referência de custo (não é cobrança do CRM). */
  costHint?: string;
}

export const TAG_LABELS: Record<ModelTag, { label: string; className: string }> = {
  recommended: { label: 'Recomendado', className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' },
  cheapest: { label: 'Mais barato', className: 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20' },
  most_powerful: { label: 'Mais potente', className: 'bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20' },
  fastest: { label: 'Mais rápido', className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  new: { label: 'Novo', className: 'bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/20' },
  vision: { label: 'Visão', className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' },
  audio: { label: 'Áudio', className: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20' },
  free_tier: { label: 'Free tier', className: 'bg-lime-500/10 text-lime-700 dark:text-lime-400 border-lime-500/20' },
};

const ALL_TEXT_CAPS: AICapability[] = [
  'agent_chat', 'sales_copilot', 'image_vision', 'content_generation', 'analysis_insights',
];

export const MODELS_BY_PROVIDER: Record<AIProviderId, AIModelInfo[]> = {
  openai: [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Chat e copiloto — equilíbrio custo/qualidade', tags: ['recommended'], supports: ALL_TEXT_CAPS, costHint: '~US$0,15/1M entrada' },
    { id: 'gpt-4o', label: 'GPT-4o', description: 'Multimodal completo', tags: ['vision', 'most_powerful'], supports: ALL_TEXT_CAPS, costHint: '~US$2,50/1M entrada' },
    { id: 'gpt-5-mini', label: 'GPT-5 Mini', description: 'Nova geração — volume', tags: ['new'], supports: ALL_TEXT_CAPS, costHint: 'Consulte platform.openai.com/pricing' },
    { id: 'gpt-4o-transcribe', label: 'GPT-4o Transcribe', description: 'Transcrição de áudio', tags: ['recommended', 'audio'], supports: ['audio_transcription'], costHint: 'Por minuto de áudio' },
    { id: 'whisper-1', label: 'Whisper 1', description: 'Transcrição clássica', tags: ['audio', 'cheapest'], supports: ['audio_transcription'], costHint: '~US$0,006/min' },
    { id: 'text-embedding-3-small', label: 'Embedding 3 Small', description: 'Memória semântica', tags: ['recommended'], supports: ['embeddings'], costHint: '~US$0,02/1M tokens' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', description: 'Recomendado — multimodal', tags: ['recommended', 'free_tier', 'vision'], supports: ALL_TEXT_CAPS, costHint: 'Free tier: ~15 RPM / ~1.500 RPD' },
    { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', description: 'Mais barato e rápido', tags: ['cheapest', 'fastest', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free tier com limites maiores' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', description: 'Raciocínio profundo', tags: ['most_powerful', 'vision'], supports: ALL_TEXT_CAPS, costHint: 'Free tier limitado; depois pago' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', description: 'Estável', tags: ['free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Ver ai.google.dev/pricing' },
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B', description: 'Open source — muito rápido', tags: ['recommended', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free: ~30 req/min' },
    { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B', description: 'Ultra rápido para volume', tags: ['fastest', 'cheapest', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free tier generoso' },
    { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B', description: 'MoE eficiente', tags: [], supports: ALL_TEXT_CAPS, costHint: 'Ver console.groq.com' },
  ],
  deepseek: [
    { id: 'deepseek-chat', label: 'DeepSeek Chat', description: 'Conversação geral', tags: ['recommended', 'cheapest'], supports: ALL_TEXT_CAPS, costHint: '~US$0,27/1M entrada' },
    { id: 'deepseek-reasoner', label: 'DeepSeek Reasoner', description: 'Raciocínio complexo', tags: ['most_powerful'], supports: ['analysis_insights', 'content_generation', 'sales_copilot'], costHint: 'Maior custo por token' },
  ],
  mistral: [
    { id: 'mistral-small-latest', label: 'Mistral Small', description: 'Equilíbrio custo/qualidade', tags: ['recommended'], supports: ALL_TEXT_CAPS, costHint: 'Experiment: créditos free' },
    { id: 'mistral-large-latest', label: 'Mistral Large', description: 'Máxima capacidade', tags: ['most_powerful'], supports: ALL_TEXT_CAPS, costHint: 'Pago por token' },
    { id: 'open-mistral-nemo', label: 'Mistral Nemo', description: 'Leve e rápido', tags: ['cheapest', 'fastest'], supports: ALL_TEXT_CAPS, costHint: 'Baixo custo' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5', description: 'Recomendado — agentes e código', tags: ['recommended', 'vision'], supports: ALL_TEXT_CAPS, costHint: '~US$3/1M entrada' },
    { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5', description: 'Rápido e barato', tags: ['cheapest', 'fastest'], supports: ALL_TEXT_CAPS, costHint: '~US$0,80/1M entrada' },
    { id: 'claude-opus-4-1', label: 'Claude Opus 4.1', description: 'Topo de linha', tags: ['most_powerful'], supports: ALL_TEXT_CAPS, costHint: '~US$15/1M entrada' },
  ],
  perplexity: [
    { id: 'sonar', label: 'Sonar', description: 'Busca web rápida', tags: ['recommended', 'fastest'], supports: ['agent_chat', 'sales_copilot', 'content_generation', 'analysis_insights'], costHint: 'Por request + tokens' },
    { id: 'sonar-pro', label: 'Sonar Pro', description: 'Mais contexto e fontes', tags: ['most_powerful'], supports: ['agent_chat', 'sales_copilot', 'content_generation', 'analysis_insights'], costHint: 'Maior custo por request' },
  ],
  together: [
    { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', label: 'Llama 3.3 70B Turbo', description: 'Open source via Together', tags: ['recommended'], supports: ALL_TEXT_CAPS, costHint: 'Por token no catálogo Together' },
    { id: 'meta-llama/Llama-3.1-8B-Instruct-Turbo', label: 'Llama 3.1 8B Turbo', description: 'Volume barato', tags: ['cheapest'], supports: ALL_TEXT_CAPS, costHint: 'Baixo custo' },
    { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3 (Together)', description: 'Via infra Together', tags: ['most_powerful'], supports: ALL_TEXT_CAPS, costHint: 'Variável por modelo' },
  ],
  openrouter: [
    { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini 2.0 Flash (Free)', description: 'Via OpenRouter sem custo', tags: ['recommended', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Gratuito' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free)', description: 'Meta via OpenRouter sem custo', tags: ['free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Gratuito' },
    { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 (OR)', description: 'Anthropic via OpenRouter', tags: ['most_powerful'], supports: ALL_TEXT_CAPS, costHint: 'Pago por token via créditos' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (OR)', description: 'OpenAI via OpenRouter', tags: ['cheapest'], supports: ALL_TEXT_CAPS, costHint: 'Pago por token via créditos' },
  ],
  qwen: [
    { id: 'qwen-turbo', label: 'Qwen Turbo', description: 'Rápido e free tier generoso', tags: ['recommended', 'free_tier', 'fastest'], supports: ALL_TEXT_CAPS, costHint: '~1M tokens/mês grátis' },
    { id: 'qwen-plus', label: 'Qwen Plus', description: 'Equilíbrio qualidade/custo', tags: [], supports: ALL_TEXT_CAPS, costHint: 'Baixo custo' },
    { id: 'qwen-max', label: 'Qwen Max', description: 'Máxima capacidade', tags: ['most_powerful'], supports: ALL_TEXT_CAPS, costHint: 'Pago por token' },
  ],
  elevenlabs: [
    { id: 'eleven_multilingual_v2', label: 'Multilingual V2', description: 'TTS multilíngue alta qualidade', tags: ['recommended'], supports: ['audio_transcription', 'content_generation'], costHint: '~US$0,30/1000 chars' },
    { id: 'eleven_turbo_v2_5', label: 'Turbo V2.5', description: 'TTS ultra-rápido', tags: ['fastest'], supports: ['audio_transcription', 'content_generation'], costHint: 'Baixa latência' },
  ],
  veo: [
    { id: 'veo-2', label: 'Veo 2', description: 'Geração de vídeo Google DeepMind', tags: ['recommended', 'new'], supports: ['content_generation'], costHint: 'Pago por vídeo gerado' },
  ],
  banana: [
    { id: 'custom-model', label: 'Modelo Customizado', description: 'Deploy seu próprio modelo', tags: ['recommended'], supports: ALL_TEXT_CAPS, costHint: 'Pay-per-second GPU' },
  ],
  cerebras: [
    { id: 'llama-3.3-70b', label: 'Llama 3.3 70B', description: 'Inferência ultrarrápida ~2000 tok/s', tags: ['recommended', 'free_tier', 'fastest'], supports: ALL_TEXT_CAPS, costHint: 'Free: 30 req/min' },
    { id: 'llama-3.1-8b', label: 'Llama 3.1 8B', description: 'Leve e instantâneo', tags: ['cheapest', 'fastest', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free tier generoso' },
  ],
  fireworks: [
    { id: 'accounts/fireworks/models/llama-v3p3-70b-instruct', label: 'Llama 3.3 70B', description: 'Open source otimizado', tags: ['recommended'], supports: ALL_TEXT_CAPS, costHint: '~US$0,90/1M tokens' },
    { id: 'accounts/fireworks/models/llama-v3p1-8b-instruct', label: 'Llama 3.1 8B', description: 'Volume barato', tags: ['cheapest', 'fastest'], supports: ALL_TEXT_CAPS, costHint: '~US$0,20/1M tokens' },
  ],
  xai: [
    { id: 'grok-2', label: 'Grok 2', description: 'Raciocínio avançado com dados em tempo real', tags: ['recommended', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free: $25/mês em créditos' },
    { id: 'grok-2-mini', label: 'Grok 2 Mini', description: 'Rápido e leve', tags: ['cheapest', 'fastest', 'free_tier'], supports: ALL_TEXT_CAPS, costHint: 'Free tier' },
  ],
  cohere: [
    { id: 'command-r-plus', label: 'Command R+', description: 'RAG otimizado — retrieval-augmented', tags: ['recommended', 'most_powerful'], supports: ['agent_chat', 'sales_copilot', 'content_generation', 'analysis_insights', 'embeddings'], costHint: 'Trial gratuito' },
    { id: 'command-r', label: 'Command R', description: 'Chat geral', tags: [], supports: ALL_TEXT_CAPS, costHint: 'Baixo custo' },
    { id: 'embed-multilingual-v3.0', label: 'Embed Multilingual V3', description: 'Embeddings multilíngue', tags: ['recommended'], supports: ['embeddings'], costHint: 'Trial: 1000 req/mês' },
  ],
  replicate: [
    { id: 'black-forest-labs/flux-1.1-pro', label: 'Flux 1.1 Pro', description: 'Geração de imagens state-of-the-art', tags: ['recommended'], supports: ['content_generation'], costHint: '~US$0,04/imagem' },
    { id: 'openai/whisper', label: 'Whisper (Replicate)', description: 'Transcrição via Replicate', tags: ['audio'], supports: ['audio_transcription'], costHint: 'Por predição' },
  ],
  runway: [
    { id: 'gen3a_turbo', label: 'Gen-3 Alpha Turbo', description: 'Vídeo rápido', tags: ['recommended', 'fastest'], supports: ['content_generation'], costHint: '~US$0,50/5s de vídeo' },
    { id: 'gen3a', label: 'Gen-3 Alpha', description: 'Vídeo alta qualidade', tags: ['most_powerful'], supports: ['content_generation'], costHint: '~US$1/5s de vídeo' },
  ],
  stability: [
    { id: 'sd3-large', label: 'Stable Diffusion 3 Large', description: 'Geração de imagens última geração', tags: ['recommended', 'most_powerful'], supports: ['content_generation'], costHint: '~US$0,06/imagem' },
    { id: 'sdxl-1.0', label: 'SDXL 1.0', description: 'Imagens alta resolução', tags: ['cheapest'], supports: ['content_generation'], costHint: '~US$0,01/imagem' },
  ],
};

export function getModelsForCapability(provider: AIProviderId, capability: AICapability): AIModelInfo[] {
  return (MODELS_BY_PROVIDER[provider] ?? []).filter((m) => m.supports.includes(capability));
}

export function getDefaultModel(provider: AIProviderId, capability: AICapability): string | undefined {
  const models = getModelsForCapability(provider, capability);
  return models.find((m) => m.tags.includes('recommended'))?.id ?? models[0]?.id;
}
