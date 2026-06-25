import type { Env } from './types';

/** Rotas do admin SPA (React Router) — não são arquivos estáticos. */
function isAdminSpaRoute(pathname: string): boolean {
  if (!pathname.startsWith('/admin')) return false;
  const last = pathname.split('/').filter(Boolean).pop() ?? '';
  return !last.includes('.');
}

/**
 * Serve assets estáticos; fallback para /admin/index.html em rotas client-side.
 */
export async function serveAssets(request: Request, env: Env): Promise<Response> {
  const response = await env.ASSETS.fetch(request);

  if (response.status !== 404) {
    return response;
  }

  const { pathname } = new URL(request.url);
  if (!isAdminSpaRoute(pathname)) {
    return response;
  }

  const indexUrl = new URL('/admin/index.html', request.url);
  return env.ASSETS.fetch(new Request(indexUrl.toString(), request));
}
