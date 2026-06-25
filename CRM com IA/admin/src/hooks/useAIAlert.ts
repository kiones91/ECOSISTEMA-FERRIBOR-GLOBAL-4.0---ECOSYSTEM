import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface AIProviderAlert {
  organization_id: string;
  exhausted: boolean;
  last_provider: string | null;
  last_error: string | null;
  updated_at: string;
}

/**
 * Lê o estado de esgotamento de IA (ai_provider_alert). Quando `exhausted` é
 * true, TODOS os provedores cadastrados falharam (cota/queda) — o admin vê o
 * alerta de recarga. O backend (_shared/direct-ai.ts) limpa o flag no primeiro
 * sucesso, então o banner some sozinho quando a IA volta.
 */
export function useAIAlert() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  return useQuery({
    queryKey: ['ai-provider-alert', orgId],
    enabled: !!orgId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<AIProviderAlert | null> => {
      const { data, error } = await supabase
        .from('ai_provider_alert')
        .select('organization_id, exhausted, last_provider, last_error, updated_at')
        .eq('organization_id', orgId as string)
        .maybeSingle();
      if (error) throw error;
      return (data as AIProviderAlert) ?? null;
    },
  });
}
