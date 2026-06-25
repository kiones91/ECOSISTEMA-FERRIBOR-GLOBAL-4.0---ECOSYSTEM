import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Order {
  id: string;
  order_number: number | null;
  lote: string | null;
  nf_number: string | null;
  nf_serie: string | null;
  nf_access_key: string | null;
  nf_issued_at: string | null;
  nf_status: string | null;
  nf_fiscal_data: Record<string, unknown> | null;
  certificates: { type: string; name: string; url: string; uploaded_at: string }[] | null;
  cert_vedacao: { name: string; url: string; uploaded_at: string } | null;
  cert_co2: { name: string; url: string; uploaded_at: string } | null;
  cert_esg: { name: string; url: string; uploaded_at: string } | null;
  cert_iso_9001: { name: string; url: string; uploaded_at: string } | null;
  cert_iso_14001: { name: string; url: string; uploaded_at: string } | null;
  cert_impacto_ambiental: { name: string; url: string; uploaded_at: string } | null;
  emitter_data: Record<string, unknown> | null;
  client_id: string;
  organization_id: string | null;
  status: string;
  notes: string | null;
  delivery_deadline: string | null;
  shipping_address: string | null;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_company: string | null;
  client_cpf_cnpj: string | null;
  client_ie: string | null;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number | null;
  total_price: number | null;
  specifications: Record<string, unknown> | null;
  created_at: string;
}

export function useOrders(statusFilter?: string) {
  return useQuery({
    queryKey: ['orders', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Order[];
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Order;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select('*, order_items(*)')
        .single();
      if (error) throw error;

      // Send chat notification to client
      const statusLabels: Record<string, string> = {
        pending: 'aguardando aprovação',
        approved: 'aprovado',
        in_vulcanization: 'em vulcanização',
        in_production: 'em produção',
        in_expedition: 'em expedição',
        in_transit: 'em rota de entrega',
        at_carrier: 'na transportadora',
        delivered: 'entregue',
        rejected: 'rejeitado',
        cancelled: 'cancelado',
      };

      try {
        const { data: conv } = await supabase
          .from('conversations')
          .select('id')
          .eq('client_id', data.client_id)
          .eq('status', 'open')
          .order('criado_em', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (conv) {
          const statusText = statusLabels[status] || status;
          await supabase.from('messages').insert({
            conversation_id: conv.id,
            sender_id: data.client_id,
            sender_type: 'staff',
            body: `📋 Pedido N:${data.order_number || id.slice(0,8)} acabou de ser atualizado para "${statusText}".\n\nAcompanhe seu pedido no Portal do Cliente.`,
            attachments: [],
          });
        }
      } catch (chatErr) {
        console.error('Erro ao notificar cliente:', chatErr);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status');
      if (error) throw error;

      const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        confirmed: data.filter(o => o.status === 'confirmed').length,
        in_production: data.filter(o => o.status === 'in_production').length,
        shipped: data.filter(o => o.status === 'shipped').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        cancelled: data.filter(o => o.status === 'cancelled').length,
      };
      return stats;
    },
  });
}
