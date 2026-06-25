/** Tipos do Worker FerriBor (API + assets estáticos). */

export interface Env {
  ASSETS: Fetcher;
  /** Supabase — bridge CRM / Evolution */
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}
