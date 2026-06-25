#!/usr/bin/env node
/** Testa optimize-course-field (requer IA ligada + chave no Supabase). */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

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
  const env = parseEnv(await readFile(join(ROOT, "config/crm.env"), "utf8"));
  const url = env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const enabled = await fetch(
    `${url}/rest/v1/integration_settings?key=eq.ai_global_enabled&select=value`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  ).then((r) => r.json());
  if (enabled[0]?.value !== "true") {
    console.warn("ai_global_enabled=false — ligue no admin ou:");
    await fetch(`${url}/rest/v1/integration_settings`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ key: "ai_global_enabled", value: "true" }),
    });
    console.log("ai_global_enabled=true (forçado para teste CLI)");
  }

  const fnUrl = `${url}/functions/v1/optimize-course-field`;
  const res = await fetch(fnUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      apikey: env.VITE_SUPABASE_ANON_KEY || key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      field: "resumo",
      value: "Curso de CCIH para hospitais.",
      courseContext: { titulo: "CCIH", modalidade: "ao_vivo" },
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("Falha:", data);
    process.exit(1);
  }
  console.log("OK:", data.optimized?.slice(0, 200));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
