# 🔁 REPOINTAR PARA FERRIBOR — Config & Autenticação (NÃO DELETAR)

> ⚠️ Estes itens **não são lixo**. O CRM é um sistema **em funcionamento** cuja autenticação/acesso aponta hoje para a infraestrutura do cliente anterior (**InforHealth**). Deletar quebra o sistema. O correto é **repointar** para a infraestrutura da FerriBor.

📍 Base: [README.md](README.md) · [DOCUMENTACAO-COMPLETA.md](DOCUMENTACAO-COMPLETA.md)

---

## 🎯 Resumo: a autenticação vem do banco/Supabase

A autenticação e o acesso do CRM dependem de um **projeto Supabase** e de **URLs** que hoje são da InforHealth. Para a FerriBor assumir o sistema, é preciso:

1. Criar (ou usar) o **projeto Supabase da FerriBor**.
2. Trocar as credenciais no **`config/crm.env`** (gitignored — segredos).
3. Atualizar URLs/refs não-secretos no **`config/crm.config.json`**.
4. Definir o **`SESSION_SECRET`** próprio (hoje há fallback hardcoded).

---

## 1. `config/crm.env` (SEGREDOS — repointar)

Arquivo gitignored com as credenciais vivas. Hoje aponta para o Supabase da InforHealth. Trocar **os valores** (não apagar o arquivo) das chaves:

| Variável | O que é | Ação |
| :-- | :-- | :-- |
| `VITE_SUPABASE_URL` | URL do projeto Supabase | Trocar para o projeto **FerriBor** |
| `VITE_SUPABASE_ANON_KEY` | Anon key (cliente) | Trocar para a key da FerriBor |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (servidor) | Trocar para a key da FerriBor |
| `SUPABASE_PROJECT_REF` | Ref do projeto (CLI) | Trocar para o ref da FerriBor |
| `SESSION_SECRET` | Segredo de sessão (JWT/HMAC) | **Definir** valor forte próprio da FerriBor |
| `EVOLUTION_API_URL` / `_KEY` / `_INSTANCE_NAME` | WhatsApp (Evolution) | Repointar para a instância FerriBor |
| `RESEND_API_KEY` | E-mail transacional | Repointar para conta FerriBor |
| `MERCADOPAGO_*` | Pagamentos | Repointar/avaliar se aplicável ao FerriBor |

## 2. `config/crm.config.json` (NÃO-secreto — repointar)

Hoje contém URLs/refs da InforHealth ([crm.config.json](../config/crm.config.json)):

| Campo | Valor atual (InforHealth) | Ação |
| :-- | :-- | :-- |
| `urls.portal` | `https://edu.inforhealth.com.br` | Trocar para domínio FerriBor |
| `urls.portal_staging` | `https://inforhealth.buffallos.com.br` | Trocar para staging FerriBor |
| `urls.admin_base` | `https://edu.inforhealth.com.br/admin` | Trocar para domínio FerriBor |
| `supabase.project_ref` | `kpkcqqqshbsyaxdaorqt` | Trocar para o ref FerriBor |
| `supabase.project_url` | `https://kpkcqqqshbsyaxdaorqt.supabase.co` | Trocar para o URL FerriBor |
| `supabase.project_name_dev` | `inforhealth-admin-dev` | Renomear para `ferribor-*` |

## 3. `worker/src/auth/session.ts` (fallback hardcoded)

[session.ts:21](../worker/src/auth/session.ts) tem fallback inseguro:

```ts
return env.SESSION_SECRET || 'inforhealth-dev-session-secret';
```

**Ação:** garantir que `SESSION_SECRET` esteja sempre definido no ambiente (env/secret) e, idealmente, remover o fallback hardcoded — ou ao menos trocar o literal por algo neutro (`'dev-only-change-me'`). Não deletar o arquivo: ele assina/valida as sessões.

## 4. Supabase — migrations (NÃO renomear/deletar sem cuidado)

**Decisão (faxina 2026-06-23):** o Supabase do FerriBor será um **projeto novo, zerado**. Como não há histórico a preservar, **todas as migrations antigas foram movidas para `_BACKUP_CRM_PRE_FAXINA/migrations/`** (fora do repo) como referência de schema. As pastas de migrations no projeto estão **vazias** e serão repovoadas com tabelas novas, na lógica do ECOSSISTEMA FERRIBOR GLOBAL 4.0.

Backup das migrations (referência):
- `migrations/supabase-backend/` — 23 arquivos (backend principal CRM)
- `migrations/worker-d1/` — 2 arquivos (Cloudflare D1, área do aluno LMS)
- `migrations/admin-app/` — 235 arquivos (histórico do app admin)

---

## 5. O que já foi feito na faxina (2026-06-23)

| Item | Ação executada |
| :-- | :-- |
| `admin/src/integrations/lovable/` | **Deletado** (código morto; ninguém importava) |
| `@lovable.dev/cloud-auth-js` + `lovable-tagger` | Removidos de `package.json` e `vite.config.ts` (regerar lockfiles no `install`) |
| Edge function `inforhealth-chat-bot` | **Renomeada** → `webchat-agente` (+ caller em `worker/src/routes/webchat.ts`) |
| `SESSION_SECRET` hardcoded | **Removido** o fallback; agora lança erro se `env.SESSION_SECRET` faltar |
| `admin/docs/` (24 guias Buffallos) | Movidos para `_BACKUP_CRM_PRE_FAXINA/admin-docs/` |
| Migrations (260 arquivos) | Movidas para `_BACKUP_CRM_PRE_FAXINA/migrations/` |

> ⚠️ **Lockfiles:** `admin/package-lock.json` e `admin/bun.lock` ainda listam os pacotes Lovable. Eles se regeneram ao rodar `npm install` / `bun install` — não editar à mão.

---

## ✅ Checklist de repoint
- [ ] Projeto Supabase da FerriBor criado (zerado)
- [ ] `config/crm.env` com credenciais FerriBor (valores trocados, arquivo mantido)
- [x] `SESSION_SECRET` agora 100% via env (fallback hardcoded removido) — falta **definir** o valor no `.env`
- [ ] `config/crm.config.json` com URLs/refs FerriBor
- [ ] Evolution/Resend/pagamentos repointados
- [ ] `config.toml` (`project_id` + `additional_redirect_urls`) atualizado para FerriBor
- [ ] Recriar schema/tabelas novas no Supabase zerado (lógica FerriBor)
- [ ] Reinstalar deps do `admin/` para regerar lockfiles sem Lovable
- [ ] Deploy da edge function com o novo nome `webchat-agente`
