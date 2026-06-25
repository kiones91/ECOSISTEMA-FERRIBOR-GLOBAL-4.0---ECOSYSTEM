# 📐 PDR — Site (Product Design Document)

> Design do produto do módulo **Site** (frontend de aquisição). Base: [README.md](README.md) · [ECOSYSTEM](../../docs/ECOSYSTEM.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. i18n PT/EN/ES/FR dia 1 · 2. SEO técnico nativo · 3. Mobile-first (LCP<2.5s) · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Visão do Produto
Plataforma institucional multilíngue que posiciona a FerriBor como indústria de engenharia de ponta em elastômeros, captando leads B2B qualificados e servindo de porta de entrada para o Portal do Cliente.

## 2. Problema que Resolve
- Compradores industriais (mineração, cerâmica, agro, metalmecânica) não encontram fornecedores que entendam especificações técnicas online.
- Barreira de entendimento de desenhos mecânicos → mostruário 3D + SmartSpec reduzem fricção.
- Cotação tradicional é lenta → calculadora ROI e SmartSpec aceleram a decisão.

## 3. Personas
| Persona | Perfil | Necessidade |
| :-- | :-- | :-- |
| **Engenheiro de Manutenção** | Especifica peças, busca tolerâncias | Ficha técnica precisa, 3D, comparação ROI |
| **Comprador Industrial** | Decide por custo/prazo | Cotação rápida, payback, multilíngue |
| **Diretor/Decisor** | Aprova investimento | PDF de ROI para apresentar à diretoria |
| **Lead Internacional** | Chile/Peru/Argentina/Colômbia/Guiana | Conteúdo no idioma nativo (ES/FR) |

## 4. Jornada do Usuário
```
Busca orgânica (SEO técnico no idioma) → Landing setorial → Mostruário 3D / ficha técnica
   → SmartSpec (upload desenho) OU Calculadora ROI → Cotação → CRM
   → "Acessar Portal do Cliente" → Dashboard (Extranet)
```

## 5. Requisitos de UX/UI
- Switcher de idioma automático por geolocalização + manual.
- Arquitetura por **Soluções Setoriais**, não só produtos.
- Tabelas HTML de specs (indexáveis), nunca PDF.
- Visualizador 3D com hotspots técnicos, corte transversal, fallback 2D (WebGL ausente).
- Wizard de cotação multi-etapa com upload (PDF/DWG/STEP/imagem).
- Botão "Acessar seu Portal do Cliente" em destaque.

## 6. Fluxos de Navegação
- Home → Soluções Setoriais → Produto (3D+specs) → Cotação/SmartSpec.
- Home → SmartSpec → Resultado IA → Cotação.
- Home → Calculadora ROI → PDF.
- Header → Portal do Cliente → Dashboard.

## 7. Acessibilidade (a11y — WCAG 2.1 AA)
- Navegação por teclado no 3D (setas rotacionam, +/- zoom).
- Contraste ≥ 4.5:1, skip links, ARIA em acordeões/modais.

## 8. Design System
Tailwind + shadcn/ui, tokens de cor/tipografia/espaçamento, Framer Motion para micro-interações. Tema claro como base (vide commit de reestruturação da home).
