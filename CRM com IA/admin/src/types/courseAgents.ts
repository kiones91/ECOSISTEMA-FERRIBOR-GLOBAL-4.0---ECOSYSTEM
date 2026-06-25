export type AgentType = "sdr" | "closer" | "support" | "financial" | "orchestrator" | "custom";
export type ToneStyle = "formal" | "consultive" | "friendly" | "technical";
export type MessageStyle = "short" | "balanced" | "detailed";

export interface HumanizationConfig {
  enabled: boolean;
  timing?: {
    first_reply_min_ms?: number;
    first_reply_max_ms?: number;
    between_bubbles_ms?: number;
  };
  style?: {
    lowercase?: boolean;
    abbreviations?: boolean;
  };
}

export interface CourseAgent {
  id: string;
  course_id: string | null;
  name: string;
  description: string | null;
  agent_type: AgentType;
  primary_objective: string | null;
  can_do: string[];
  cannot_do: string[];
  handoff_triggers: string[];
  tone_style: ToneStyle;
  message_style: MessageStyle;
  additional_prompt: string | null;
  humanization: HumanizationConfig | null;
  tool_flags: Record<string, boolean>;
  channel_flags: Record<string, boolean>;
  is_active: boolean;
  is_default: boolean;
  criado_em: string;
  atualizado_em: string;
  lms_courses?: { id: string; titulo: string; slug: string } | null;
}

export interface CourseAgentInput {
  course_id?: string | null;
  name: string;
  description?: string;
  agent_type: AgentType;
  primary_objective?: string;
  can_do?: string[];
  cannot_do?: string[];
  handoff_triggers?: string[];
  tone_style?: ToneStyle;
  message_style?: MessageStyle;
  additional_prompt?: string;
  humanization?: HumanizationConfig | null;
  tool_flags?: Record<string, boolean>;
  channel_flags?: Record<string, boolean>;
  is_active?: boolean;
  is_default?: boolean;
}

export const AGENT_TYPE_LABELS: Record<AgentType, string> = {
  sdr: "SDR — Qualificação",
  closer: "Closer — Fechamento",
  support: "Suporte",
  financial: "Financeiro",
  orchestrator: "Orquestrador",
  custom: "Personalizado",
};

export const GLOBAL_AGENT_TYPES: AgentType[] = ["orchestrator", "sdr", "closer", "support", "financial"];

export const DEFAULT_HUMANIZATION: HumanizationConfig = {
  enabled: true,
  timing: { first_reply_min_ms: 4000, first_reply_max_ms: 9000, between_bubbles_ms: 1200 },
  style: { lowercase: false, abbreviations: true },
};

export const DEFAULT_TOOL_FLAGS: Record<string, boolean> = {
  can_update_pipeline: true,
  can_apply_tags: true,
  can_qualify_lead: true,
  can_handoff_human: true,
  can_open_ticket: false,
  can_share_course_link: true,
  can_share_checkout: false,
};

export const DEFAULT_CHANNEL_FLAGS: Record<string, boolean> = {
  webchat: true,
  whatsapp: false,
  inbox_crm: true,
};

export const TOOL_FLAG_LABELS: Record<string, string> = {
  can_update_pipeline: "Atualizar estágio no pipeline",
  can_apply_tags: "Aplicar tags ao lead",
  can_qualify_lead: "Qualificar lead e vincular curso",
  can_handoff_human: "Transferir para humano",
  can_open_ticket: "Abrir ticket de suporte",
  can_share_course_link: "Enviar link do curso",
  can_share_checkout: "Enviar link de checkout",
};

export const CHANNEL_FLAG_LABELS: Record<string, string> = {
  webchat: "Webchat do site",
  whatsapp: "WhatsApp (Evolution)",
  inbox_crm: "Inbox do CRM",
};

