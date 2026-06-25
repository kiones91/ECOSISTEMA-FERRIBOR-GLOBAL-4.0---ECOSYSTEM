import { useEffect, useState } from "react";
import { useCourseKnowledge, type KnowledgeSource } from "@/hooks/useCourseKnowledge";

interface Props {
  courseId: string;
}

export function CursoCerebroPanel({ courseId }: Props) {
  const { listSources, addFaq, addText, deleteSource, processSource, saving, error } = useCourseKnowledge();
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [textBody, setTextBody] = useState("");

  const refresh = async () => setSources(await listSources(courseId));

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const onAddFaq = async () => {
    if (!faqQ.trim() || !faqA.trim()) return;
    setMessage(null);
    const row = await addFaq(courseId, faqQ, faqA);
    if (row) {
      setFaqQ("");
      setFaqA("");
      await refresh();
      if (await processSource(row.id)) {
        setMessage("FAQ adicionada e indexada.");
        await refresh();
      }
    }
  };

  const onAddText = async () => {
    if (!textTitle.trim() || !textBody.trim()) return;
    setMessage(null);
    const row = await addText(courseId, textTitle, textBody);
    if (row) {
      setTextTitle("");
      setTextBody("");
      await refresh();
      if (await processSource(row.id)) {
        setMessage("Material indexado no Cérebro.");
        await refresh();
      }
    }
  };

  const onReprocess = async (id: string) => {
    setMessage(null);
    if (await processSource(id)) {
      setMessage("Fonte reprocessada.");
      await refresh();
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "Pendente",
    processing: "Processando…",
    ready: `Pronto (${sources.find((s) => s.status === "ready")?.chunk_count ?? 0} chunks)`,
    error: "Erro",
  };

  return (
    <section className="panel curso-cerebro">
      <p className="page-sub" style={{ marginBottom: "1rem" }}>
        Base de conhecimento (RAG) usada pelo SDR, Closer e Suporte neste curso. Adicione FAQs e textos; a IA gera embeddings automaticamente.
      </p>

      {error && (
        <div className="panel panel-error" style={{ marginBottom: "1rem" }}>
          <p>{error}</p>
        </div>
      )}
      {message && (
        <div className="panel" style={{ marginBottom: "1rem" }}>
          <p>{message}</p>
        </div>
      )}

      <div className="lms-module-block">
        <h3>Nova FAQ</h3>
        <label>
          Pergunta
          <input value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="Como acesso o certificado?" />
        </label>
        <label>
          Resposta
          <textarea value={faqA} onChange={(e) => setFaqA(e.target.value)} rows={3} />
        </label>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void onAddFaq()}>
          + Adicionar FAQ
        </button>
      </div>

      <div className="lms-module-block" style={{ marginTop: "1.5rem" }}>
        <h3>Material de texto</h3>
        <label>
          Título
          <input value={textTitle} onChange={(e) => setTextTitle(e.target.value)} placeholder="Ementa resumida" />
        </label>
        <label>
          Conteúdo
          <textarea value={textBody} onChange={(e) => setTextBody(e.target.value)} rows={6} placeholder="Cole ementa, políticas, informações do curso…" />
        </label>
        <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void onAddText()}>
          + Indexar texto
        </button>
      </div>

      <h3 style={{ marginTop: "1.5rem" }}>Fontes indexadas</h3>
      <ul className="lms-lessons-list">
        {sources.map((s) => (
          <li key={s.id} className="objection-row">
            <div>
              <strong>{s.title}</strong>
              <span className="kanban-tag" style={{ marginLeft: "0.5rem" }}>
                {s.source_type} · {s.status === "ready" ? `${s.chunk_count} chunks` : statusLabel[s.status] || s.status}
              </span>
              {s.error_message && <p className="form-error">{s.error_message}</p>}
            </div>
            <span className="blog-cover-row">
              {s.status !== "ready" && (
                <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void onReprocess(s.id)}>
                  Processar
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => void deleteSource(s.id).then(() => refresh())}
              >
                ×
              </button>
            </span>
          </li>
        ))}
        {!sources.length && <li className="page-sub">Nenhuma fonte ainda.</li>}
      </ul>
    </section>
  );
}
