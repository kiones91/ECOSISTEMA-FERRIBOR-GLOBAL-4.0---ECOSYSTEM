#!/usr/bin/env node
/**
 * Equipe IA global: 1 Coordenador + 1 SDR + 1 Closer + 1 Suporte.
 * Desativa agentes por curso (legado).
 * Uso: npm run ai:seed-team
 */
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { TEAM_AGENTS, COMPANY_KNOWLEDGE_FAQS } from "./agent-team-definitions.mjs";

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

const HUMANIZATION = {
  enabled: true,
  timing: { first_reply_min_ms: 3500, first_reply_max_ms: 8000, between_bubbles_ms: 1200 },
  style: { lowercase: false, abbreviations: true },
};

async function upsertAgent(url, key, agentType, payload) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const listRes = await fetch(
    `${url}/rest/v1/course_agents?agent_type=eq.${agentType}&course_id=is.null&select=id`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const existing = await listRes.json();
  const body = { ...payload, humanization: HUMANIZATION, atualizado_em: new Date().toISOString() };

  if (existing.length > 0) {
    const id = existing[0].id;
    const res = await fetch(`${url}/rest/v1/course_agents?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${agentType} update: ${await res.text()}`);
    console.log(`OK: course_agent ${payload.name} atualizado (${id})`);
    return id;
  }

  const res = await fetch(`${url}/rest/v1/course_agents`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${agentType} create: ${await res.text()}`);
  const rows = await res.json();
  console.log(`OK: course_agent ${payload.name} criado (${rows[0]?.id})`);
  return rows[0]?.id;
}

async function upsertProductAgent(url, key, orgId, agentType, payload) {
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const listRes = await fetch(
    `${url}/rest/v1/product_agents?agent_type=eq.${agentType}&product_id=is.null&organization_id=eq.${orgId}&select=id`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const existing = await listRes.json();

  const body = {
    organization_id: orgId,
    product_id: null,
    name: payload.name,
    description: payload.description,
    agent_type: payload.agent_type,
    primary_objective: payload.primary_objective,
    can_do: payload.can_do,
    cannot_do: payload.cannot_do,
    handoff_triggers: payload.handoff_triggers,
    tone_style: payload.tone_style,
    message_style: payload.message_style,
    additional_prompt: payload.additional_prompt,
    is_active: payload.is_active !== false,
    is_default: payload.is_default === true,
    humanization: HUMANIZATION,
    // Tool permissions mapping
    can_update_pipeline: payload.tool_flags?.can_update_pipeline ?? true,
    can_apply_tags: payload.tool_flags?.can_apply_tags ?? true,
    can_qualify: payload.tool_flags?.can_qualify_lead ?? true,
    can_transfer: payload.tool_flags?.can_handoff_human ?? true,
    can_create_tasks: true,
    can_schedule_meetings: true,
    can_send_emails: false,
    can_send_materials: false,
    can_trigger_flows: false,
    can_notify: false,
    can_add_notes: false,
    can_start_cadence: false,
    tool_configs: {},
    // Channels
    active_in_chat: payload.channel_flags?.webchat ?? true,
    active_in_widget: payload.channel_flags?.webchat ?? true,
    active_in_whatsapp: payload.channel_flags?.whatsapp ?? true,
    active_in_inbox: payload.channel_flags?.inbox_crm ?? true,
    active_in_funnels: true,
    active_in_copilot: false,
    active_in_instagram: false,
    active_in_facebook: false,
    updated_at: new Date().toISOString(),
  };

  if (existing.length > 0) {
    const id = existing[0].id;
    const res = await fetch(`${url}/rest/v1/product_agents?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`product_agent ${agentType} update: ${await res.text()}`);
    console.log(`OK: product_agent ${payload.name} atualizado (${id})`);
    return id;
  }

  const res = await fetch(`${url}/rest/v1/product_agents`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`product_agent ${agentType} create: ${await res.text()}`);
  const rows = await res.json();
  console.log(`OK: product_agent ${payload.name} criado (${rows[0]?.id})`);
  return rows[0]?.id;
}

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Configure config/crm.env");
    process.exit(1);
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=minimal",
  };

  // Desativa agentes legados por curso
  const deact = await fetch(`${url}/rest/v1/course_agents?course_id=not.is.null`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ is_active: false, atualizado_em: new Date().toISOString() }),
  });
  if (deact.ok) console.log("OK: agentes por curso desativados (legado)");

  // Get or create organization ID for product_agents
  let orgId = null;
  try {
    const orgCheck = await fetch(`${url}/rest/v1/organizations?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    if (orgCheck.ok) {
      let orgs = await orgCheck.json();
      if (orgs.length > 0) {
        orgId = orgs[0].id;
      } else {
        console.log("Nenhuma organização encontrada. Criando organização padrão...");
        const insOrg = await fetch(`${url}/rest/v1/organizations`, {
          method: "POST",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ name: "Inforhealth" }),
        });
        if (insOrg.ok) {
          const newOrgs = await insOrg.json();
          orgId = newOrgs[0].id;
          console.log(`Organização padrão criada com ID: ${orgId}`);
        } else {
          console.warn("Falha ao criar organização padrão:", await insOrg.text());
        }
      }
    } else {
      console.warn("Tabela public.organizations não disponível no Supabase.");
    }
  } catch (err) {
    console.warn("Aviso: Falha ao obter/criar organização no Supabase (migrações do Buffallos CRM pendentes):", err.message);
  }

  for (const [keyName, def] of Object.entries(TEAM_AGENTS)) {
    await upsertAgent(url, key, def.agent_type, def);
    if (orgId) {
      try {
        await upsertProductAgent(url, key, orgId, def.agent_type, def);
      } catch (err) {
        console.warn(`Aviso: Falha ao atualizar ProductAgent ${def.name} no Supabase:`, err.message);
      }
    } else {
      console.log(`Ignorando seeding de ProductAgent ${def.name} (tabela organizations/product_agents pendente de migração)`);
    }
    void keyName;
  }

  // Base de conhecimento empresa (global)
  for (const faq of COMPANY_KNOWLEDGE_FAQS) {
    const check = await fetch(
      `${url}/rest/v1/course_knowledge_sources?course_id=is.null&title=eq.${encodeURIComponent(faq.title)}&select=id,status`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    const found = await check.json();
    if (found.length && found[0].status === "ready") continue;

    let sourceId = found[0]?.id;
    if (!sourceId) {
      const ins = await fetch(`${url}/rest/v1/course_knowledge_sources`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=representation" },
        body: JSON.stringify({
          course_id: null,
          source_type: "faq",
          title: faq.title,
          raw_content: faq.raw_content,
          status: "pending",
        }),
      });
      if (!ins.ok) {
        console.warn("FAQ:", await ins.text());
        continue;
      }
      sourceId = (await ins.json())[0]?.id;
    }

    if (sourceId) {
      await fetch(`${url}/functions/v1/process-knowledge-source`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: sourceId }),
      });
      console.log(`FAQ empresa: ${faq.title}`);
    }
  }

  console.log("\nEquipe ativa: Coordenador + SDR + Closer + Suporte (todos globais)");
  console.log("Edite instruções em: tools/ai/agent-team-definitions.mjs");
  console.log("Admin: /admin/ia/agentes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
