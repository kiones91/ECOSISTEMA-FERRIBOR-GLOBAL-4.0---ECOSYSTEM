import siteCatalog from "@/data/site-catalog.json";

export type SiteModalidade = "ao-vivo" | "gravado" | "mentoria";

export interface SiteCatalogCourse {
  slug: string;
  titulo: string;
  resumo: string;
  site_modalidade: SiteModalidade;
  modalidade: "gravado" | "ao_vivo";
  area: string;
  area_label: string;
  carga_horaria: string | null;
  thumb_path: string;
  preco_brl: number | null;
  preco_parcelas: string | null;
  checkout_ativo: boolean;
  site_url: string;
}

export const SITE_CATALOG = siteCatalog as {
  generated_at: string;
  count: number;
  courses: SiteCatalogCourse[];
};

export const AREA_ORDER = ["qualidade", "suplementar", "gestao", "faturamento", "governanca"] as const;

export const AREA_LABELS: Record<string, string> = {
  qualidade: "Qualidade e ONA",
  suplementar: "Saúde Suplementar",
  gestao: "Gestão Hospitalar",
  faturamento: "Faturamento",
  governanca: "Governança",
};

export const catalogBySlug = new Map(SITE_CATALOG.courses.map((c) => [c.slug, c]));

export function siteModalidadeLabel(m: string) {
  if (m === "gravado") return "Gravado";
  if (m === "mentoria") return "Mentoria";
  return "Ao vivo";
}

export function groupCoursesByArea<T extends { slug: string; area?: string | null }>(courses: T[]) {
  const groups = new Map<string, T[]>();
  for (const area of AREA_ORDER) groups.set(area, []);

  for (const course of courses) {
    const meta = catalogBySlug.get(course.slug);
    const area = course.area || meta?.area || "gestao";
    const list = groups.get(area) ?? [];
    list.push(course);
    groups.set(area, list);
  }

  return AREA_ORDER.map((area) => ({
    area,
    label: AREA_LABELS[area] || area,
    courses: (groups.get(area) || []).sort((a, b) => {
      const ta = catalogBySlug.get(a.slug)?.titulo || a.slug;
      const tb = catalogBySlug.get(b.slug)?.titulo || b.slug;
      return ta.localeCompare(tb, "pt-BR");
    }),
  })).filter((g) => g.courses.length > 0);
}
