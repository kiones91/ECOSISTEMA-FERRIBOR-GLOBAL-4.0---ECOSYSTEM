import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { notifyIntegrationSuccess } from '@/lib/integrationSuccessNotify';
import { parseEdgeFunctionError } from '@/lib/edgeFunctionError';
import { useEffectiveOrganizationId } from '@/hooks/useEffectiveOrganizationId';
import type { AIProviderId } from '@/config/aiProvidersCatalog';

export type AICapability =
  | 'agent_chat'
  | 'sales_copilot'
  | 'audio_transcription'
  | 'image_vision'
  | 'content_generation'
  | 'analysis_insights'
  | 'embeddings';

export type AIProvider = AIProviderId;

export interface AIRoutingRow {
  id?: string;
  capability: AICapability;
  provider: AIProvider;
  model: string | null;
}

export interface AICredentialRow {
  provider: AIProvider;
  api_key_masked: string | null;
  model_default: string | null;
  last_verified_at: string | null;
  last_error: string | null;
}

export const CAPABILITY_LABELS: Record<AICapability, { title: string; desc: string }> = {
  agent_chat: { title: 'Agentes de conversa', desc: 'WhatsApp, WebChat e Inbox' },
  sales_copilot: { title: 'Copiloto de vendas', desc: 'Sugestões para vendedores no painel' },
  audio_transcription: { title: 'Transcrição de áudio', desc: 'Conversão de áudios em texto (Whisper)' },
  image_vision: { title: 'Leitura de imagens', desc: 'Análise de fotos e prints recebidos' },
  content_generation: { title: 'Geração de conteúdo', desc: 'Criação de funis, formulários, agentes, objeções' },
  analysis_insights: { title: 'Análise e insights', desc: 'Avaliação de conversas, supervisão e relatórios' },
  embeddings: { title: 'Memória semântica', desc: 'Embeddings para busca contextual em conversas' },
};

export function useAICredentials() {
  return useQuery({
    queryKey: ['ai-credentials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_credentials')
        .select('provider, api_key, model_default, is_active, atualizado_em');
      if (error) throw error;
      return (data ?? [])
        .filter((row) => row.is_active && row.api_key)
        .map((row) => ({
          provider: row.provider as AIProvider,
          api_key_masked: row.api_key ? row.api_key.slice(0, 4) + '...' + row.api_key.slice(-4) : null,
          model_default: row.model_default,
          last_verified_at: row.atualizado_em,
          last_error: null,
        })) as AICredentialRow[];
    },
  });
}

export function useSaveAICredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      provider: AIProvider;
      api_key: string;
      model_default?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('save-ai-credential', {
        body: input,
      });
      if (error) throw new Error(await parseEdgeFunctionError(error, data));
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['org-ai-credentials'] });
      qc.invalidateQueries({ queryKey: ['integration-settings'] });
      qc.invalidateQueries({ queryKey: ['all-integration-settings'] });
      notifyIntegrationSuccess(variables.provider);
    },
    onError: (e: Error) => toast.error(`Falha ao salvar: ${e.message}`),
  });
}

export function useDeleteAICredential() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (provider: AIProvider) => {
      const { data, error } = await supabase.functions.invoke('save-ai-credential', {
        body: { provider, action: 'delete' },
      });
      if (error) throw new Error(await parseEdgeFunctionError(error, data));
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-ai-credentials'] });
      qc.invalidateQueries({ queryKey: ['all-integration-settings'] });
      toast.success('Chave removida');
    },
  });
}

export function useAIRouting() {
  const { data: orgId } = useEffectiveOrganizationId();
  return useQuery({
    queryKey: ['org-ai-routing', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_ai_routing')
        .select('id, capability, provider, model')
        .eq('organization_id', orgId!);
      if (error) throw error;
      return (data ?? []) as AIRoutingRow[];
    },
    enabled: !!orgId,
  });
}

export function useSaveAIRouting() {
  const { data: orgId } = useEffectiveOrganizationId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AIRoutingRow) => {
      if (!orgId) throw new Error('Organização não encontrada');
      const { error } = await supabase
        .from('org_ai_routing')
        .upsert(
          {
            organization_id: orgId,
            capability: input.capability,
            provider: input.provider,
            model: input.model,
            fallback_to_lovable: false,
          },
          { onConflict: 'organization_id,capability' },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['org-ai-routing'] });
      notifyIntegrationSuccess('ai-routing', { skipOpenDrawer: true });
    },
    onError: (e: Error) => toast.error(`Falha ao salvar roteamento: ${e.message}`),
  });
}
