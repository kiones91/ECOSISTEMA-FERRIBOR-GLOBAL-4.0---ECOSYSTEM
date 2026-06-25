# ✅ CHECKLIST — Site

> Execução do módulo **Site** por etapa. Base: [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. i18n PT/EN/ES/FR dia 1 · 2. SEO técnico nativo · 3. Mobile-first (LCP<2.5s) · 4. Segurança · 5. Custo de IA controlado.

---

## 📊 Diagnóstico (24/06/2026)

### ✅ Implementado
- Home completa (~900 linhas) com Hero carousel 3D, 6 serviços reais, contato, WhatsApp, Portal do Cliente
- Logo3D responsivo
- Header/Nav glassmorphism capsule
- Cookie Banner
- Scroll reveal animations + custom cursor
- Botão "Portal do Cliente" → Dashboard (link funcional)

### 🟡 Stubs (esqueleto sem conteúdo/estilo)
- `app/about/page.tsx` — só `<h1>` e `<p>` placeholder
- `app/services/page.tsx` — stub
- `app/contact/page.tsx` — stub
- `app/blog/page.tsx` — stub
- `components/catalog/CatalogGrid.tsx` — componente vazio
- `components/catalog/FilterSidebar.tsx` — componente vazio
- `app/catalog/page.tsx` — placeholder com links de exemplo
- `components/quote/QuoteWizard.tsx` — HTML puro sem estilo/lógica/validação

### 🔴 Não iniciado
- i18n (next-intl) — ZERO configuração detectada
- SEO técnico (hreflang, sitemap, Schema Markup)
- Landings por setor
- Upload (Uppy → S3)
- Integração CRM (webhook)
- SmartSpec interface
- Calculadora ROI/OEE
- Mostruário 3D com hotspots
- Testes / a11y / LGPD

### 📋 Ordem de execução definida
1. **Completar páginas internas** (About, Services, Contact) com design real
2. **Catálogo funcional** (grid + filtros + página de produto)
3. **QuoteWizard** com estilo, validação e lógica
4. **i18n** (next-intl + rotas por idioma + dropdown de seleção de idioma nativo)
5. **SEO técnico** (hreflang, sitemap, Schema)

> **Nota sobre i18n:** O site será multilíngue com dropdown para o idioma nativo do visitante. Ao selecionar o idioma, todo o site muda para a língua da região escolhida. Isso será implementado por ÚLTIMO, após todas as páginas terem conteúdo real.

---

## Fase 0 — Fundação
- [x] Scaffold Next.js (App Router) + TypeScript
- [x] Tailwind + design system base
- [x] Home com conteúdo real da FerriBor (design claro)
- [ ] Reconciliar docs legados (`documentação do site/`) com briefing (4 idiomas + CRM próprio)
- [ ] Configurar ESLint/Prettier + CI de tipos

## Fase 0.5 — Páginas Internas (design real)
- [x] Página About (história, valores, certificações, stats, CTA)
- [x] Página Services (6 serviços detalhados com imagens, features e CTAs)
- [x] Página Contact (formulário completo + cards de contato + mapa Google Maps)
- [x] Página Blog (grid de artigos + filtro por categoria + newsletter CTA)
- [x] Footer global com links, contato e redes sociais (incluído em cada página)

## Fase 1 — i18n & SEO (Camada 1) — POR ÚLTIMO
- [ ] next-intl/i18next com PT/EN/ES/FR
- [ ] Dropdown de seleção de idioma nativo (muda todo o site para a região escolhida)
- [ ] URLs por idioma (`/es/ /en/ /fr/`)
- [ ] hreflang tags
- [ ] Sitemap XML multilíngue
- [ ] Schema Markup (Product, Organization, FAQPage)
- [ ] Fichas técnicas em tabelas HTML indexáveis

## Fase 2 — Soluções Setoriais & Catálogo
- [ ] Landing por setor (Mineração, Cerâmica, Agro, Metalmecânica)
- [ ] Catálogo com filtros
- [ ] Página de produto (specs + 3D)
- [ ] Biblioteca de Estudos de Caso

## Fase 3 — Cotação & Integração CRM
- [ ] Wizard multi-etapa
- [ ] Upload (PDF/DWG/STEP/JPG/PNG) via Uppy → S3
- [ ] Webhook → CRM (lead) + confirmação por e-mail/WhatsApp no idioma
- [ ] Status tracking da cotação

## Fase 4 — Ferramentas de IA (Camada 2)
- [ ] Mostruário 3D (Three.js): hotspots, corte transversal, fallback 2D
- [ ] SmartSpec (interface): upload, barra de progresso, exibição de resultado da API
- [ ] Calculadora ROI/OEE com geração de PDF
- [x] Botão "Acessar seu Portal do Cliente" → Dashboard

## Fase 5 — Qualidade & Performance
- [ ] Core Web Vitals (LCP<2.5s, FID<100ms, CLS<0.1)
- [ ] a11y WCAG 2.1 AA (teclado no 3D, contraste, ARIA, skip links)
- [ ] Testes Vitest + Playwright (fluxo de cotação)
- [ ] LGPD/GDPR (consentimento multilíngue)
