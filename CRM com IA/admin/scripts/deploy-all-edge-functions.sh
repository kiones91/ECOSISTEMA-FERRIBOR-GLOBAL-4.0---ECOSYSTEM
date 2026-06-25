#!/usr/bin/env bash
# Deploy de TODAS as Edge Functions do repositório para o Supabase.
# Respeita verify_jwt do supabase/config.toml (--no-verify-jwt quando false).
set -uo pipefail
cd "$(dirname "$0")/.."

REF="${SUPABASE_PROJECT_REF:-ooshltpxjeldnobksrjs}"
LOG_DIR="${DEPLOY_LOG_DIR:-./scripts/deploy-logs}"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG_FILE="$LOG_DIR/deploy-all-${STAMP}.log"
FAIL_FILE="$LOG_DIR/deploy-failed-${STAMP}.txt"
OK_FILE="$LOG_DIR/deploy-ok-${STAMP}.txt"

: >"$FAIL_FILE"
: >"$OK_FILE"

# Functions com verify_jwt = false no config.toml
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

mapfile -t ALL_FUNCS < <(ls -1 supabase/functions | grep -v '^_' | sort)

TOTAL=${#ALL_FUNCS[@]}
echo "=== Deploy de $TOTAL functions → projeto $REF ===" | tee -a "$LOG_FILE"
echo "Log: $LOG_FILE" | tee -a "$LOG_FILE"
echo "No-JWT (${#NO_JWT_FUNCS[@]}): ${NO_JWT_FUNCS[*]}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

OK=0
FAIL=0
N=0

for fn in "${ALL_FUNCS[@]}"; do
  N=$((N + 1))
  extra=()
  if is_no_jwt "$fn"; then
    extra=(--no-verify-jwt)
  fi
  echo "[$N/$TOTAL] >>> $fn ${extra[*]}" | tee -a "$LOG_FILE"
  if npx supabase functions deploy "$fn" --project-ref "$REF" "${extra[@]}" >>"$LOG_FILE" 2>&1; then
    echo "$fn" >>"$OK_FILE"
    OK=$((OK + 1))
    echo "    OK" | tee -a "$LOG_FILE"
  else
    echo "$fn" >>"$FAIL_FILE"
    FAIL=$((FAIL + 1))
    echo "    FALHOU (continuando...)" | tee -a "$LOG_FILE"
  fi
done

echo "" | tee -a "$LOG_FILE"
echo "=== Concluído: $OK ok, $FAIL falhas (de $TOTAL) ===" | tee -a "$LOG_FILE"
echo "Sucesso: $OK_FILE" | tee -a "$LOG_FILE"
[[ $FAIL -gt 0 ]] && echo "Falhas: $FAIL_FILE" | tee -a "$LOG_FILE"
echo "Dashboard: https://supabase.com/dashboard/project/${REF}/functions" | tee -a "$LOG_FILE"

exit $([[ $FAIL -eq 0 ]] && echo 0 || echo 1)
