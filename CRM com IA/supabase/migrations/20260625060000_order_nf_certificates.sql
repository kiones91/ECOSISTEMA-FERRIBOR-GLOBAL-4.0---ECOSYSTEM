-- ============================================================
-- FerriBor Global 4.0 — Nota Fiscal + Certificados no Pedido
-- Estrutura pronta para integração com Receita Federal (BR)
-- e órgãos fiscais da América Latina.
-- ============================================================

-- Campos de Nota Fiscal
alter table public.orders add column if not exists nf_number text;
alter table public.orders add column if not exists nf_serie text;
alter table public.orders add column if not exists nf_access_key text; -- chave de acesso 44 dígitos
alter table public.orders add column if not exists nf_issued_at timestamptz;
alter table public.orders add column if not exists nf_status text default 'pending'; -- pending, issued, cancelled, rejected

-- Dados fiscais estruturados (JSONB para flexibilidade BR + LATAM)
-- BR: CNPJ, IE, CFOP, NCM, ICMS, IPI, PIS, COFINS, etc.
-- LATAM: RUC (PE), RUT (CL/UY), CUIT (AR), NIT (CO/BO), RFC (MX)
alter table public.orders add column if not exists nf_fiscal_data jsonb default '{}';

-- Certificados anexados ao pedido (ISO, ESG, vedação, CO²)
alter table public.orders add column if not exists certificates jsonb default '[]';

-- Dados do emitente (FerriBor) para NF - preenchido automaticamente
alter table public.orders add column if not exists emitter_data jsonb default '{
  "razao_social": "FerriBor Artefatos de Borracha Ltda",
  "nome_fantasia": "FerriBor",
  "cnpj": "",
  "ie": "",
  "endereco": "",
  "municipio": "",
  "uf": "",
  "cep": "",
  "regime_tributario": "1",
  "country": "BR"
}';

-- Comentário: Estrutura fiscal LATAM suportada via nf_fiscal_data
-- AR: { "cuit": "...", "tipo_factura": "A/B/C", "punto_venta": "...", "cae": "..." }
-- CL: { "rut": "...", "tipo_dte": "33/34/52", "folio": "...", "timbre": "..." }
-- MX: { "rfc": "...", "uuid_cfdi": "...", "serie": "...", "folio": "..." }
-- CO: { "nit": "...", "resolucion": "...", "cufe": "..." }
-- PE: { "ruc": "...", "tipo_comprobante": "01/03", "serie": "...", "correlativo": "..." }
