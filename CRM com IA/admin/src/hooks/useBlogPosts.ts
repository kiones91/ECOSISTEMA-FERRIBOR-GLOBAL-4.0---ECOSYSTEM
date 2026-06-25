import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BlogStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string;
  slug: string;
  titulo: string;
  resumo: string | null;
  content_html: string;
  imagem_destaque: string | null;
  categoria: string | null;
  tags: string[] | null;
  meta_description: string | null;
  status: BlogStatus;
  publicado_em: string | null;
  tempo_leitura_min: number | null;
  criado_em: string;
  atualizado_em: string;
}

export interface BlogPostInput {
  slug: string;
  titulo: string;
  resumo?: string;
  content_html: string;
  imagem_destaque?: string;
  categoria?: string;
  meta_description?: string;
  tempo_leitura_min?: number;
  status?: BlogStatus;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function estimateReadMin(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function useBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("blog_posts")
      .select("*")
      .order("atualizado_em", { ascending: false });
    if (err) {
      setError(err.message);
      setPosts([]);
    } else {
      setPosts((data ?? []) as BlogPost[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const getPost = async (id: string): Promise<BlogPost | null> => {
    const { data, error: err } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
    if (err) {
      setError(err.message);
      return null;
    }
    return data as BlogPost | null;
  };

  const savePost = async (input: BlogPostInput, id?: string): Promise<BlogPost | null> => {
    setSaving(true);
    setError(null);
    const readMin = input.tempo_leitura_min ?? estimateReadMin(input.content_html);
    const payload = {
      slug: input.slug,
      titulo: input.titulo.trim(),
      resumo: input.resumo?.trim() || null,
      content_html: input.content_html,
      imagem_destaque: input.imagem_destaque || null,
      categoria: input.categoria || "Gestão em Saúde",
      meta_description: input.meta_description?.trim() || input.resumo?.slice(0, 160) || null,
      tempo_leitura_min: readMin,
      status: input.status ?? "draft",
      atualizado_em: new Date().toISOString(),
    };

    let result;
    if (id) {
      result = await supabase.from("blog_posts").update(payload).eq("id", id).select("*").single();
    } else {
      result = await supabase.from("blog_posts").insert(payload).select("*").single();
    }

    setSaving(false);
    if (result.error) {
      setError(result.error.message);
      return null;
    }
    await load();
    return result.data as BlogPost;
  };

  const publishPost = async (id: string): Promise<{ ok: boolean; message?: string }> => {
    setSaving(true);
    setError(null);
    const { error: err } = await supabase
      .from("blog_posts")
      .update({
        status: "published",
        publicado_em: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", id);
    setSaving(false);
    if (err) {
      setError(err.message);
      return { ok: false };
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token;
      const res = await fetch(`/api/admin/blog/publish/${id}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Falha ao gerar HTML");
      await load();
      return { ok: true, message: body.message || "Artigo publicado." };
    } catch (e) {
      await load();
      return {
        ok: true,
        message:
          (e instanceof Error ? e.message : "Publicado no banco.") +
          " Execute npm run blog:publish se o HTML não aparecer no site.",
      };
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    setError(null);
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const now = new Date();
    const path = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
    const { error: err } = await supabase.storage.from("blog-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (err) {
      setError(err.message);
      return null;
    }
    const { data } = supabase.storage.from("blog-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const deletePost = async (id: string) => {
    const { error: err } = await supabase.from("blog_posts").delete().eq("id", id);
    if (err) {
      setError(err.message);
      return false;
    }
    await load();
    return true;
  };

  return {
    posts,
    loading,
    error,
    saving,
    load,
    getPost,
    savePost,
    publishPost,
    uploadImage,
    deletePost,
  };
}
