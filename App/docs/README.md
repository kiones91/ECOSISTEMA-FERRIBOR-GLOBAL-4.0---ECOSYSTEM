# 📱 APP — Módulo PWA FerriBor (Camada 3)

> Pasta-raiz modular do **Progressive Web App**. App mobile instalável do ecossistema FerriBor: offline parcial, push, busca por imagem e sincronização.

📍 **Doc-mestre do ecossistema:** [../../docs/ECOSYSTEM.md](../../docs/ECOSYSTEM.md)
📍 **Fonte da verdade:** [BRIEFING TÉCNICO - PROJETO FERRIBOR GLOBAL 4.0.md](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)
📍 **README de execução do código:** [../README.md](../README.md)

---

## 🎯 PRIORIDADES (do Briefing — topo de tudo)

1. **Performance mobile-first** — carregamento instantâneo de conteúdo cacheado.
2. **Offline real** — minas sem internet precisam consultar catálogo/fichas técnicas.
3. **Internacionalização (i18n)** — PT/EN/ES/FR desde o início.
4. **Segurança** — dados industriais sensíveis, sincronização segura.
5. **Escalabilidade da IA** — busca por imagem consome backend; controlar custo por token.

---

## 1. Visão Geral

PWA que entrega a experiência do Portal do Cliente no celular, funcionando como app nativo (ícone na tela inicial). Complementa o [Dashboard (Extranet)](../../Dashboard/docs/README.md) com foco em mobilidade e operação em campo.

Funcionalidades-chave (Briefing Camada 3):
- App instalável (`manifest.json`, ícone na tela inicial).
- Modo offline parcial (catálogos e fichas técnicas via Service Worker + IndexedDB).
- Push notifications (recompra, status de produção, ESG).
- Busca por imagem (câmera → IA identifica peça).
- Sincronização automática ao reconectar.

## 2. Stack Tecnológica

| Camada | Tecnologia |
| :-- | :-- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilização | Tailwind CSS + shadcn/ui |
| PWA | `next-pwa` ou Workbox (Service Workers) |
| Cache local | IndexedDB |
| Notificações | Web Push API |
| i18n | next-intl (PT/EN/ES/FR) |

## 3. Pré-requisitos
- Node.js v18+
- npm (ou pnpm/yarn)

## 4. Como rodar localmente

```bash
cd App
npm install
npm run dev
```

## 5. Variáveis de Ambiente (a definir)

```env
NEXT_PUBLIC_API_URL=            # backend CRM com IA
NEXT_PUBLIC_PORTAL_URL=         # Dashboard / Extranet
VAPID_PUBLIC_KEY=               # Web Push
VAPID_PRIVATE_KEY=
NEXT_PUBLIC_DEFAULT_LOCALE=pt
```

## 6. Estrutura de Pastas

```
App/
├── docs/                       # 📚 Documentação padrão deste módulo
│   ├── README.md               # (este arquivo)
│   ├── PDR.md
│   ├── PRD.md
│   ├── CHECKLIST.md
│   └── DOCUMENTACAO-COMPLETA.md
├── database/                   # 🗄️ Recorte de dados (cache offline)
│   ├── README.md
│   ├── schema/
│   └── seeds/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── app/                    # Rotas (App Router)
│   ├── components/
│   ├── lib/                    # offline (IndexedDB), push, sync, api
│   └── workers/                # Service Worker / cache
├── package.json
└── README.md                   # Execução do código (legado, mantido)
```

## 7. Documentação do Módulo

| Documento | Conteúdo |
| :-- | :-- |
| [PDR.md](PDR.md) | Design do produto: personas, jornadas mobile, UX/UI, offline |
| [PRD.md](PRD.md) | Requisitos (Must/Should/Could/Won't), NFRs, critérios de aceite |
| [CHECKLIST.md](CHECKLIST.md) | Checklist de execução por etapa |
| [DOCUMENTACAO-COMPLETA.md](DOCUMENTACAO-COMPLETA.md) | Arquitetura PWA, Service Worker, sync, APIs, deploy |
| [../database/README.md](../database/README.md) | Modelo de dados do cache offline |

## 8. Status Atual
**Scaffold inicial** — estrutura criada, implementação pendente. Falta: Service Worker, IndexedDB, push, busca por imagem, sync, i18n.
