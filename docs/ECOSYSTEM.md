# 🌐 FERRIBOR GLOBAL 4.0 — MAPA DO ECOSSISTEMA

> Documento-mestre da PASTA RAIZ. Ponto de entrada para qualquer pessoa ou agente de IA entender como o ecossistema FerriBor está organizado de forma modular.

**Cliente:** Ferri Indústria de Artefatos de Borracha Ltda (FerriBor)
**Segmento:** Indústria B2B de artefatos de borracha industrial (elastômeros)
**Mercados-Alvo:** Brasil, Chile, Peru, Argentina, Colômbia, Guiana Francesa
**Setores:** Mineração, Agronegócio, Cerâmica, Metalmecânica
**Idiomas:** Português, Inglês, Espanhol, Francês
**Fonte da verdade:** [BRIEFING TÉCNICO - PROJETO FERRIBOR GLOBAL 4.0.md](../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

---

## 🏗️ Arquitetura do Ecossistema

```
FERRIBOR GLOBAL 4.0 - ECOSYSTEM
├── [Frontend - Aquisição e Portal do Cliente]
│   ├── Site Institucional Multilíngue (PT/EN/ES/FR)
│   │   ├── Mostruário com Peças 3D (Biblioteca Técnica 3D)
│   │   ├── IA de Análise de Desenhos (SmartSpec)
│   │   ├── Calculadora de ROI e OEE
│   │   └── Botão "Acessar seu Portal do Cliente"
│   ├── PWA FerriBor (Mobile App)
│   └── Dashboard do Cliente (Extranet B2B)
│       ├── Histórico de Pedidos e Status de Produção
│       ├── Recompra Automática
│       ├── FerriBor Credit (Cashback B2B)
│       ├── FerriBor Circular (Logística Reversa)
│       ├── Dashboard e Selo ESG (para clientes)
│       └── Aba de Mensagens Diretas com CRM
├── [Backend / Core - Operação e IA]
│   ├── CRM Poliglota com IA (Atendimento Cliente/Fornecedor)
│   │   ├── Formulário Inteligente de Cotação
│   │   └── Dashboard de Leads em Tempo Real
│   ├── Motor de IA (SmartSpec + RAG)
│   ├── Sistema de Recompra Automática (Backend)
│   ├── FerriBor Circular (Backend ESG/Logística Reversa)
│   ├── FerriBor Credit (Backend Cashback B2B)
│   └── Track & Trace Industrial (Backend)
└── [Integrações e Infraestrutura]
    ├── WhatsApp Business API (via QR Code)
    ├── APIs de IA (GPT-4o / Claude 3.5 Sonnet)
    ├── APIs de Tradução/Detecção de Idioma
    ├── Middleware CAD (Aspose)
    ├── API/EDI para ERPs de mineradoras (Portal Fornecedores)
    ├── Cloud (AWS/Azure/Vercel)
    ├── S3/Blob Storage
    ├── Banco de Dados Vetorial (RAG)
    └── CDN Global
```

---

## 📦 Módulos (Pastas-Raiz Modulares)

Cada módulo é uma **pasta-raiz independente**, com sua própria documentação completa (`docs/`) e seu próprio banco de dados organizado (`database/`) — mesmo que no servidor SQL todos compartilhem uma única instância.

| # | Módulo (pasta) | Papel no ecossistema | Camada do briefing | Status atual |
| :-- | :-- | :-- | :-- | :-- |
| 1 | [`Site/`](../Site/docs/README.md) | Frontend de aquisição: site institucional multilíngue, mostruário 3D, SmartSpec (demo), Calculadora ROI, porta de entrada do Portal | Camada 1-2 | Estrutura existente, incompleta |
| 2 | [`App/`](../App/docs/README.md) | PWA FerriBor (mobile app): offline, push, busca por imagem | Camada 3 | Scaffold inicial |
| 3 | [`Dashboard/`](../Dashboard/docs/README.md) | Extranet B2B (Portal do Cliente): pedidos, Track & Trace, Recompra, Credit, Circular, ESG, mensagens com CRM | Camada 3-4 | A criar do zero |
| 4 | [`CRM com IA/`](../CRM%20com%20IA/docs/README.md) | Backend/Core (UI interna em PT-BR): CRM com agentes de IA multilíngues, Motor de IA (SmartSpec+RAG), Recompra, Circular, Credit, Track & Trace (todos os backends) | Camada 1-4 | Estrutura existente, incompleta |

---

## 📁 Padrão de cada Pasta-Raiz Modular

Todo módulo segue a mesma estrutura, para que qualquer pessoa/IA navegue de forma previsível:

```
<MÓDULO>/
├── docs/
│   ├── README.md                 # Visão geral, stack, como rodar, variáveis de ambiente
│   ├── PDR.md                    # Product Design Document (UX/UI, personas, jornadas, fluxos)
│   ├── PRD.md                    # Product Requirements Document (requisitos Must/Should/Could/Won't)
│   ├── CHECKLIST.md              # Checklist de execução por etapa/camada
│   └── DOCUMENTACAO-COMPLETA.md  # Documentação técnica detalhada (arquitetura, APIs, modelos, deploy)
├── database/
│   ├── README.md                 # Modelo de dados do módulo, schema lógico, relações
│   ├── schema/                   # DDL / migrations / definição de tabelas do módulo
│   └── seeds/                    # Dados de exemplo / fixtures
├── src/                          # Código-fonte do módulo
└── (artefatos do próprio módulo)
```

### Regra de Banco de Dados Modular
No servidor SQL de produção pode existir **um único banco**. Aqui, **cada módulo documenta e versiona apenas o seu próprio recorte** (tabelas, views, migrations) dentro de `database/`. Isso mantém o domínio de cada parte isolado e compreensível, mesmo compartilhando a instância física.

---

## 🎯 Prioridades (vindas do Briefing)

Estas prioridades devem estar **no topo de cada documento** de cada módulo:

1. **Internacionalização (i18n)** desde o dia 1 — PT/EN/ES/FR, não deixar para depois.
2. **SEO técnico** embutido na arquitetura (não como afterthought).
3. **Performance mobile-first** — PWA precisa ser rápido (LCP < 2.5s).
4. **Segurança** em todas as camadas — dados industriais sensíveis (LGPD/GDPR, 2FA na Extranet, AES-256).
5. **Escalabilidade da infraestrutura de IA** — controle de custo por token.

### Pontos de atenção críticos
- **SmartSpec (IA de análise de desenhos)** é o coração do projeto — precisa ser extremamente preciso.
- **RAG (banco vetorial)** precisa ser alimentado com todo o catálogo técnico da FerriBor.
- **Detecção automática de idioma** é crítica para o CRM poliglota.
- **PWA offline** precisa funcionar bem (minas sem internet).
- **WhatsApp via QR Code** — sistema próprio da startup.

---

## 🗓️ Cronograma por Camada (referência)

| Camada | Duração | Entregas Principais | Módulos envolvidos |
| :-- | :-- | :-- | :-- |
| Camada 1 | Mês 1-3 | Site multilíngue, CRM poliglota, formulários, SEO técnico | Site, CRM |
| Camada 2 | Mês 4-6 | SmartSpec (IA), Calculadora ROI, Visualizador 3D | Site, CRM |
| Camada 3 | Mês 7-9 | Extranet, Recompra Automática, PWA, FerriBor Credit | Dashboard, App, CRM |
| Camada 4 | Mês 10-12 | FerriBor Circular, Dashboard ESG, API/EDI | Dashboard, CRM |

---

## 🤖 Stack Tecnológica (resumo)

- **Frontend/Site/PWA:** Next.js (React) + TypeScript, Tailwind + shadcn/ui, Three.js / R3F, next-intl/i18next
- **Backend:** Node.js (NestJS) ou Python (FastAPI), PostgreSQL, Redis, BullMQ/RabbitMQ
- **IA:** OpenAI GPT-4o / Claude 3.5 Sonnet, embeddings text-embedding-3-large, Vector DB (Pinecone/Weaviate/Qdrant), Aspose.CAD
- **Integrações:** WhatsApp (QR Code próprio), SendGrid/SES, Stripe/Pagar.me, S3/R2, Cloudflare/Vercel
- **Infra:** Vercel + AWS/Azure, Docker/K8s, GitHub Actions, Sentry/Datadog

---

*Versão do documento: 1.0 — gerado a partir do briefing reorganizado.*
