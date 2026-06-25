import type { Env } from '../types';
import { json } from './api';

async function invokeSdrBot(env: Env, conversationId: string): Promise<void> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  const res = await fetch(`${env.SUPABASE_URL}/functions/v1/webchat-agente`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ conversation_id: conversationId }),
  });
  if (!res.ok) {
    console.error('webchat-agente', res.status, await res.text().catch(() => ''));
  }
}

async function sbFetch(env: Env, path: string, init?: RequestInit) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Chat indisponível no momento');
  }
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers as Record<string, string>),
    },
  });
  return res;
}

async function getSession(env: Env, token: string) {
  const res = await sbFetch(
    env,
    `webchat_sessions?select=id,conversation_id,visitor_name,visitor_email&session_token=eq.${encodeURIComponent(token)}&limit=1`,
  );
  if (!res.ok) throw new Error('Erro ao buscar sessão');
  const rows = (await res.json()) as Array<{
    id: string;
    conversation_id: string;
    visitor_name: string | null;
    visitor_email: string | null;
  }>;
  return rows[0] ?? null;
}

async function getNovoStageId(env: Env): Promise<string | null> {
  const res = await sbFetch(env, 'pipeline_stages?select=id&slug=eq.novo&limit=1');
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}

async function createWebchatLead(
  env: Env,
  name: string,
  email: string | null,
): Promise<string | null> {
  const stageId = await getNovoStageId(env);
  const res = await sbFetch(env, 'leads', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      nome: name,
      email,
      origem: 'webchat',
      pipeline_stage_id: stageId,
    }),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ id: string }>;
  return rows[0]?.id ?? null;
}

async function linkConversationLead(env: Env, conversationId: string, leadId: string) {
  await sbFetch(env, `inbox_conversations?id=eq.${conversationId}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ lead_id: leadId, atualizado_em: new Date().toISOString() }),
  });
}

async function logWebchatInteraction(env: Env, leadId: string, text: string) {
  await sbFetch(env, 'interactions', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      lead_id: leadId,
      tipo: 'whatsapp',
      canal: 'webchat',
      conteudo: text,
    }),
  });
}

async function ensureConversationLead(
  env: Env,
  conversationId: string,
  name: string,
  email: string | null,
): Promise<string | null> {
  const convRes = await sbFetch(
    env,
    `inbox_conversations?select=id,lead_id,contact_name&id=eq.${conversationId}&limit=1`,
  );
  if (!convRes.ok) return null;
  const convRows = (await convRes.json()) as Array<{ lead_id: string | null; contact_name: string }>;
  const conv = convRows[0];
  if (!conv) return null;
  if (conv.lead_id) return conv.lead_id;

  const leadId = await createWebchatLead(env, name || conv.contact_name || 'Visitante', email);
  if (leadId) await linkConversationLead(env, conversationId, leadId);
  return leadId;
}

export async function handleWebchat(
  request: Request,
  env: Env,
  ctx?: ExecutionContext,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (url.pathname !== '/api/webchat') return null;

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
      },
    });
  }

  const cors = { 'Access-Control-Allow-Origin': '*' };

  try {
    if (request.method === 'GET') {
      const token = url.searchParams.get('session_token');
      if (!token) return json({ error: 'session_token obrigatório' }, 400, cors);

      const session = await getSession(env, token);
      if (!session) return json({ error: 'sessão inválida' }, 404, cors);

      const res = await sbFetch(
        env,
        `inbox_messages?select=id,direction,body,sender_type,criado_em&conversation_id=eq.${session.conversation_id}&order=criado_em.asc`,
      );
      if (!res.ok) return json({ error: 'Erro ao buscar mensagens' }, 502, cors);
      const messages = await res.json();
      return json({ messages: messages ?? [] }, 200, cors);
    }

    if (request.method !== 'POST') return json({ error: 'Método não permitido' }, 405, cors);

    const body = (await request.json()) as Record<string, unknown>;
    const action = String(body.action ?? '');

    if (action === 'start') {
      const name = String(body.name ?? 'Visitante').trim() || 'Visitante';
      const email = body.email ? String(body.email).trim() || null : null;

      const leadId = await createWebchatLead(env, name, email);

      const convRes = await sbFetch(env, 'inbox_conversations', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          channel: 'webchat',
          contact_name: name,
          contact_email: email,
          lead_id: leadId,
          status: 'open',
          external_id: crypto.randomUUID(),
        }),
      });
      if (!convRes.ok) {
        return json({ error: 'Não foi possível iniciar o chat' }, 502, cors);
      }
      const convRows = (await convRes.json()) as Array<{ id: string }>;
      const conv = convRows[0];
      if (!conv) return json({ error: 'Conversa não criada' }, 502, cors);

      const sessRes = await sbFetch(env, 'webchat_sessions', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          conversation_id: conv.id,
          visitor_name: name,
          visitor_email: email,
        }),
      });
      if (!sessRes.ok) return json({ error: 'Sessão não criada' }, 502, cors);
      const sessRows = (await sessRes.json()) as Array<{ session_token: string; conversation_id: string }>;
      const session = sessRows[0];
      if (!session) return json({ error: 'Sessão inválida' }, 502, cors);

      return json(
        {
          session_token: session.session_token,
          conversation_id: session.conversation_id,
          lead_id: leadId,
        },
        200,
        cors,
      );
    }

    if (action === 'send') {
      const token = String(body.session_token ?? '');
      const text = String(body.text ?? '').trim();
      if (!token || !text) return json({ error: 'session_token e text obrigatórios' }, 400, cors);

      const session = await getSession(env, token);
      if (!session) return json({ error: 'sessão inválida' }, 404, cors);

      const leadId = await ensureConversationLead(
        env,
        session.conversation_id,
        session.visitor_name ?? 'Visitante',
        session.visitor_email,
      );

      const msgRes = await sbFetch(env, 'inbox_messages', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          conversation_id: session.conversation_id,
          direction: 'inbound',
          body: text,
          sender_type: 'contact',
        }),
      });
      if (!msgRes.ok) return json({ error: 'Erro ao enviar mensagem' }, 502, cors);

      if (leadId) await logWebchatInteraction(env, leadId, text);

      const runBot = () => invokeSdrBot(env, session.conversation_id);
      if (ctx?.waitUntil) ctx.waitUntil(runBot());
      else await runBot();

      return json({ ok: true }, 200, cors);
    }

    return json({ error: 'action inválida' }, 400, cors);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro no chat' }, 500, cors);
  }
}
