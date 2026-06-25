import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import {
  handleEvolutionAction,
  type DbInstance,
  type EvolutionDb,
} from "../../../shared/evolution-handler.ts";

async function requireAdmin(req: Request, supabase: ReturnType<typeof createClient>) {
  const auth = req.headers.get("Authorization");
  if (!auth) return null;
  const { data } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
  return data.user;
}

function createDb(supabase: ReturnType<typeof createClient>): EvolutionDb {
  return {
    async getConfig() {
      const { data } = await supabase
        .from("integration_settings")
        .select("key, value")
        .in("key", ["evolution_api_url", "evolution_api_key"]);
      const map = new Map((data ?? []).map((r) => [r.key, r.value ?? ""]));
      const url = (map.get("evolution_api_url") || "").replace(/\/$/, "");
      const globalApiKey = map.get("evolution_api_key") || "";
      if (!url || !globalApiKey) return null;
      return { url, globalApiKey };
    },

    async getInstanceById(id: string) {
      const { data } = await supabase.from("evolution_instances").select("*").eq("id", id).maybeSingle();
      return (data as DbInstance) ?? null;
    },

    async getSingletonInstance() {
      const { data } = await supabase
        .from("evolution_instances")
        .select("*")
        .order("criado_em", { ascending: true })
        .limit(1)
        .maybeSingle();
      return (data as DbInstance) ?? null;
    },

    async insertInstance(row) {
      const { data, error } = await supabase
        .from("evolution_instances")
        .insert({ status: "disconnected", ...row })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as DbInstance;
    },

    async updateInstance(id, patch) {
      const { error } = await supabase
        .from("evolution_instances")
        .update({ ...patch, atualizado_em: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const user = await requireAdmin(req, supabase);
  if (!user) return jsonResponse({ error: "Não autorizado" }, 401);

  const body = await req.json().catch(() => ({}));
  const action = body.action ?? "sync_instance_status";
  const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/evolution-webhook`;

  try {
    const result = await handleEvolutionAction(
      action,
      body,
      createDb(supabase),
      webhookUrl,
    );
    return jsonResponse(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
