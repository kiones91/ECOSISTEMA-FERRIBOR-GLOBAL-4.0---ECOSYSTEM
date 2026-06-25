-- ============================================================
-- Adiciona número sequencial de pedido (order_number)
-- Formato: inteiro auto-incrementado, gerado via sequence
-- ============================================================

create sequence if not exists public.order_number_seq start 1000;

alter table public.orders add column if not exists order_number integer unique default nextval('public.order_number_seq');
