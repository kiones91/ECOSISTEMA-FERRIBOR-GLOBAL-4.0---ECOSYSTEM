import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Certificate {
  id: string;
  certificate_number: number;
  type: string;
  status: string;
  client_id: string | null;
  client_name: string | null;
  client_company: string | null;
  client_cnpj: string | null;
  client_address: string | null;
  order_id: string | null;
  data: Record<string, unknown>;
  notes: string | null;
  signature_ids: string[];
  pdf_url: string | null;
  issued_at: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export type CertificateType = 'vedacao' | 'co2' | 'esg' | 'iso_9001' | 'iso_14001' | 'impacto_ambiental';

export const CERTIFICATE_TYPES: { type: CertificateType; label: string; color: string }[] = [
  { type: 'vedacao', label: 'Certificado de Vedação', color: 'blue' },
  { type: 'co2', label: 'Certificado CO₂', color: 'green' },
  { type: 'esg', label: 'Certificado ESG', color: 'emerald' },
  { type: 'iso_9001', label: 'ISO 9001', color: 'amber' },
  { type: 'iso_14001', label: 'ISO 14001', color: 'teal' },
  { type: 'impacto_ambiental', label: 'Impacto Ambiental', color: 'purple' },
];

export function useCertificates(typeFilter?: CertificateType | 'all') {
  return useQuery({
    queryKey: ['certificates', typeFilter],
    queryFn: async () => {
      let query = (supabase as any)
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeFilter && typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[certificates] Table not ready:', error.message);
        return [] as Certificate[];
      }
      return (data || []) as Certificate[];
    },
  });
}

export function useCertificateStats() {
  return useQuery({
    queryKey: ['certificates', 'stats'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('certificates')
        .select('type, status');
      if (error) {
        console.warn('[certificates] Table not ready:', error.message);
        return { total: 0, issued: 0, draft: 0, byType: CERTIFICATE_TYPES.map(t => ({ ...t, count: 0, issuedCount: 0 })) };
      }

      const all = (data || []) as { type: string; status: string }[];
      const total = all.length;
      const issued = all.filter(c => c.status === 'issued').length;
      const draft = all.filter(c => c.status === 'draft').length;
      const byType = CERTIFICATE_TYPES.map(t => ({
        ...t,
        count: all.filter(c => c.type === t.type).length,
        issuedCount: all.filter(c => c.type === t.type && c.status === 'issued').length,
      }));

      return { total, issued, draft, byType };
    },
  });
}

export function useCreateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Certificate>) => {
      const { data, error } = await (supabase as any)
        .from('certificates')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}

export function useUpdateCertificate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Certificate> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('certificates')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Certificate;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
}
