-- Migration 003: Create guest_profiles table
-- Marketing Intelligence — accumulated guest data (FR10)

CREATE TABLE IF NOT EXISTS guest_profiles (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number        TEXT NOT NULL UNIQUE,
  email               TEXT,
  name                TEXT,
  language            TEXT NOT NULL DEFAULT 'pt' CHECK (language IN ('pt','en','es')),
  travel_history      JSONB NOT NULL DEFAULT '[]',
  preferences         JSONB NOT NULL DEFAULT '{}',
  special_dates       JSONB NOT NULL DEFAULT '[]',
  total_spent         NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  interaction_count   INTEGER NOT NULL DEFAULT 0,
  last_interaction_at TIMESTAMPTZ,
  anonimized_at       TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
