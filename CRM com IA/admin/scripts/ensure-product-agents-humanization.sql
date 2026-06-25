-- Coluna humanization em product_agents (idempotente)
ALTER TABLE public.product_agents
  ADD COLUMN IF NOT EXISTS humanization JSONB NOT NULL DEFAULT '{}'::jsonb;

NOTIFY pgrst, 'reload schema';
