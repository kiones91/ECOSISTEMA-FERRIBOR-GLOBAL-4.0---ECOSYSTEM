/**
 * Worker de roteamento para o ecossistema FerriBor.
 *
 * Serve os assets estáticos e aplica fallback SPA
 * para os sub-apps /crm/* e /cliente/*.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Tenta servir o asset estático diretamente
    const response = await env.ASSETS.fetch(request);

    // Se encontrou o arquivo, retorna normalmente
    if (response.status !== 404) {
      return response;
    }

    // SPA fallback para /crm/*
    if (url.pathname === '/crm' || url.pathname.startsWith('/crm/')) {
      const spaUrl = new URL('/crm/index.html', url.origin);
      return env.ASSETS.fetch(new Request(spaUrl, request));
    }

    // SPA fallback para /cliente/*
    if (url.pathname === '/cliente' || url.pathname.startsWith('/cliente/')) {
      const spaUrl = new URL('/cliente/index.html', url.origin);
      return env.ASSETS.fetch(new Request(spaUrl, request));
    }

    // Para qualquer outra rota não encontrada, retorna o 404 original
    return response;
  }
};
