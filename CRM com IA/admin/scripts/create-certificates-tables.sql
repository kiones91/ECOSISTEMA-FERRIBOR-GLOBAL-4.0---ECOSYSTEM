-- Migration: Create certificates module tables
-- Run this in your Supabase SQL editor

-- Digital signatures (director, engineer, etc.)
create table if not exists digital_signatures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  signer_name text not null,
  signer_role text not null,
  signer_crea text,
  signature_url text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Certificates issued
create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid,
  certificate_number serial,
  type text not null,
  status text default 'draft',
  client_id uuid,
  client_name text,
  client_company text,
  client_cnpj text,
  client_address text,
  order_id uuid,
  data jsonb default '{}',
  notes text,
  signature_ids uuid[] default '{}',
  pdf_url text,
  issued_at timestamptz,
  valid_until timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_certificates_type on certificates(type);
create index if not exists idx_certificates_status on certificates(status);
create index if not exists idx_certificates_client_cnpj on certificates(client_cnpj);
create index if not exists idx_certificates_order_id on certificates(order_id);

-- RLS policies
alter table digital_signatures enable row level security;
alter table certificates enable row level security;

create policy "Authenticated users can read signatures"
  on digital_signatures for select to authenticated using (true);

create policy "Authenticated users can manage signatures"
  on digital_signatures for all to authenticated using (true) with check (true);

create policy "Authenticated users can read certificates"
  on certificates for select to authenticated using (true);

create policy "Authenticated users can manage certificates"
  on certificates for all to authenticated using (true) with check (true);
