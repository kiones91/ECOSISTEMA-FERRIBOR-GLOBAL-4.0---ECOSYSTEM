import type { ResolvedDirectAI } from "./direct-ai.ts";

const EMBED_MODEL = "text-embedding-004";

export async function geminiEmbed(apiKey: string, text: string): Promise<number[]> {
  const trimmed = text.trim().slice(0, 8000);
  if (!trimmed) return [];

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: { parts: [{ text: trimmed }] },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Embedding ${res.status}: ${JSON.stringify(data).slice(0, 200)}`);
  }
  const values = data?.embedding?.values as number[] | undefined;
  if (!values?.length) throw new Error("Embedding vazio");
  return values;
}

export async function embedText(ai: ResolvedDirectAI, text: string): Promise<number[]> {
  if (ai.provider === "gemini") return geminiEmbed(ai.apiKey, text);
  // Fallback: Gemini via env for non-gemini chat providers
  const key = Deno.env.get("GEMINI_API_KEY")?.trim() || Deno.env.get("GOOGLE_AI_API_KEY")?.trim();
  if (key) return geminiEmbed(key, text);
  throw new Error("Embeddings requerem Gemini configurado.");
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}

export function chunkText(text: string, maxLen = 700, overlap = 80): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= maxLen) return [normalized];

  const chunks: string[] = [];
  const paragraphs = normalized.split(/\n{2,}/);
  let buffer = "";

  const flush = () => {
    if (!buffer.trim()) return;
    chunks.push(buffer.trim());
    buffer = buffer.slice(-overlap);
  };

  for (const para of paragraphs) {
    const piece = para.trim();
    if (!piece) continue;
    if ((buffer + "\n\n" + piece).length <= maxLen) {
      buffer = buffer ? `${buffer}\n\n${piece}` : piece;
    } else {
      if (buffer) flush();
      if (piece.length <= maxLen) {
        buffer = piece;
      } else {
        for (let i = 0; i < piece.length; i += maxLen - overlap) {
          chunks.push(piece.slice(i, i + maxLen).trim());
        }
        buffer = "";
      }
    }
  }
  if (buffer.trim()) chunks.push(buffer.trim());
  return chunks;
}
