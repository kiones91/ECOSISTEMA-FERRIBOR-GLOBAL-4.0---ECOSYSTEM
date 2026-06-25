-- =============================================================================
-- INFORHEALTH — Setup completo Inbox + Evolution (rode ANTES do upsert settings)
-- SQL Editor → colar tudo → Run
-- =============================================================================

-- 1) Tabelas (E1.3)
create table if not exists public.integration_settings (
  key text primary key,
  value text,
  atualizado_em timestamptz not null default now()
);

create table if not exists public.evolution_instances (
  id uuid primary key default gen_random_uuid(),
  instance_name text not null default 'inforhealth',
  instance_id text,
  instance_token text,
  status text not null default 'disconnected'
    check (status in ('disconnected', 'connecting', 'connected', 'error', 'qr_pending', 'paired')),
  phone_number text,
  qr_code_base64 text,
  api_base_url text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.evolution_instances
  add column if not exists instance_id text,
  add column if not exists instance_token text;

create table if not exists public.inbox_conversations (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('whatsapp', 'webchat')),
  lead_id uuid references public.leads (id) on delete set null,
  contact_name text not null,
  contact_phone text,
  contact_email text,
  status text not null default 'open' check (status in ('open', 'closed')),
  last_message_at timestamptz not null default now(),
  unread_count int not null default 0,
  external_id text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists inbox_conversations_last_message_idx
  on public.inbox_conversations (last_message_at desc);

create table if not exists public.inbox_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.inbox_conversations (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null,
  media_url text,
  sender_type text not null default 'contact'
    check (sender_type in ('contact', 'agent', 'system')),
  sender_user_id uuid references auth.users (id) on delete set null,
  external_id text,
  criado_em timestamptz not null default now()
);

create table if not exists public.webchat_sessions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.inbox_conversations (id) on delete cascade,
  visitor_name text,
  visitor_email text,
  session_token text not null unique default encode(gen_random_bytes(24), 'hex'),
  criado_em timestamptz not null default now()
);

create or replace function public.inbox_bump_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.inbox_conversations
  set last_message_at = new.criado_em,
      unread_count = case when new.direction = 'inbound' then unread_count + 1 else unread_count end,
      atualizado_em = now()
  where id = new.conversation_id;
  return new;
end; $$;

drop trigger if exists inbox_messages_bump on public.inbox_messages;
create trigger inbox_messages_bump after insert on public.inbox_messages
  for each row execute function public.inbox_bump_conversation();

alter table public.integration_settings enable row level security;
alter table public.evolution_instances enable row level security;
alter table public.inbox_conversations enable row level security;
alter table public.inbox_messages enable row level security;

drop policy if exists "integration_settings_admin" on public.integration_settings;
create policy "integration_settings_admin" on public.integration_settings for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "evolution_instances_staff_select" on public.evolution_instances;
create policy "evolution_instances_staff_select" on public.evolution_instances for select
  using (public.is_staff());

drop policy if exists "evolution_instances_admin_write" on public.evolution_instances;
create policy "evolution_instances_admin_write" on public.evolution_instances for all
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "inbox_conversations_select_staff" on public.inbox_conversations;
create policy "inbox_conversations_select_staff" on public.inbox_conversations for select
  using (public.is_staff());

drop policy if exists "inbox_conversations_manage_crm" on public.inbox_conversations;
create policy "inbox_conversations_manage_crm" on public.inbox_conversations for all
  using (public.can_manage_crm()) with check (public.can_manage_crm());

drop policy if exists "inbox_messages_select_staff" on public.inbox_messages;
create policy "inbox_messages_select_staff" on public.inbox_messages for select using (public.is_staff());

drop policy if exists "inbox_messages_manage_crm" on public.inbox_messages;
create policy "inbox_messages_manage_crm" on public.inbox_messages for all
  using (public.can_manage_crm()) with check (public.can_manage_crm());

insert into public.evolution_instances (instance_name, status)
select 'inforhealth', 'disconnected'
where not exists (select 1 from public.evolution_instances limit 1);

-- 2) Credenciais Evolution (salvas para quando o servidor estiver no ar)
insert into public.integration_settings (key, value) values
  ('evolution_api_url', 'https://whatsapp-api-evolution-go.gz9cms.easypanel.host'),
  ('evolution_api_key', 'e07ea3ed51b636c5f385cead297776b3'),
  ('evolution_instance_name', 'inforhealth')
on conflict (key) do update set value = excluded.value, atualizado_em = now();

-- 3) Conversas demo WhatsApp (testar inbox SEM Evolution)
with conv as (
  insert into public.inbox_conversations (
    channel, lead_id, contact_name, contact_phone, status,
    last_message_at, unread_count, external_id
  )
  select 'whatsapp', l.id, l.nome, l.telefone, 'open',
    now() - (row_number() over (order by l.criado_em)) * interval '2 hours', 1,
    'demo-inbox-' || l.id::text
  from public.leads l
  where l.origem = 'demo'
    and l.email in (
      'marina.alves@hospitalvida.com.br',
      'fernando.lopes@redeor.com.br',
      'eduardo.prado@hcor.com.br',
      'ricardo.mendes@einstein.br'
    )
    and not exists (
      select 1 from public.inbox_conversations c where c.external_id = 'demo-inbox-' || l.id::text
    )
  returning id
)
insert into public.inbox_messages (conversation_id, direction, body, sender_type)
select c.id, m.direction, m.body, m.sender_type
from conv c
cross join (values
  ('inbound', 'Olá! Gostaria de saber mais sobre os cursos ao vivo.', 'contact'),
  ('outbound', 'Olá! Obrigado pelo contato. Qual curso te interessa?', 'agent'),
  ('inbound', 'Tenho interesse na formação. Podem enviar a grade?', 'contact')
) as m(direction, body, sender_type)
where not exists (select 1 from public.inbox_messages im where im.conversation_id = c.id);

-- 4) Conferência
select
  (select count(*) from public.integration_settings) as settings,
  (select count(*) from public.inbox_conversations) as conversas,
  (select count(*) from public.inbox_messages) as mensagens;
