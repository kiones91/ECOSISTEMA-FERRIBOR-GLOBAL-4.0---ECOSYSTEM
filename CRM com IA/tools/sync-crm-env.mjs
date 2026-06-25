#!/usr/bin/env node
/**
 * Gera admin/.env.local para Vite.
 * Ordem: config/crm.env → secrets do GitHub (integração Supabase) → env VITE_*.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "config", "crm.env");
const DST = join(ROOT, "admin", ".env.local");

function fromCrmEnv() {
  if (!existsSync(SRC)) return null;
  const raw = readFileSync(SRC, "utf8");
  const map = {};
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    map[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return map;
}

function fromCiSecrets() {
  const url =
    process.env.VITE_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (process.env.SUPABASE_PROJECT_ID
      ? `https://${process.env.SUPABASE_PROJECT_ID}.supabase.co`
      : "");
  const anon =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  if (!url || !anon) return null;
  return {
    VITE_SUPABASE_URL: url,
    VITE_SUPABASE_ANON_KEY: anon,
  };
}

const crm = fromCrmEnv();
const ci = fromCiSecrets();
const url = crm?.VITE_SUPABASE_URL || ci?.VITE_SUPABASE_URL;
const anon = crm?.VITE_SUPABASE_ANON_KEY || ci?.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error(
    "Supabase não configurado: preencha config/crm.env ou defina SUPABASE_URL + SUPABASE_ANON_KEY no CI",
  );
  process.exit(1);
}

const lines = [
  `VITE_SUPABASE_URL=${url}`,
  `VITE_SUPABASE_ANON_KEY=${anon}`,
  `VITE_EVOLUTION_PROXY_URL=/api/admin/evolution`,
];

writeFileSync(DST, lines.join("\n") + "\n", "utf8");

const serviceRole =
  crm?.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const workerVars = join(ROOT, "..", ".dev.vars");
if (serviceRole) {
  const devVars = [
    `SUPABASE_URL=${url}`,
    `SUPABASE_ANON_KEY=${anon}`,
    `SUPABASE_SERVICE_ROLE_KEY=${serviceRole}`,
  ];
  writeFileSync(workerVars, devVars.join("\n") + "\n", "utf8");
}

const src = crm ? "config/crm.env" : "GitHub Secrets (integração Supabase)";
console.log(`OK: admin/.env.local ← ${src}`);
if (serviceRole) console.log("OK: .dev.vars ← SUPABASE (wrangler dev)");
