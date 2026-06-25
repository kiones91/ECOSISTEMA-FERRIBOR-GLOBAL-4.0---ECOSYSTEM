import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { record } = await req.json();

    if (!record?.id) {
      return new Response(JSON.stringify({ error: 'Missing order record' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', record.id)
      .single();

    if (!order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const itemsSummary = order.order_items
      ?.map((i: any) => `${i.quantity}x ${i.product_name}`)
      .join(', ') || 'sem itens';

    // Insert notification for CRM staff
    await supabase.from('notifications').insert({
      title: `Novo pedido de ${order.client_name || 'Cliente'}`,
      body: `Pedido: ${itemsSummary}. Empresa: ${order.client_company || '—'}`,
      type: 'order',
      reference_id: order.id,
      is_read: false,
    }).throwOnError().catch(() => {
      // notifications table may not exist yet — silent fail
    });

    return new Response(
      JSON.stringify({ success: true, order_id: order.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
