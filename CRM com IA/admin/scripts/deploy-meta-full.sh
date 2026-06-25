#!/usr/bin/env bash
# Deploy completo Meta Inbox + envio de mensagens (produção ibex).
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
  webchat-inbox
)

echo "Deploy Meta + Inbox send → ${PROJECT_REF}"
npx supabase functions deploy "${FUNCS[@]}" --project-ref "${PROJECT_REF}"
echo ""
echo "Verificação meta-webhook:"
curl -s -D - -o /tmp/meta-verify-body.txt \
  "https://${PROJECT_REF}.supabase.co/functions/v1/meta-webhook?hub.mode=subscribe&hub.verify_token=buffallos_meta_ibexgdypyyhixwmcxovf&hub.challenge=OK" \
  | grep -iE 'HTTP/|x-meta-webhook-build'
echo "Body: $(cat /tmp/meta-verify-body.txt)"
