export type AppRole = 'admin' | 'manager' | 'seller' | 'super_admin';

/** Rota inicial após login. Single-tenant: todos caem na tela única, que é a
 * raiz do app (servida em /admin/ pelo base do Vite; o router usa basename). */
export function getPostLoginPath(_roles?: Array<AppRole | string> | Array<{ role: string }> | null): string {
  return '/';
}

/** Rota após aceitar convite. Single-tenant: tela única na raiz. */
export function getPostInvitePath(_role?: string | null): string {
  return '/';
}
