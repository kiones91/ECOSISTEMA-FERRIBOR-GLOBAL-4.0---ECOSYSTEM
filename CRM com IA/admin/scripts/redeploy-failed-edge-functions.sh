#!/usr/bin/env bash
# Re-deploy apenas as functions que falharam (limite do plano ou retry).
set -euo pipefail
cd "$(dirname "$0")/.."
REF="${SUPABASE_PROJECT_REF:-ooshltpxjeldnobksrjs}"
FAIL_FILE="${1:-scripts/deploy-logs/deploy-failed-20260604-230213.txt}"

if [[ ! -f "$FAIL_FILE" ]]; then
  echo "Arquivo não encontrado: $FAIL_FILE"
  exit 1
fi

mapfile -t NO_JWT_FUNCS < <(
  grep -B1 'verify_jwt = false' supabase/config.toml \
    | grep '^\[functions\.' \
    | sed 's/\[functions\.//;s/\]//'
)

is_no_jwt() {
  local fn="$1"
  for nj in "${NO_JWT_FUNCS[@]}"; do
    [[ "$fn" == "$nj" ]] && return 0
  done
  return 1
}

while IFS= read -r fn; do
  [[ -z "$fn" ]] && continue
  extra=()
  is_no_jwt "$fn" && extra=(--no-verify-jwt)
  echo ">>> retry $fn"
  npx supabase functions deploy "$fn" --project-ref "$REF" "${extra[@]}"
done < "$FAIL_FILE"

echo "Retry concluído."
