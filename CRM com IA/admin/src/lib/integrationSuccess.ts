import { integrationsCatalog, type IntegrationItem } from '@/config/integrationsCatalog';

export const INTEGRATION_OPEN_STORAGE_KEY = 'integration_open_id';

/** Params na URL após OAuth / redirect externo */
export const INTEGRATION_RETURN_QUERY_KEYS = [
  'int_status',
  'int_message',
  'int_items',
  'int_id',
  // legado Meta
  'meta_status',
  'meta_message',
  'meta_count',
  'meta_items',
  'integration',
  'google_calendar_connected',
  'google_calendar_error',
  'outlook_calendar_connected',
  'outlook_calendar_error',
] as const;

export type IntegrationReturnPayload = {
  status: 'success' | 'error';
  message: string;
  items: string[];
  integrationId: string | null;
};

export function findIntegrationItem(integrationId: string | null): IntegrationItem | null {
  if (!integrationId) return null;
  for (const cat of integrationsCatalog) {
    const item = cat.items.find((i) => i.id === integrationId);
    if (item) return item;
  }
  return null;
}

export function buildAdminIntegrationReturnUrl(): string {
  return `${window.location.origin}/admin`;
}

/** Título do popup de sucesso por integração */
export function getIntegrationSuccessTitle(integrationId: string): string {
  if (integrationId === 'facebook-messenger' || integrationId === 'instagram-direct') {
    return 'Sua conta da Meta foi adicionada com sucesso';
  }
  const item = findIntegrationItem(integrationId);
  if (item) {
    return `Sua conta ${item.name} foi integrada com sucesso`;
  }
  return 'Integração concluída com sucesso';
}

export function readIntegrationReturnFromSearch(search: string): IntegrationReturnPayload | null {
  const params = new URLSearchParams(search);

  const googleOk = params.get('google_calendar_connected');
  const googleErr = params.get('google_calendar_error');
  if (googleOk === 'true') {
    return {
      status: 'success',
      message: '',
      items: [],
      integrationId: 'google-calendar',
    };
  }
  if (googleErr) {
    return {
      status: 'error',
      message: decodeURIComponent(googleErr),
      items: [],
      integrationId: 'google-calendar',
    };
  }

  const outlookOk = params.get('outlook_calendar_connected');
  const outlookErr = params.get('outlook_calendar_error');
  if (outlookOk === 'true') {
    return {
      status: 'success',
      message: '',
      items: [],
      integrationId: 'outlook',
    };
  }
  if (outlookErr) {
    return {
      status: 'error',
      message: decodeURIComponent(outlookErr),
      items: [],
      integrationId: 'outlook',
    };
  }

  let status = params.get('int_status') ?? params.get('meta_status');
  if (status !== 'success' && status !== 'error') return null;

  const integrationId =
    params.get('int_id') ?? params.get('integration') ?? null;

  return {
    status,
    message: params.get('int_message') ?? params.get('meta_message') ?? '',
    items: (params.get('int_items') ?? params.get('meta_items'))?.split('|').filter(Boolean) ?? [],
    integrationId,
  };
}

export function stripIntegrationReturnFromUrl() {
  const params = new URLSearchParams(window.location.search);
  INTEGRATION_RETURN_QUERY_KEYS.forEach((k) => params.delete(k));
  params.delete('tab');
  const path = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
  window.history.replaceState({}, '', path);
  if (window.location.hash === '#_=_' || window.location.hash.startsWith('#_=')) {
    window.history.replaceState({}, '', path);
  }
}
