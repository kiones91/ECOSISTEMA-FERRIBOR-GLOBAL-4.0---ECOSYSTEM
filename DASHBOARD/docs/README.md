# 🔐 DASHBOARD — Extranet B2B / Portal do Cliente (Camada 3-4)

> Pasta-raiz modular do **Dashboard do Cliente (Extranet B2B)**. Hub central do Portal do Cliente: onde o cliente logado acompanha pedidos, recompra, créditos, ESG e fala com o CRM.

📍 **Doc-mestre do ecossistema:** [../../docs/ECOSYSTEM.md](../../docs/ECOSYSTEM.md)
📍 **Fonte da verdade:** [BRIEFING TÉCNICO - PROJETO FERRIBOR GLOBAL 4.0.md](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

---

## 🎯 PRIORIDADES (do Briefing — topo de tudo)

1. **Segurança** — área logada com dados industriais sensíveis: 2FA, AES-256, LGPD/GDPR, auditoria de acesso.
2. **Internacionalização (i18n)** — PT/EN/ES/FR.
3. **Performance** — dashboards e status em tempo real responsivos.
4. **Integração com o CRM** — o Dashboard é a face do cliente sobre os backends do [CRM com IA](../../CRM%20com%20IA/docs/README.md).
5. **Escalabilidade da IA** — alertas preditivos de recompra e cálculos ESG consomem backend.

---

## 1. Visão Geral

Extranet B2B onde o cliente acessa, após login a partir do botão "Acessar seu Portal do Cliente" no [Site](../../Site/docs/README.md). Agrega num só lugar:

- **Histórico de Pedidos + Status de Produção** (Track & Trace Industrial: Em corte → Vulcanização → QA → Expedição).
- **Recompra Automática** (1-click + alertas preditivos de desgaste).
- **FerriBor Credit** (cashback B2B, pontos, ranking, resgate).
- **FerriBor Circular** (logística reversa: solicitar coleta de usados, créditos ESG).
- **Dashboard e Selo ESG** (certificado de impacto ambiental em PDF, selo visual).
- **Mensagens Diretas com o CRM** (chat com engenharia da FerriBor).
- **Central de Documentos** (NFs, certificados, laudos técnicos).

> O Dashboard é o **frontend logado**; toda a lógica de negócio vive nos backends do [CRM com IA](../../CRM%20com%20IA/docs/README.md). O [App (PWA)](../../App/docs/README.md) consome o mesmo domínio em mobile.

## 2. Stack Tecnológica

| Camada | Tecnologia |
| :-- | :-- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| Autenticação | NextAuth.js / Auth0 / Clerk + 2FA |
| Estado/Dados | React Query (server state) |
| i18n | next-intl (PT/EN/ES/FR) |
| PDF | geração de certificados ESG / ROI |
| Tempo real | WebSocket/SSE para Track & Trace |

## 3. Pré-requisitos
- Node.js v18+
- npm (ou pnpm/yarn)
- Acesso às APIs do [CRM com IA](../../CRM%20com%20IA/docs/README.md)

## 4. Como rodar localmente (após scaffold)

```bash
cd Dashboard
npm install
npm run dev
```

## 5. Variáveis de Ambiente (a definir)

```env
NEXT_PUBLIC_API_URL=            # backend CRM com IA
NEXTAUTH_URL=
NEXTAUTH_SECRET=
AUTH_2FA_PROVIDER=
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

## 6. Estrutura de Pastas

```
Dashboard/
├── docs/                       # 📚 Documentação padrão deste módulo
│   ├── README.md               # (este arquivo)
│   ├── PDR.md
│   ├── PRD.md
│   ├── CHECKLIST.md
│   └── DOCUMENTACAO-COMPLETA.md
├── database/                   # 🗄️ Recorte de dados do Portal
│   ├── README.md
│   ├── schema/
│   └── seeds/
├── src/                        # Código Next.js (a criar)
└── public/
```

## 7. Documentação do Módulo

| Documento | Conteúdo |
| :-- | :-- |
| [PDR.md](PDR.md) | Design do produto: personas, jornadas logadas, UX/UI |
| [PRD.md](PRD.md) | Requisitos (Must/Should/Could/Won't), NFRs, critérios de aceite |
| [CHECKLIST.md](CHECKLIST.md) | Checklist de execução por etapa |
| [DOCUMENTACAO-COMPLETA.md](DOCUMENTACAO-COMPLETA.md) | Arquitetura, auth, Track & Trace, APIs, deploy |
| [../database/README.md](../database/README.md) | Modelo de dados do Portal |

## 8. Status Atual
**A criar do zero** — pasta e documentação estruturadas; código ainda não iniciado.
