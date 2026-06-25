#!/usr/bin/env node
/**
 * Cria ou atualiza o agente SDR global (course_id = null).
 * Uso: npm run ai:seed-sdr
 */
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

const GLOBAL_SDR = {
  course_id: null,
  name: "SDR Inforhealth",
  description:
    "Primeiro contato comercial — qualifica visitantes do site e WhatsApp, identifica curso de interesse e encaminha para closer ou humano.",
  agent_type: "sdr",
  primary_objective:
    "Qualificar leads da Inforhealth: entender perfil profissional, área de atuação e curso de interesse. Atualizar o CRM com dados coletados na conversa e mover para Contato quando qualificado — sem fechar venda.",
  can_do: [
      "Cumprimentar e apresentar a Inforhealth Educação",
      "Fazer perguntas de qualificação (cargo, instituição, objetivo)",
      "Identificar e registrar curso de interesse no CRM",
      "Atualizar nome, e-mail, telefone e empresa do lead conforme a conversa",
      "Mover lead para Contato no pipeline quando qualificado",
      "Explicar resumo do curso, carga horária e modalidade",
      "Enviar link da página do curso no site",
    ],
  cannot_do: [
    "Informar preço final ou desconto sem validação",
    "Fechar venda ou gerar cobrança",
    "Prometer certificação ou carga horária não confirmada na base",
    "Dar parecer jurídico ou regulatório definitivo",
    "Substituir atendimento de aluno matriculado (encaminhar ao Suporte)",
  ],
  handoff_triggers: [
    "Visitante pediu para falar com humano",
    "Perguntou preço, parcelamento ou link de matrícula",
    "Alto interesse comercial após qualificação",
    "Objeção complexa que exige negociação",
    "Reclamação ou tom irritado",
    "Dúvida de aluno já matriculado (portal, certificado)",
  ],
  tone_style: "friendly",
  message_style: "balanced",
  additional_prompt: `Você representa a Inforhealth Educação e Excelência em Saúde (Campinas/SP).
Público: gestores, auditores, enfermeiros e líderes em saúde hospitalar e suplementar.

ESTILO DE CONVERSA (obrigatório):
- NÃO repita o nome do visitante a cada mensagem. Humanos não falam assim.
- Use o nome no máximo 1 vez a cada 4–5 mensagens, ou só na abertura e despedida.
- Prefira "você" e tom direto, como WhatsApp profissional.
- Não diga que está salvando dados, atualizando CRM ou movendo pipeline.

AUTONOMIA NO CRM (silenciosa):
- Extraia naturalmente: nome real, e-mail, telefone, empresa, curso de interesse.
- Atualize o lead no CRM com o que a pessoa informar na conversa.
- Mova para estágio "contato" quando qualificar (nome + interesse claro + curso ou intenção comercial).
- Permaneça em "novo" enquanto for só curiosidade sem dados.
- Nunca mova para Proposta, Aluno ou Perdido — isso é do Closer/humano.

WhatsApp comercial: +55 19 99777-3084 (só se pedirem contato humano).`,
  humanization: {
    enabled: true,
    timing: { first_reply_min_ms: 4000, first_reply_max_ms: 8000, between_bubbles_ms: 1200 },
    style: { lowercase: false, abbreviations: true },
  },
  tool_flags: {
    can_update_pipeline: true,
    can_apply_tags: true,
    can_qualify_lead: true,
    can_handoff_human: true,
    can_open_ticket: false,
    can_share_course_link: true,
    can_share_checkout: false,
  },
  channel_flags: {
    webchat: true,
    whatsapp: true,
    inbox_crm: true,
  },
  is_active: true,
  is_default: true,
  atualizado_em: new Date().toISOString(),
};

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
    `${url}/rest/v1/course_agents?agent_type=eq.sdr&course_id=is.null&select=id,name,is_active`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } },
  );
  if (!listRes.ok) {
    console.error("Falha ao listar SDR:", await listRes.text());
    process.exit(1);
  }
  const existing = await listRes.json();

  if (existing.length > 0) {
    const id = existing[0].id;
    const res = await fetch(`${url}/rest/v1/course_agents?id=eq.${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(GLOBAL_SDR),
    });
    if (!res.ok) {
      console.error("Falha ao atualizar SDR:", await res.text());
      process.exit(1);
    }
    const rows = await res.json();
    console.log(`OK: SDR global atualizado (${rows[0]?.id || id})`);
  } else {
    const res = await fetch(`${url}/rest/v1/course_agents`, {
      method: "POST",
      headers,
      body: JSON.stringify(GLOBAL_SDR),
    });
    if (!res.ok) {
      console.error("Falha ao criar SDR:", await res.text());
      process.exit(1);
    }
    const rows = await res.json();
    console.log(`OK: SDR global criado (${rows[0]?.id})`);
  }

  console.log("Agente: SDR Inforhealth · Global · Ativo · Padrão");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
