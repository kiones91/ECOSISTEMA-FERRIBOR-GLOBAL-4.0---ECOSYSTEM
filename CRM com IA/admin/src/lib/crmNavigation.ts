/** Navegação entre rotas do CRM (Index usa estado interno, não URL). */

import { INTEGRATION_OPEN_STORAGE_KEY } from '@/lib/integrationSuccess';

export const CRM_NAV_TAB_KEY = 'buffallos_crm_nav_tab';
export const ATENDIMENTOS_SUBTAB_KEY = 'buffallos_atendimentos_subtab';
export const ADMIN_NAV_SECTION_KEY = 'buffallos_admin_section';
export const META_FLOW_MODE_KEY = 'buffallos_meta_flow_mode';

/** Deep link admin: Atendimentos → aba Engajamento (use em <Link to={...}>). */
export const ADMIN_ENGAGEMENT_PATH = '/admin?tab=inbox&engagement=1';

/** Deep link app vendedor (Conversas → Atendimentos → Engajamento). */
export const SELLER_ENGAGEMENT_PATH = '/?tab=inbox&engagement=1';

/** Vendedor: / → aba Conversas/Atendimentos → Engajamento */
export function primeOpenAtendimentosEngagement(): void {
  sessionStorage.setItem(CRM_NAV_TAB_KEY, 'inbox');
  sessionStorage.setItem(ATENDIMENTOS_SUBTAB_KEY, 'engajamento');
}

/** Admin — fallback se não usar Link (preferir ADMIN_ENGAGEMENT_PATH). */
export function primeOpenAdminAtendimentosEngagement(): void {
  sessionStorage.setItem(ADMIN_NAV_SECTION_KEY, 'inbox');
  sessionStorage.setItem(ATENDIMENTOS_SUBTAB_KEY, 'engajamento');
}

export function shouldOpenEngagementSubtab(searchParams: URLSearchParams): boolean {
  return searchParams.get('engagement') === '1';
}

/** Admin → Integrações → Canais → fluxo Integrar comentários */
export function primeMetaEngagementIntegrations(): void {
  sessionStorage.setItem(INTEGRATION_OPEN_STORAGE_KEY, 'facebook-messenger');
  sessionStorage.setItem(META_FLOW_MODE_KEY, 'engagement');
}

export function consumeAdminNavSection(): string | null {
  const section = sessionStorage.getItem(ADMIN_NAV_SECTION_KEY);
  if (section) sessionStorage.removeItem(ADMIN_NAV_SECTION_KEY);
  return section;
}

export function consumeMetaFlowMode(): 'messages' | 'engagement' | null {
  const mode = sessionStorage.getItem(META_FLOW_MODE_KEY);
  if (mode) sessionStorage.removeItem(META_FLOW_MODE_KEY);
  if (mode === 'messages' || mode === 'engagement') return mode;
  return null;
}

export function consumeCrmNavTab(): string | null {
  const tab = sessionStorage.getItem(CRM_NAV_TAB_KEY);
  if (tab) sessionStorage.removeItem(CRM_NAV_TAB_KEY);
  return tab;
}

export function consumeAtendimentosSubtab(): string | null {
  const sub = sessionStorage.getItem(ATENDIMENTOS_SUBTAB_KEY);
  if (sub) sessionStorage.removeItem(ATENDIMENTOS_SUBTAB_KEY);
  return sub;
}
