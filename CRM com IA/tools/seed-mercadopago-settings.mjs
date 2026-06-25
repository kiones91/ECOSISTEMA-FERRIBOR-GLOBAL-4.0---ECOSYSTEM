#!/usr/bin/env node
/**
 * Grava credenciais Mercado Pago em integration_settings (Supabase).
 * Lê config/crm.env — NUNCA commitar credenciais.
 *
 * Uso: npm run mercadopago:seed
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
  const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
  const publicKey = env.MERCADOPAGO_PUBLIC_KEY;
  const modo = env.MERCADOPAGO_MODO || "sandbox";
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;

  if (!accessToken || !serviceKey || !supabaseUrl) {
    console.error("Preencha em config/crm.env:");
    console.error("  MERCADOPAGO_ACCESS_TOKEN, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_URL");
    process.exit(1);
  }

  const rows = [
    { key: "mercadopago_access_token", value: accessToken },
    { key: "mercadopago_public_key", value: publicKey || "" },
    { key: "mercadopago_modo", value: modo },
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

  console.log("Mercado Pago seed concluído.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
