/** Garante no máximo 1 linha (evita erro PGRST116 com duplicatas em platform_settings). */
export function platformSettingsSelect<T>(query: T): T {
  return (query as { order: (col: string, opts: { ascending: boolean }) => { limit: (n: number) => T } })
    .order('updated_at', { ascending: false })
    .limit(1);
}
