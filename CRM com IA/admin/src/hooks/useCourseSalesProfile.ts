import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type {
  CourseObjection,
  CourseObjectionInput,
  CourseSalesProfile,
  CourseSalesProfileInput,
} from "@/types/courseSalesProfile";

export function useCourseSalesProfile() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfile = useCallback(async (courseId: string): Promise<CourseSalesProfile | null> => {
    const { data, error: err } = await supabase
      .from("course_sales_profile")
      .select("*")
      .eq("course_id", courseId)
      .maybeSingle();
    if (err) {
      setError(err.message);
      return null;
    }
    return data as CourseSalesProfile | null;
  }, []);

  const saveProfile = useCallback(
    async (courseId: string, input: CourseSalesProfileInput): Promise<CourseSalesProfile | null> => {
      setSaving(true);
      setError(null);
      const payload = {
        course_id: courseId,
        icp: input.icp?.trim() || null,
        pitch_15s: input.pitch_15s?.trim() || null,
        pitch_30s: input.pitch_30s?.trim() || null,
        pitch_2min: input.pitch_2min?.trim() || null,
        differentials: input.differentials?.filter(Boolean) ?? [],
        short_description: input.short_description?.trim() || null,
        sales_status: input.sales_status ?? "draft",
        ai_enabled: input.ai_enabled ?? true,
        atualizado_em: new Date().toISOString(),
      };
      const { data, error: err } = await supabase
        .from("course_sales_profile")
        .upsert(payload, { onConflict: "course_id" })
        .select()
        .single();
      setSaving(false);
      if (err) {
        setError(err.message);
        return null;
      }
      return data as CourseSalesProfile;
    },
    [],
  );

  const listObjections = useCallback(async (courseId: string): Promise<CourseObjection[]> => {
    const { data, error: err } = await supabase
      .from("course_objections")
      .select("*")
      .eq("course_id", courseId)
      .order("ordem");
    if (err) {
      setError(err.message);
      return [];
    }
    return (data ?? []) as CourseObjection[];
  }, []);

  const saveObjection = useCallback(
    async (courseId: string, input: CourseObjectionInput, id?: string): Promise<CourseObjection | null> => {
      setSaving(true);
      setError(null);
      const payload = {
        course_id: courseId,
        objection: input.objection.trim(),
        response: input.response.trim(),
        ordem: input.ordem ?? 0,
        atualizado_em: new Date().toISOString(),
      };
      const query = id
        ? supabase.from("course_objections").update(payload).eq("id", id).select().single()
        : supabase.from("course_objections").insert(payload).select().single();
      const { data, error: err } = await query;
      setSaving(false);
      if (err) {
        setError(err.message);
        return null;
      }
      return data as CourseObjection;
    },
    [],
  );

  const deleteObjection = useCallback(async (id: string): Promise<boolean> => {
    const { error: err } = await supabase.from("course_objections").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }, []);

  const generateObjections = useCallback(
    async (courseId: string, courseContext: Record<string, unknown>): Promise<CourseObjection[]> => {
      setSaving(true);
      setError(null);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("generate-objections", {
          body: { course_id: courseId, courseContext },
        });
        if (fnErr) throw fnErr;
        if (data?.error) throw new Error(data.error);
        return (data?.objections ?? []) as CourseObjection[];
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao gerar objeções");
        return [];
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return {
    getProfile,
    saveProfile,
    listObjections,
    saveObjection,
    deleteObjection,
    generateObjections,
    saving,
    error,
  };
}
