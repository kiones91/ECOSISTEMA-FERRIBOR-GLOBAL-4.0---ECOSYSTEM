/** Status de entrega estilo WhatsApp (✓ / ✓✓ / ✓✓ azul). */

export type MessageDeliveryStatus =
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

const RANK: Record<MessageDeliveryStatus, number> = {
  failed: 0,
  sending: 1,
  sent: 2,
  delivered: 3,
  read: 4,
};

function rankOf(value: string | undefined): number {
  if (!value) return 0;
  return RANK[value as MessageDeliveryStatus] ?? 0;
}

/** Resolve ícone a partir de metadata + prop opcional (outbound do agente/bot). */
export function resolveMessageDeliveryStatus(
  metadata: Record<string, unknown> | null | undefined,
  propStatus?: MessageDeliveryStatus,
  opts?: { isOutbound?: boolean },
): MessageDeliveryStatus | null {
  const isOutbound = opts?.isOutbound ?? true;
  if (!isOutbound) return null;

  const meta = metadata || {};
  const raw = String(meta.delivery_status || '').toLowerCase();

  if (raw === 'failed') return 'failed';
  if (meta.failed_at) return 'failed';

  let fromMeta: MessageDeliveryStatus | undefined;
  if (raw === 'read' || meta.read_at) fromMeta = 'read';
  else if (raw === 'delivered' || meta.delivered_at) fromMeta = 'delivered';
  else if (raw === 'sent' || meta.sent_at) fromMeta = 'sent';
  else if (raw === 'sending') fromMeta = 'sending';

  const candidates: MessageDeliveryStatus[] = [];
  if (fromMeta) candidates.push(fromMeta);
  if (propStatus) candidates.push(propStatus);

  if (!candidates.length) {
    return isOutbound ? 'sent' : null;
  }

  return candidates.reduce((best, cur) =>
    rankOf(cur) > rankOf(best) ? cur : best,
  );
}

/**
 * Se o visitante respondeu depois desta mensagem, considera lida (✓✓ azul).
 * Funciona mesmo sem webhook message_reads / deploy pendente.
 */
export function applyThreadReadInference(
  status: MessageDeliveryStatus | null,
  hasLaterVisitorMessage: boolean,
): MessageDeliveryStatus | null {
  if (!status || status === 'failed' || status === 'sending') return status;
  if (hasLaterVisitorMessage && rankOf(status) < rankOf('read')) return 'read';
  return status;
}

/** Índice: existe mensagem do visitante após `createdAt`? */
export function createHasLaterVisitorReplyFn(
  messages: Array<{ created_at: string; sender_type: string }>,
): (createdAt: string) => boolean {
  const visitorTimes = messages
    .filter((m) => m.sender_type === 'visitor')
    .map((m) => new Date(m.created_at).getTime());
  return (createdAt: string) => {
    const t = new Date(createdAt).getTime();
    return visitorTimes.some((vt) => vt > t);
  };
}
