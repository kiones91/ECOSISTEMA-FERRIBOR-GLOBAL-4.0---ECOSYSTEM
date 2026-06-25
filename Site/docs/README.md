# 🌐 SITE — Módulo Frontend de Aquisição (FerriBor Global 4.0)

> Pasta-raiz modular do **Site Institucional Multilíngue**. Ponto de entrada do ecossistema FerriBor: aquisição de leads, mostruário de produtos e porta de acesso ao Portal do Cliente.

📍 **Doc-mestre do ecossistema:** [../../docs/ECOSYSTEM.md](../../docs/ECOSYSTEM.md)
📍 **Fonte da verdade:** [BRIEFING TÉCNICO - PROJETO FERRIBOR GLOBAL 4.0.md](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

---

## 🎯 PRIORIDADES (do Briefing — topo de tudo)

1. **Internacionalização (i18n)** desde o dia 1 — PT/EN/ES/FR com switcher automático por geolocalização.
2. **SEO técnico** embutido na arquitetura — hreflang, sitemap multilíngue, Schema Markup, indexação massiva de fichas técnicas.
3. **Performance mobile-first** — Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1).
4. **Segurança** — HTTPS/TLS 1.3, LGPD/GDPR, proteção de uploads.
5. **Escalabilidade da IA** — SmartSpec no site consome backend; controlar custo por token.

> ⚠️ **Divergência a reconciliar:** A documentação legada em [`../documentação do site/`](../documentação%20do%20site/) descreve o site **só em português**. O briefing define **4 idiomas (PT/EN/ES/FR)**. Estes docs novos seguem o briefing. (As antigas menções a HubSpot/Zoho já foram corrigidas para o **CRM próprio da FerriBor**.) Reconciliar i18n com o time antes de codar.

---

## 1. Visão Geral

O Site é o **frontend de aquisição** do ecossistema. Responsável por:
- Apresentar a FerriBor e suas soluções setoriais (Mineração, Cerâmica, Agronegócio, Metalmecânica).
- **Mostruário 3D** (Biblioteca Técnica 3D — Three.js / React Three Fiber).
- **SmartSpec (demo)** — upload de desenho e análise por IA via API do backend.
- **Calculadora de ROI e OEE** — ferramenta interativa com geração de PDF.
- **Botão "Acessar seu Portal do Cliente"** — porta de entrada para o módulo [Dashboard (Extranet)](../../Dashboard/docs/README.md).

## 2. Stack Tecnológica

| Camada | Tecnologia |
| :-- | :-- |
| Framework | Next.js 14+ (App Router) + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| 3D | Three.js + React Three Fiber + `@react-three/drei` (modelos glTF/GLB) |
| i18n | next-intl ou i18next (PT/EN/ES/FR) |
| Estado | Zustand |
| Formulários | React Hook Form + Zod |
| Upload | Uppy.io → AWS S3 (pre-signed URLs) |
| Animações | Framer Motion |
| Testes | Vitest + RTL / Playwright |

## 3. Pré-requisitos

- Node.js v18+
- npm (ou pnpm/yarn)

## 4. Como rodar localmente

```bash
cd Site
npm ci
npm run dev      # http://localhost:3000
npm run build    # build de produção + checagem de tipos
```

## 5. Variáveis de Ambiente (a definir)

```env
# IA / SmartSpec (via backend CRM com IA)
NEXT_PUBLIC_SMARTSPEC_API_URL=
# Uploads
S3_BUCKET=
S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
# Portal do Cliente
NEXT_PUBLIC_PORTAL_URL=
# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

## 6. Estrutura de Pastas

```
Site/
├── docs/                       # 📚 Documentação padrão deste módulo
│   ├── README.md               # (este arquivo)
│   ├── PDR.md
│   ├── PRD.md
│   ├── CHECKLIST.md
│   └── DOCUMENTACAO-COMPLETA.md
├── database/                   # 🗄️ Recorte de dados do Site
│   ├── README.md
│   ├── schema/
│   └── seeds/
├── documentação do site/       # 📁 Docs legados (manter — reconciliar)
├── src/                        # Código Next.js
│   ├── app/                    # Rotas (App Router)
│   ├── components/
│   ├── lib/
│   ├── routes/
│   ├── styles/
│   └── types/
└── public/                     # assets, models 3D
```

## 7. Documentação do Módulo

| Documento | Conteúdo |
| :-- | :-- |
| [PDR.md](PDR.md) | Design do produto: personas, jornadas, UX/UI, fluxos, acessibilidade |
| [PRD.md](PRD.md) | Requisitos funcionais (Must/Should/Could/Won't), NFRs, critérios de aceite |
| [CHECKLIST.md](CHECKLIST.md) | Checklist de execução por etapa |
| [DOCUMENTACAO-COMPLETA.md](DOCUMENTACAO-COMPLETA.md) | Arquitetura, APIs, modelos de dados, deploy |
| [../database/README.md](../database/README.md) | Modelo de dados do módulo |

## 8. Status Atual

Estrutura Next.js existente, **incompleta**. Home reestruturada com conteúdo real da FerriBor (design system claro). Falta: i18n completo, mostruário 3D, SmartSpec demo, calculadora ROI, integração com Portal.
