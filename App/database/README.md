# 🗄️ DATABASE — App PWA

> Recorte de dados do módulo **App (PWA)**. Diferente dos outros módulos, o "banco" do App é majoritariamente **cache local (IndexedDB)** — não é fonte da verdade. Base: [DOCUMENTACAO-COMPLETA.md](../docs/DOCUMENTACAO-COMPLETA.md)

## 🎯 Prioridades (topo)
1. Mobile-first · 2. Offline real · 3. i18n PT/EN/ES/FR · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Papel do App quanto a dados
O App é **offline-first**: replica localmente um subconjunto dos dados do portal para funcionar sem rede. A fonte da verdade vive no [CRM com IA](../../CRM%20com%20IA/database/README.md) e é consumida via APIs do portal ([Dashboard](../../Dashboard/database/README.md)).

## 2. Object Stores (IndexedDB)
| Store | Conteúdo | Sincronização |
| :-- | :-- | :-- |
| `catalogo_cache` | Produtos e fichas técnicas para consulta offline | Stale-While-Revalidate |
| `pedidos_cache` | Histórico de pedidos do cliente logado | Network-First |
| `fila_offline` | Ações feitas offline (recompra, solicitação de coleta) | Background Sync (replay) |
| `push_subscriptions` | Inscrição Web Push do dispositivo | Registrada no backend |
| `i18n_cache` | Strings de idioma (pt/en/es/fr) | Versionada |

## 3. Regras de sincronização
- `fila_offline`: cada item tem `client_id` + `timestamp` (idempotência). Replay ao reconectar; servidor resolve conflitos.
- `catalogo_cache`/`pedidos_cache`: revalidados ao voltar a rede; expiração configurável.
- Limpeza completa no logout (dados sensíveis não persistem).

## 4. Pastas
- `schema/` — definição dos object stores e versões do IndexedDB (migrations de schema do cache).
- `seeds/` — dados de exemplo para testar offline em desenvolvimento.

## 5. Pendências
- [ ] Definir versão inicial do schema IndexedDB e estratégia de migração.
- [ ] Definir política de expiração por store.
- [ ] Definir contrato da `fila_offline` com o backend (idempotência).
