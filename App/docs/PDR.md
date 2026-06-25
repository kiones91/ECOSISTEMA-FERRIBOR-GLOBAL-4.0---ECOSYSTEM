# 📐 PDR — App PWA (Product Design Document)

> Design do produto do módulo **App (PWA)**. Base: [README.md](README.md) · [ECOSYSTEM](../../docs/ECOSYSTEM.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Mobile-first · 2. Offline real · 3. i18n PT/EN/ES/FR · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Visão do Produto
App instalável que leva o Portal do Cliente ao celular, com foco em uso em campo (minas, fábricas) onde a internet é instável ou ausente.

## 2. Problema que Resolve
- Operadores em campo precisam consultar fichas técnicas e status sem internet estável.
- Recompra e alertas precisam chegar como notificação push, não só e-mail.
- Identificar uma peça desgastada via foto acelera o reabastecimento.

## 3. Personas
| Persona | Perfil | Necessidade |
| :-- | :-- | :-- |
| **Operador de Campo** | Mina/fábrica, conectividade ruim | Catálogo/ficha offline, busca por imagem |
| **Comprador Mobile** | Recompra pelo celular | Push de recompra, 1-click, status |
| **Gestor ESG** | Acompanha coletas/créditos | Push de status ESG, dashboard |

## 4. Jornada do Usuário
```
Instala PWA (ícone) → Login → consulta catálogo/ficha (offline)
   → recebe push (recompra/status/ESG) → busca por imagem (câmera → IA)
   → recompra 1-click → sincroniza ao reconectar
```

## 5. Requisitos de UX/UI
- Instalação como app (manifest, ícones maskable).
- Indicador claro de estado offline/online e de sincronização pendente.
- Busca por imagem com feedback de progresso.
- Push acionável (deep link para pedido/coleta).
- Mobile-first, toques grandes, alto contraste para uso em campo.

## 6. Fluxos de Navegação
- Home → Catálogo offline → Ficha técnica.
- Push → detalhe (recompra/status/ESG).
- Câmera → busca por imagem → produto → recompra.

## 7. Acessibilidade (a11y — WCAG 2.1 AA)
- Alvos de toque ≥ 44px, contraste alto, suporte a leitor de tela, legendas de estado.

## 8. Design System
Reaproveita tokens do ecossistema (Tailwind + shadcn/ui), adaptados a mobile-first e uso em ambiente industrial.
