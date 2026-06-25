#!/usr/bin/env node
// Roda SQL no projeto Supabase via Management API.
// Uso: node sb-query.mjs < query.sql   (SQL pelo stdin)
//   ou: node sb-query.mjs "select 1;"
// Lê o PAT de ~/.supabase-pat. Nunca imprime o token.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const REF = process.env.SB_REF || "kpkcqqqshbsyaxdaorqt";
const patPath = join(homedir(), ".supabase-pat");

let pat;
try {
  pat = readFileSync(patPath, "utf8").trim();
} catch {
  console.error("ERRO: nao consegui ler ~/.supabase-pat");
  process.exit(2);
}
if (!pat) {
  console.error("ERRO: ~/.supabase-pat vazio");
  process.exit(2);
}

let sql = process.argv[2];
if (!sql) {
  sql = readFileSync(0, "utf8"); // stdin
}
if (!sql || !sql.trim()) {
  console.error("ERRO: nenhuma query fornecida");
  process.exit(2);
}

const res = await fetch(
  `https://api.supabase.com/v1/projects/${REF}/database/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error(`HTTP ${res.status}`);
  console.error(text);
  process.exit(1);
}
// pretty-print
try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}
