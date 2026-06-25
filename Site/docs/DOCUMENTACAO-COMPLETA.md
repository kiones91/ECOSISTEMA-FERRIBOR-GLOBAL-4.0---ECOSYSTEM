# 📖 DOCUMENTAÇÃO COMPLETA — Site

> Documentação técnica detalhada do módulo **Site**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. i18n PT/EN/ES/FR dia 1 · 2. SEO técnico nativo · 3. Mobile-first (LCP<2.5s) · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Arquitetura Técnica

```
[Browser multilíngue] ──> [Next.js App Router (SSR/SSG)]
   ├─ i18n middleware (geolocalização → locale)
   ├─ Páginas setoriais / catálogo / produto (SSG + ISR)
   ├─ Mostruário 3D (Three.js / R3F, modelos GLB)
   ├─ SmartSpec (UI) ──upload──> [API SmartSpec @ CRM com IA]
   ├─ Calculadora ROI (cliente) ──> geração de PDF
   └─ Wizard de Cotação ──webhook──> [CRM com IA]
[Uploads] ──pre-signed URL──> [AWS S3]
```

O Site é **stateless quanto à lógica de IA**: ele apenas chama as APIs do módulo [CRM com IA](../../CRM%20com%20IA/docs/README.md). A área logada vive no [Dashboard](../../Dashboard/docs/README.md).

## 2. Rotas (App Router, por locale)

```
/[locale]
├── /(home)
├── /solucoes/[setor]        # mineracao | ceramica | agro | metalmecanica
├── /catalogo
│   ├── /categoria/[slug]
│   └── /produto/[id]        # specs + 3D
├── /smartspec               # demo IA
├── /calculadora-roi
├── /estudos-de-caso
├── /solicitar-orcamento     # wizard
├── /contato
└── /legal/(privacidade|termos)
```
Locales: `pt` (default), `en`, `es`, `fr`. hreflang em todas as páginas.

## 3. Integrações (contratos a definir com o backend)

| Integração | Direção | Endpoint (a definir no CRM com IA) |
| :-- | :-- | :-- |
| SmartSpec | Site → CRM | `POST /api/smartspec/analyze` (multipart: arquivo + locale) |
| Cotação | Site → CRM | `POST /api/leads/quote` (dados + anexos S3) |
| Confirmação | CRM → cliente | e-mail/WhatsApp no idioma (assíncrono) |
| Portal | Site → Dashboard | redirect autenticado para `NEXT_PUBLIC_PORTAL_URL` |

> Os payloads/responses definitivos pertencem ao [CRM com IA](../../CRM%20com%20IA/docs/DOCUMENTACAO-COMPLETA.md). Este módulo apenas consome.

## 4. Dados e Modelos
O Site consome dados de catálogo/produto. Modelo de dados detalhado em [../database/README.md](../database/README.md). Conteúdo i18n pode ser estático (arquivos de mensagem) ou via CMS (a decidir).

## 5. SEO Técnico (implementação)
- `generateMetadata` por locale; `alternates.languages` para hreflang.
- `sitemap.ts` multilíngue; `robots.ts`.
- JSON-LD: `Organization` global, `Product` em produto, `FAQPage` onde houver FAQ.
- Imagens via `<Image>` (WebP/AVIF), metadados pesados para SEO de imagem.

## 6. Performance
- SSG/ISR para catálogo; lazy-load do Canvas 3D; GLB comprimido (Draco).
- Orçamento de bundle; `next/font`; CDN (Vercel/Cloudflare).

## 7. Segurança
- HTTPS/TLS 1.3; uploads só via pre-signed URL (sem chave no cliente).
- Rate limiting no proxy do SmartSpec; validação Zod de todo input.
- Consentimento LGPD/GDPR multilíngue.

## 8. Testes
- Vitest + RTL (componentes, estado Zustand, validação Zod).
- Playwright E2E: troca de idioma, wizard de cotação, fallback 3D.

## 9. Deploy e Rollback
- Vercel (preview por PR, produção em `main`).
- Rollback: redeploy do build anterior na Vercel; assets versionados.

## 10. Documentação para o Cliente Final
- Guia de uso da Calculadora ROI e do SmartSpec (como interpretar o resultado), no idioma do usuário.
