import { supabase } from '@/integrations/supabase/client';

/**
 * Acesso a tabelas ainda não presentes nos tipos gerados do Supabase.
 * Evita erros TS2589/TS2769 no build de produção.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extraTable(table: string): any {
  return (supabase as any).from(table);
}
