import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DigitalSignature {
  id: string;
  signer_name: string;
  signer_role: string;
  signer_crea: string | null;
  signature_url: string;
  created_at: string;
  updated_at: string;
}

export function useDigitalSignatures() {
  return useQuery({
    queryKey: ['digital-signatures'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('digital_signatures')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.warn('[signatures] Table not ready:', error.message);
        return [] as DigitalSignature[];
      }
      return (data || []) as DigitalSignature[];
    },
  });
}

export function useCreateSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { signer_name: string; signer_role: string; signer_crea?: string; signature_url: string }) => {
      const { data, error } = await (supabase as any)
        .from('digital_signatures')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as DigitalSignature;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['digital-signatures'] });
    },
  });
}

export function useDeleteSignature() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('digital_signatures')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['digital-signatures'] });
    },
  });
}
