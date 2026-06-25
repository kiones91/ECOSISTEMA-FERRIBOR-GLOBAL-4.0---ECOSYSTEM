# 📐 PDR — CRM com IA (Product Design Document)

> Design do produto do módulo **CRM com IA (Backend/Core)**. Base: [README.md](README.md) · [ECOSYSTEM](../../docs/ECOSYSTEM.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. SmartSpec preciso · 2. RAG alimentado · 3. Detecção de idioma · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Visão do Produto
Cérebro do ecossistema: atende leads em qualquer idioma, analisa desenhos técnicos com IA, qualifica e roteia oportunidades, e sustenta os backends de Recompra, Circular, Credit e Track & Trace.

## 2. Problema que Resolve
- Atendimento multilíngue B2B é caro e lento → CRM interno (PT-BR) com agentes de IA que atendem no idioma do cliente.
- Engenharia perde tempo interpretando desenhos → SmartSpec automatiza.
- Leads mal qualificados/roteados → qualificação e roteamento automáticos.
- Falta de visão em tempo real do pipeline → dashboard de leads.

## 3. Personas (usuários internos)
| Persona | Perfil | Necessidade |
| :-- | :-- | :-- |
| **Atendente Comercial** | Responde leads | Histórico traduzido, roteamento por idioma/setor |
| **Engenheiro de Vendas** | Analisa desenhos | SmartSpec preciso, fila priorizada |
| **Gestor Comercial** | Acompanha pipeline | Dashboard de leads em tempo real |
| **Operação/Logística** | Produção e coleta | Track & Trace, ordens de coleta Circular |

## 4. Fluxos de IA / Atendimento
```
Lead (WhatsApp/e-mail/chat) → detecção de idioma → resposta no idioma nativo
   → qualificação (tamanho/volume/prazo) → roteamento (idioma+setor) → comercial

Upload de desenho → Aspose (CAD→metadados) → LLM multimodal (dimensões/tolerâncias)
   → RAG (catálogo FerriBor) → recomendação + ficha + cotação estimada
```

## 5. Requisitos de UX/UI (back-office)
- Inbox omnichannel com histórico traduzido e organizado.
- Painel SmartSpec com barra de progresso e histórico por cliente.
- Dashboard de leads por país/idioma/setor, conversão, tempo de resposta.
- Gestão de fuso horário (agendamento automático).

## 6. Acessibilidade
- Back-office acessível (teclado, contraste, ARIA) WCAG 2.1 AA.

## 7. Design System
Consistente com o ecossistema; foco em densidade de informação para operadores.
