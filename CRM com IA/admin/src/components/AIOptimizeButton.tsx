import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAIConfig } from "@/hooks/useAIConfig";

interface Props {
  field: string;
  value: string;
  onOptimized: (text: string) => void;
  courseContext?: Record<string, unknown>;
  disabled?: boolean;
}

export function AIOptimizeButton({ field, value, onOptimized, courseContext, disabled }: Props) {
  const { globalEnabled } = useAIConfig();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    if (!value.trim()) {
      setErr("Digite algo antes de otimizar");
      return;
    }
    if (!globalEnabled) {
      setErr("Ligue a IA no topo do painel");
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-product-field", {
        body: { field, value, productContext: courseContext },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      onOptimized(data.optimized as string);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro ao otimizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="ai-optimize-wrap">
      <button
        type="button"
        className="btn btn-ghost ai-optimize-btn"
        onClick={() => void run()}
        disabled={disabled || loading}
      >
        {loading ? "Otimizando…" : "✨ Otimizar com IA"}
      </button>
      {err && <span className="form-error ai-optimize-err">{err}</span>}
    </span>
  );
}
