export type SalesStatus = "draft" | "review" | "published";

export interface CourseSalesProfile {
  course_id: string;
  icp: string | null;
  pitch_15s: string | null;
  pitch_30s: string | null;
  pitch_2min: string | null;
  differentials: string[];
  short_description: string | null;
  sales_status: SalesStatus;
  ai_enabled: boolean;
  criado_em?: string;
  atualizado_em?: string;
}

export interface CourseSalesProfileInput {
  icp?: string;
  pitch_15s?: string;
  pitch_30s?: string;
  pitch_2min?: string;
  differentials?: string[];
  short_description?: string;
  sales_status?: SalesStatus;
  ai_enabled?: boolean;
}

export interface CourseObjection {
  id: string;
  course_id: string;
  objection: string;
  response: string;
  ordem: number;
}

export interface CourseObjectionInput {
  objection: string;
  response: string;
  ordem?: number;
}

export const SALES_STATUS_LABELS: Record<SalesStatus, string> = {
  draft: "Rascunho",
  review: "Em revisão",
  published: "Publicado (IA ativa)",
};
