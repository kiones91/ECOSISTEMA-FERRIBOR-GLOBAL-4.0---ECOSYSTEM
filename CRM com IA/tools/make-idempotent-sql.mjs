#!/usr/bin/env node
/**
 * Transforma o delta consolidado do CRM em um script idempotente,
 * seguro para colar/rodar repetidamente no SQL Editor do Supabase.
 *
 * Regras (line-based; identificadores estão sempre na linha inicial):
 *  - CREATE TABLE x            -> CREATE TABLE IF NOT EXISTS x
 *  - CREATE [UNIQUE] INDEX x   -> + IF NOT EXISTS
 *  - ^CREATE POLICY "n" ON t   -> injeta DROP POLICY IF EXISTS "n" ON t; antes
 *  - ^CREATE TRIGGER n ... ON t-> injeta DROP TRIGGER IF EXISTS n ON t; antes
 *  - CREATE [OR REPLACE] VIEW v -> injeta DROP VIEW IF EXISTS v; e remove OR REPLACE
 *
 * NÃO altera: CREATE POLICY/TABLE indentados (dentro de DO blocks),
 * ADD COLUMN/CONSTRAINT (já com guard), INSERT (ON CONFLICT), FUNCTION, EXTENSION.
 */
import { readFileSync, writeFileSync } from "node:fs";

const [, , inPath, outPath] = process.argv;
if (!inPath || !outPath) {
  console.error("uso: node make-idempotent-sql.mjs <entrada.sql> <saida.sql>");
  process.exit(1);
}

const src = readFileSync(inPath, "utf8");
// Arquivo de origem é mixed CRLF/LF; normaliza para LF para os regex ancorarem.
const lines = src.split(/\r?\n/);
const out = [];

const stats = {
  table: 0,
  index: 0,
  policy: 0,
  policyMultiline: 0,
  trigger: 0,
  triggerMultiline: 0,
  view: 0,
};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // CREATE TABLE (start of line, sem IF NOT EXISTS)
  let m = line.match(/^CREATE TABLE (?!IF NOT EXISTS)(.*)$/);
  if (m) {
    out.push(`CREATE TABLE IF NOT EXISTS ${m[1]}`);
    stats.table++;
    continue;
  }

  // CREATE [UNIQUE] INDEX (start of line, sem IF NOT EXISTS)
  m = line.match(/^CREATE (UNIQUE )?INDEX (?!IF NOT EXISTS)(.*)$/);
  if (m) {
    out.push(`CREATE ${m[1] || ""}INDEX IF NOT EXISTS ${m[2]}`);
    stats.index++;
    continue;
  }

  // CREATE POLICY "name" [ON table]  (standalone, início de linha)
  // O "ON tabela" pode estar na mesma linha OU em linhas seguintes (multi-linha).
  m = line.match(/^CREATE POLICY ("(?:[^"\\]|\\.)*")(.*)$/);
  if (m) {
    const policyName = m[1];
    let table = null;
    const sameLine = line.match(/\bON (\S+)/);
    if (sameLine) {
      table = sameLine[1];
    } else {
      for (let j = i + 1; j < lines.length && j < i + 6; j++) {
        const look = lines[j].match(/^\s*ON (\S+)/);
        if (look) {
          table = look[1];
          break;
        }
        if (/;\s*$/.test(lines[j])) break; // fim do statement sem achar ON
      }
      stats.policyMultiline++;
    }
    if (table) {
      const cleanTable = table.replace(/[(;].*$/, "");
      out.push(`DROP POLICY IF EXISTS ${policyName} ON ${cleanTable};`);
      stats.policy++;
    }
    out.push(line);
    continue;
  }

  // CREATE TRIGGER name ... ON table  (standalone)
  // O "ON tabela" pode estar na mesma linha OU em linhas seguintes (multi-linha).
  m = line.match(/^CREATE TRIGGER (\S+)(.*)$/);
  if (m) {
    const triggerName = m[1];
    // procura "ON <tabela>" na linha inicial e nas seguintes até EXECUTE/;
    let table = null;
    const sameLine = line.match(/\bON (\S+)/);
    if (sameLine) {
      table = sameLine[1];
    } else {
      for (let j = i + 1; j < lines.length && j < i + 8; j++) {
        const look = lines[j].match(/\bON (\S+)/);
        if (look) {
          table = look[1];
          break;
        }
        if (/;\s*$/.test(lines[j])) break; // fim do statement sem achar ON
      }
      stats.triggerMultiline++;
    }
    if (table) {
      // remove ; ou ( residual colado no nome da tabela
      const cleanTable = table.replace(/[(;].*$/, "");
      out.push(`DROP TRIGGER IF EXISTS ${triggerName} ON ${cleanTable};`);
      stats.trigger++;
    }
    out.push(line);
    continue;
  }

  // CREATE [OR REPLACE] VIEW name
  m = line.match(/^CREATE (OR REPLACE )?VIEW (\S+)(.*)$/);
  if (m) {
    out.push(`DROP VIEW IF EXISTS ${m[2]};`);
    out.push(`CREATE VIEW ${m[2]}${m[3]}`);
    stats.view++;
    continue;
  }

  out.push(line);
}

const header = `-- ============================================================
-- SCRIPT CONSOLIDADO IDEMPOTENTE — CRM Buffallos
-- Gerado por tools/make-idempotent-sql.mjs a partir de:
--   ${inPath.split("/").pop()}
-- Seguro para colar e rodar repetidamente no SQL Editor do Supabase.
-- Projeto: kpkcqqqshbsyaxdaorqt
-- ============================================================

`;

writeFileSync(outPath, header + out.join("\n"), "utf8");

console.log("Transformações aplicadas:");
console.log(`  CREATE TABLE   -> IF NOT EXISTS : ${stats.table}`);
console.log(`  CREATE INDEX   -> IF NOT EXISTS : ${stats.index}`);
console.log(`  CREATE POLICY  + DROP antes      : ${stats.policy}`);
console.log(`  CREATE TRIGGER + DROP antes      : ${stats.trigger} (multi-linha: ${stats.triggerMultiline})`);
console.log(`  CREATE VIEW    + DROP antes      : ${stats.view}`);
console.log(`\nSaida: ${outPath}`);
