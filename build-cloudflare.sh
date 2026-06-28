#!/usr/bin/env bash
# Build combinado para Cloudflare Pages.
# Monta os apps em UM único diretório (dist-cloudflare/):
#   /           -> Site (Next.js export estático)
#   /proposta/  -> Proposta comercial (HTML estático)
#   /crm/       -> CRM com IA (Vite SPA)
#   /cliente/   -> Dashboard / Portal do Cliente (Vite SPA)
set -euo pipefail

# Evita que o Git Bash no Windows converta "/crm/" em caminho do sistema.
# Inofensivo no Linux (builder da Cloudflare).
export MSYS_NO_PATHCONV=1

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT="$ROOT/dist-cloudflare"

echo "==> Limpando saída anterior"
rm -rf "$OUT"
mkdir -p "$OUT"

echo "==> 1/4 Build do Site (Next.js export) -> /"
cd "$ROOT/Site"
npm ci --legacy-peer-deps
npm run build
cp -r out/. "$OUT/"

echo "==> 2/4 Copiando proposta comercial (HTML estático) -> /proposta"
mkdir -p "$OUT/proposta"
cp "$ROOT/proposta comercial/proposta.html" "$OUT/proposta/index.html"
cp -r "$ROOT/proposta comercial/assets" "$OUT/proposta/assets"

echo "==> 3/4 Build do CRM (base /crm/) -> /crm"
cd "$ROOT/CRM com IA/admin"
npm ci --legacy-peer-deps
VITE_BASE_PATH=/crm/ npm run build
mkdir -p "$OUT/crm"
cp -r "$ROOT/dist/admin/." "$OUT/crm/"

echo "==> 4/4 Build do Dashboard (base /cliente/) -> /cliente"
cd "$ROOT/DASHBOARD"
npm ci --legacy-peer-deps
VITE_BASE_PATH=/cliente/ npm run build
mkdir -p "$OUT/cliente"
cp -r dist/. "$OUT/cliente/"

echo "==> Concluído. Saída pronta em: dist-cloudflare/"
