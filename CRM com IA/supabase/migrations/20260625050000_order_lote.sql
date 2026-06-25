-- Campo LOTE para controle interno de despacho
alter table public.orders add column if not exists lote text;
