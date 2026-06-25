/** Templates padrão de follow-up omnichannel — seed no banco + fallback no inbox. */
export const DEFAULT_FOLLOWUP_QUICK_REPLIES = [
  {
    category: 'Follow-up Omnichannel',
    title: 'Retorno após proposta',
    content:
      'Olá {{nome}}! 👋\n\nPassando para saber se teve a chance de analisar a proposta do {{produto}}.\n\nFicou alguma dúvida que eu possa esclarecer?',
    shortcut: '/proposta',
  },
  {
    category: 'Follow-up Omnichannel',
    title: 'Follow-up gentil',
    content:
      'Oi {{nome}}, tudo bem?\n\nSei que o dia a dia é corrido — só queria confirmar se ainda faz sentido conversarmos sobre o {{produto}}.\n\nPosso te ajudar com algo?',
    shortcut: '/retorno',
  },
  {
    category: 'Follow-up Omnichannel',
    title: 'Negociação de valor',
    content:
      '{{nome}}, entendo que investimento é um fator importante. 💬\n\nPodemos revisar juntos condições e escopo do {{produto}} para encaixar melhor na sua realidade.\n\nO que seria ideal para você?',
    shortcut: '/negociar',
  },
  {
    category: 'Follow-up Omnichannel',
    title: 'Urgência amigável',
    content:
      'Oi {{nome}}! ⏰\n\nTemos condições especiais do {{produto}} válidas por pouco tempo.\n\nQuer que eu reserve uma proposta atualizada para você hoje?',
    shortcut: '/urgencia',
  },
  {
    category: 'Follow-up Omnichannel',
    title: 'Fechamento consultivo',
    content:
      '{{nome}}, pelo que conversamos, o {{produto}} resolve exatamente o que você precisa. ✅\n\nPosso te enviar o link/contrato para formalizarmos ainda esta semana?',
    shortcut: '/fechar',
  },
  {
    category: 'Follow-up Omnichannel',
    title: 'Cliente respondeu — prioridade',
    content:
      'Oi {{nome}}! Vi sua mensagem e estou aqui para te ajudar. 🙌\n\nSobre o {{produto}}, qual ponto você gostaria de alinhar agora para avançarmos?',
    shortcut: '/prioridade',
  },
] as const;
