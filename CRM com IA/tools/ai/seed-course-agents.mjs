#!/usr/bin/env node
/** Cria agentes Closer + Support por curso publicado. Uso: npm run ai:seed-course-agents */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
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

const CLOSER_TOOLS = {
  can_update_pipeline: true,
  can_apply_tags: true,
  can_qualify_lead: true,
  can_handoff_human: true,
  can_open_ticket: false,
  can_share_course_link: true,
  can_share_checkout: true,
};

const SUPPORT_TOOLS = {
  can_update_pipeline: false,
  can_apply_tags: false,
  can_qualify_lead: false,
  can_handoff_human: true,
  can_open_ticket: true,
  can_share_course_link: true,
  can_share_checkout: false,
};

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) process.exit(1);

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  const coursesRes = await fetch(
    `${url}/rest/v1/lms_courses?status=eq.published&select=id,titulo,slug`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const courses = await coursesRes.json();
  if (!coursesRes.ok) {
    console.error(courses);
    process.exit(1);
  }

  let closers = 0;
  let supports = 0;

  for (const c of courses) {
    for (const [type, tools, namePrefix] of [
      ["closer", CLOSER_TOOLS, "Closer"],
      ["support", SUPPORT_TOOLS, "Suporte"],
    ]) {
      const check = await fetch(
        `${url}/rest/v1/course_agents?course_id=eq.${c.id}&agent_type=eq.${type}&select=id`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } },
      );
      const exists = await check.json();
      if (exists.length) continue;

      const body = {
        course_id: c.id,
        name: `${namePrefix} — ${c.titulo}`,
        agent_type: type,
        primary_objective:
          type === "closer"
            ? `Fechar matrícula no curso ${c.titulo}, tratar objeções e enviar link de checkout.`
            : `Suporte a alunos do curso ${c.titulo}. Abrir ticket se necessário.`,
        can_do:
          type === "closer"
            ? ["Tratar objeções", "Enviar link checkout", "Mover para Proposta"]
            : ["Orientar portal", "FAQ do curso", "Abrir ticket"],
        cannot_do: type === "closer" ? ["Descontos não autorizados"] : ["Vender outros cursos"],
        handoff_triggers: ["Pediu humano"],
        tone_style: type === "closer" ? "consultive" : "friendly",
        message_style: type === "closer" ? "detailed" : "balanced",
        tool_flags: tools,
        channel_flags: { webchat: true, whatsapp: true, inbox_crm: true },
        is_active: true,
        is_default: type === "closer",
      };

      const res = await fetch(`${url}/rest/v1/course_agents`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        if (type === "closer") closers++;
        else supports++;
      } else {
        console.warn(c.slug, type, await res.text());
      }
    }
  }

  console.log(`OK: ${closers} Closers + ${supports} Supports criados (${courses.length} cursos)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
