import type { Env } from '../types';
import { handleEvolutionAdmin } from './evolution';
import { handleWebchat } from './webchat';

export function json(data: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin || '*';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Access-Control-Max-Age': '86400',
  };
}

export async function handleApi(request: Request, env: Env, ctx?: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (url.pathname === '/api/health') {
    return json({ ok: true, service: 'ferribor-crm-api', version: '0.3.0' }, 200, cors);
  }

  const webchatRes = await handleWebchat(request, env, ctx);
  if (webchatRes) return webchatRes;

  if (url.pathname === '/api/admin/evolution' && request.method === 'POST') {
    return handleEvolutionAdmin(request, env);
  }

  return json({ error: 'Rota não encontrada' }, 404, cors);
}
