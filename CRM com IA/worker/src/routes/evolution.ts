import type { Env } from '../types';
import { corsHeaders, json } from './api';
import {
  handleEvolutionAction,
  type DbInstance,
  type EvolutionDb,
  type EvolutionGoConfig,
} from '../../../shared/evolution-handler';

async function verifyAdminUser(request: Request, env: Env): Promise<boolean> {
  const auth = request.headers.get('Authorization');
  if (!auth?.startsWith('Bearer ')) return false;
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) return true;
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: env.SUPABASE_ANON_KEY },
  });
  return res.ok;
}

function dbAuth(env: Env, request: Request): { key: string; auth: string } | null {
  const userAuth = request.headers.get('Authorization');
  if (env.SUPABASE_SERVICE_ROLE_KEY && env.SUPABASE_URL) {
    return { key: env.SUPABASE_SERVICE_ROLE_KEY, auth: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };
  }
  if (userAuth && env.SUPABASE_ANON_KEY && env.SUPABASE_URL) {
    return { key: env.SUPABASE_ANON_KEY, auth: userAuth };
  }
  return null;
}

function createDb(env: Env, request: Request): EvolutionDb {
  const auth = dbAuth(env, request);
  const base = env.SUPABASE_URL!;

  async function rest<T>(path: string, init?: RequestInit): Promise<T> {
    if (!auth) throw new Error('Supabase não configurado no proxy.');
    const res = await fetch(`${base}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: auth.key,
        Authorization: auth.auth,
        'Content-Type': 'application/json',
        ...(init?.headers as Record<string, string>),
      },
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(t.slice(0, 300));
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }

  return {
    async getConfig(): Promise<EvolutionGoConfig | null> {
      const rows = await rest<Array<{ key: string; value: string }>>(
        'integration_settings?select=key,value&key=in.(evolution_api_url,evolution_api_key)',
      );
      let url = '';
      let globalApiKey = '';
      for (const r of rows) {
        if (r.key === 'evolution_api_url') url = (r.value ?? '').replace(/\/$/, '');
        if (r.key === 'evolution_api_key') globalApiKey = r.value ?? '';
      }
      if (!url || !globalApiKey) return null;
      return { url, globalApiKey };
    },

    async getInstanceById(id: string) {
      const rows = await rest<DbInstance[]>(
        `evolution_instances?select=*&id=eq.${id}&limit=1`,
      );
      return rows[0] ?? null;
    },

    async getSingletonInstance() {
      const rows = await rest<DbInstance[]>(
        'evolution_instances?select=*&order=criado_em.asc&limit=1',
      );
      return rows[0] ?? null;
    },

    async insertInstance(row) {
      const rows = await rest<DbInstance[]>('evolution_instances', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'disconnected', ...row }),
      });
      const inst = rows[0];
      if (!inst) throw new Error('Falha ao inserir instância.');
      return inst;
    },

    async updateInstance(id, patch) {
      await rest(`evolution_instances?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ ...patch, atualizado_em: new Date().toISOString() }),
      });
    },
  };
}

export async function handleEvolutionAdmin(request: Request, env: Env): Promise<Response> {
  const origin = request.headers.get('Origin');
  const cors = corsHeaders(origin);

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (!(await verifyAdminUser(request, env))) {
    return json({ error: 'Não autorizado' }, 401, cors);
  }

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? 'test_connection');
  const webhookUrl = `${env.SUPABASE_URL}/functions/v1/evolution-webhook`;

  try {
    const result = await handleEvolutionAction(action, body, createDb(env, request), webhookUrl);
    return json(result, 200, cors);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return json({ error: message }, 502, cors);
  }
}
