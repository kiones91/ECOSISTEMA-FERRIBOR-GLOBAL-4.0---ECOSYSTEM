#!/usr/bin/env bash
# Publica no Supabase as Edge Functions do Inbox Meta (obrigatório antes de "Verificar e salvar" na Meta).
set -euo pipefail
PROJECT_REF="ibexgdypyyhixwmcxovf"
FUNCS=(
  meta-webhook
  meta-webhook-verify
  facebook-leads-webhook
  meta-webhook-health
  meta-inbox-config
  meta-subscribe-channels
  meta-engagement-reply
  meta-engagement-sync
  webchat-inbox
)

echo "Deploy Meta Inbox → projeto ${PROJECT_REF}"
npx supabase functions deploy "${FUNCS[@]}" --project-ref "${PROJECT_REF}"
echo ""
echo "Teste:"
bash "$(dirname "$0")/test-meta-webhook-verify.sh"
