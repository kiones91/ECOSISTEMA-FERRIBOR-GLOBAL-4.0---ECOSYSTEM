import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { notifyIntegrationSuccess } from '@/lib/integrationSuccessNotify';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';

export interface IntegrationSetting {
  id: string;
  organization_id: string;
  integration_type: string;
  api_key_masked: string | null;
  is_configured: boolean;
  settings: Record<string, unknown>;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

const AVAILABLE_INTEGRATIONS = [
  {
    type: 'resend',
    name: 'Resend',
    description: 'Envio de emails transacionais',
    icon: 'Mail',
    docsUrl: 'https://resend.com/docs'
  },
  {
    type: 'firecrawl',
    name: 'Firecrawl',
    description: 'Web scraping e crawling',
    icon: 'Globe',
    docsUrl: 'https://firecrawl.dev/docs'
  },
  {
    type: 'zapier',
    name: 'Zapier',
    description: 'Automações e webhooks',
    icon: 'Zap',
    docsUrl: 'https://zapier.com/developer'
  }
];

export function useIntegrations() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['integration-settings', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('id, organization_id, integration_type, api_key_masked, is_configured, last_verified_at, created_at, updated_at')
        .eq('organization_id', profile!.organization_id!);

      if (error) throw error;

      // Merge with available integrations
      return AVAILABLE_INTEGRATIONS.map(integration => {
        const setting = data?.find(s => s.integration_type === integration.type);
        return {
          ...integration,
          setting: setting as IntegrationSetting | undefined
        };
      });
    },
    enabled: !!profile?.organization_id
  });
}

export type OrgApiKeyIntegration = 'resend' | 'firecrawl' | 'zapier';

export function useSaveIntegrationCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { integrationType: OrgApiKeyIntegration; apiKey: string }) => {
      const { data, error } = await supabase.functions.invoke('save-integration-credential', {
        body: { integration_type: input.integrationType, api_key: input.apiKey },
      });
      if (error) throw new Error(await parseEdgeFunctionError(error, data));
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      queryClient.invalidateQueries({ queryKey: ['all-integration-settings'] });
      const notifyId =
        variables.integrationType === 'firecrawl' || variables.integrationType === 'zapier'
          ? variables.integrationType
          : 'api-keys';
      notifyIntegrationSuccess(notifyId);
    },
    onError: (error: Error) => {
      toast.error(`Falha ao salvar: ${error.message}`);
    },
  });
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      integrationType, 
      apiKeyMasked,
      isConfigured,
      settings 
    }: { 
      integrationType: string;
      apiKeyMasked?: string;
      isConfigured?: boolean;
      settings?: Record<string, unknown>;
    }) => {
      const { data: existing } = await supabase
        .from('integration_settings')
        .select('id')
        .eq('organization_id', profile!.organization_id!)
        .eq('integration_type', integrationType)
        .single();

      if (existing) {
        const { error } = await supabase
          .from('integration_settings')
          .update({
            api_key_masked: apiKeyMasked,
            is_configured: isConfigured,
            settings: settings ? JSON.parse(JSON.stringify(settings)) : undefined,
            last_verified_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integration_settings')
          .insert([{
            organization_id: profile!.organization_id!,
            integration_type: integrationType,
            api_key_masked: apiKeyMasked,
            is_configured: isConfigured ?? false,
            settings: JSON.parse(JSON.stringify(settings ?? {})),
            last_verified_at: new Date().toISOString()
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration-settings'] });
      queryClient.invalidateQueries({ queryKey: ['all-integration-settings'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar integração: ' + error.message);
    }
  });
}

export function useEmailConfig() {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['email-config', profile?.organization_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_settings')
        .select('settings')
        .eq('organization_id', profile!.organization_id!)
        .eq('integration_type', 'email_config')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return (data?.settings as {
        senderName?: string;
        senderEmail?: string;
        signature?: string;
        logoUrl?: string;
      }) ?? {
        senderName: '',
        senderEmail: '',
        signature: '',
        logoUrl: ''
      };
    },
    enabled: !!profile?.organization_id
  });
}

export function useUpdateEmailConfig() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (config: {
      senderName?: string;
      senderEmail?: string;
      signature?: string;
      logoUrl?: string;
    }) => {
      const { data: existing } = await supabase
        .from('integration_settings')
        .select('id')
        .eq('organization_id', profile!.organization_id!)
        .eq('integration_type', 'email_config')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('integration_settings')
          .update({
            settings: config,
            is_configured: true
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integration_settings')
          .insert({
            organization_id: profile!.organization_id!,
            integration_type: 'email_config',
            is_configured: true,
            settings: config
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-config'] });
      notifyIntegrationSuccess('email-config');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configurações: ' + error.message);
    }
  });
}
