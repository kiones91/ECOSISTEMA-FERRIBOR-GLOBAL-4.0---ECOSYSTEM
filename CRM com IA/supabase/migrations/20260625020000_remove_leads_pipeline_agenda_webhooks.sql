-- Migration: Remove Leads, Pipeline, Agenda (Calendar), and Webhooks tables
-- These features were removed from the CRM as part of the FerriBor B2B rebuild.

-- Drop FKs in tables that are being kept
ALTER TABLE IF EXISTS inbox_conversations DROP CONSTRAINT IF EXISTS inbox_conversations_lead_id_fkey;
ALTER TABLE IF EXISTS inbox_conversations DROP COLUMN IF EXISTS lead_id;

ALTER TABLE IF EXISTS ai_outreach_queue DROP CONSTRAINT IF EXISTS ai_outreach_queue_webhook_id_fkey;
ALTER TABLE IF EXISTS ai_outreach_queue DROP COLUMN IF EXISTS webhook_id;

-- Drop webhook tables
DROP TABLE IF EXISTS webhook_sample_requests CASCADE;
DROP TABLE IF EXISTS webhook_logs CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;

-- Drop funnel webhook logs
DROP TABLE IF EXISTS funnel_webhook_logs CASCADE;

-- Drop calendar tables
DROP TABLE IF EXISTS calendar_events CASCADE;

-- Drop lead/pipeline related tables
DROP TABLE IF EXISTS lead_pipeline_history CASCADE;
DROP TABLE IF EXISTS interactions CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;

-- Drop RPCs
DROP FUNCTION IF EXISTS increment_webhook_requests(uuid);
DROP FUNCTION IF EXISTS reset_monthly_webhook_requests();
