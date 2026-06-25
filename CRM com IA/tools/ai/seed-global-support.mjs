#!/usr/bin/env node
/** Agente Support global + FAQs de portal. Uso: npm run ai:seed-support */
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

const GLOBAL_SUPPORT = {
  course_id: null,
  name: "Suporte Inforhealth",
  description: "Atendimento a alunos e visitantes com dúvidas de acesso, certificado e portal.",
  agent_type: "support",
  primary_objective:
    "Resolver dúvidas sobre portal do aluno, certificados, acesso e conteúdo. Abrir ticket automaticamente quando não houver resposta na base.",
  can_do: [
    "Orientar acesso ao portal edu.inforhealth.com.br/aluno",
    "Explicar emissão de certificado após conclusão",
    "Consultar FAQ e base de conhecimento",
    "Abrir ticket para equipe humana",
  ],
  cannot_do: ["Vender novos cursos", "Alterar notas ou certificados manualmente"],
  handoff_triggers: ["Problema técnico não resolvido", "Reclamação grave"],
  tone_style: "friendly",
  message_style: "balanced",
  additional_prompt: `Portal do aluno: https://edu.inforhealth.com.br/aluno
Recuperação de senha: usar "Esqueci minha senha" no login.
Certificado: liberado após 100% das aulas e avaliação quando aplicável.
Não repita o nome do visitante a cada mensagem.`,
  humanization: { enabled: true, timing: { first_reply_min_ms: 3000, first_reply_max_ms: 7000, between_bubbles_ms: 1000 } },
  tool_flags: {
    can_update_pipeline: false,
    can_apply_tags: false,
    can_qualify_lead: false,
    can_handoff_human: true,
    can_open_ticket: true,
    can_share_course_link: true,
    can_share_checkout: false,
  },
  channel_flags: { webchat: true, whatsapp: true, inbox_crm: true },
  is_active: true,
  is_default: true,
  atualizado_em: new Date().toISOString(),
};

const GLOBAL_FAQS = [
  {
    title: "Como acesso o portal do aluno?",
    raw_content:
      "Entre em https://edu.inforhealth.com.br/aluno com o e-mail usado na matrícula. Se esqueceu a senha, clique em Esqueci minha senha.",
  },
  {
    title: "Quando recebo o certificado?",
    raw_content:
      "O certificado é emitido após conclusão de 100% das aulas e aprovação na avaliação do curso, quando houver.",
  },
  {
    title: "Não consigo entrar no curso",
    raw_content:
      "Verifique se está usando o mesmo e-mail da compra. Limpe o cache do navegador ou tente outro navegador. Se persistir, nossa equipe abre um chamado em até 1 dia útil.",
  },
];

async function main() {
  const env = parseEnv(await readFile(ENV_PATH, "utf8"));
  const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em config/crm.env");
    process.exit(1);
  }

  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const listRes = await fetch(
    `${url}/rest/v1/course_agents?agent_type=eq.support&course_id=is.null&select=id`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  const existing = await listRes.json();

  if (existing.length > 0) {
    const id = existing[0].id;
    const res = await fetch(`${url}/rest/v1/course_agents?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(GLOBAL_SUPPORT),
    });
    if (!res.ok) {
      console.error(await res.text());
      process.exit(1);
    }
    console.log(`OK: Support global atualizado (${id})`);
  } else {
    const res = await fetch(`${url}/rest/v1/course_agents`, {
      method: "POST",
      headers,
      body: JSON.stringify(GLOBAL_SUPPORT),
    });
    if (!res.ok) {
      console.error(await res.text());
      process.exit(1);
    }
    const rows = await res.json();
    console.log(`OK: Support global criado (${rows[0]?.id})`);
  }

  for (const faq of GLOBAL_FAQS) {
    const check = await fetch(
      `${url}/rest/v1/course_knowledge_sources?course_id=is.null&title=eq.${encodeURIComponent(faq.title)}&select=id`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } },
    );
    const found = await check.json();
    if (found.length) continue;

    const ins = await fetch(`${url}/rest/v1/course_knowledge_sources`, {
      method: "POST",
      headers,
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
    const row = (await ins.json())[0];
    if (row?.id) {
      await fetch(`${url}/functions/v1/process-knowledge-source`, {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ source_id: row.id }),
      });
      console.log(`FAQ indexada: ${faq.title}`);
    }
  }

  console.log("Concluído: Support global + FAQs portal");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
