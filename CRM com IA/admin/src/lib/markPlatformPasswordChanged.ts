import { supabase } from '@/integrations/supabase/client';
import { platformSettingsSelect } from '@/lib/platformSettingsRow';

/** Marca senha padrão como trocada (RPC + fallback direto em platform_settings). */
export async function markPlatformPasswordChanged(): Promise<{ ok: boolean; error?: string }> {
  const { error: rpcError } = await supabase.rpc('mark_super_admin_password_changed' as never);
  if (!rpcError) return { ok: true };

  const { data: row, error: readError } = await platformSettingsSelect(
    supabase.from('platform_settings').select('id')
  ).maybeSingle();

  if (readError || !row?.id) {
    return { ok: false, error: rpcError.message || readError?.message || 'platform_settings não encontrado' };
  }

  const { error: updateError } = await supabase
    .from('platform_settings')
    .update({ default_password_changed: true })
    .eq('id', row.id);

  if (updateError) {
    return { ok: false, error: updateError.message };
  }

  return { ok: true };
}
