# 📚 Brief de Reconstrução do Portal Ferribor
**Objetivo:** Criar, do zero, um site institucional‑e‑e‑commerce para a Ferribor (artefatos de borracha) que ofereça **UI/UX de alto nível**, experiência **3D interativa**, fluxo de **orçamento customizado** e suporte a **upload de arquivos**.  

Abaixo está o *roadmap completo* dividido em seções (dobras) e, ao final, um **prompt pronto** que pode ser enviado a outra IA (ex.: ChatGPT, Midjourney, Stable Diffusion, Copilot) para gerar código, assets ou wireframes.

---

## 1️⃣ Estrutura de Informação (IA) – Sitemapa

```
/
│
├─ home                     – hero 3D, slide de produtos, CTA geral
├─ about                    – história, valores, certificações, CNPJ
├─ catalog                  – lista filtrável de produtos
│   ├─ category/:slug       – grade de cards (filtros: material, aplicação, faixa de preço)
│   └─ product/:id          – página 3D “Autocard” + detalhes técnicos + CTA orçamento
├─ services                 – soluções customizadas, parcerias, cases
├─ request‑quote            – formulário avançado + upload de arquivos
├─ blog                     – notícias, artigos técnicos, SEO
├─ contact                  – mapa, telefone, WhatsApp, chat
└─ legal
    ├─ privacy
    └─ terms
```

---

## 2️⃣ Tecnologias Front‑End (por dobra)

| Dobra / Área                     | Tecnologias recomendadas | Por quê? |
|----------------------------------|--------------------------|----------|
| **Core**                         | **React 18 + Vite** (ou **Next.js** se precisar de SSR) | Build ultra‑rápido, componentes reutilizáveis, hot‑module replacement. |
| **UI Library**                   | **TailwindCSS** + **Headless UI** (ou **Radix UI**) | Design system com utilitários, responsividade e controle total do CSS. |
| **Componentes 3D**               | **Three.js** + **react‑three‑fiber** + **drei** | Renderização WebGL declarativa, fácil integração com React. |
| **Modelos 3D**                   | Formatos **glTF / GLB** (compactos, streaming) | Carregamento rápido, PBR material ready‑to‑use. |
| **Animações**                    | **Framer Motion** (para UI) + **GSAP** (para cenas 3D) | Transições fluidas, controle de timeline. |
| **State mgmt**                   | **Zustand** (leve) ou **Redux Toolkit** (se precisar de cache de API) | Gerenciar estado do produto selecionado, filtros, carrinho de orçamento. |
| **Data fetching**                | **React Query / TanStack Query** | Cache, re‑validação automática, loading & error states. |
| **Formulários avançados**        | **React Hook Form** + **Zod** (validação) | Performance e validação tipada. |
| **Upload de arquivos**           | **uppy.io** (UI + resumable uploads) + **S3 pre‑signed URLs** | Drag‑and‑drop, progress bar, suporte a PDF/MP4/JPG. |
| **CMS / Conteúdo**               | **Sanity.io** (headless) ou **Strapi** (self‑hosted) | Gerenciamento de catálogos, blog e assets. |
| **SEO**                          | **Next‑SEO** (se Next) ou **React Helmet** + **JSON‑LD** | Meta tags, Open Graph, Breadcrumbs, rich snippets. |
| **Acessibilidade**               | **eslint-plugin-jsx-a11y**, **axe-core** (testes) | WCAG AA compliance. |
| **Testing**                      | **Vitest** + **React Testing Library** (unit) <br> **Playwright** (e2e) | Garantia de qualidade. |
| **CI/CD**                        | **GitHub Actions** → Deploy em **Vercel** ou **Cloudflare Pages** | Deploy automático a cada PR. |
| **Analytics**                    | **Google Tag Manager**, **Hotjar** (heatmaps) + **Fathom** (privacy‑first) | Métricas de UX. |
| **Infra**                        | **Edge Functions** (Vercel/Cloudflare) para redirecionamentos 301 | 0 ms latency. |

---

## 3️⃣ Experiência 3D “Autocard”

