import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ClientResult {
  id: string;
  name: string;
  company: string | null;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export function useClientSearch(query: string) {
  return useQuery({
    queryKey: ['client-search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];

      const q = query.trim().toLowerCase();

      const { data, error } = await (supabase as any)
        .from('orders')
        .select('client_id, client_name, client_company, client_cpf_cnpj, client_email, client_phone, shipping_address')
        .or(`client_name.ilike.%${q}%,client_company.ilike.%${q}%,client_cpf_cnpj.ilike.%${q}%`)
        .limit(20);

      if (error) throw error;

      const seen = new Set<string>();
      const results: ClientResult[] = [];

      for (const row of data || []) {
        const key = row.client_cpf_cnpj || row.client_name || '';
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          id: row.client_id || '',
          name: row.client_name || '',
          company: row.client_company || null,
          cnpj: row.client_cpf_cnpj || null,
          email: row.client_email || null,
          phone: row.client_phone || null,
          address: row.shipping_address || null,
        });
      }

      return results;
    },
    enabled: query.length >= 2,
  });
}
