import type { LucideIcon } from 'lucide-react';
import {
  Instagram,
  Brain,
  Sparkles,
  Cpu,
  Search as SearchIcon,
  CreditCard,
  DollarSign,
  Wallet,
  Banknote,
  Mail,
  FileText,
  Inbox,
  CalendarDays,
  Calendar as CalIcon,
  Facebook,
  Megaphone,
  Target,
  Building2,
  Boxes,
  Package,
  Globe,
  Webhook,
  Zap,
  Key,
  MessageSquare,
  MessageSquareText,
  FileInput,
} from 'lucide-react';

export type IntegrationStatus = 'active' | 'configurable' | 'coming_soon';

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon background tint */
  color: string;
  /** Component key — maps to a configurator in IntegrationConfigDrawer */
  configKey?:
    | 'whatsapp'
    | 'botconversa'
    | 'email-config'
    | 'email-templates'
    | 'mass-email'
    | 'google-calendar'
    | 'outlook-calendar'
    | 'sankhya'
    | 'api-keys'
    | 'openai'
    | 'anthropic'
    | 'gemini'
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
    | 'stability'
    | 'ai-routing'
    | 'cakto'
    | 'hotmart'
    | 'doppus'
    | 'asaas'
    | 'pagarme'
    | 'pix-direto'
    | 'stripe'
    | 'mercadopago'
    | 'smtp-custom'
    | 'webhooks-link'
    | 'google-ads'
    | 'tiktok-ads';
  /** Marks the card visually but still opens config (e.g. native always-on services) */
  alwaysActive?: boolean;
  comingSoon?: boolean;
  /** Optional keywords to improve search matches */
  keywords?: string[];
  /** Optional brand logo (overrides Lucide icon when present) */
  logoSrc?: string;
}

export interface IntegrationCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  items: IntegrationItem[];
}

