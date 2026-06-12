# Checklist de reconstrução FerriBor

Baseado em [README-UXUI-REBUILD.md](README-UXUI-REBUILD.md).

## Concluído

- [x] Estrutura inicial do projeto criada em `Site/`.
- [x] Migração da base para `Next.js` com `src/app`.
- [x] Layout global estruturado com `Header`, `Footer` e skip link.
- [x] Rotas principais criadas:
  - [x] `/`
  - [x] `/about`
  - [x] `/catalog`
  - [x] `/catalog/category/[slug]`
  - [x] `/catalog/product/[id]`
  - [x] `/services`
  - [x] `/request-quote`
  - [x] `/blog`
  - [x] `/contact`
  - [x] `/legal/privacy`
  - [x] `/legal/terms`
- [x] Home com atalhos estruturais para as rotas principais.
- [x] Página de produto com blocos para breadcrumbs, viewer, specs, CTA, documentação e relacionados.
- [x] Página de orçamento com wizard e área separada para upload.
- [x] Estrutura de catálogo criada com rota principal, rota de categoria e rota de produto.
- [x] Campos estruturais do formulário de orçamento desenhados.
- [x] Área de upload de arquivos separada e visível na interface.
- [x] Componentes-base criados para hero, carrossel, catálogo, produto e orçamento.
- [x] Dependências instaladas para o projeto compilar.
- [x] Build do projeto validado com sucesso.

## Ainda por implementar

- [ ] Design System completo.
  - [ ] Tokens de cor.
  - [ ] Tipografia.
  - [ ] Espaçamentos.
  - [ ] Botões, cards, inputs e estados.
- [ ] CSS final da interface.
  - [ ] Grid responsivo.
  - [ ] Header e footer visuais.
  - [ ] Hero visual.
  - [ ] Estilo dos blocos de catálogo e produto.
- [ ] Conteúdo real das páginas.# Checklist de reconstrução FerriBor

Baseado em [README-UXUI-REBUILD.md](README-UXUI-REBUILD.md).

## Concluído

- [x] Estrutura inicial do projeto criada em `Site/`.
- [x] Migração da base para `Next.js` com `src/app`.
- [x] Layout global estruturado com `Header`, `Footer` e skip link.
- [x] Rotas principais criadas:
  - [x] `/`
  - [x] `/about`
  - [x] `/catalog`
  - [x] `/catalog/category/[slug]`
  - [x] `/catalog/product/[id]`
  - [x] `/services`
  - [x] `/request-quote`
  - [x] `/blog`
  - [x] `/contact`
  - [x] `/legal/privacy`
  - [x] `/legal/terms`
- [x] Home com atalhos estruturais para as rotas principais.
- [x] Página de produto com blocos para breadcrumbs, viewer, specs, CTA, documentação e relacionados.
- [x] Página de orçamento com wizard e área separada para upload.
- [x] Estrutura de catálogo criada com rota principal, rota de categoria e rota de produto.
- [x] Campos estruturais do formulário de orçamento desenhados.
- [x] Área de upload de arquivos separada e visível na interface.
- [x] Componentes‑base criados para hero, carrossel, catálogo, produto e orçamento.
- [x] Dependências instaladas para o projeto compilar.
- [x] Build do projeto validado com sucesso.
- [x] **Design System** iniciado:
  - [x] Tokens de cor definidos (primary, secondary, neutral, success, error).
  - [x] Tipografia (Inter Variable) mapeada.
  - [x] Espaçamentos (base = 4 px) configurados.
- [x] **Tailwind** configurado para consumir os tokens (`src/tailwind.config.ts`).
- [x] Componentes UI críticos criados:
  - [x] `PrimaryButton`
  - [x] `ProductCard`
  - [x] `TextInput` (com integração a React Hook Form)
- [x] Página de **Catálogo** já utiliza o novo `ProductCard` estilizado e está funcional.
- [x] Projeto compila sem erros e o servidor de desenvolvimento roda.

## Ainda por implementar

- [ ] Design System completo.
  - [ ] Tokens de cor (refinar paleta completa).
  - [ ] Tipografia (definir pesos extras, fallback fonts).
  - [ ] Espaçamentos (definir scale completa – 0‑12).
  - [ ] Botões, cards, inputs e estados avançados (hover, focus, disabled, loading).
- [ ] CSS final da interface.
  - [ ] Grid responsivo detalhado.
  - [ ] Header e footer visuais (menus dropdown, animações).
  - [ ] Hero visual (background 3D + overlay tipográfico).
  - [ ] Estilo dos blocos de catálogo e produto.
- [ ] Conteúdo real das páginas.
  - [ ] Textos institucionais.
  - [ ] Conteúdo de serviços.
  - [ ] Conteúdo legal.
  - [ ] Conteúdo do blog.
- [ ] Mídias e arquivos reais.
  - [ ] Logos finais.
  - [ ] Imagens de catálogo.
  - [ ] Arquivos 3D `.glb`.