export const AGENT_TEMPLATES: Record<AgentType, Partial<CourseAgentInput>> = {
  sdr: {
    name: "SDR Inforhealth",
    primary_objective:
      "Qualificar leads, entender perfil e momento profissional, vincular curso de interesse, atualizar o CRM com dados coletados na conversa e mover para Contato quando qualificado — sem fechar venda.",
    can_do: [
      "Fazer perguntas de qualificação",
      "Identificar curso de interesse e gravar no CRM",
      "Atualizar nome, e-mail, telefone e empresa do lead",
      "Mover lead para Contato no pipeline quando qualificado",
      "Explicar modalidades ao vivo e gravado",
    ],
    cannot_do: ["Informar preço fechado sem validação", "Conceder descontos", "Fechar venda sozinho"],
    handoff_triggers: ["Pediu para falar com humano", "Alto interesse comercial", "Objeção complexa de preço"],
    tone_style: "friendly",
    message_style: "balanced",
  },
  closer: {
    name: "Closer",
    primary_objective:
      "Conduzir o lead qualificado até a matrícula, responder objeções comerciais e enviar link de inscrição ou checkout quando aplicável.",
    can_do: [
      "Apresentar benefícios do curso",
      "Tratar objeções comerciais",
      "Enviar link de inscrição ou checkout",
      "Sugerir parcelamento conforme política",
      "Mover lead para Proposta no pipeline",
    ],
    cannot_do: ["Prometer descontos não autorizados", "Alterar condições contratuais"],
    handoff_triggers: ["Solicitou negociação especial", "Pediu contrato ou nota fiscal"],
    tone_style: "consultive",
    message_style: "detailed",
    tool_flags: {
      ...DEFAULT_TOOL_FLAGS,
      can_share_checkout: true,
      can_update_pipeline: true,
    },
  },
  support: {
    name: "Suporte aluno",
    primary_objective:
      "Responder dúvidas sobre acesso ao portal, certificados e conteúdo. Abrir ticket quando não souber a resposta.",
    can_do: [
      "Orientar acesso ao portal do aluno",
      "Explicar certificados e prazos",
      "Consultar FAQ e materiais do curso",
    ],
    cannot_do: ["Vender novos cursos", "Alterar notas ou certificados manualmente"],
    handoff_triggers: ["Problema técnico não resolvido", "Reclamação grave", "Sem resposta na base de conhecimento"],
    tone_style: "friendly",
    message_style: "balanced",
    tool_flags: { ...DEFAULT_TOOL_FLAGS, can_open_ticket: true, can_share_checkout: false },
  },
  financial: {
    name: "Financeiro",
    primary_objective: "Orientar sobre boletos, parcelas e status de pagamento.",
    can_do: ["Consultar status de pagamento", "Reenviar boleto ou link"],
    cannot_do: ["Negociar descontos", "Alterar contrato"],
    handoff_triggers: ["Contestação de cobrança", "Chargeback"],
    tone_style: "formal",
    message_style: "short",
  },
  orchestrator: {
    name: "Coordenador Inforhealth",
    primary_objective:
      "Supervisionar cada turno, analisar contexto global e direcionar silenciosamente ao SDR, Closer ou Suporte — e ao curso correto.",
    can_do: [
      "Classificar intenção e curso em foco",
      "Coordenar múltiplos cursos na mesma conversa",
      "Escalar humano para in-company e agenda",
    ],
    cannot_do: ["Responder ao visitante diretamente", "Fechar vendas"],
    handoff_triggers: ["In-company com agenda", "Pedido de humano"],
    tone_style: "consultive",
    message_style: "short",
  },
  custom: {
    name: "Agente personalizado",
    primary_objective: "",
    can_do: [],
    cannot_do: [],
    handoff_triggers: [],
    tone_style: "friendly",
    message_style: "balanced",
  },
};

export function emptyAgentInput(type: AgentType = "sdr"): CourseAgentInput {
  const tpl = AGENT_TEMPLATES[type];
  return {
    course_id: GLOBAL_AGENT_TYPES.includes(type) ? null : undefined,
    name: tpl.name || "",
    description: "",
    agent_type: type,
    primary_objective: tpl.primary_objective || "",
    can_do: [...(tpl.can_do || [])],
    cannot_do: [...(tpl.cannot_do || [])],
    handoff_triggers: [...(tpl.handoff_triggers || [])],
    tone_style: tpl.tone_style || "friendly",
    message_style: tpl.message_style || "balanced",
    additional_prompt: "",
    humanization: { ...DEFAULT_HUMANIZATION },
    tool_flags: { ...DEFAULT_TOOL_FLAGS, ...(tpl.tool_flags || {}) },
    channel_flags: { ...DEFAULT_CHANNEL_FLAGS },
    is_active: true,
    is_default: false,
  };
}