export const integrationsCatalog: IntegrationCategory[] = [
  {
    id: 'ai',
    label: 'Inteligência Artificial',
    icon: Brain,
    description: 'Sua chave, seu provedor — CRM híbrido BYOK (sem IA da plataforma)',
    items: [
      {
        id: 'ai-routing',
        name: 'Roteamento de IA',
        description: 'Escolha provedor e modelo por capacidade (Copiloto, Agentes, Áudio…)',
        icon: Brain,
        color: 'bg-violet-500/10 text-violet-500',
        configKey: 'ai-routing',
        keywords: ['roteamento', 'provedor', 'capacidade', 'whatsapp', 'audio', 'imagem'],
      },
      {
        id: 'gemini',
        name: 'Google Gemini',
        description: 'Free tier disponível — limites diários por modelo (Google AI Studio)',
        icon: Sparkles,
        color: 'bg-blue-500/10 text-blue-500',
        configKey: 'gemini',
        keywords: ['google', 'bard', 'gemini', 'free', 'grátis'],
      },
      {
        id: 'openai',
        name: 'OpenAI (ChatGPT)',
        description: 'Pago por token — GPT-4o, Whisper, embeddings',
        icon: Cpu,
        color: 'bg-teal-500/10 text-teal-500',
        configKey: 'openai',
        keywords: ['gpt', 'chatgpt', 'gpt-4', 'gpt-5'],
      },
      {
        id: 'groq',
        name: 'Groq',
        description: 'Free tier — inferência ultrarrápida (Llama, Mixtral)',
        icon: Cpu,
        color: 'bg-fuchsia-500/10 text-fuchsia-600',
        configKey: 'groq',
        keywords: ['groq', 'llama', 'free', 'rápido'],
      },
      {
        id: 'deepseek',
        name: 'DeepSeek',
        description: 'Baixo custo — ideal para alto volume de mensagens',
        icon: Brain,
        color: 'bg-indigo-500/10 text-indigo-600',
        configKey: 'deepseek',
        keywords: ['deepseek', 'barato'],
      },
      {
        id: 'mistral',
        name: 'Mistral AI',
        description: 'Free tier (Experiment) — modelos europeus eficientes',
        icon: Sparkles,
        color: 'bg-orange-500/10 text-orange-500',
        configKey: 'mistral',
        keywords: ['mistral', 'europa'],
      },
      {
        id: 'anthropic',
        name: 'Anthropic (Claude)',
        description: 'Pago por token — Claude Sonnet/Opus para agentes',
        icon: Brain,
        color: 'bg-amber-500/10 text-amber-600',
        configKey: 'anthropic',
        keywords: ['claude', 'sonnet', 'opus'],
      },
      {
        id: 'perplexity',
        name: 'Perplexity',
        description: 'Pago — busca na web e respostas com fontes atualizadas',
        icon: SearchIcon,
        color: 'bg-cyan-500/10 text-cyan-600',
        configKey: 'perplexity',
        keywords: ['perplexity', 'sonar', 'busca', 'web', 'pesquisa', 'fontes'],
      },
      {
        id: 'together',
        name: 'Together AI',
        description: 'Baixo custo — centenas de modelos open-source',
        icon: Cpu,
        color: 'bg-slate-500/10 text-slate-600',
        configKey: 'together',
        keywords: ['together', 'llama', 'open source'],
      },
      {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Gateway unificado — centenas de modelos numa única chave',
        icon: Globe,
        color: 'bg-purple-500/10 text-purple-600',
        configKey: 'openrouter',
        keywords: ['openrouter', 'gateway', 'multi', 'modelos', 'free'],
      },
      {
        id: 'qwen',
        name: 'Qwen (Alibaba)',
        description: 'Free tier generoso — alta performance em PT-BR',
        icon: Sparkles,
        color: 'bg-sky-500/10 text-sky-600',
        configKey: 'qwen',
        keywords: ['qwen', 'alibaba', 'free', 'multilingual'],
      },
      {
        id: 'elevenlabs',
        name: 'ElevenLabs',
        description: 'Voz ultra-realista — TTS, clonagem e agentes de voz',
        icon: Sparkles,
        color: 'bg-pink-500/10 text-pink-600',
        configKey: 'elevenlabs',
        keywords: ['elevenlabs', 'voz', 'tts', 'audio', 'speech'],
      },
      {
        id: 'veo',
        name: 'Veo (Google)',
        description: 'Geração de vídeo por IA — alta qualidade',
        icon: Sparkles,
        color: 'bg-red-500/10 text-red-600',
        configKey: 'veo',
        keywords: ['veo', 'video', 'google', 'deepmind'],
      },
      {
        id: 'banana',
        name: 'Banana.dev',
        description: 'GPU serverless — qualquer modelo ML escalável',
        icon: Cpu,
        color: 'bg-yellow-500/10 text-yellow-600',
        configKey: 'banana',
        keywords: ['banana', 'gpu', 'serverless', 'inference'],
      },
      {
        id: 'cerebras',
        name: 'Cerebras',
        description: 'Free tier — inferência até 2000 tokens/s',
        icon: Cpu,
        color: 'bg-emerald-500/10 text-emerald-600',
        configKey: 'cerebras',
        keywords: ['cerebras', 'fast', 'free', 'llama'],
      },
      {
        id: 'fireworks',
        name: 'Fireworks AI',
        description: 'Inferência otimizada — modelos open-source rápidos',
        icon: Sparkles,
        color: 'bg-orange-500/10 text-orange-600',
        configKey: 'fireworks',
        keywords: ['fireworks', 'fast', 'llama', 'mixtral'],
      },
      {
        id: 'xai',
        name: 'xAI (Grok)',
        description: 'Free tier $25/mês — raciocínio avançado',
        icon: Brain,
        color: 'bg-slate-500/10 text-slate-600',
        configKey: 'xai',
        keywords: ['xai', 'grok', 'elon', 'free'],
      },
      {
        id: 'cohere',
        name: 'Cohere',
        description: 'Embeddings e RAG — busca semântica enterprise',
        icon: SearchIcon,
        color: 'bg-green-500/10 text-green-600',
        configKey: 'cohere',
        keywords: ['cohere', 'embeddings', 'rag', 'rerank'],
      },
      {
        id: 'replicate',
        name: 'Replicate',
        description: 'Qualquer modelo open-source por API',
        icon: Globe,
        color: 'bg-indigo-500/10 text-indigo-600',
        configKey: 'replicate',
        keywords: ['replicate', 'flux', 'whisper', 'sdxl'],
      },
      {
        id: 'runway',
        name: 'Runway',
        description: 'Geração e edição de vídeo — Gen-3 Alpha',
        icon: Sparkles,
        color: 'bg-violet-500/10 text-violet-600',
        configKey: 'runway',
        keywords: ['runway', 'video', 'gen3'],
      },
      {
        id: 'stability',
        name: 'Stability AI',
        description: 'Geração de imagens — Stable Diffusion 3',
        icon: Sparkles,
        color: 'bg-purple-500/10 text-purple-600',
        configKey: 'stability',
        keywords: ['stability', 'sdxl', 'imagem', 'sd3'],
      },
    ],
  },
  {
    id: 'email',
    label: 'E-mail & Comunicação',
    icon: Mail,
    description: 'Envio transacional, templates e campanhas',
    items: [
      {
        id: 'email-config',
        name: 'Configuração de E-mail',
        description: 'Remetente, assinatura e logo',
        icon: Mail,
        color: 'bg-blue-500/10 text-blue-500',
        configKey: 'email-config',
        keywords: ['resend', 'remetente'],
      },
      {
        id: 'email-templates',
        name: 'Templates de E-mail',
        description: 'Modelos reutilizáveis de mensagens',
        icon: FileText,
        color: 'bg-purple-500/10 text-purple-500',
        configKey: 'email-templates',
      },
      {
        id: 'mass-email',
        name: 'E-mail em Massa',
        description: 'Campanhas para listas segmentadas',
        icon: Inbox,
        color: 'bg-pink-500/10 text-pink-500',
        configKey: 'mass-email',
        keywords: ['marketing', 'campanha'],
      },
      {
        id: 'smtp-custom',
        name: 'SMTP Customizado',
        description: 'Use seu próprio servidor de e-mail',
        icon: Mail,
        color: 'bg-slate-500/10 text-slate-500',
        configKey: 'smtp-custom',
        keywords: ['smtp', 'servidor', 'gmail', 'outlook', 'hostinger'],
      },
    ],
  },
  {
    id: 'productivity',
    label: 'Agenda & Produtividade',
    icon: CalendarDays,
    items: [
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        description: 'Sincronize agenda dos vendedores',
        icon: CalendarDays,
        color: 'bg-blue-500/10 text-blue-500',
        configKey: 'google-calendar',
        keywords: ['google', 'agenda'],
      },
      {
        id: 'outlook',
        name: 'Microsoft Outlook',
        description: 'Sincronização com calendário Outlook / Microsoft 365',
        icon: CalIcon,
        color: 'bg-cyan-500/10 text-cyan-500',
        configKey: 'outlook-calendar',
        keywords: ['outlook', 'microsoft', 'office365', 'teams', 'agenda'],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Ferramentas & Webhooks',
    icon: Zap,
    description: 'Automações, scraping e integrações customizadas',
    items: [
      {
        id: 'api-keys',
        name: 'Chaves de API',
        description: 'Resend, Firecrawl, Zapier e outros',
        icon: Key,
        color: 'bg-amber-500/10 text-amber-500',
        configKey: 'api-keys',
      },
      {
        id: 'firecrawl',
        name: 'Firecrawl',
        description: 'Web scraping com IA',
        icon: Globe,
        color: 'bg-orange-500/10 text-orange-500',
        configKey: 'api-keys',
        keywords: ['scraping', 'crawl'],
      },
      {
        id: 'zapier',
        name: 'Zapier',
        description: 'Conecte com mais de 5000 apps',
        icon: Zap,
        color: 'bg-yellow-500/10 text-yellow-500',
        configKey: 'api-keys',
      },
      {
        id: 'webhooks',
        name: 'Webhooks Customizados',
        description: 'Configure webhooks em Automação → Webhooks',
        icon: Webhook,
        color: 'bg-violet-500/10 text-violet-500',
        configKey: 'webhooks-link',
      },
    ],
  },
];
