-- Execute no Supabase SQL Editor (produção ooshltpxjeldnobksrjs)
-- Idempotente: pode rodar mais de uma vez.

ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS public_app_url text;

-- 1) Rebrand platform_settings
UPDATE public.platform_settings
SET
  platform_name = 'Buffallos Sales',
  footer_text = '© 2026 Buffallos Sales. Todos os direitos reservados.',
  browser_title = COALESCE(NULLIF(trim(browser_title), ''), 'Buffallos Sales'),
  meta_description = COALESCE(NULLIF(trim(meta_description), ''), 'Buffallos Sales — Plataforma de vendas com IA'),
  public_app_url = COALESCE(NULLIF(trim(public_app_url), ''), 'https://app.buffallos.com.br')
WHERE platform_name IS NULL
   OR platform_name ILIKE '%vendus%'
   OR platform_name ILIKE '%bizon%'
   OR platform_name = 'Plataforma'
   OR public_app_url IS NULL
   OR public_app_url ILIKE '%vendus%'
   OR public_app_url ILIKE '%lovable%';

-- 2) Uma única linha em platform_settings
DELETE FROM public.platform_settings ps
WHERE ps.id NOT IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) AS rn
    FROM public.platform_settings
  ) ranked
  WHERE ranked.rn = 1
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_settings_singleton
  ON public.platform_settings ((true));

-- 3) Super admin: não forçar troca de senha no wizard
UPDATE public.platform_settings
SET default_password_changed = true, remix_setup_completed = true
WHERE COALESCE(default_password_changed, false) = false
   OR COALESCE(remix_setup_completed, false) = false;

-- 4) Central de ajuda (coluna correta: content_html)
UPDATE public.help_articles
SET
  slug = 'bem-vindo-buffallos-sales',
  title = 'Bem-vindo à Buffallos Sales',
  content_html = replace(replace(COALESCE(content_html, ''), 'Vendus', 'Buffallos Sales'), 'vendus', 'buffallos'),
  summary = replace(replace(COALESCE(summary, ''), 'Vendus', 'Buffallos Sales'), 'vendus', 'buffallos')
WHERE slug = 'bem-vindo-vendus'
   OR title ILIKE '%vendus%'
   OR COALESCE(content_html, '') ILIKE '%vendus%'
   OR COALESCE(summary, '') ILIKE '%vendus%';

-- 5) Storage logos / favicon
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Super admins can manage platform assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view platform assets" ON storage.objects;

CREATE POLICY "Super admins can manage platform assets"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'platform-assets' AND public.is_super_admin(auth.uid()))
WITH CHECK (bucket_id = 'platform-assets' AND public.is_super_admin(auth.uid()));

CREATE POLICY "Anyone can view platform assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'platform-assets');

-- 6) Templates mínimos de e-mail
INSERT INTO public.platform_email_templates (slug, name, description, category, subject, html_content, variables)
VALUES
('welcome_company', 'Boas-vindas Nova Empresa', 'Enviado quando uma nova empresa se cadastra',
 'sistema', 'Bem-vindo ao {{platform_name}}, {{company_name}}!',
 '<div><h1>Bem-vindo, {{company_name}}!</h1><p><a href="{{login_url}}">Acessar</a></p></div>',
 '["platform_name","company_name","user_name","login_url"]'::jsonb),
('team_invite', 'Convite de Equipe', 'Convite para equipe',
 'acesso', 'Convite — {{organization_name}}',
 '<div><p>Convite de {{invited_by_name}} para {{organization_name}}.</p><p><a href="{{invite_link}}">Aceitar</a></p></div>',
 '["platform_name","organization_name","invited_by_name","role_name","squad_text","invite_link"]'::jsonb),
('payment_reminder', 'Cobrança Pendente', 'Lembrete de pagamento',
 'cobranca', 'Lembrete de fatura',
 '<div><p>Fatura R$ {{amount}} — vence em {{days_until_due}} dias.</p></div>',
 '["platform_name","user_name","amount","due_date","days_until_due","payment_url"]'::jsonb),
('mass_email_default', 'Mala Direta (padrão)', 'Campanhas',
 'mala_direta', '{{subject}}', '<div>{{content}}</div>',
 '["platform_name","subject","content"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
