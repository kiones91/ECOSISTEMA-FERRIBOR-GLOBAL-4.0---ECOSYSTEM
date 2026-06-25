import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AGENT_TEMPLATES,
  emptyAgentInput,
  type CourseAgent,
  type CourseAgentInput,
} from "@/types/courseAgents";

const SELECT = "*, lms_courses(id, titulo, slug)";

export function useCourseAgents() {
  const [agents, setAgents] = useState<CourseAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("course_agents")
      .select(SELECT)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true });
    if (err) {
      setError(err.message);
      setAgents([]);
    } else {
      setAgents((data ?? []) as CourseAgent[]);
    }
    setLoading(false);
    return (data ?? []) as CourseAgent[];
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getAgent = async (id: string): Promise<CourseAgent | null> => {
    const { data, error: err } = await supabase.from("course_agents").select(SELECT).eq("id", id).maybeSingle();
    if (err) {
      setError(err.message);
      return null;
    }
    return data as CourseAgent | null;
  };

  const saveAgent = async (input: CourseAgentInput, id?: string): Promise<CourseAgent | null> => {
    setSaving(true);
    setError(null);
    const payload = {
      course_id: input.course_id ?? null,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      agent_type: input.agent_type,
      primary_objective: input.primary_objective?.trim() || null,
      can_do: input.can_do ?? [],
      cannot_do: input.cannot_do ?? [],
      handoff_triggers: input.handoff_triggers ?? [],
      tone_style: input.tone_style ?? "friendly",
      message_style: input.message_style ?? "balanced",
      additional_prompt: input.additional_prompt?.trim() || null,
      humanization: input.humanization ?? null,
      tool_flags: input.tool_flags ?? {},
      channel_flags: input.channel_flags ?? {},
      is_active: input.is_active !== false,
      is_default: input.is_default === true,
      atualizado_em: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from("course_agents").update(payload).eq("id", id).select(SELECT).single();
    } else {
      result = await supabase.from("course_agents").insert(payload).select(SELECT).single();
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return null;
    }

    if (payload.is_default && result.data) {
      const courseId = (result.data as CourseAgent).course_id;
      let q = supabase
        .from("course_agents")
        .update({ is_default: false })
        .neq("id", (result.data as CourseAgent).id);
      if (courseId) q = q.eq("course_id", courseId);
      else q = q.is("course_id", null);
      await q;
    }

    await load();
    return result.data as CourseAgent;
  };

  const deleteAgent = async (id: string) => {
    const { error: err } = await supabase.from("course_agents").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    await load();
    return true;
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    const { error: err } = await supabase
      .from("course_agents")
      .update({ is_active: isActive, atualizado_em: new Date().toISOString() })
      .eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    await load();
    return true;
  };

  const seedGlobalSdr = async (): Promise<CourseAgent | null> => {
    const tpl = AGENT_TEMPLATES.sdr;
    return saveAgent({
      ...emptyAgentInput("sdr"),
      name: tpl.name || "SDR Inforhealth",
      course_id: null,
      is_default: true,
      is_active: true,
    });
  };

  return {
    agents,
    loading,
    saving,
    error,
    load,
    getAgent,
    saveAgent,
    deleteAgent,
    toggleActive,
    seedGlobalSdr,
  };
}
