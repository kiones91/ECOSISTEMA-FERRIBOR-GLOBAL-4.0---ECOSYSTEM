-- ============================================================
-- FerriBor Global 4.0 — Sistema de Pedidos (Dashboard ↔ CRM)
-- Integração: cliente faz pedido no Portal → CRM processa
-- ============================================================

-- Campos adicionais no profiles para NF
alter table public.profiles add column if not exists cpf_cnpj text;
alter table public.profiles add column if not exists inscricao_estadual text;
alter table public.profiles add column if not exists endereco_completo text;

-- Tabela principal de pedidos
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  organization_id uuid,
  status text not null default 'pending',
  notes text,
  delivery_deadline date,
  shipping_address text,
  client_name text,
  client_email text,
  client_phone text,
  client_company text,
  client_cpf_cnpj text,
  client_ie text,
  total_amount numeric(12,2) default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Itens do pedido
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  product_name text not null,
  description text,
  quantity integer not null default 1,
  unit text default 'un',
  unit_price numeric(12,2),
  total_price numeric(12,2),
  specifications jsonb,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Clientes veem apenas seus pedidos
create policy "orders_client_select" on public.orders
  for select using (auth.uid() = client_id);

create policy "orders_client_insert" on public.orders
  for insert with check (auth.uid() = client_id);

-- Staff do CRM vê todos os pedidos
create policy "orders_staff_all" on public.orders
  for all using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'comercial', 'manager')
    )
  );

-- Order items: herda visibilidade do pedido pai
create policy "order_items_client_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.client_id = auth.uid()
    )
  );

create policy "order_items_client_insert" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.client_id = auth.uid()
    )
  );

create policy "order_items_staff_all" on public.order_items
  for all using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'comercial', 'manager')
    )
  );

-- Trigger para atualizar updated_at
create or replace function public.update_orders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_orders_updated_at();
