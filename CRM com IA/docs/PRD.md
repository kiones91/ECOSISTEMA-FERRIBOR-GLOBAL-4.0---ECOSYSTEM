# 📋 PRD — CRM com IA (Product Requirements Document)

> Requisitos do módulo **CRM com IA (Backend/Core)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. SmartSpec preciso · 2. RAG alimentado · 3. Detecção de idioma · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Objetivo
Ser o backend/core que atende leads em qualquer idioma, analisa desenhos com IA, qualifica/roteia oportunidades e sustenta os backends de Recompra, Circular, Credit e Track & Trace que alimentam Site, Dashboard e App.

## 2. Escopo
**Dentro:** CRM omnichannel (UI em PT-BR) com agentes de IA multilíngues, detecção de idioma do cliente, qualificação/roteamento de leads, Motor de IA (SmartSpec + RAG), formulário inteligente de cotação, dashboard de leads, backends de Recompra/Circular/Credit/Track&Trace, API/EDI para ERPs.
**Fora:** frontends ([Site](../../Site/docs/README.md), [Dashboard](../../Dashboard/docs/README.md), [App](../../App/docs/README.md)) — consomem este core.

## 3. Requisitos Funcionais (MoSCoW)

### Must
- RF-01 Canais integrados: WhatsApp (QR Code), e-mail, chat do site.
- RF-02 Detecção automática de idioma da 1ª mensagem (NLU) + resposta no idioma nativo.
- RF-03 Qualificação automática de leads (tamanho da peça, volume, prazo).
- RF-04 Roteamento inteligente para comercial (por idioma e setor).
- RF-05 Motor SmartSpec: Aspose (CAD→metadados) → LLM multimodal → RAG (catálogo) → recomendação + ficha + cotação estimada.
- RF-06 Formulário inteligente de cotação: extração de metadados, priorização da fila de engenharia.
- RF-07 Histórico completo traduzido e organizado.

### Should
- RF-08 Dashboard de leads em tempo real (país/idioma/setor, conversão, tempo de resposta, origem).
- RF-09 Gestão de fuso horário (agendamento automático).
- RF-10 Backend de Recompra (monitoramento vida útil + alerta preditivo + geração de pedido).
- RF-11 Backend Track & Trace (eventos de produção → frontends).
- RF-12 Backend FerriBor Credit (acúmulo/resgate/ranking).
- RF-13 Backend FerriBor Circular (cálculo de créditos ESG, ordem de coleta, certificado PDF).

### Could
- RF-14 API/EDI (X12, EDIFACT, REST) para ERPs de mineradoras (Vale, Codelco, BHP).
- RF-15 Previsão de receita baseada em pipeline.

### Won't (neste módulo)
- RF-16 Renderização de UI dos portais; lógica de apresentação.

## 4. Requisitos Não Funcionais
- NFR-01 Resposta da IA < 10s para análise de desenho.
- NFR-02 Segurança: AES-256, LGPD/GDPR, gestão de secrets, rate limiting nas APIs de IA.
- NFR-03 Escalabilidade horizontal; 10.000+ usuários simultâneos; controle de custo por token.
- NFR-04 SLA 99.9%, backup diário (retenção 30 dias).

## 5. Critérios de Aceitação (amostra)
- CA-02: mensagem em ES recebe resposta automática em ES.
- CA-05: upload de DWG retorna recomendação + ficha + cotação estimada em < 10s.
- CA-10: fim de vida útil dispara alerta preditivo nos canais (push/WhatsApp/e-mail).
- CA-13: solicitação de coleta calcula créditos ESG e emite certificado PDF.

## 6. Dependências
- LLM (GPT-4o/Claude), embeddings, Vector DB, Aspose, tradução, WhatsApp próprio, SendGrid/SES, S3.

## 7. Riscos e Mitigação
| Risco | Mitigação |
| :-- | :-- |
| SmartSpec impreciso | Avaliação contínua, human-in-the-loop, RAG curado |
| RAG desatualizado | Pipeline de ingestão do catálogo + reindexação |
| Custo de tokens | Cache, quotas, modelos por tarefa |
| Desconexão do WhatsApp | Reconeither automática + monitoramento |
| Docs herdados (InforHealth) | Reconciliar/limpar antes de produção |

## 8. Métricas de Sucesso (KPIs)
Leads por país/idioma/setor · tempo de resposta (IA vs humano) · nº de análises/dia · taxa de recompra · créditos ESG · NPS.

## 9. Timeline
C1 (1-3): CRM + agentes de IA multilíngues + cotação. C2 (4-6): SmartSpec+RAG. C3 (7-9): Recompra/Credit/Track&Trace. C4 (10-12): Circular/ESG/API-EDI.
