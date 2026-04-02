-- Migration 006: Create data_deletion_requests table
-- LGPD compliance — NFR10. Depends on: guest_profiles

CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guest_id        UUID NOT NULL REFERENCES guest_profiles(id) ON DELETE CASCADE,
  requester_email TEXT,
  data_scope      TEXT NOT NULL DEFAULT 'full' CHECK (data_scope IN ('full','conversations','profile')),
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','rejected')),
  reason          TEXT,
  processed_by    TEXT,
  proof_url       TEXT,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
