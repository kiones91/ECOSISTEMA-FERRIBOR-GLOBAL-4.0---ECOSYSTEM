/** Canais omnichannel exibidos no Inbox (mensagens diretas) */

export type InboxMessageChannelFilter = 'all' | 'whatsapp' | 'webchat';

export const INBOX_MESSAGE_CHANNEL_FILTERS: {
  id: InboxMessageChannelFilter;
  label: string;
  backendChannel: string | null;
}[] = [
  { id: 'all', label: 'Todas', backendChannel: null },
  { id: 'whatsapp', label: 'WhatsApp', backendChannel: 'whatsapp' },
  { id: 'webchat', label: 'Chat do site', backendChannel: 'webchat' },
];
