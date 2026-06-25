-- ============================================================
-- FerriBor Global 4.0 — Chat entre Dashboard (cliente) e CRM (staff)
-- Integração #2: Dashboard → CRM (mensagens diretas)
-- ============================================================

-- Conversas entre cliente e equipe interna
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'closed')),
  subject text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.conversations enable row level security;

-- Cliente só vê as próprias conversas
create policy "conversations_client_select" on public.conversations
  for select using (auth.uid() = client_id);

-- Cliente pode criar conversa
create policy "conversations_client_insert" on public.conversations
  for insert with check (auth.uid() = client_id);

-- Mensagens dentro de uma conversa
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null,
  sender_type text not null check (sender_type in ('client', 'staff')),
  body text,
  attachments jsonb default '[]'::jsonb,
  criado_em timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Cliente vê mensagens das suas conversas
create policy "messages_client_select" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.client_id = auth.uid()
    )
  );

-- Cliente pode enviar mensagens nas suas conversas
create policy "messages_client_insert" on public.messages
  for insert with check (
    sender_type = 'client' and sender_id = auth.uid() and
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.client_id = auth.uid()
    )
  );

-- Atualiza timestamp da conversa quando nova mensagem chega
create or replace function public.update_conversation_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set atualizado_em = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists on_new_message on public.messages;
create trigger on_new_message
  after insert on public.messages
  for each row execute function public.update_conversation_timestamp();

-- Habilita Realtime nas mensagens para atualização em tempo real
alter publication supabase_realtime add table public.messages;
