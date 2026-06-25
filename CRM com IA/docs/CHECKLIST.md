# ✅ CHECKLIST — CRM com IA

> Execução do módulo **CRM com IA (Backend/Core)** por etapa. Base: [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. SmartSpec preciso · 2. RAG alimentado · 3. Detecção de idioma · 4. Segurança · 5. Custo de IA controlado.

---

## Fase 0 — Fundação & Reconciliação
- [x] Estrutura existente (admin + supabase + worker)
- [ ] Reconciliar/limpar docs herdados (InforHealth/Buffallos) para contexto FerriBor
- [ ] Consolidar variáveis de ambiente e gestão de secrets
- [ ] Definir API principal (NestJS ou FastAPI) e padronizar

## Fase 1 — CRM Omnichannel + Agentes de IA multilíngues (Camada 1)
- [ ] WhatsApp via QR Code (sistema próprio)
- [ ] E-mail (SendGrid/SES) + chat do site
- [ ] Detecção automática de idioma (NLU) na 1ª mensagem
- [ ] Resposta automática no idioma nativo
- [ ] Qualificação automática de leads (tamanho/volume/prazo)
- [ ] Roteamento inteligente (idioma + setor)
- [ ] Histórico traduzido e organizado
- [ ] Gestão de fuso horário (agendamento)

## Fase 2 — Cotação & Dashboard de Leads (Camada 1)
- [ ] Formulário inteligente: extração de metadados
- [ ] Priorização da fila de engenharia
- [ ] Confirmação automática (WhatsApp/e-mail) no idioma
- [ ] Dashboard de leads em tempo real (país/idioma/setor/conversão)

## Fase 3 — Motor de IA SmartSpec + RAG (Camada 2)
- [ ] Middleware CAD (Aspose): DWG/STEP → metadados
- [ ] LLM multimodal (GPT-4o/Claude): dimensões, tolerâncias, material
- [ ] Banco vetorial (Pinecone/Weaviate/Qdrant) + embeddings
- [ ] Pipeline de ingestão do catálogo técnico FerriBor (RAG)
- [ ] Output: recomendação + ficha técnica + cotação estimada
- [ ] Resposta < 10s + barra de progresso (eventos para o frontend)
- [ ] Histórico de análises por cliente

## Fase 4 — Backends de Carteira (Camada 3)
- [ ] Track & Trace (eventos de produção → portais)
- [ ] Recompra: monitorar vida útil + alerta preditivo + geração de pedido
- [ ] FerriBor Credit: acúmulo, resgate, ranking

## Fase 5 — ESG & Integrações (Camada 4)
- [ ] FerriBor Circular: cálculo de créditos ESG + ordem de coleta
- [ ] Certificado de impacto ambiental (PDF + assinatura digital)
- [ ] API/EDI (X12, EDIFACT, REST) para ERPs de mineradoras

## Fase 6 — Qualidade, Segurança & Escala
- [ ] AES-256 + LGPD/GDPR + auditoria
- [ ] Rate limiting nas APIs de IA + quotas por token
- [ ] Backup diário (retenção 30 dias) + plano de DR
- [ ] Testes (unit + integração) + monitoramento (Sentry/Datadog)
