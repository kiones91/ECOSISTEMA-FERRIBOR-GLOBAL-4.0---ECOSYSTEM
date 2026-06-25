import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FinanceCategory {
  id: string;
  nome: string;
  slug: string;
  tipo: "receita" | "despesa";
}

export interface FinanceEntry {
  id: string;
  categoria_id: string | null;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  data_lancamento: string;
  pedido_id_d1: string | null;
  deal_id: string | null;
  origem: string | null;
  criado_em: string;
}

export interface FinanceSummary {
  receitas: number;
  despesas: number;
  saldo: number;
}

export function useFinance() {
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [catRes, entRes] = await Promise.all([
      supabase.from("finance_categories").select("*").order("nome"),
      supabase.from("finance_entries").select("*").order("data_lancamento", { ascending: false }),
    ]);
    if (catRes.error || entRes.error) {
      setError(catRes.error?.message ?? entRes.error?.message ?? "Erro ao carregar");
    } else {
      setCategories((catRes.data ?? []) as FinanceCategory[]);
      setEntries((entRes.data ?? []) as FinanceEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo((): FinanceSummary => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let receitas = 0;
    let despesas = 0;
    for (const e of entries) {
      const d = new Date(e.data_lancamento + "T12:00:00");
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      if (e.tipo === "receita") receitas += Number(e.valor);
      else despesas += Number(e.valor);
    }
    return { receitas, despesas, saldo: receitas - despesas };
  }, [entries]);

  const createEntry = async (input: {
    descricao: string;
    valor: number;
    tipo: "receita" | "despesa";
    categoria_id?: string;
    data_lancamento?: string;
  }) => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("finance_entries").insert({
      descricao: input.descricao.trim(),
      valor: input.valor,
      tipo: input.tipo,
      categoria_id: input.categoria_id || null,
      data_lancamento: input.data_lancamento ?? new Date().toISOString().slice(0, 10),
      origem: "manual",
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return false;
    }
    await load();
    return true;
  };

  const deleteEntry = async (id: string) => {
    const { error: err } = await supabase.from("finance_entries").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    await load();
    return true;
  };

  return { categories, entries, summary, loading, error, saving, createEntry, deleteEntry, reload: load };
}
