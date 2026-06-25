import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { resolveEffectiveOrganizationId } from '@/lib/resolveEffectiveOrganizationId';

/** ID da organização para queries de integrações (inclui fallback para super admin). */
export function useEffectiveOrganizationId() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['effective-organization-id', profile?.organization_id],
    queryFn: () => resolveEffectiveOrganizationId(profile?.organization_id),
    enabled: true,
    staleTime: 60_000,
  });
}
