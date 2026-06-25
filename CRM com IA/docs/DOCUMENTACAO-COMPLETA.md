# 📖 DOCUMENTAÇÃO COMPLETA — CRM com IA

> Documentação técnica detalhada do módulo **CRM com IA (Backend/Core)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. SmartSpec preciso · 2. RAG alimentado · 3. Detecção de idioma · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Arquitetura Técnica

```
[Site] [Dashboard] [App] ──> [API Core (NestJS/FastAPI)]
   ├─ CRM Omnichannel
   │    ├─ WhatsApp (QR Code próprio) · E-mail (SES/SendGrid) · Chat
   │    ├─ Detecção de idioma (DeepL/Google) → resposta no idioma
   │    └─ Qualificação + roteamento (idioma+setor)
   ├─ Motor de IA (SmartSpec)
   │    [Upload] → [Aspose CAD→metadados] → [LLM GPT-4o/Claude]
   │             → [RAG: Vector DB c/ catálogo] → recomendação+ficha+cotação
   ├─ Backends de negócio
   │    Recompra · Track & Trace · FerriBor Credit · FerriBor Circular/ESG
   ├─ Dashboard de Leads (tempo real)
   └─ API/EDI (X12/EDIFACT/REST) ↔ ERPs de mineradoras
[Infra] PostgreSQL · Redis · Filas (BullMQ/RabbitMQ) · S3 · Vector DB
```

## 2. CRM Omnichannel (UI PT-BR) com Agentes de IA multilíngues
- **Canais:** WhatsApp via QR Code (sistema próprio — worker), e-mail, chat do site.
- **Detecção de idioma:** NLU na 1ª mensagem → define o idioma de toda a conversa.
- **Qualificação:** extrai tamanho da peça, volume, prazo.
- **Roteamento:** por idioma + setor para o comercial certo.
- **Histórico:** traduzido e organizado por lead.

## 3. Motor de IA — SmartSpec + RAG
- **Aspose.CAD:** converte DWG/STEP em metadados.
- **LLM multimodal:** extrai dimensões, tolerâncias, material, temperatura, aplicação.
- **RAG:** banco vetorial (Pinecone/Weaviate/Qdrant) com catálogo técnico FerriBor (rolos, vedações, niveladores, elastômeros) + embeddings text-embedding-3-large.
- **Output:** produto recomendado + ficha técnica + cotação estimada em < 10s.
- **Pipeline de ingestão:** processo para alimentar/reindexar o catálogo no RAG (crítico).

## 4. Backends de Carteira e ESG
- **Recompra:** monitora data da última compra × vida útil → alerta preditivo → gera pedido.
- **Track & Trace:** emite eventos de produção (corte/vulcanização/QA/expedição) para portais.
- **FerriBor Credit:** regras de acúmulo (compras/indicações/ESG), resgate, ranking.
- **FerriBor Circular:** calcula créditos ESG, gera ordem de coleta, emite certificado PDF (GRI/ISO 14001) com assinatura digital.

## 5. APIs expostas (contratos a consolidar)
| Consumidor | Domínio | Endpoint |
| :-- | :-- | :-- |
| Site | SmartSpec | `POST /api/smartspec/analyze` |
| Site | Cotação/Lead | `POST /api/leads/quote` |
| Dashboard/App | Pedidos/Track&Trace | `GET /api/orders`, `WS /api/orders/stream` |
| Dashboard/App | Recompra | `POST /api/orders/reorder` |
| Dashboard/App | Credit | `GET /api/credit`, `POST /api/credit/redeem` |
| Dashboard/App | Circular/ESG | `POST /api/circular/pickup`, `GET /api/esg/certificate` |
| App | Visão (busca por imagem) | `POST /api/vision/identify` |
| ERPs | API/EDI | X12 / EDIFACT / REST |

> Estado atual usa Supabase Edge Functions (`evolution-*`, `webchat-api`, `form-submit`, etc.). Consolidar com a API Core ao evoluir.

## 6. Dados e Modelos
Fonte da verdade do ecossistema. Modelo detalhado em [../database/README.md](../database/README.md).

## 7. Segurança
- AES-256 (repouso), TLS 1.3 (trânsito), gestão de secrets, RBAC.
- Rate limiting + quotas por token nas APIs de IA.
- LGPD/GDPR, auditoria, backup diário (retenção 30 dias), plano de DR.

## 8. Testes
- Unit + integração das edge functions/serviços; avaliação contínua do SmartSpec (precisão); testes de carga para escala.

## 9. Deploy e Rollback
- Supabase (functions/migrations) no estado atual; evoluir para containers (Docker/K8s) + CI/CD (GitHub Actions). Rollback por migration reversível + redeploy de função anterior.

## 10. Reconciliação (herança InforHealth/Buffallos)
- `admin/` e `docs/crm-admin/` vêm de outro cliente. Plano: extrair o que é reaproveitável (estrutura de inbox, integrações Meta/WhatsApp), remover o específico de saúde, renomear para o domínio FerriBor.
