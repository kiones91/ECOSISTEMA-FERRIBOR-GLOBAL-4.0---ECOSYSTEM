#!/usr/bin/env bash
# Marca todas as migrations locais como já aplicadas no projeto linkado.
# Use quando o banco já tem o schema (remix/Lovable) mas schema_migrations está vazio.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! npx supabase projects list &>/dev/null; then
  echo "Rode: npx supabase login"
  exit 1
fi

mapfile -t VERSIONS < <(ls -1 supabase/migrations/*.sql | sed -E 's|.*/([0-9]+)_.*|\1|' | sort -u)
echo "Marcando ${#VERSIONS[@]} migrations como applied..."

BATCH=40
for ((i=0; i<${#VERSIONS[@]}; i+=BATCH)); do
  slice=("${VERSIONS[@]:i:BATCH}")
  npx supabase migration repair --status applied "${slice[@]}"
  echo "  ... $((i + ${#slice[@]})) / ${#VERSIONS[@]}"
done

echo "Concluído. Verifique: npx supabase migration list --linked"
