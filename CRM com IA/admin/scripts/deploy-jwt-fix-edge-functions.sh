#!/usr/bin/env bash
# Deploy das Edge Functions afetadas pelo reparo JWT (INTERNAL_SERVICE_ROLE_JWT).
set -euo pipefail
cd "$(dirname "$0")/.."
REF="${SUPABASE_PROJECT_REF:-ooshltpxjeldnobksrjs}"

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

FUNCS=(
  test-integration
  send-transactional-email
  process-email-queue
  send-invite-email
  auth-email-hook
  send-mass-email
  send-notification-email
  send-booking-confirmation
  create-team-member
  webchat-inbox
  webchat-bot
  webchat-api
  evolution-webhook
  evolution-send
  process-scheduled-messages
  admin-agent-handle-inbound
  agent-handoff-greeter
  process-media-message
  memory-search
  memory-embedder
  prompt-experiment-pick
)

echo "=== Deploy JWT fix: ${#FUNCS[@]} functions → $REF ==="
for fn in "${FUNCS[@]}"; do
  extra=()
  is_no_jwt "$fn" && extra=(--no-verify-jwt)
  echo ">>> $fn ${extra[*]}"
  npx supabase functions deploy "$fn" --project-ref "$REF" "${extra[@]}"
done
echo "=== Concluído ==="
