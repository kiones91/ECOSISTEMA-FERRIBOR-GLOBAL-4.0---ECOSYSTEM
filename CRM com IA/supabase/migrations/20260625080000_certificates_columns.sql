-- ============================================================
-- Certificados em colunas separadas (1 por tipo)
-- Cada coluna armazena um JSONB com: name, url, uploaded_at
-- ============================================================

alter table public.orders add column if not exists cert_vedacao jsonb;
alter table public.orders add column if not exists cert_co2 jsonb;
alter table public.orders add column if not exists cert_esg jsonb;
alter table public.orders add column if not exists cert_iso_9001 jsonb;
alter table public.orders add column if not exists cert_iso_14001 jsonb;
alter table public.orders add column if not exists cert_impacto_ambiental jsonb;
