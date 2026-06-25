import { FunctionsHttpError } from '@supabase/supabase-js';

/** Extrai mensagem legível quando uma Edge Function retorna status != 2xx. */
export async function parseEdgeFunctionError(error: unknown, data?: unknown): Promise<string> {
  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    if (typeof body.error === 'string' && body.error.trim()) return body.error;
    if (typeof body.message === 'string' && body.message.trim()) return body.message;
  }

  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json();
      if (typeof payload?.error === 'string' && payload.error.trim()) return payload.error;
      if (typeof payload?.message === 'string' && payload.message.trim()) return payload.message;
    } catch {
      // ignore parse failure
    }
  }

  if (error instanceof Error && error.message) {
    if (
      error.message.includes('Failed to send a request to the Edge Function') ||
      error.message.includes('Failed to fetch')
    ) {
      return (
        'Não foi possível contactar a Edge Function no Supabase (função ausente ou rede). ' +
        'Verifique o deploy em ibexgdypyyhixwmcxovf ou use o fallback do CRM quando disponível.'
      );
    }
    if (error.message.includes('non-2xx')) {
      return (
        'A Edge Function retornou erro. Verifique os logs no Supabase (Edge Functions → Logs) ' +
        'e confirme que a função está publicada (deploy).'
      );
    }
    return error.message;
  }

  return 'Erro desconhecido ao chamar o servidor';
}
