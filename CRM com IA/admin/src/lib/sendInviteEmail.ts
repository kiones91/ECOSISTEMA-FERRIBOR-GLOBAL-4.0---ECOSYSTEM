import { supabase } from '@/integrations/supabase/client';
import { getPublicAppUrl } from '@/lib/publicUrl';
import {
  ClientEmailTrace,
  errorMessageFromInvokeBody,
  parseInvokeErrorBody,
  parseTraceFromResponse,
} from '@/lib/emailTrace';

export interface SendInviteEmailParams {
  email: string;
  token: string;
  role: string;
  squadName?: string;
  invitedByName?: string;
  organizationName?: string;
}

export class InviteEmailError extends Error {
  trace?: ReturnType<ClientEmailTrace['toJSON']>;

  constructor(message: string, trace?: ReturnType<ClientEmailTrace['toJSON']>) {
    super(message);
    this.name = 'InviteEmailError';
    this.trace = trace;
  }
}

/** Dispara edge function send-invite-email; lança InviteEmailError com trace se falhar. */
export async function sendInviteEmail(params: SendInviteEmailParams): Promise<void> {
  const trace = new ClientEmailTrace('crm-invite-email');
  const inviteLink = `${getPublicAppUrl()}/aceitar-convite?token=${encodeURIComponent(params.token)}`;

  trace.ok('CRM-01', 'Chamando send-invite-email', params.email);

  const { data, error } = await supabase.functions.invoke('send-invite-email', {
    body: {
      email: params.email,
      inviteLink,
      role: params.role,
      squadName: params.squadName,
      invitedByName: params.invitedByName,
      organizationName: params.organizationName,
    },
  });

  const responseBody = await parseInvokeErrorBody(error, data);
  trace.mergeServer(parseTraceFromResponse(responseBody));

  if (error) {
    const msg = errorMessageFromInvokeBody(responseBody, error.message);
    trace.fail('CRM-02', 'Resposta da Edge Function', msg);
    throw new InviteEmailError(msg, trace.toJSON());
  }

  if (data && typeof data === 'object' && (data as { error?: string }).error) {
    trace.fail('CRM-02', 'Envio do convite', String((data as { error: string }).error));
    throw new InviteEmailError(String((data as { error: string }).error), trace.toJSON());
  }

  trace.ok('CRM-02', 'Convite enviado com sucesso ✓');
}

export function buildInviteAcceptUrl(token: string): string {
  return `${getPublicAppUrl()}/aceitar-convite?token=${encodeURIComponent(token)}`;
}
