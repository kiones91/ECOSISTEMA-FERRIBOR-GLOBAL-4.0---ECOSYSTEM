import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffectiveOrganizationId } from '@/hooks/useEffectiveOrganizationId';

export interface LeadTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  organization_id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  is_automatic: boolean;
  is_lifecycle_status: boolean;
}

export function useLeadTags() {
  const orgId = useEffectiveOrganizationId();
  return useQuery({
    queryKey: ['lead-tags', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_tags')
        .select('*')
        .eq('organization_id', orgId!)
        .order('name');
      if (error) throw error;
      return data as LeadTag[];
    },
    enabled: !!orgId,
  });
}

export function useLeadTagsForLead(leadId?: string) {
  return useQuery({
    queryKey: ['lead-tag-assignments', leadId],
    queryFn: async () => [] as any[],
    enabled: false,
  });
}

export function useCreateLeadTag() {
  const queryClient = useQueryClient();
  const orgId = useEffectiveOrganizationId();
  return useMutation({
    mutationFn: async (input: { name: string; color: string; description?: string }) => {
      const { data, error } = await supabase
        .from('lead_tags')
        .insert({ ...input, organization_id: orgId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-tags'] }),
  });
}

export function useUpdateLeadTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; color?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('lead_tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-tags'] }),
  });
}

export function useDeleteLeadTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lead_tags').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['lead-tags'] }),
  });
}

export interface TagAutomation {
  id: string;
  tag_id: string;
  event: string;
  action: string;
  organization_id: string;
  created_at: string;
}

export const TAG_EVENT_LABELS: Record<string, string> = {
  purchase_completed: 'Compra realizada',
  pix_generated: 'PIX gerado',
  boleto_generated: 'Boleto gerado',
  checkout_abandoned: 'Checkout abandonado',
  payment_confirmed: 'Pagamento confirmado',
  subscription_cancelled: 'Assinatura cancelada',
};

export function useTagAutomations() {
  const orgId = useEffectiveOrganizationId();
  return useQuery({
    queryKey: ['tag-automations', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_tags')
        .select('*')
        .eq('organization_id', orgId!)
        .eq('is_automatic', true);
      if (error) throw error;
      return data as LeadTag[];
    },
    enabled: !!orgId,
  });
}

export function useUpsertTagAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_input: Partial<TagAutomation>) => {
      return null;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tag-automations'] }),
  });
}

export function useDeleteTagAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_id: string) => {},
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tag-automations'] }),
  });
}
