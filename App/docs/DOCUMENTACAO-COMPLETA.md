# 📖 DOCUMENTAÇÃO COMPLETA — App PWA

> Documentação técnica detalhada do módulo **App (PWA)**. Base: [README.md](README.md) · [PDR.md](PDR.md) · [PRD.md](PRD.md) · [Briefing](../../BRIEFING%20TÉCNICO%20-%20PROJETO%20FERRIBOR%20GLOBAL%204.0.md)

## 🎯 Prioridades (topo)
1. Mobile-first · 2. Offline real · 3. i18n PT/EN/ES/FR · 4. Segurança · 5. Custo de IA controlado.

---

## 1. Arquitetura Técnica

```
[Celular] ── instala ──> [PWA Next.js + manifest.json]
   ├─ Service Worker (Workbox/next-pwa)
   │    ├─ Cache de catálogo/fichas (stale-while-revalidate)
   │    ├─ Background Sync (fila de ações offline)
   │    └─ Web Push (recompra/status/ESG)
   ├─ IndexedDB (dados locais + fila offline)
   ├─ Câmera ── imagem ──> [API busca por imagem @ CRM com IA]
   └─ Sessão/dados do portal ──> [Dashboard / CRM com IA]
```

O App é um **cliente offline-first** do portal. Não contém lógica de IA nem regras de negócio — consome as APIs do [CRM com IA](../../CRM%20com%20IA/docs/README.md) e compartilha o domínio do [Dashboard](../../Dashboard/docs/README.md).

## 2. Service Worker — estratégias de cache
| Recurso | Estratégia |
| :-- | :-- |
| Catálogo / fichas técnicas | Stale-While-Revalidate |
| Assets estáticos (JS/CSS/ícones) | Cache-First com versionamento |
| Chamadas de API dinâmicas | Network-First com fallback ao cache |
| Ações offline (recompra etc.) | Background Sync (fila em IndexedDB) |

## 3. Sincronização
- Fila idempotente em IndexedDB; cada ação tem `client_id` + timestamp.
- Ao reconectar: replay da fila → servidor resolve conflitos (último-a-escrever ou regra de negócio).
- Indicador de "pendências de sincronização" na UI.

## 4. Push Notifications
- Web Push API + chaves VAPID.
- Tópicos: recompra (alerta preditivo de desgaste), status de produção (Track & Trace), ESG (coleta/créditos).
- Payload com deep link → abre a tela correspondente.

## 5. Busca por Imagem
- Captura → compressão (canvas) → `POST` multipart ao backend → IA identifica peça → retorna produto → recompra 1-click.
- Quota por usuário para conter custo de IA.

## 6. Integrações (contratos a definir no backend)
| Integração | Direção | Endpoint (a definir no CRM com IA) |
| :-- | :-- | :-- |
| Busca por imagem | App → CRM | `POST /api/vision/identify` |
| Dados do portal | App ↔ Dashboard/CRM | reaproveita APIs do portal |
| Push | CRM → App | Web Push (VAPID) |

## 7. Dados e Modelos
Cache local em IndexedDB (não é fonte da verdade). Modelo detalhado em [../database/README.md](../database/README.md).

## 8. Segurança
- HTTPS obrigatório; token de sessão seguro; dados sensíveis minimizados no cache.
- Limpeza de cache no logout; expiração de dados offline.

## 9. Testes
- Unit (lib offline/sync), E2E (Playwright) simulando offline/online, Lighthouse PWA.

## 10. Deploy e Rollback
- Vercel (ou equivalente com suporte a SW). Atenção ao versionamento do Service Worker para evitar cache preso; `skipWaiting`/`clientsClaim` controlados.
- Rollback: redeploy anterior + bump de versão de cache.

## 11. Documentação para o Cliente Final
- Como instalar o app (A2HS) em iOS/Android, como usar offline e busca por imagem — no idioma do usuário.
