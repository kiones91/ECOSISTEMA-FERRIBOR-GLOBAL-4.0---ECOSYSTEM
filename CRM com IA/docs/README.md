# 🧠 CRM COM IA — Backend / Core do Ecossistema (Camada 1-4)

> Pasta-raiz modular do **CRM interno (PT-BR) com Agentes de IA** e de todos os backends do ecossistema. É o cérebro da operação: atendimento, Motor de IA (SmartSpec + RAG), Recompra, Circular, Credit e Track & Trace.

> 🌐 **Idioma do CRM:** a interface do CRM é **toda em PT-BR** (uso interno da FerriBor). O que é multilíngue é a **capacidade dos Agentes de IA** de atender os clientes (que chegam pelo Site global) em vários idiomas (PT/EN/ES/FR). O CRM **não** é uma interface multilíngue.

📍 **Doc-mestre do ecossistema:** [../../docs/ECOSYSTEM.md](../../docs/ECOSYSTEM.md)
📍 **Fonte da verdade:** [BRIEFING TÉCNICO - PROJETO FERRIBOR GLOBAL 4.0.md](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

---

## 🎯 PRIORIDADES (do Briefing — topo de tudo)

1. **SmartSpec preciso** — IA de análise de desenhos é o coração do projeto.
2. **RAG alimentado** — banco vetorial com todo o catálogo técnico da FerriBor.
3. **Agentes de IA multilíngues** — os agentes atendem clientes em PT/EN/ES/FR (detecção automática de idioma do cliente). A interface do CRM permanece em PT-BR.
4. **Segurança** — dados industriais sensíveis (LGPD/GDPR, AES-256, secrets).
5. **Escalabilidade da IA** — controle de custo por token.

> ⚠️ **Divergência a reconciliar:** A estrutura atual (`admin/`, `docs/crm-admin/`) traz documentação herdada de **InforHealth/Buffallos** (outro cliente). Estes docs novos descrevem o CRM **no contexto FerriBor**. O código existente deve ser adaptado/limpo; os docs herdados ficam preservados até a reconciliação.

---

## 1. Visão Geral

O CRM com IA é o **backend/core** que serve [Site](../../Site/docs/README.md), [Dashboard](../../Dashboard/docs/README.md) e [App](../../App/docs/README.md). Responsável por:

- **CRM Omnichannel (UI em PT-BR) com Agentes de IA multilíngues** — WhatsApp (QR Code), e-mail, chat do site; os agentes detectam o idioma do cliente e respondem nele; qualificação e roteamento de leads.
- **Motor de IA (SmartSpec + RAG)** — análise de desenhos (CAD/PDF/imagem) cruzada com catálogo via banco vetorial.
- **Formulário Inteligente de Cotação** — extração de metadados, priorização da fila de engenharia.
- **Dashboard de Leads em Tempo Real** — leads por país/idioma/setor, conversão, tempo de resposta.
- **Backends de negócio:** Recompra Automática, FerriBor Circular (ESG), FerriBor Credit, Track & Trace Industrial.

## 2. Stack Tecnológica

| Camada | Tecnologia |
| :-- | :-- |
| API | Node.js (NestJS) ou Python (FastAPI) |
| Banco relacional | PostgreSQL (via Supabase no estado atual) |
| Banco vetorial (RAG) | Pinecone / Weaviate / Qdrant |
| Cache | Redis |
| Filas | BullMQ / RabbitMQ |
| LLM | OpenAI GPT-4o / Anthropic Claude 3.5 Sonnet |
| Embeddings | OpenAI text-embedding-3-large |
| CAD | Aspose.CAD Cloud API |
| Idioma | Google Cloud Translation / DeepL |
| WhatsApp | Sistema próprio (QR Code) |

## 3. Estrutura Atual (existente)

```
CRM com IA/
├── admin/              # Front-office do CRM (React/Lovable) — herdado, adaptar
├── supabase/           # Edge functions + migrations (Postgres)
│   └── functions/      # evolution-proxy, webchat-api, form-submit, etc.
├── worker/             # Worker (auth, bridge, db, routes) — WhatsApp/integrações
├── tools/ai/           # Ferramentas de IA
├── shared/ · config/   # Compartilhados
└── docs/crm-admin/     # Docs herdados (InforHealth) — preservados
```

## 4. Pré-requisitos
- Node.js v18+
- Supabase CLI (estado atual) / Docker
- Chaves: LLM, embeddings, Aspose, tradução, WhatsApp

## 5. Variáveis de Ambiente (a definir/consolidar)

```env
DATABASE_URL=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
VECTOR_DB_URL=
ASPOSE_CLIENT_ID=
ASPOSE_CLIENT_SECRET=
TRANSLATION_API_KEY=
WHATSAPP_SESSION=
```

## 6. Estrutura de Documentação do Módulo

```
CRM com IA/
├── docs/
│   ├── README.md               # (este arquivo)
│   ├── PDR.md
│   ├── PRD.md
│   ├── CHECKLIST.md
│   ├── DOCUMENTACAO-COMPLETA.md
│   └── crm-admin/              # 📁 Docs herdados (preservados)
└── database/
    ├── README.md
    ├── schema/
    └── seeds/
```

## 7. Documentação do Módulo

| Documento | Conteúdo |
| :-- | :-- |
| [PDR.md](PDR.md) | Design: personas internas, fluxos de atendimento/IA |
| [PRD.md](PRD.md) | Requisitos (Must/Should/Could/Won't), NFRs, critérios de aceite |
| [CHECKLIST.md](CHECKLIST.md) | Checklist de execução por etapa |
| [DOCUMENTACAO-COMPLETA.md](DOCUMENTACAO-COMPLETA.md) | Arquitetura, Motor de IA, APIs, modelos, deploy |
| [../database/README.md](../database/README.md) | Modelo de dados (fonte da verdade do ecossistema) |

## 8. Status Atual
Estrutura existente (admin + supabase + worker), **incompleta** e parcialmente herdada de outro cliente. Falta: adaptar ao FerriBor, Motor de IA SmartSpec+RAG, backends de Recompra/Circular/Credit/Track&Trace, agentes de IA multilíngues (a UI permanece em PT-BR).
