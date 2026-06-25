# 📋 PRD — Dashboard / Extranet (Product Requirements Document)

> Requisitos do módulo **Dashboard (Extranet B2B)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Segurança (2FA/AES-256/LGPD) · 2. i18n PT/EN/ES/FR · 3. Performance tempo real · 4. Integração com CRM · 5. Custo de IA controlado.

---

## 1. Objetivo
Reter e expandir a carteira de clientes B2B com um portal logado que dá visibilidade total do relacionamento, automatiza recompra e engaja via créditos e ESG.

## 2. Escopo
**Dentro:** login/2FA, dashboard por cliente, histórico de pedidos, Track & Trace, recompra, FerriBor Credit, FerriBor Circular, dashboard/selo ESG, central de documentos, chat com CRM.
**Fora:** lógica de IA e regras de negócio dos backends (vivem no [CRM com IA](../../CRM%20com%20IA/docs/README.md)), site público ([Site](../../Site/docs/README.md)), app mobile ([App](../../App/docs/README.md)).

## 3. Requisitos Funcionais (MoSCoW)

### Must
- RF-01 Login seguro com 2FA; sessão por cliente.
- RF-02 Dashboard personalizado por cliente.
- RF-03 Histórico completo de pedidos.
- RF-04 Track & Trace em tempo real (Em corte → Vulcanização → QA → Expedição).
- RF-05 Recompra 1-click de pedidos anteriores.
- RF-06 Central de documentos (NFs, certificados, laudos).

### Should
- RF-07 Alertas preditivos de desgaste (recompra) — exibição e ação.
- RF-08 FerriBor Credit: saldo, extrato, resgate, ranking.
- RF-09 FerriBor Circular: solicitar coleta (peso/foto), acompanhar, ver créditos ESG.
- RF-10 Dashboard ESG + certificado PDF + selo.
- RF-11 Chat direto com engenharia/CRM no idioma do cliente.
- RF-12 i18n PT/EN/ES/FR.

### Could
- RF-13 Assinatura de contratos de fornecimento recorrente.
- RF-14 Gamificação avançada do ranking.

### Won't (neste módulo)
- RF-15 Processamento de IA, emissão fiscal, integração EDI (ficam no backend).

## 4. Requisitos Não Funcionais
- NFR-01 2FA, AES-256 em dados sensíveis, HTTPS/TLS 1.3.
- NFR-02 LGPD/GDPR, auditoria de acessos.
- NFR-03 Atualização de status em tempo real (WebSocket/SSE).
- NFR-04 a11y WCAG 2.1 AA.

## 5. Critérios de Aceitação (amostra)
- CA-01: login exige 2FA; sessão expira conforme política.
- CA-04: mudança de etapa de produção reflete na timeline do cliente em tempo real.
- CA-05: recompra 1-click gera pedido e atualiza o Track & Trace.
- CA-10: solicitar coleta calcula créditos ESG e gera certificado em PDF.

## 6. Dependências
- APIs de pedidos, produção, recompra, credit, circular, ESG, chat → [CRM com IA](../../CRM%20com%20IA/docs/README.md).
- Provedor de auth/2FA; storage de documentos (S3).

## 7. Riscos e Mitigação
| Risco | Mitigação |
| :-- | :-- |
| Vazamento de dados industriais | 2FA, AES-256, auditoria, least-privilege |
| Latência do tempo real | SSE/WebSocket + fallback polling |
| Inconsistência com backend | Fonte da verdade única no CRM; React Query revalidando |

## 8. Métricas de Sucesso (KPIs)
Taxa de recompra · adesão ao ESG/Circular · créditos resgatados · uso do chat · retenção de carteira · NPS.

## 9. Timeline
Camada 3 (Mês 7-9): Extranet, Track & Trace, Recompra, FerriBor Credit. Camada 4 (Mês 10-12): FerriBor Circular, Dashboard/Selo ESG.
