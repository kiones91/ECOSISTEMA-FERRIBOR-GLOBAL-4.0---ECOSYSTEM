import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { chunkText, cosineSimilarity, embedText } from "./embeddings.ts";
import type { ResolvedDirectAI } from "./direct-ai.ts";
import { resolveDirectAI } from "./direct-ai.ts";

export interface KnowledgeSourceRow {
  id: string;
  course_id: string | null;
  source_type: string;
  title: string;
  raw_content: string | null;
  extracted_content: string | null;
}

function sourceText(source: KnowledgeSourceRow): string {
  if (source.source_type === "faq") {
    return `Pergunta: ${source.title}\nResposta: ${source.raw_content || source.extracted_content || ""}`;
  }
  return source.extracted_content || source.raw_content || source.title;
}

export async function ingestKnowledgeSource(
  admin: SupabaseClient,
  sourceId: string,
): Promise<{ chunkCount: number }> {
  const { data: source, error } = await admin
    .from("course_knowledge_sources")
    .select("id, course_id, source_type, title, raw_content, extracted_content")
    .eq("id", sourceId)
    .single();

  if (error || !source) throw new Error("Fonte não encontrada");

  await admin
    .from("course_knowledge_sources")
    .update({ status: "processing", error_message: null, atualizado_em: new Date().toISOString() })
    .eq("id", sourceId);

  const text = sourceText(source as KnowledgeSourceRow).trim();
  if (!text) {
    await admin
      .from("course_knowledge_sources")
      .update({ status: "error", error_message: "Conteúdo vazio", atualizado_em: new Date().toISOString() })
      .eq("id", sourceId);
    throw new Error("Conteúdo vazio");
  }

  const { data: route } = await admin
    .from("ai_routing")
    .select("provider, model")
    .eq("capability", "embeddings")
    .maybeSingle();

  const ai = await resolveDirectAI(admin, route?.provider as "gemini" | null);

  const chunks = chunkText(text);
  await admin.from("course_knowledge_chunks").delete().eq("source_id", sourceId);

  const rows = [];
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await embedText(ai, chunks[i]);
    rows.push({
      source_id: sourceId,
      course_id: source.course_id,
      chunk_index: i,
      content: chunks[i],
      embedding,
    });
  }

  if (rows.length) {
    const { error: insErr } = await admin.from("course_knowledge_chunks").insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  await admin
    .from("course_knowledge_sources")
    .update({
      status: "ready",
      extracted_content: text.slice(0, 50000),
      chunk_count: rows.length,
      error_message: null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", sourceId);

  return { chunkCount: rows.length };
}

export async function searchCourseRAG(
  admin: SupabaseClient,
  courseId: string | null,
  query: string,
  limit = 5,
): Promise<string> {
  const q = query.trim();
  if (!q) return "";

  let chunkQuery = admin
    .from("course_knowledge_chunks")
    .select("content, embedding, course_id")
    .limit(200);

  if (courseId) {
    chunkQuery = chunkQuery.or(`course_id.eq.${courseId},course_id.is.null`);
  } else {
    chunkQuery = chunkQuery.is("course_id", null);
  }

  const { data: chunks } = await chunkQuery;
  if (!chunks?.length) return "";

  const { data: route } = await admin
    .from("ai_routing")
    .select("provider")
    .eq("capability", "embeddings")
    .maybeSingle();

  const ai = await resolveDirectAI(admin, route?.provider as "gemini" | null);
  const queryVec = await embedText(ai, q);

  const scored = chunks
    .map((c) => {
      const emb = c.embedding as number[];
      return { content: c.content as string, score: cosineSimilarity(queryVec, emb) };
    })
    .filter((x) => x.score > 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!scored.length) return "";
  return "BASE DE CONHECIMENTO (RAG):\n" + scored.map((s, i) => `[${i + 1}] ${s.content}`).join("\n\n");
}