1. **Visor** – `<Canvas>` full‑screen com `OrbitControls` (zoom, rotação limitada).  
2. **Card Carousel** – `react‑slick` ou **Swiper** embutido em cena: mini‑cards circulares que giram ao redor do objeto.  
3. **Hotspots** – pequenos pontos interativos (`<mesh>` invisível) que, ao *hover*/*click*, disparam um **tooltip** minimalista (ex.: “Material: PEAD”).  
4. **Animação de Transição** – ao mudar de produto, o modelo anterior dissolve (`shader dissolve`) e o novo aparece com *fade‑in* e *scale‑up*.  
5. **Fallback** – caso WebGL falhe, mostrar uma galeria de imagens de alta‑resolução (lazy‑loaded).  

*Bibliotecas úteis*: `@react-three/drei` → `<Html>` para tooltip, `<Text>` para anotações, `<useGLTF>` para carregamento otimizado.

---

## 4️⃣ Layout Responsivo (by “dobras”)

| Dobra                     | Breakpoints | Estratégia visual |
|---------------------------|-------------|-------------------|
| **Hero 3D**               | xs‑xl       | Full‑bleed canvas + call‑to‑action central; overlay de texto com `backdrop‑blur`. |
| **Carousel de Cards**    | sm‑xl       | 1 card (mobile), 3‑4 cards (tablet), 5‑6 cards (desktop) usando `swiper` com `slidesPerView`. |
| **Catálogo**              | sm‑xl       | Grid de cards *Masonry*; filtros sticky no topo; barra lateral colapsável em mobile. |
| **Página Produto**        | xs‑xl       | Dividido em duas colunas: esquerda – 3D viewer; direita – specs + CTA; em mobile, viewer no topo, specs abaixo. |
| **Formulário Orçamento**  | xs‑xl       | Layout em “wizard” de 3 passos (dados do cliente → especificação do produto → upload + revisão). |
| **Footer**                | xs‑xl       | 4 colunas em desktop, 2‑colunas em tablet, 1‑coluna em mobile; inclui QR‑code para WhatsApp. |

---

## 5️⃣ Detalhamento da Página de Produto

| Seção | Conteúdo | Interatividade |
|-------|----------|----------------|
| **Header** | Nome do produto, breadcrumbs, share buttons | Clique para copiar link direto. |
| **3D Viewer** | Canvas + hotspots | Hover → tooltip; click → modal com ficha técnica completa. |
| **Specs Table** | Material, dimensões, tolerância, código interno, peso, norma ABNT, etc. | Accordion para categorias de informação. |
| **CTA “Solicitar Orçamento”** | Botão fixo sticky (desktop) ou flotante (mobile) | Abre modal “quick‑quote”. |
| **Documentação** | Links para PDFs (catálogo, certificação) | Download direto / visualização em PDF.js. |
| **Related Products** | Slider horizontal de peças similares | Clique → nova página produto. |

---

## 6️⃣ Formulário de Orçamento + Upload

| Campo | Tipo | Validação | Observação |
|-------|------|-----------|------------|
| Nome completo | texto | required, min 2 | — |
| E‑mail | email | required, formato | — |
| Telefone | tel | required, mask ( (99) 99999‑9999 ) | — |
| Empresa | texto | optional | — |
| Produto (select) | dropdown (API) | required | pré‑carregado com catálogos. |
| Quantidade | número | min 1 | — |
| Unidade de medida | select (unidades, peças, kg) | required | — |
| Prazo desejado | date picker | optional | — |
| Tamanho / Dimensões | texto livre + máscara | optional | — |
| Material preferencial | multi‑select | optional | — |
| Descrição detalhada | textarea (rich‑text) | optional | Max 2000 chars. |
| Upload de arquivos | uppy drag‑drop | aceita .pdf, .jpg, .jpeg, .png, .mp4 (max 50 MB) | Armazenamento em S3 via pre‑signed URL. |
| Termos & Política | checkbox | required | Link para `/legal/privacy`. |
| **Submit** | botão | disabled until required fields valid | Loading spinner + toast “Orçamento enviado”. |

*Após envio*: disparar **Webhook** → Slack + e‑mail + criação de registro no CRM (HubSpot ou Zoho).

---

## 7️⃣ SEO & Performance

1. **SSR/SSG** (Next.js) para pages de catálogo e produto → HTML pronto para crawlers.  
2. **Images** – `next/image` (ou `vite-imagetools`) → otimização WebP, lazy‑load, `srcset`.  
3. **Pre‑connect** a `fonts.googleapis.com`, `cdn.jsdelivr.net`.  
4. **Fontes** – variable font (e.g., `Inter var`) carregada via `font-display: swap`.  
5. **Cache** – Service Worker (Workbox) para assets estáticos + `stale‑while‑revalidate`.  
6. **Lighthouse target** – > 90 em Performance, Accessibility, SEO.  

---

## 8️⃣ Acessibilidade (a11y)

- **ARIA roles** em todos os botões e carrosséis.  
- **Keyboard navigation** para o 3D viewer (setas → rotação, `+/-` → zoom).  
- **Contraste** ≥ 4.5:1, testes com `axe-core`.  
- **Text alternatives** para imagens 3D (descrição curta).  
- **Captions** em vídeos de demonstrativo.  

---

## 9️⃣ Checklist de Entrega (para a equipe)

```
[ ] Definir Design System (tokens, tipografia, cores) – Figma.
[ ] Modelar os 10‑15 produtos-chave em CAD → exportar glTF.
[ ] Configurar Headless CMS (schema: product, category, spec, media).
[ ] Implementar layout base (Header, Footer, Grid System) – Tailwind.
[ ] Criar Home com Hero 3D + Carousel de destaque.
[ ] Desenvolver página Catalog + filtros avançados.
[ ] Construir Autocard com Three.js + hotspots + tooltip.
[ ] Implementar página Product (spec table, CTA, related).
[ ] Formulário Request Quote + upload (Uppy + S3).
[ ] SEO: meta tags, JSON‑LD Organization + BreadcrumbList.
[ ] Testes unitários (Vitest) + e2e (Playwright) para fluxo de orçamento.
[ ] Accessibility audit (axe) e correções.
[ ] CI/CD pipeline (GitHub Actions → Vercel) + preview deploys.
[ ] Documentação de hand‑off (README, Storybook, Figma link).
[ ] Go‑Live checklist: DNS, SSL, redirects 301, sitemap.xml, robots.txt.
```

---

## 🔮 Prompt pronto para outra IA (Gerar código/ Wireframes)

```
You are a senior front‑end architect. Create a complete project plan and starter code for a high‑end product showcase website for Ferribor (industrial rubber components). The site must be built with React (or Next.js) + Vite, styled with TailwindCSS, and include:

1. A full‑screen Three.js canvas (react‑three‑fiber) that loads glTF models of products.
2. Interactive hotspots on the 3D model that show tool‑tips with material, dimensions, thread size, etc.
3. A carousel of product cards (Swiper) that synchronizes with the 3D viewer.
4. A product detail page with:
   - 3D viewer
   - Accordion spec table
   - CTA “Request Quote” opening a multi‑step form.
5. Request‑Quote form built with React Hook Form + Zod, supporting file uploads (PDF/MP4/JPG) via uppy.io and storing to AWS S3 (presigned URLs).
6. State management using Zustand and data fetching with TanStack Query.
7. SEO setup with Next‑SEO (or React Helmet), JSON‑LD Organization schema, Open Graph tags.
8. Accessibility: ARIA roles, keyboard navigation for the 3D viewer, contrast checks.
9. CI/CD pipeline using GitHub Actions deploying to Vercel (or Cloudflare Pages) with preview environments.
10. Testing skeleton with Vitest + React Testing Library and Playwright e2e.

Provide:
- Folder structure (tree).
- Sample code snippets for the critical parts (3D viewer with hotspots, product carousel, request‑quote form with upload).
- Tailwind config with custom colors and fonts.
- A short Figma‑style design brief (colors, typography, spacing) for the UI designer.
- The complete checklist (as markdown) for the development team.

Output everything in markdown files with proper code fences (include file paths). Do not include any explanation outside the markdown blocks.