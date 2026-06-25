# 🗄️ DATABASE — Site

> Recorte de dados do módulo **Site**. No servidor SQL de produção pode haver um único banco compartilhado; aqui versionamos apenas o que pertence ao domínio do Site. Base: [DOCUMENTACAO-COMPLETA.md](../docs/DOCUMENTACAO-COMPLETA.md)

## 🎯 Prioridades (topo)
1. i18n PT/EN/ES/FR dia 1 · 2. SEO técnico nativo · 3. Mobile-first · 4. Segurança (LGPD) · 5. Custo de IA controlado.

---

## 1. Papel do Site quanto a dados
O Site é majoritariamente **somente-leitura**: consome catálogo/produtos e escreve apenas leads/cotações que são entregues ao [CRM com IA](../../CRM%20com%20IA/database/README.md) (dono real desses dados). Conteúdo i18n pode ser estático (arquivos de mensagem) ou via CMS — a decidir.

## 2. Entidades de leitura (catálogo)
| Entidade | Descrição | Fonte |
| :-- | :-- | :-- |
| `produto` | Peça técnica (rolos, vedações, niveladores) | CMS/Catálogo |
| `produto_especificacao` | Specs em tabela HTML (material, dureza, tolerância) | CMS/Catálogo |
| `produto_modelo_3d` | Referência ao GLB/STEP | S3 |
| `setor_solucao` | Mineração, Cerâmica, Agro, Metalmecânica | CMS |
| `estudo_de_caso` | Casos técnicos por setor | CMS |
| `traducao` | Strings i18n (pt/en/es/fr) | Arquivos/CMS |

## 3. Entidades de escrita (encaminhadas ao CRM)
| Entidade | Descrição | Destino |
| :-- | :-- | :-- |
| `lead_cotacao` | Submissão do wizard (dados + anexos S3) | CRM com IA |
| `smartspec_request` | Upload + locale para análise | CRM com IA (Motor de IA) |

> Estas tabelas **não são donas** no Site — o schema canônico vive no [CRM com IA/database](../../CRM%20com%20IA/database/README.md). Aqui documentamos o contrato de entrada.

## 4. Pastas
- `schema/` — DDL/migrations específicas do Site (se houver tabelas locais de catálogo/CMS).
- `seeds/` — dados de exemplo (produtos fictícios, traduções de amostra) para desenvolvimento.

## 5. Pendências
- [ ] Decidir: catálogo em CMS headless vs. tabelas próprias.
- [ ] Definir contrato `lead_cotacao` / `smartspec_request` com o CRM.
- [ ] Estratégia de armazenamento de traduções (arquivo vs. banco).
