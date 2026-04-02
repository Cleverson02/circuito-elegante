-- Migration 007: Create webhook_events table
-- Audit trail for received webhooks (FR25). Depends on: guest_profiles

CREATE TABLE IF NOT EXISTS webhook_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source        TEXT NOT NULL CHECK (source IN ('elevare','evolution','chatwoot')),
  event_type    TEXT NOT NULL,
  payload       JSONB NOT NULL,
  session_id    TEXT,
  guest_id      UUID REFERENCES guest_profiles(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processing','processed','failed')),
  error_message TEXT,
  processed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
