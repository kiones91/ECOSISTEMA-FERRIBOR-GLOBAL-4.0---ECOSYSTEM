#!/usr/bin/env node
/**
 * Grava URL + API Key Evolution em integration_settings (Supabase).
 * Lê config/crm.env — NUNCA commitar credenciais.
 *
 * Uso: npm run evolution:seed
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, "config", "crm.env");

function parseEnv(text) {
  const out = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    out[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return out;
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const url = env.EVOLUTION_API_URL || env.VITE_EVOLUTION_API_URL;
  const key = env.EVOLUTION_API_KEY || env.VITE_EVOLUTION_API_KEY;
  const instance = env.EVOLUTION_INSTANCE_NAME || "inforhealth";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;

  if (!url || !key || !serviceKey || !supabaseUrl) {
    console.error("Preencha em config/crm.env:");
    console.error("  EVOLUTION_API_URL, EVOLUTION_API_KEY, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL");
    process.exit(1);
  }

  const rows = [
    { key: "evolution_api_url", value: url },
    { key: "evolution_api_key", value: key },
    { key: "evolution_instance_name", value: instance },
  ];

  for (const row of rows) {
    const res = await fetch(`${supabaseUrl}/rest/v1/integration_settings`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ ...row, atualizado_em: new Date().toISOString() }),
    });
    if (!res.ok) {
      console.error(`Falha ${row.key}:`, await res.text());
      process.exit(1);
    }
    console.log(`OK: ${row.key}`);
  }

  console.log("Evolution configurado no Supabase. Abra /admin/integracoes e clique Testar conexão.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
