# 📖 DOCUMENTAÇÃO COMPLETA — Dashboard / Extranet

> Documentação técnica detalhada do módulo **Dashboard (Extranet B2B)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Segurança (2FA/AES-256/LGPD) · 2. i18n PT/EN/ES/FR · 3. Performance tempo real · 4. Integração com CRM · 5. Custo de IA controlado.

---

## 1. Arquitetura Técnica

```
[Site] ── "Acessar Portal" ──> [Dashboard Next.js logado]
   ├─ Auth (NextAuth/Auth0/Clerk) + 2FA
   ├─ Pedidos / Track & Trace ──SSE/WS──> [CRM com IA]
   ├─ Recompra (1-click + alerta preditivo) ──> [CRM com IA]
   ├─ FerriBor Credit (saldo/extrato/ranking) ──> [CRM com IA]
   ├─ FerriBor Circular (coleta/créditos ESG) ──> [CRM com IA]
   ├─ ESG (certificado PDF + selo) ──> [CRM com IA]
   ├─ Documentos (NF/laudos) ──> [S3 / CRM com IA]
   └─ Mensagens ──> [CRM com IA]
[App PWA] consome o mesmo domínio em mobile
```

O Dashboard é **frontend logado**: nenhuma regra de negócio/IA roda aqui — tudo vem das APIs do [CRM com IA](../../CRM%20com%20IA/docs/README.md). O [App (PWA)](../../App/docs/README.md) é a versão mobile do mesmo domínio.

## 2. Autenticação & Sessão
- Provedor: NextAuth.js / Auth0 / Clerk (a decidir).
- **2FA obrigatório** (TOTP ou e-mail/SMS).
- Sessão por cliente; expiração e refresh controlados; logout limpa estado sensível.
- Auditoria de acessos (quem acessou o quê e quando).

## 3. Track & Trace Industrial (tempo real)
- Etapas: `Em corte` → `Em vulcanização` → `Em controle de qualidade` → `Em expedição`.
- Transporte: WebSocket/SSE com fallback a polling.
- A fonte de eventos de produção é o backend (Track & Trace no [CRM com IA](../../CRM%20com%20IA/docs/README.md)).

## 4. Recompra
- 1-click a partir de pedido anterior.
- Alerta preditivo de desgaste: backend cruza histórico × vida útil e dispara; Dashboard exibe e permite ação.

## 5. FerriBor Credit
- Saldo, extrato, regras de acúmulo (compras, indicações, ESG), resgate (descontos/serviços), ranking/gamificação. Cálculo no backend.

## 6. FerriBor Circular & ESG
- Solicitar coleta (peso estimado ou foto) → backend calcula créditos ESG e gera ordem de coleta.
- Certificado de impacto ambiental em PDF (kg desviados, CO₂, padrão GRI/ISO 14001) com assinatura digital.
- Selo ESG visual + export para relatórios do cliente.

## 7. Integrações (contratos a definir no backend)
| Domínio | Endpoint (a definir no CRM com IA) |
| :-- | :-- |
| Pedidos / Track & Trace | `GET /api/orders`, `WS /api/orders/stream` |
| Recompra | `POST /api/orders/reorder` |
| Credit | `GET /api/credit`, `POST /api/credit/redeem` |
| Circular | `POST /api/circular/pickup` |
| ESG | `GET /api/esg/certificate` |
| Mensagens | `GET/POST /api/messages` |

## 8. Dados e Modelos
O Dashboard não é dono dos dados; consome o domínio do portal. Modelo em [../database/README.md](../database/README.md).

## 9. Segurança
- 2FA, AES-256 em dados sensíveis, HTTPS/TLS 1.3, RBAC por cliente, auditoria, LGPD/GDPR.

## 10. Testes
- Unit (componentes/estado), E2E (Playwright) para login+2FA, recompra, Track & Trace, coleta ESG.

## 11. Deploy e Rollback
- Vercel/host com suporte a SSR + WebSocket/SSE. Rollback por redeploy anterior.

## 12. Documentação para o Cliente Final
- Guia do Portal: como acompanhar pedidos, recomprar, usar créditos, solicitar coleta e baixar certificados — no idioma do cliente.
