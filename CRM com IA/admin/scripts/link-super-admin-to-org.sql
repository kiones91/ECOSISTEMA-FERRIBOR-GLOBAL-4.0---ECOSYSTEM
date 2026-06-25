-- Vincula super admin sem organização à primeira empresa do sistema.
UPDATE public.profiles p
SET organization_id = o.id,
    updated_at = now()
FROM (
  SELECT id FROM public.organizations ORDER BY created_at ASC LIMIT 1
) o
WHERE p.organization_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = p.id AND ur.role IN ('super_admin', 'admin')
  );
