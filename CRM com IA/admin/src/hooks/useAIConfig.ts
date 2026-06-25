import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Flags globais de IA (liga/desliga). As CREDENCIAIS de IA (chave/provedor) são
// geridas só em Integrações → Inteligência Artificial (useAIRouting →
// org_ai_credentials), que é o que de fato alimenta agentes, "criar com IA" e
// "otimizar com IA". Este hook cuida apenas dos interruptores em integration_settings.
const SETTINGS_KEYS = {
  global: "ai_global_enabled",
  webchat: "ai_webchat_auto",
  whatsapp: "ai_whatsapp_auto",
} as const;

async function upsertSetting(key: string, value: string) {
  const { error } = await supabase.from("integration_settings").upsert(
    { key, value, atualizado_em: new Date().toISOString() },
    { onConflict: "key" },
  );
  if (error) throw error;
}

export function useAIConfig() {
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [webchatAuto, setWebchatAuto] = useState(true);
  const [whatsappAuto, setWhatsappAuto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: settings } = await supabase
        .from("integration_settings")
        .select("key, value")
        .in("key", Object.values(SETTINGS_KEYS));

      for (const row of settings ?? []) {
        if (row.key === SETTINGS_KEYS.global) setGlobalEnabled(row.value === "true");
        if (row.key === SETTINGS_KEYS.webchat) setWebchatAuto(row.value !== "false");
        if (row.key === SETTINGS_KEYS.whatsapp) setWhatsappAuto(row.value === "true");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar IA");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const setGlobalEnabledAndSave = useCallback(async (enabled: boolean) => {
    setGlobalEnabled(enabled);
    setSaving(true);
    setError(null);
    try {
      await upsertSetting(SETTINGS_KEYS.global, enabled ? "true" : "false");
      setMessage(enabled ? "IA ativada para todo o sistema" : "IA desligada — nenhum agente responderá");
    } catch (e) {
      setGlobalEnabled(!enabled);
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, []);

  const setWebchatAutoAndSave = useCallback(async (enabled: boolean) => {
    setWebchatAuto(enabled);
    setSaving(true);
    try {
      await upsertSetting(SETTINGS_KEYS.webchat, enabled ? "true" : "false");
    } catch (e) {
      setWebchatAuto(!enabled);
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, []);

  const setWhatsappAutoAndSave = useCallback(async (enabled: boolean) => {
    setWhatsappAuto(enabled);
    setSaving(true);
    try {
      await upsertSetting(SETTINGS_KEYS.whatsapp, enabled ? "true" : "false");
    } catch (e) {
      setWhatsappAuto(!enabled);
      setError(e instanceof Error ? e.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    globalEnabled,
    setGlobalEnabledAndSave,
    webchatAuto,
    setWebchatAuto: setWebchatAutoAndSave,
    whatsappAuto,
    setWhatsappAuto: setWhatsappAutoAndSave,
    loading,
    saving,
    error,
    message,
    reload,
  };
}
