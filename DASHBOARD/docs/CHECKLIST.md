# ✅ CHECKLIST — Dashboard / Extranet

> Execução do módulo **Dashboard (Extranet B2B)** por etapa. Base: [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Segurança (2FA/AES-256/LGPD) · 2. i18n PT/EN/ES/FR · 3. Performance tempo real · 4. Integração com CRM · 5. Custo de IA controlado.

---

## Fase 0 — Fundação (a criar do zero)
- [ ] Scaffold Next.js (App Router) + TypeScript
- [ ] Tailwind + shadcn/ui
- [ ] i18n PT/EN/ES/FR
- [ ] ESLint/Prettier + CI

## Fase 1 — Autenticação & Acesso (Camada 3)
- [ ] Login seguro (NextAuth/Auth0/Clerk)
- [ ] 2FA
- [ ] Sessão por cliente + políticas de expiração
- [ ] Auditoria de acessos
- [ ] Dashboard personalizado por cliente

## Fase 2 — Pedidos & Track & Trace (Camada 3)
- [ ] Histórico completo de pedidos
- [ ] Timeline de produção em tempo real (Em corte → Vulcanização → QA → Expedição)
- [ ] WebSocket/SSE + fallback polling
- [ ] Central de documentos (NFs, certificados, laudos)

## Fase 3 — Recompra & Credit (Camada 3)
- [ ] Recompra 1-click de pedidos anteriores
- [ ] Alertas preditivos de desgaste (exibição + ação)
- [ ] FerriBor Credit: saldo, extrato, resgate
- [ ] Ranking/gamificação

## Fase 4 — Circular & ESG (Camada 4)
- [ ] Solicitar coleta de usados (peso/foto)
- [ ] Acompanhar coleta + créditos ESG
- [ ] Dashboard ESG
- [ ] Certificado de impacto ambiental (PDF) + assinatura digital
- [ ] Selo ESG visual

## Fase 5 — Comunicação & Qualidade
- [ ] Chat direto com engenharia/CRM no idioma do cliente
- [ ] a11y WCAG 2.1 AA
- [ ] AES-256 em dados sensíveis + LGPD/GDPR
- [ ] Testes (unit + E2E de fluxos críticos)
