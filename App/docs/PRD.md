# 📋 PRD — App PWA (Product Requirements Document)

> Requisitos do módulo **App (PWA)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Mobile-first · 2. Offline real · 3. i18n PT/EN/ES/FR · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Objetivo
Entregar a experiência do Portal do Cliente no celular como app instalável, operando offline em campo e notificando o cliente por push.

## 2. Escopo
**Dentro:** instalação PWA, offline parcial (catálogo/fichas), push, busca por imagem (UI), sincronização, i18n.
**Fora:** lógica de IA de identificação (vive no [CRM com IA](../../CRM%20com%20IA/docs/README.md)), regras de negócio do portal (vive no [Dashboard](../../Dashboard/docs/README.md)), site público (vive no [Site](../../Site/docs/README.md)).

## 3. Requisitos Funcionais (MoSCoW)

### Must
- RF-01 Instalável (`manifest.json`, ícones 192/512/maskable, ícone na tela inicial).
- RF-02 Offline parcial: consulta de catálogos e fichas técnicas via Service Worker + IndexedDB.
- RF-03 Sincronização automática ao reconectar (fila de ações offline).
- RF-04 Push notifications: recompra, status de produção, ESG.

### Should
- RF-05 Busca por imagem (câmera → envia ao backend → IA identifica peça).
- RF-06 i18n PT/EN/ES/FR.
- RF-07 Recompra 1-click a partir do push/histórico.

### Could
- RF-08 Indicador de sincronização pendente e resolução de conflitos.
- RF-09 Cache preditivo dos produtos mais consultados.

### Won't (neste módulo)
- RF-10 Processamento de IA, autenticação backend, emissão de certificados ESG.

## 4. Requisitos Não Funcionais
- NFR-01 Carregamento instantâneo de conteúdo cacheado.
- NFR-02 Sincronização segura (HTTPS, token), dados sensíveis criptografados em repouso quando possível.
- NFR-03 Funciona em conectividade intermitente (minas).
- NFR-04 a11y WCAG 2.1 AA mobile.

## 5. Critérios de Aceitação (amostra)
- CA-01: app instala e abre pela tela inicial sem barra do navegador.
- CA-02: com rede desligada, catálogo e fichas previamente abertos continuam acessíveis.
- CA-03: ação feita offline (ex.: recompra) entra em fila e sincroniza ao voltar a rede.
- CA-04: push de recompra abre direto o pedido correspondente (deep link).

## 6. Dependências
- API de identificação por imagem e dados do portal → [CRM com IA](../../CRM%20com%20IA/docs/README.md) / [Dashboard](../../Dashboard/docs/README.md).
- Web Push (VAPID), S3 (imagens).

## 7. Riscos e Mitigação
| Risco | Mitigação |
| :-- | :-- |
| Cache desatualizado offline | Versionamento de cache + revalidação ao reconectar |
| Conflito de dados na sync | Fila idempotente + timestamps + resolução server-side |
| Custo de IA na busca por imagem | Compressão de imagem + quota por usuário |

## 8. Métricas de Sucesso (KPIs)
Taxa de instalação · uso offline · taxa de recompra via push · nº de buscas por imagem · tempo de sincronização.

## 9. Timeline
Camada 3 (Mês 7-9): PWA instalável, offline, push, sync, busca por imagem.
