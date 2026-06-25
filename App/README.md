# 📱 FerriBor App (PWA) — Camada 3

Módulo do **Progressive Web App** do ecossistema FerriBor Global 4.0.
Projeto independente: instala, builda e roda **dentro desta pasta** (não há package geral na raiz).

> Status: **scaffold inicial** — estrutura criada, implementação pendente (ver checklist).

---

## 🎯 Escopo (Briefing — Camada 3)

- App instalável (ícone na tela inicial, `manifest.json`)
- Modo offline parcial (catálogos e fichas técnicas via Service Worker + IndexedDB)
- Push notifications (recompra, status de produção, ESG)
- Busca por imagem (câmera → IA identifica peça)
- Sincronização automática ao reconectar
- Performance mobile-first
- Integração com a Extranet (Portal do Cliente) e o CRM

## 🧱 Stack prevista

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- PWA: `next-pwa` ou Workbox (Service Workers)
- IndexedDB (cache local) + Web Push API
- i18n: `next-intl` (PT/EN/ES/FR)

## 📁 Estrutura de pastas

```
App/
├── public/
│   ├── manifest.json        # Instalação como app
│   └── icons/               # Ícones PWA (192, 512, maskable)
├── src/
│   ├── app/                 # Rotas (App Router)
│   ├── components/          # UI compartilhada do app
│   ├── lib/                 # offline (IndexedDB), push, sync, api
│   └── workers/             # Service Worker / estratégias de cache
├── package.json
└── README.md
```

## ⚡ Execução (após implementação)

```bash
cd App
npm install
npm run dev
```
