# 📋 PRD — Site (Product Requirements Document)

> Requisitos do módulo **Site**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. i18n PT/EN/ES/FR dia 1 · 2. SEO técnico nativo · 3. Mobile-first (LCP<2.5s) · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Objetivo
Captar leads B2B qualificados nos 4 mercados (BR/Andinos/Guiana) via conteúdo técnico multilíngue, ferramentas de IA e mostruário 3D, encaminhando-os ao CRM e ao Portal do Cliente.

## 2. Escopo
**Dentro:** site institucional multilíngue, soluções setoriais, catálogo/fichas técnicas, mostruário 3D, SmartSpec (interface), Calculadora ROI, wizard de cotação, SEO técnico, link para Portal.
**Fora:** lógica de IA (vive no [CRM com IA](../../CRM%20com%20IA/docs/README.md)), área logada do cliente (vive no [Dashboard](../../Dashboard/docs/README.md)), app mobile (vive no [App](../../App/docs/README.md)).

## 3. Requisitos Funcionais (MoSCoW)

### Must
- RF-01 i18n PT/EN/ES/FR com switcher por geolocalização + manual.
- RF-02 Arquitetura por Soluções Setoriais (Mineração, Cerâmica, Agro, Metalmecânica).
- RF-03 Fichas técnicas em tabelas HTML indexáveis (sem PDF).
- RF-04 SEO técnico: hreflang, sitemap XML multilíngue, URLs `/es/ /en/ /fr/`, Schema Markup (Product/Organization/FAQPage).
- RF-05 Wizard de cotação multi-etapa com upload (PDF/DWG/STEP/JPG/PNG) → CRM.
- RF-06 Botão "Acessar seu Portal do Cliente" em destaque → Dashboard.

### Should
- RF-07 Mostruário/Biblioteca 3D (Three.js) com hotspots, corte transversal, fallback 2D.
- RF-08 SmartSpec (interface): upload, barra de progresso, exibição de recomendação+ficha+cotação estimada (lógica no backend).
- RF-09 Calculadora ROI/OEE com geração de PDF.

### Could
- RF-10 Biblioteca de Estudos de Caso Técnicos.
- RF-11 Export de modelos 3D (STEP/IGES) para clientes.

### Won't (neste módulo)
- RF-12 Processamento CAD/LLM, RAG, autenticação de cliente, push notifications.

## 4. Requisitos Não Funcionais
- NFR-01 Core Web Vitals: LCP<2.5s, FID<100ms, CLS<0.1.
- NFR-02 HTTPS/TLS 1.3; uploads via pre-signed URL; rate limiting no endpoint SmartSpec.
- NFR-03 LGPD/GDPR (consentimento, política de privacidade multilíngue).
- NFR-04 a11y WCAG 2.1 AA.
- NFR-05 SSR/SSG para indexação integral.

## 5. Critérios de Aceitação (amostra)
- CA-01: trocar idioma reflete URL, conteúdo, hreflang e metadados.
- CA-04: submissão de cotação cria lead no CRM e confirma por e-mail/WhatsApp no idioma do cliente.
- CA-07: SmartSpec exibe progresso e resultado retornado pela API; falha de rede mostra erro amigável.
- CA-09: 3D cai para galeria 2D quando WebGL ausente.

## 6. Dependências
- API SmartSpec e CRM → [CRM com IA](../../CRM%20com%20IA/docs/README.md).
- Auth/Portal → [Dashboard](../../Dashboard/docs/README.md).
- S3 (uploads), API de geolocalização/idioma.

## 7. Riscos e Mitigação
| Risco | Mitigação |
| :-- | :-- |
| Custo de tokens no SmartSpec público | Rate limit, cache, quota por sessão |
| Peso do 3D vs. LCP | Lazy-load, GLB comprimido, fallback 2D |
| SEO multilíngue mal configurado | hreflang + sitemap validados em CI |

## 8. Métricas de Sucesso (KPIs)
Leads por país/idioma/setor · taxa de conversão por canal · origem (SEO orgânico) · nº de análises SmartSpec/dia · Core Web Vitals.

## 9. Timeline
Camada 1 (Mês 1-3): site multilíngue + SEO + cotação. Camada 2 (Mês 4-6): SmartSpec demo + Calculadora ROI + 3D.
