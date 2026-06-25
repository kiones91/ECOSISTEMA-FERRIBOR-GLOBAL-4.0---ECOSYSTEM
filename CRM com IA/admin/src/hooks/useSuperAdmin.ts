import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Platform settings hook
export function usePlatformSettings() {
  return useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Record<string, any>) => {
      const { data: existing } = await supabase
        .from('platform_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('platform_settings')
          .update(settings)
          .eq('id', existing.id)
          .select('*')
          .maybeSingle();
        if (error) throw error;
        return updated;
      }
      return null;
    },
    onSuccess: (updated) => {
      // Limpa o cache local antigo (placeholder visual) para não voltar ao estado anterior
      try {
        localStorage.removeItem('platform-branding-cache-v1');
      } catch {
        // ignore
      }

      // Semeia imediatamente o resultado na query canônica de branding
      // para que Logo, Login, favicon, cores etc. atualizem na mesma sessão
      // sem precisar de refresh manual.
      if (updated) {
        try {
          localStorage.setItem(
            'platform-branding-cache-v1',
            JSON.stringify(updated)
          );
        } catch {
          // ignore
        }
        queryClient.setQueryData(['platform-branding'], updated);
      }

      queryClient.invalidateQueries({ queryKey: ['platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['platform-branding'] });
      // Refetch ativo garante que qualquer dado derivado no servidor
      // (defaults, triggers, etc.) entre na UI imediatamente.
      queryClient.refetchQueries({ queryKey: ['platform-branding'] });
    },
  });
}

// Platform email settings hook
export function usePlatformEmailSettings() {
  return useQuery({
    queryKey: ['platform-email-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_email_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePlatformEmailSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: {
      provider?: string;
      sender_email?: string;
      sender_name?: string;
      smtp_host?: string;
      smtp_port?: number;
      reminder_days_before?: number;
      reminder_on_due_date?: boolean;
      alert_days_after?: number;
      suspend_days_after?: number;
    }) => {
      const { data: existing } = await supabase
        .from('platform_email_settings')
        .select('id')
        .limit(1)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('platform_email_settings')
          .update(settings)
          .eq('id', existing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-email-settings'] });
    },
  });
}

// Audit logs
export function useAuditLogs(limit = 50) {
  return useQuery({
    queryKey: ['audit-logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_audit_logs')
        .select(`
          *,
          profiles:actor_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateAuditLog() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: {
      action: string;
      entity_type?: string;
      entity_id?: string;
      metadata?: object;
    }) => {
      const { error } = await supabase
        .from('platform_audit_logs')
        .insert({
          action: log.action,
          entity_type: log.entity_type,
          entity_id: log.entity_id,
          metadata: log.metadata as any,
          actor_id: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
}
