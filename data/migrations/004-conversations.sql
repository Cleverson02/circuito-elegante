-- Migration 004: Create conversations table
-- Depends on: guest_profiles, hotels

CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      TEXT NOT NULL,
  guest_id        UUID REFERENCES guest_profiles(id) ON DELETE SET NULL,
  user_id         TEXT NOT NULL,
  channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','website')),
  messages        JSONB NOT NULL DEFAULT '[]',
  message_count   INTEGER NOT NULL DEFAULT 0,
  hotel_focus     UUID REFERENCES hotels(id) ON DELETE SET NULL,
  handover        BOOLEAN NOT NULL DEFAULT false,
  handover_reason TEXT CHECK (handover_reason IN (
    'hotel_manual','guest_requested','low_confidence','api_failure','sensitive_topic'
  )),
  resolved        BOOLEAN NOT NULL DEFAULT false,
  metadata        JSONB NOT NULL DEFAULT '{}',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
