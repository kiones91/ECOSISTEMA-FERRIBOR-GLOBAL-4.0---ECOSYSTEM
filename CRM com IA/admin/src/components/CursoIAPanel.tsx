import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AIOptimizeButton } from "@/components/AIOptimizeButton";
import { useCourseSalesProfile } from "@/hooks/useCourseSalesProfile";
import type { CourseObjection, CourseSalesProfile, SalesStatus } from "@/types/courseSalesProfile";
import { SALES_STATUS_LABELS } from "@/types/courseSalesProfile";
import { CursoCerebroPanel } from "@/components/CursoCerebroPanel";

const IA_TABS = [
  { id: "config", label: "Configurações" },
  { id: "playbook", label: "Playbook" },
  { id: "objections", label: "Objeções" },
  { id: "cerebro", label: "Cérebro" },
] as const;

type IaTabId = (typeof IA_TABS)[number]["id"];

interface Props {
  courseId: string;
  courseContext: { titulo: string; modalidade: string; resumo: string; slug: string };
}

export function CursoIAPanel({ courseId, courseContext }: Props) {
  const {
    getProfile,
    saveProfile,
    listObjections,
    saveObjection,
    deleteObjection,
    generateObjections,
    saving,
    error,
  } = useCourseSalesProfile();

  const [tab, setTab] = useState<IaTabId>("config");
  const [message, setMessage] = useState<string | null>(null);

  const [icp, setIcp] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [salesStatus, setSalesStatus] = useState<SalesStatus>("draft");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [differentials, setDifferentials] = useState("");
  const [pitch15, setPitch15] = useState("");
  const [pitch30, setPitch30] = useState("");
  const [pitch2min, setPitch2min] = useState("");

  const [objections, setObjections] = useState<CourseObjection[]>([]);
  const [newObjection, setNewObjection] = useState({ objection: "", response: "" });

  const ctx = { ...courseContext };

  const loadAll = async () => {
    const profile = await getProfile(courseId);
    if (profile) applyProfile(profile);
    setObjections(await listObjections(courseId));
  };

  const applyProfile = (p: CourseSalesProfile) => {
    setIcp(p.icp ?? "");
    setShortDescription(p.short_description ?? "");
    setSalesStatus(p.sales_status);
    setAiEnabled(p.ai_enabled);
    setDifferentials((p.differentials ?? []).join("\n"));
    setPitch15(p.pitch_15s ?? "");
    setPitch30(p.pitch_30s ?? "");
    setPitch2min(p.pitch_2min ?? "");
  };

  useEffect(() => {
    void loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const onSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const saved = await saveProfile(courseId, {
      icp,
      short_description: shortDescription,
      sales_status: salesStatus,
      ai_enabled: aiEnabled,
      differentials: differentials.split("\n").map((s) => s.trim()).filter(Boolean),
      pitch_15s: pitch15,
      pitch_30s: pitch30,
      pitch_2min: pitch2min,
    });
    if (saved) setMessage("Perfil comercial salvo.");
  };

  const onAddObjection = async () => {
    if (!newObjection.objection.trim() || !newObjection.response.trim()) return;
    const row = await saveObjection(courseId, {
      ...newObjection,
      ordem: objections.length,
    });
    if (row) {
      setObjections((prev) => [...prev, row]);
      setNewObjection({ objection: "", response: "" });
    }
  };

  const onGenerateObjections = async () => {
    setMessage(null);
    const generated = await generateObjections(courseId, ctx);
    if (generated.length) {
      setObjections(generated);
      setMessage(`${generated.length} objeções geradas com IA.`);
    }
  };

  return (
    <div className="curso-ia-panel">
      <div className="agent-tabs" style={{ marginBottom: "1rem" }}>
        {IA_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`agent-tab${tab === t.id ? " is-active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

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

      <form className="blog-edit-form" onSubmit={(e) => void onSaveProfile(e)}>
        {tab === "config" && (
          <section className="panel">
            <p className="page-sub" style={{ marginBottom: "1rem" }}>
              Perfil comercial usado pela equipe IA (SDR e Closer global). O <strong>Coordenador</strong> escolhe o curso em foco automaticamente.
              {" "}
              <Link to="/ia/agentes">Equipe global →</Link>
            </p>
            <label>
              <span className="label-row">
                ICP (perfil ideal de aluno)
                <AIOptimizeButton field="icp" value={icp} onOptimized={setIcp} courseContext={ctx} />
              </span>
              <textarea value={icp} onChange={(e) => setIcp(e.target.value)} rows={4} placeholder="Gestores hospitalares, coordenadores de enfermagem…" />
            </label>
            <label>
              <span className="label-row">
                Descrição comercial (1 linha)
                <AIOptimizeButton field="short_description" value={shortDescription} onOptimized={setShortDescription} courseContext={ctx} />
              </span>
              <input value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} />
            </label>
            <label>
              Diferenciais (um por linha)
              <textarea value={differentials} onChange={(e) => setDifferentials(e.target.value)} rows={4} placeholder="Certificação reconhecida&#10;Cases reais de hospitais" />
            </label>
            <label>
              Status comercial
              <select value={salesStatus} onChange={(e) => setSalesStatus(e.target.value as SalesStatus)}>
                {Object.entries(SALES_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
              <input type="checkbox" checked={aiEnabled} onChange={(e) => setAiEnabled(e.target.checked)} />
              IA pode usar este curso nas conversas
            </label>
          </section>
        )}

        {tab === "playbook" && (
          <section className="panel">
            <label>
              <span className="label-row">
                Pitch 15 segundos
                <AIOptimizeButton field="pitch_15s" value={pitch15} onOptimized={setPitch15} courseContext={ctx} />
              </span>
              <textarea value={pitch15} onChange={(e) => setPitch15(e.target.value)} rows={3} />
            </label>
            <label>
              <span className="label-row">
                Pitch 30 segundos
                <AIOptimizeButton field="pitch_30s" value={pitch30} onOptimized={setPitch30} courseContext={ctx} />
              </span>
              <textarea value={pitch30} onChange={(e) => setPitch30(e.target.value)} rows={4} />
            </label>
            <label>
              <span className="label-row">
                Pitch 2 minutos
                <AIOptimizeButton field="pitch_2min" value={pitch2min} onOptimized={setPitch2min} courseContext={ctx} />
              </span>
              <textarea value={pitch2min} onChange={(e) => setPitch2min(e.target.value)} rows={6} />
            </label>
          </section>
        )}

        {tab !== "objections" && tab !== "cerebro" && (
          <div className="blog-edit-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Salvar perfil comercial
            </button>
          </div>
        )}
      </form>

      {tab === "cerebro" && <CursoCerebroPanel courseId={courseId} />}

      {tab === "objections" && (
        <section className="panel">
          <div className="blog-cover-row" style={{ marginBottom: "1rem" }}>
            <p className="page-sub" style={{ flex: 1 }}>
              Respostas prontas para objeções de matrícula (Closer / SDR).
            </p>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void onGenerateObjections()}>
              ✨ Gerar com IA
            </button>
          </div>
          <ul className="lms-lessons-list">
            {objections.map((o) => (
              <li key={o.id} className="objection-row">
                <div>
                  <strong>{o.objection}</strong>
                  <p>{o.response}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => void deleteObjection(o.id).then(() => setObjections((prev) => prev.filter((x) => x.id !== o.id)))}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="lms-module-block">
            <label>
              Objeção
              <input value={newObjection.objection} onChange={(e) => setNewObjection((s) => ({ ...s, objection: e.target.value }))} placeholder="Está caro / Não tenho tempo" />
            </label>
            <label>
              Resposta sugerida
              <textarea value={newObjection.response} onChange={(e) => setNewObjection((s) => ({ ...s, response: e.target.value }))} rows={3} />
            </label>
            <button type="button" className="btn btn-ghost" disabled={saving} onClick={() => void onAddObjection()}>
              + Adicionar objeção
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