- [ ] Implementação 3D de fato.
  - [ ] Canvas com `Three.js` / `react-three-fiber`.
  - [ ] Hotspots interativos.
  - [ ] Fallback para navegação sem WebGL.
- [ ] Catálogo funcional.
  - [ ] Dados reais de produtos (CMS).
  - [ ] Filtros reais (material, aplicação, faixa de preço).
  - [ ] Grid de produtos com dados.
  - [ ] Categorias e paginação.
- [ ] Página de produto funcional.
  - [ ] Ficha técnica real.
  - [ ] Accordion de specs.
  - [ ] CTA para orçamento com ação real.
  - [ ] Produtos relacionados.
- [ ] Formulário de orçamento real.
  - [ ] Validação com Zod.
  - [ ] Integração com React Hook Form.
  - [ ] Fluxo multi‑step real.
- [ ] Upload de arquivos.
  - [ ] Validação de tipos e tamanho.
  - [ ] Integração com armazenamento externo (S3 pre‑signed URLs).
- [ ] Integração com CMS.
  - [ ] Estrutura de `product`.
  - [ ] Estrutura de `category`.
  - [ ] Estrutura de `spec`.
  - [ ] Estrutura de `media`.
- [ ] SEO e performance.
  - [ ] Metadados completos.
  - [ ] JSON‑LD.
  - [ ] Sitemap.
  - [ ] Robots.
- [ ] Acessibilidade.
  - [ ] ARIA nos componentes interativos.
  - [ ] Navegação por teclado.
  - [ ] Auditoria com `axe-core`.
- [ ] Testes.
  - [ ] Unitários com Vitest.
  - [ ] Componentes com React Testing Library.
  - [ ] E2E com Playwright.
- [ ] CI/CD.
  - [ ] Pipeline de validação.
  - [ ] Deploy automatizado.
  - [ ] Preview deploys.
- [ ] Observabilidade e analytics.
  - [ ] Tag Manager.
  - [ ] Hotjar ou equivalente.
  - [ ] Métricas de UX.
```

---

## Como visualizar o site em desenvolvimento

### 1️⃣ Servidor local (dev)

1. **Abra o terminal na raiz do projeto** (`Site/` ou onde está o `package.json`).  
2. Instale as dependências caso ainda não tenha feito (uma única vez):

```bash
npm ci   # ou yarn install / pnpm i
```

3. Inicie o modo desenvolvimento:

```bash
npm run dev   # (Next.js) → normalmente abre http://localhost:3000
  - [ ] Textos institucionais.
  - [ ] Conteúdo de serviços.
  - [ ] Conteúdo legal.
  - [ ] Conteúdo do blog.
- [ ] Mídias e arquivos reais.
  - [ ] Logos finais.
  - [ ] Imagens de catálogo.
  - [ ] Arquivos 3D `.glb`.
- [ ] Implementação 3D de fato.
  - [ ] Canvas com `Three.js` / `react-three-fiber`.
  - [ ] Hotspots interativos.
  - [ ] Fallback para navegação sem WebGL.
- [ ] Catálogo funcional.
  - [ ] Dados reais de produtos.
  - [ ] Filtros reais.
  - [ ] Grid de produtos com dados.
  - [ ] Categorias e paginação.
- [ ] Página de produto funcional.
  - [ ] Ficha técnica real.
  - [ ] Accordion de specs.
  - [ ] CTA para orçamento com ação real.
  - [ ] Produtos relacionados.
- [ ] Formulário de orçamento real.
  - [x] Campos conforme o brief desenhados na estrutura.
  - [ ] Validação com Zod.
  - [ ] Integração com React Hook Form.
  - [ ] Fluxo multi-step real.
- [ ] Upload de arquivos.
  - [x] Área de drag and drop reservada.
  - [ ] Validação de tipos e tamanho.
  - [ ] Integração com armazenamento externo.
- [ ] Integração com CMS.
  - [ ] Estrutura de `product`.
  - [ ] Estrutura de `category`.
  - [ ] Estrutura de `spec`.
  - [ ] Estrutura de `media`.
- [ ] SEO e performance.
  - [ ] Metadados completos.
  - [ ] JSON-LD.
  - [ ] Sitemap.
  - [ ] Robots.
- [ ] Acessibilidade.
  - [ ] ARIA nos componentes interativos.
  - [ ] Navegação por teclado.
  - [ ] Auditoria com `axe-core`.
- [ ] Testes.
  - [ ] Unitários com Vitest.
  - [ ] Componentes com React Testing Library.
  - [ ] E2E com Playwright.
- [ ] CI/CD.
  - [ ] Pipeline de validação.
  - [ ] Deploy automatizado.
  - [ ] Preview deploys.
- [ ] Observabilidade e analytics.
  - [ ] Tag Manager.
  - [ ] Hotjar ou equivalente.
  - [ ] Métricas de UX.
