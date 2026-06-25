#!/usr/bin/env node
/**
 * Sincroniza secrets do Worker Cloudflare a partir de config/crm.env.
 * Uso: npm run wrangler:secrets
 */
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
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

function putSecret(name, value) {
  const res = spawnSync("npx", ["wrangler", "secret", "put", name], {
    input: value,
    cwd: join(ROOT, ".."),
    stdio: ["pipe", "inherit", "inherit"],
    shell: true,
  });
  if (res.status !== 0) {
    console.error(`Falha ao gravar secret ${name}`);
    process.exit(1);
  }
  console.log(`OK: ${name}`);
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const anon = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;
  const service = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service) {
    console.error("Preencha em config/crm.env:");
    console.error("  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  putSecret("SUPABASE_URL", url);
  putSecret("SUPABASE_ANON_KEY", anon);
  putSecret("SUPABASE_SERVICE_ROLE_KEY", service);
  console.log("Secrets Worker sincronizados.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
