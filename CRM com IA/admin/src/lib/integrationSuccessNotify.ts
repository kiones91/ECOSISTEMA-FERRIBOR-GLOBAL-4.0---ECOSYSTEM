export type IntegrationNotifyOptions = {
  status?: 'success' | 'error';
  message?: string;
  items?: string[];
  /** Não abrir drawer da integração após o popup */
  skipOpenDrawer?: boolean;
};

type NotifyFn = (integrationId: string, options?: IntegrationNotifyOptions) => void;

let notifyFn: NotifyFn | null = null;

export function registerIntegrationSuccessNotify(fn: NotifyFn | null) {
  notifyFn = fn;
}

/** Dispara popup de sucesso/erro (usado por formulários e hooks de integração). */
export function notifyIntegrationSuccess(
  integrationId: string,
  options?: IntegrationNotifyOptions,
) {
  notifyFn?.(integrationId, { status: 'success', ...options });
}

export function notifyIntegrationError(
  integrationId: string,
  message?: string,
) {
  notifyFn?.(integrationId, { status: 'error', message });
}
