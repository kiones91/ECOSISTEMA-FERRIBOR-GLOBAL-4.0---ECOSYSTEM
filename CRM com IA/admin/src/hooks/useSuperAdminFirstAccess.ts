import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { platformSettingsSelect } from '@/lib/platformSettingsRow';

const DEFAULT_EMAILS = [
  'comercial@buffallos.online',
  'superadmin@buffallos.online',
  'admin@buffallos.online',
];

/**
 * Detecta se o super admin atual está usando credenciais padrão de instalação
 * (email padrão OU senha ainda não trocada). Usado para forçar o modal de
 * primeiro acesso após o seed inicial em um remix.
 */
export function useSuperAdminFirstAccess() {
  const { user, isSuperAdmin } = useAuth();

  const query = useQuery({
    queryKey: ['platform-settings', 'first-access'],
    enabled: !!user?.id && isSuperAdmin(),
    queryFn: async () => {
      const [settingsRes, orgsRes] = await Promise.all([
        platformSettingsSelect(
          supabase
            .from('platform_settings')
            .select('default_password_changed, remix_setup_completed')
        ).maybeSingle(),
        supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true }),
      ]);
      if (settingsRes.error) throw settingsRes.error;
      return {
        settings: settingsRes.data as { default_password_changed?: boolean; remix_setup_completed?: boolean } | null,
        orgCount: orgsRes.count ?? 0,
      };
    },
  });

  const usingDefaultEmail = !!user?.email && DEFAULT_EMAILS.includes(user.email.toLowerCase());
  const settings = query.data?.settings ?? null;
  const passwordNotChanged = settings?.default_password_changed === false;
  // Single-tenant: o wizard de configuração obrigatória foi removido. A empresa
  // é dona do CRM; não há etapa de setup forçado. Eventuais pendências ficam
  // apenas no checklist do dashboard (não bloqueiam o uso).
  const shouldForceSetup = false;

  return {
    shouldForceSetup,
    usingDefaultEmail,
    passwordNotChanged,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
