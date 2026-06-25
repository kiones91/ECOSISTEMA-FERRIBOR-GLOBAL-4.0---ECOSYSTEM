-- ============================================================
-- FerriBor — Dados reais do emitente + Bucket de certificados
-- CNPJ: 20.036.263/0001-68
-- ============================================================

-- Atualiza emitter_data padrão com dados reais da FerriBor
alter table public.orders alter column emitter_data set default '{
  "razao_social": "Ferri Fabricação de Artefatos de Borracha Ltda",
  "nome_fantasia": "FerriBor",
  "cnpj": "20.036.263/0001-68",
  "ie": "",
  "endereco": "Santa Gertrudes, SP",
  "municipio": "Santa Gertrudes",
  "uf": "SP",
  "cep": "",
  "natureza_juridica": "Sociedade Empresária Limitada",
  "cnae_principal": "2219-6/00 - Fabricação de artefatos de borracha não especificados anteriormente",
  "data_fundacao": "2014-04-07",
  "regime_tributario": "1",
  "country": "BR"
}'::jsonb;

-- Atualiza pedidos existentes com dados reais
update public.orders set emitter_data = '{
  "razao_social": "Ferri Fabricação de Artefatos de Borracha Ltda",
  "nome_fantasia": "FerriBor",
  "cnpj": "20.036.263/0001-68",
  "ie": "",
  "endereco": "Santa Gertrudes, SP",
  "municipio": "Santa Gertrudes",
  "uf": "SP",
  "cep": "",
  "natureza_juridica": "Sociedade Empresária Limitada",
  "cnae_principal": "2219-6/00 - Fabricação de artefatos de borracha não especificados anteriormente",
  "data_fundacao": "2014-04-07",
  "regime_tributario": "1",
  "country": "BR"
}'::jsonb where emitter_data is null or emitter_data->>'cnpj' = '';

-- Bucket de storage para certificados e documentos de pedidos
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Policy: qualquer autenticado pode fazer upload
create policy "documents_upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents');

-- Policy: qualquer um pode ler (público)
create policy "documents_read" on storage.objects
  for select using (bucket_id = 'documents');

-- Policy: staff pode deletar
create policy "documents_delete" on storage.objects
  for delete using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role in ('admin', 'comercial', 'manager')
    )
  );
