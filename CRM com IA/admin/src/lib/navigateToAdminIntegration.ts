import type { NavigateFunction } from 'react-router-dom';
import { INTEGRATION_OPEN_STORAGE_KEY } from '@/lib/integrationSuccess';

/** Abre Configurações → Integrações → Canais (drawer Meta). */
export function primeSocialChannelsIntegrationOpen(
  integrationId: 'facebook-messenger' | 'instagram-direct' = 'facebook-messenger',
): void {
  sessionStorage.setItem(INTEGRATION_OPEN_STORAGE_KEY, integrationId);
}

export const ADMIN_INTEGRATIONS_PATH = '/admin?tab=integrations';

export function navigateToAdminIntegrations(
  navigate: NavigateFunction,
  integrationId: 'facebook-messenger' | 'instagram-direct' = 'facebook-messenger',
): void {
  primeSocialChannelsIntegrationOpen(integrationId);
  navigate(ADMIN_INTEGRATIONS_PATH);
}
