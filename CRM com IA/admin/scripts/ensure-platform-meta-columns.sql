-- Idempotente: três apps Meta + RPC de status.
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS meta_app_engagement_id text,
  ADD COLUMN IF NOT EXISTS meta_app_engagement_verify_token text,
  ADD COLUMN IF NOT EXISTS meta_app_engagement_webhook_url text,
  ADD COLUMN IF NOT EXISTS meta_app_engagement_webhook_configured_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta_app_lead_forms_id text,
  ADD COLUMN IF NOT EXISTS meta_app_lead_forms_verify_token text,
  ADD COLUMN IF NOT EXISTS meta_app_lead_forms_webhook_url text,
  ADD COLUMN IF NOT EXISTS meta_app_lead_forms_webhook_configured_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta_app_messages_id text,
  ADD COLUMN IF NOT EXISTS meta_app_messages_verify_token text,
  ADD COLUMN IF NOT EXISTS meta_app_messages_webhook_url text,
  ADD COLUMN IF NOT EXISTS meta_app_messages_webhook_configured_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta_webhook_messages_configured_at timestamptz,
  ADD COLUMN IF NOT EXISTS meta_webhook_engagement_configured_at timestamptz;

UPDATE public.platform_settings
SET
  meta_app_messages_webhook_configured_at = COALESCE(
    meta_app_messages_webhook_configured_at,
    meta_webhook_messages_configured_at
  ),
  meta_app_engagement_webhook_configured_at = COALESCE(
    meta_app_engagement_webhook_configured_at,
    meta_webhook_engagement_configured_at
  )
WHERE meta_webhook_messages_configured_at IS NOT NULL
   OR meta_webhook_engagement_configured_at IS NOT NULL;

CREATE OR REPLACE FUNCTION public.get_meta_platform_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT jsonb_build_object(
        'messages_webhook_configured',
          COALESCE(
            meta_app_messages_webhook_configured_at,
            meta_webhook_messages_configured_at
          ) IS NOT NULL,
        'engagement_webhook_configured',
          COALESCE(
            meta_app_engagement_webhook_configured_at,
            meta_webhook_engagement_configured_at
          ) IS NOT NULL,
        'lead_forms_webhook_configured',
          meta_app_lead_forms_webhook_configured_at IS NOT NULL,
        'meta_app_engagement_id', meta_app_engagement_id,
        'meta_app_lead_forms_id', meta_app_lead_forms_id,
        'meta_app_messages_id', meta_app_messages_id
      )
      FROM public.platform_settings
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST
      LIMIT 1
    ),
    '{"messages_webhook_configured":false,"engagement_webhook_configured":false,"lead_forms_webhook_configured":false}'::jsonb
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_meta_platform_status() TO authenticated;
