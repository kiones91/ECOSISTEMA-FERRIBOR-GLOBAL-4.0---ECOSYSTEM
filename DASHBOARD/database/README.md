# 🗄️ DATABASE — Dashboard / Extranet

> Recorte de dados do módulo **Dashboard (Extranet B2B)**. No servidor SQL de produção pode haver um único banco compartilhado; aqui versionamos apenas o domínio do Portal do Cliente. Base: [DOCUMENTACAO-COMPLETA.md](../docs/DOCUMENTACAO-COMPLETA.md)

## 🎯 Prioridades (topo)
1. Segurança (2FA/AES-256/LGPD) · 2. i18n PT/EN/ES/FR · 3. Performance tempo real · 4. Integração com CRM · 5. Custo de IA controlado.

---

## 1. Papel do Dashboard quanto a dados
O Dashboard é a **face logada** do cliente sobre os backends do [CRM com IA](../../CRM%20com%20IA/database/README.md), que é a fonte da verdade. Aqui documentamos o domínio que o portal lê/escreve; o schema canônico de cada entidade vive no CRM. O [App (PWA)](../../App/database/README.md) consome o mesmo domínio em mobile.

## 2. Entidades do domínio do Portal
| Entidade | Descrição | Dono canônico |
| :-- | :-- | :-- |
| `cliente` | Conta do cliente B2B logado | CRM com IA |
| `usuario_cliente` | Usuários + credenciais 2FA por cliente | CRM com IA |
| `pedido` | Pedidos do cliente | CRM com IA |
| `pedido_status` | Etapas Track & Trace (corte/vulcanização/QA/expedição) | CRM com IA |
| `recompra_alerta` | Alertas preditivos de desgaste | CRM com IA |
| `credito_conta` | Saldo/extrato FerriBor Credit | CRM com IA |
| `credito_ranking` | Ranking/gamificação | CRM com IA |
| `circular_coleta` | Solicitações de coleta de usados | CRM com IA |
| `esg_certificado` | Certificados de impacto ambiental (PDF) | CRM com IA |
| `documento` | NFs, certificados, laudos (refs S3) | CRM com IA / S3 |
| `mensagem` | Chat cliente ↔ engenharia/CRM | CRM com IA |
| `acesso_auditoria` | Log de acessos (LGPD) | CRM com IA |

## 3. Segurança de dados
- Credenciais e 2FA nunca expostas ao frontend; tokens de sessão seguros.
- Dados sensíveis em AES-256 (repouso) e TLS 1.3 (trânsito).
- `acesso_auditoria` registra leitura/escrita para compliance LGPD/GDPR.

## 4. Pastas
- `schema/` — views/contratos de leitura específicos do portal (se houver materializações locais).
- `seeds/` — clientes/pedidos fictícios para desenvolvimento e testes E2E.

## 5. Pendências
- [ ] Definir provedor de auth/2FA e onde residem as credenciais.
- [ ] Definir contratos de API (payloads/responses) com o CRM para cada entidade.
- [ ] Definir política de retenção/auditoria conforme LGPD.
