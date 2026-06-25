-- Tabela single-tenant usada pelo runtime dos agentes
CREATE TABLE IF NOT EXISTS ai_credentials (
  provider TEXT PRIMARY KEY,
  api_key TEXT NOT NULL DEFAULT '',
  model_default TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela multi-tenant usada pela UI admin
CREATE TABLE IF NOT EXISTS org_ai_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  api_key_encrypted TEXT NOT NULL DEFAULT '',
  api_key_masked TEXT,
  model_default TEXT,
  last_verified_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, provider)
);

-- Roteamento single-tenant (runtime)
CREATE TABLE IF NOT EXISTS ai_routing (
  capability TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT,
  fallback_provider TEXT,
  fallback_model TEXT,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Roteamento multi-tenant (UI admin)
CREATE TABLE IF NOT EXISTS org_ai_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  provider TEXT NOT NULL,
  model TEXT,
  fallback_to_lovable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, capability)
);

-- Key/value store para flags globais (IA Geral toggle, etc.)
CREATE TABLE IF NOT EXISTS integration_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed: IA Geral desligada por padrão
INSERT INTO integration_settings (key, value)
VALUES ('ai_global_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

INSERT INTO integration_settings (key, value)
VALUES ('ai_webchat_auto', 'true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO integration_settings (key, value)
VALUES ('ai_whatsapp_auto', 'false')
ON CONFLICT (key) DO NOTHING;

-- RLS: permitir leitura/escrita para authenticated
ALTER TABLE ai_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "ai_credentials_all" ON ai_credentials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE org_ai_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "org_ai_credentials_all" ON org_ai_credentials
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE ai_routing ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "ai_routing_all" ON ai_routing
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE org_ai_routing ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "org_ai_routing_all" ON org_ai_routing
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "integration_settings_all" ON integration_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
