-- Garante buckets essenciais do CRM (idempotente — seguro reexecutar).
-- Projeto: ooshltpxjeldnobksrjs

-- company-logos (onboarding + configurações da empresa)
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can view company logos" ON storage.objects;
CREATE POLICY "Anyone can view company logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

DROP POLICY IF EXISTS "Org admins can upload company logos" ON storage.objects;
CREATE POLICY "Org admins can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.is_super_admin(auth.uid())
  )
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Org admins can update company logos" ON storage.objects;
CREATE POLICY "Org admins can update company logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.is_super_admin(auth.uid())
  )
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Org admins can delete company logos" ON storage.objects;
CREATE POLICY "Org admins can delete company logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'manager'::public.app_role)
    OR public.is_super_admin(auth.uid())
  )
  AND (storage.foldername(name))[1] = (
    SELECT organization_id::text FROM public.profiles WHERE id = auth.uid()
  )
);

-- avatars (perfil de usuário)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- catalog-media (catálogo de produtos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('catalog-media', 'catalog-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read catalog media" ON storage.objects;
CREATE POLICY "Public read catalog media"
ON storage.objects FOR SELECT
USING (bucket_id = 'catalog-media');

DROP POLICY IF EXISTS "Auth insert catalog media" ON storage.objects;
CREATE POLICY "Auth insert catalog media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'catalog-media');

DROP POLICY IF EXISTS "Auth update catalog media" ON storage.objects;
CREATE POLICY "Auth update catalog media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'catalog-media');

DROP POLICY IF EXISTS "Auth delete catalog media" ON storage.objects;
CREATE POLICY "Auth delete catalog media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'catalog-media');

-- help-media (central de ajuda)
INSERT INTO storage.buckets (id, name, public)
VALUES ('help-media', 'help-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can view help media" ON storage.objects;
CREATE POLICY "Anyone can view help media"
ON storage.objects FOR SELECT
USING (bucket_id = 'help-media');

DROP POLICY IF EXISTS "Super admin insert help media" ON storage.objects;
CREATE POLICY "Super admin insert help media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'help-media' AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin update help media" ON storage.objects;
CREATE POLICY "Super admin update help media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'help-media' AND public.is_super_admin(auth.uid()));

DROP POLICY IF EXISTS "Super admin delete help media" ON storage.objects;
CREATE POLICY "Super admin delete help media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'help-media' AND public.is_super_admin(auth.uid()));

-- platform-assets (identidade visual da plataforma)
INSERT INTO storage.buckets (id, name, public)
VALUES ('platform-assets', 'platform-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- chat-media (inbox: áudio, imagem, vídeo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "chat-media public read" ON storage.objects;
CREATE POLICY "chat-media public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat-media authenticated upload" ON storage.objects;
CREATE POLICY "chat-media authenticated upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat-media authenticated update" ON storage.objects;
CREATE POLICY "chat-media authenticated update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'chat-media');

DROP POLICY IF EXISTS "chat-media authenticated delete" ON storage.objects;
CREATE POLICY "chat-media authenticated delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'chat-media');

-- funnel-assets (logos/imagens de funis)
INSERT INTO storage.buckets (id, name, public)
VALUES ('funnel-assets', 'funnel-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "funnel_assets_public_read" ON storage.objects;
CREATE POLICY "funnel_assets_public_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'funnel-assets');

DROP POLICY IF EXISTS "funnel_assets_auth_insert" ON storage.objects;
CREATE POLICY "funnel_assets_auth_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'funnel-assets');

DROP POLICY IF EXISTS "funnel_assets_auth_update" ON storage.objects;
CREATE POLICY "funnel_assets_auth_update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'funnel-assets');

DROP POLICY IF EXISTS "funnel_assets_auth_delete" ON storage.objects;
CREATE POLICY "funnel_assets_auth_delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'funnel-assets');

-- product-documents (cérebro do produto / PDFs)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('product-documents', 'product-documents', false, 52428800)
ON CONFLICT (id) DO UPDATE SET file_size_limit = 52428800;

DROP POLICY IF EXISTS "Users can upload product documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their org product documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their org product documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can view product documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can upload product documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can update product documents" ON storage.objects;
DROP POLICY IF EXISTS "Org members can delete product documents" ON storage.objects;

CREATE POLICY "Org members can view product documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'product-documents'
  AND (storage.foldername(name))[1] = public.get_user_organization(auth.uid())::text
);

CREATE POLICY "Org members can upload product documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'product-documents'
  AND (storage.foldername(name))[1] = public.get_user_organization(auth.uid())::text
);

CREATE POLICY "Org members can update product documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'product-documents'
  AND (storage.foldername(name))[1] = public.get_user_organization(auth.uid())::text
);

CREATE POLICY "Org members can delete product documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'product-documents'
  AND (storage.foldername(name))[1] = public.get_user_organization(auth.uid())::text
);
