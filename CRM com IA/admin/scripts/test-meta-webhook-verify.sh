#!/usr/bin/env bash
# Testa verificação GET da Meta nos endpoints Supabase (sem Facebook).
set -euo pipefail
TOKEN="buffallos_meta_ibexgdypyyhixwmcxovf"
QUERY="hub.mode=subscribe&hub.verify_token=${TOKEN}&hub.challenge=OK"
BASE="https://ibexgdypyyhixwmcxovf.supabase.co/functions/v1"

probe() {
  local name="$1"
  local path="$2"
  echo "=== ${name} ==="
  local body code
  body=$(curl -sS "${BASE}/${path}?${QUERY}" || true)
  code=$(curl -sS -o /dev/null -w "%{http_code}" "${BASE}/${path}?${QUERY}" || echo "0")
  echo "HTTP ${code} body: ${body}"
  if [ "${body}" = "OK" ] && [ "${code}" = "200" ]; then
    echo "PASS"
  elif [ "${code}" = "404" ]; then
    echo "FAIL — função não publicada (deploy no Supabase)"
  elif [ "${code}" = "403" ]; then
    echo "FAIL — código antigo ou token rejeitado (deploy meta-webhook)"
  else
    echo "FAIL"
  fi
  echo ""
}

probe "meta-webhook (mensagens)" "meta-webhook"
probe "meta-webhook-verify" "meta-webhook-verify"
probe "facebook-leads-webhook (token inbox)" "facebook-leads-webhook"

echo "Deploy sugerido:"
echo "npx supabase login"
echo "npx supabase functions deploy meta-webhook meta-webhook-verify facebook-leads-webhook meta-webhook-health --project-ref ibexgdypyyhixwmcxovf"
