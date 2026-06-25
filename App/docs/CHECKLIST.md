# ✅ CHECKLIST — App PWA

> Execução do módulo **App (PWA)** por etapa. Base: [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Mobile-first · 2. Offline real · 3. i18n PT/EN/ES/FR · 4. Segurança · 5. Custo de IA controlado.

---

## Fase 0 — Fundação
- [x] Scaffold Next.js + TypeScript
- [x] `manifest.json` + pasta de ícones
- [ ] Tailwind + shadcn/ui configurados
- [ ] ESLint/Prettier + CI

## Fase 1 — PWA Instalável
- [ ] `manifest.json` completo (nome, cores, ícones 192/512/maskable)
- [ ] Service Worker registrado (`next-pwa`/Workbox)
- [ ] Prompt de instalação (A2HS)
- [ ] i18n PT/EN/ES/FR

## Fase 2 — Offline
- [ ] Estratégias de cache (catálogo, fichas técnicas)
- [ ] IndexedDB para dados locais
- [ ] Indicador de estado offline/online
- [ ] Fila de ações offline

## Fase 3 — Sincronização & Push
- [ ] Background Sync ao reconectar
- [ ] Resolução de conflitos (idempotência + timestamps)
- [ ] Web Push (VAPID): recompra, status, ESG
- [ ] Deep links acionáveis no push

## Fase 4 — Busca por Imagem
- [ ] Captura via câmera
- [ ] Compressão da imagem
- [ ] Envio ao backend (IA identifica peça)
- [ ] Exibição de resultado → recompra 1-click

## Fase 5 — Qualidade & Performance
- [ ] Lighthouse PWA score
- [ ] Carregamento instantâneo de cache
- [ ] a11y WCAG 2.1 AA mobile
- [ ] Testes (unit + E2E de fluxo offline/sync)
