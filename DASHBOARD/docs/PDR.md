# 📐 PDR — Dashboard / Extranet (Product Design Document)

> Design do produto do módulo **Dashboard (Extranet B2B)**. Base: [README.md](README.md) · [ECOSYSTEM](../../docs/ECOSYSTEM.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Segurança (2FA/AES-256/LGPD) · 2. i18n PT/EN/ES/FR · 3. Performance tempo real · 4. Integração com CRM · 5. Custo de IA controlado.

---

## 1. Visão do Produto
Portal logado que blinda a carteira de clientes: dá visibilidade total do relacionamento (pedidos, produção, documentos), facilita recompra e engaja via créditos e ESG.

## 2. Problema que Resolve
- Cliente B2B não tem visibilidade do status de produção do seu pedido.
- Recompra é manual e dependente do comercial.
- Falta de canal direto e organizado com a engenharia.
- Cliente precisa de documentos (NFs, laudos, certificados ESG) num só lugar.

## 3. Personas
| Persona | Perfil | Necessidade |
| :-- | :-- | :-- |
| **Comprador Recorrente** | Recompra periódica | Histórico, recompra 1-click, alertas de desgaste |
| **Engenheiro do Cliente** | Acompanha specs/produção | Track & Trace, chat com engenharia, laudos |
| **Gestor de Sustentabilidade** | Reporta ESG | Coleta de usados, certificado ESG, selo |
| **Financeiro do Cliente** | Documentos fiscais | NFs, central de documentos |

## 4. Jornada do Usuário
```
Site → "Acessar Portal" → Login (2FA) → Dashboard
   ├─ Pedidos → Track & Trace (tempo real)
   ├─ Recompra (1-click / alerta preditivo)
   ├─ FerriBor Credit (saldo, ranking, resgate)
   ├─ FerriBor Circular (solicitar coleta → créditos ESG)
   ├─ ESG (certificado PDF + selo)
   ├─ Documentos (NFs, laudos)
   └─ Mensagens (chat com CRM/engenharia)
```

## 5. Requisitos de UX/UI
- Login seguro com 2FA; dashboard personalizado por cliente.
- Timeline visual do Track & Trace (Em corte → Vulcanização → QA → Expedição).
- Recompra em 1 clique a partir de pedidos anteriores.
- Cartões de créditos/ESG com gamificação (ranking).
- Chat integrado ao CRM no idioma do cliente.

## 6. Fluxos de Navegação
Pedidos↔Track&Trace · Recompra↔Pedido · Circular→Coleta→Crédito→ESG · Mensagens↔CRM.

## 7. Acessibilidade (a11y — WCAG 2.1 AA)
- Navegação por teclado, contraste ≥4.5:1, ARIA em tabelas/timelines/modais.

## 8. Design System
Tailwind + shadcn/ui, consistente com Site e App; tema do ecossistema FerriBor.
