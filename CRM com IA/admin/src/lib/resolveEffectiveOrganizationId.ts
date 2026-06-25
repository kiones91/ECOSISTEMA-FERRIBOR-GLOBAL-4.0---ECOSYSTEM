/**
 * Org efetiva para queries de integrações.
 *
 * Retorna SOMENTE a organização do próprio perfil. NÃO há fallback para a
 * "primeira organização": isso causava vazamento cross-tenant — um super admin
 * sem vínculo passava a ler/gravar as integrações de uma empresa real.
 *
 * Configuração de plataforma (apps Meta, Cakto platform, etc.) vive no /superadmin.
 */
export async function resolveEffectiveOrganizationId(
  profileOrganizationId?: string | null,
): Promise<string | null> {
  return profileOrganizationId ?? null;
}
