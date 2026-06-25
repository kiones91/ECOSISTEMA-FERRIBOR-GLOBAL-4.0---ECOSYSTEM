#!/usr/bin/env bash
# Edge Functions essenciais para produção Buffallos Sales
set -euo pipefail
cd "$(dirname "$0")/.."
REF="${SUPABASE_PROJECT_REF:-ooshltpxjeldnobksrjs}"

FUNCS=(
  ensure-default-super-admin
  auth-email-hook
  process-email-queue
  send-transactional-email
  send-invite-email
  test-integration
  create-team-member
  cakto-proxy
  cakto-webhook
)

NO_JWT=(auth-email-hook cakto-webhook)

for fn in "${FUNCS[@]}"; do
  extra=()
  for nj in "${NO_JWT[@]}"; do
    [[ "$fn" == "$nj" ]] && extra=(--no-verify-jwt)
  done
  echo ">>> deploy $fn"
  npx supabase functions deploy "$fn" --project-ref "$REF" "${extra[@]}"
done

echo "Deploy concluído. Confira: https://supabase.com/dashboard/project/${REF}/functions"
