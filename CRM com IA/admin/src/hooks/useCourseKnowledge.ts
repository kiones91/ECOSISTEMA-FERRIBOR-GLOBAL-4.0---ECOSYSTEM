import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeSource {
  id: string;
  course_id: string | null;
  source_type: "faq" | "text" | "pdf";
  title: string;
  raw_content: string | null;
  storage_path: string | null;
  status: string;
  chunk_count: number;
  error_message: string | null;
  criado_em: string;
}

export function useCourseKnowledge() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listSources = useCallback(async (courseId: string): Promise<KnowledgeSource[]> => {
    const { data, error: err } = await supabase
      .from("course_knowledge_sources")
      .select("*")
      .eq("course_id", courseId)
      .order("criado_em", { ascending: false });
    if (err) {
      setError(err.message);
      return [];
    }
    return (data ?? []) as KnowledgeSource[];
  }, []);

  const addFaq = useCallback(async (courseId: string, question: string, answer: string) => {
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("course_knowledge_sources")
      .insert({
        course_id: courseId,
        source_type: "faq",
        title: question.trim(),
        raw_content: answer.trim(),
        status: "pending",
      })
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return data as KnowledgeSource;
  }, []);

  const addText = useCallback(async (courseId: string, title: string, content: string) => {
    setSaving(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("course_knowledge_sources")
      .insert({
        course_id: courseId,
        source_type: "text",
        title: title.trim(),
        raw_content: content.trim(),
        status: "pending",
      })
      .select()
      .single();
    setSaving(false);
    if (err) {
      setError(err.message);
      return null;
    }
    return data as KnowledgeSource;
  }, []);

  const deleteSource = useCallback(async (id: string) => {
    const { error: err } = await supabase.from("course_knowledge_sources").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    return true;
  }, []);

  const processSource = useCallback(async (sourceId: string): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("process-knowledge-source", {
        body: { source_id: sourceId },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao processar");
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { listSources, addFaq, addText, deleteSource, processSource, saving, error };
}
