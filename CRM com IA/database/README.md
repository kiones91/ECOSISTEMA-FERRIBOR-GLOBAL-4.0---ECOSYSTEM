# 🗄️ DATABASE — CRM com IA (Fonte da Verdade)

> Recorte de dados do módulo **CRM com IA (Backend/Core)**. Este é o **dono canônico** da maior parte dos dados do ecossistema. No servidor SQL pode haver um único banco compartilhado; aqui versionamos o domínio central. Base: [DOCUMENTACAO-COMPLETA.md](../docs/DOCUMENTACAO-COMPLETA.md)

## 🎯 Prioridades (topo)
1. SmartSpec preciso · 2. RAG alimentado · 3. Detecção de idioma · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Papel do CRM quanto a dados
O CRM com IA é a **fonte da verdade**: [Site](../../Site/database/README.md), [Dashboard](../../Dashboard/database/README.md) e [App](../../App/database/README.md) consomem e referenciam estas tabelas. Estado atual usa **PostgreSQL via Supabase** (migrations em `supabase/migrations`). Além do relacional, há o **banco vetorial (RAG)** para o catálogo técnico.

## 2. Domínios e Entidades

### CRM / Atendimento
| Entidade | Descrição |
| :-- | :-- |
| `lead` | Lead capturado (país, idioma detectado, setor, origem) |
| `conversa` | Thread omnichannel (WhatsApp/e-mail/chat) |
| `mensagem` | Mensagens + idioma + tradução |
| `qualificacao` | Tamanho da peça, volume, prazo |
| `roteamento` | Atribuição ao comercial (idioma+setor) |
| `cotacao` | Submissão do formulário inteligente + anexos S3 |

### Motor de IA
| Entidade | Descrição |
| :-- | :-- |
| `smartspec_analise` | Upload, metadados extraídos (Aspose+LLM), resultado |
| `catalogo_produto` | Catálogo técnico FerriBor (relacional) |
| `rag_embedding` | Vetores do catálogo (banco vetorial) |

### Carteira / ESG
| Entidade | Descrição |
| :-- | :-- |
| `cliente` / `usuario_cliente` | Conta B2B + credenciais/2FA |
| `pedido` / `pedido_status` | Pedidos + etapas Track & Trace |
| `recompra_alerta` | Alertas preditivos de desgaste |
| `credito_*` | FerriBor Credit (saldo, extrato, ranking) |
| `circular_coleta` | Logística reversa (coleta de usados) |
| `esg_certificado` | Certificados de impacto (PDF) |
| `documento` | NFs, laudos, certificados (refs S3) |
| `acesso_auditoria` | Log de acessos (LGPD) |

## 3. Banco Vetorial (RAG)
- Pinecone / Weaviate / Qdrant (a decidir).
- Embeddings: text-embedding-3-large.
- **Pipeline de ingestão** alimenta/reindexa todo o catálogo técnico — requisito crítico do briefing.

## 4. Estado atual (Supabase)
- Migrations: `CRM com IA/supabase/migrations`.
- Edge functions com lógica de dados: `evolution-*`, `webchat-api`, `form-submit`, `process-knowledge-source`.
- ⚠️ Schema atual herdado de InforHealth — reconciliar para o domínio FerriBor.

## 5. Pastas
- `schema/` — DDL/migrations canônicas do FerriBor (relacional) + definição do índice vetorial.
- `seeds/` — catálogo de exemplo, leads/pedidos fictícios para desenvolvimento.

## 6. Segurança
- AES-256 (repouso), TLS 1.3 (trânsito), RBAC, auditoria, LGPD/GDPR.
- Backup diário (retenção 30 dias) + plano de DR.

## 7. Pendências
- [ ] Reconciliar schema Supabase (InforHealth → FerriBor).
- [ ] Escolher banco vetorial e definir pipeline de ingestão do catálogo.
- [ ] Consolidar migrations canônicas em `schema/`.
- [ ] Definir contratos de dados com Site/Dashboard/App.
