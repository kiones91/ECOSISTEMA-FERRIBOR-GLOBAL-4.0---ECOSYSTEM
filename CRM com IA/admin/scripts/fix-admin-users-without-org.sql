-- Cria perfil e vincula à primeira organização para admins sem profile/org.

INSERT INTO public.profiles (id, full_name, email, organization_id)
SELECT au.user_id,
  au.full_name,
  au.email,
  (SELECT id FROM public.organizations ORDER BY created_at ASC LIMIT 1)
FROM (
  SELECT DISTINCT ur.user_id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)) AS full_name
  FROM public.user_roles ur
  JOIN auth.users u ON u.id = ur.user_id
  WHERE ur.role IN ('admin', 'manager', 'super_admin')
) au
LEFT JOIN public.profiles p ON p.id = au.user_id
WHERE p.id IS NULL;

UPDATE public.profiles p
SET organization_id = (SELECT id FROM public.organizations ORDER BY created_at ASC LIMIT 1),
    updated_at = now()
WHERE p.organization_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role IN ('admin', 'manager', 'super_admin')
  );
