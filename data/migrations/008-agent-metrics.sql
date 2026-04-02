-- Migration 008: Create agent_metrics table
-- Pipeline observability. Depends on: conversations

CREATE TABLE IF NOT EXISTS agent_metrics (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id               TEXT NOT NULL,
  conversation_id          UUID REFERENCES conversations(id) ON DELETE SET NULL,
  intent                   TEXT,
  confidence               REAL,
  language                 TEXT CHECK (language IN ('pt','en','es')),
  tools_used               TEXT[] NOT NULL DEFAULT '{}',
  latency_intent_ms        INTEGER,
  latency_orchestrator_ms  INTEGER,
  latency_persona_ms       INTEGER,
  latency_safety_ms        INTEGER,
  latency_total_ms         INTEGER,
  safety_approved          BOOLEAN NOT NULL DEFAULT true,
  safety_category          TEXT,
  guardrail_triggered      BOOLEAN NOT NULL DEFAULT false,
  guardrail_type           TEXT,
  channel                  TEXT CHECK (channel IN ('whatsapp','website')),
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
