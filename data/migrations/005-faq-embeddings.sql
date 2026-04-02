-- Migration 005: Create faq_embeddings table
-- RAG knowledge base — ~430 chunks. Depends on: hotels

CREATE TABLE IF NOT EXISTS faq_embeddings (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hotel_id          UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  section_title     TEXT NOT NULL,
  content           TEXT NOT NULL,
  content_hash      TEXT NOT NULL,
  embedding         vector(1536) NOT NULL,
  embedding_version TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  source            TEXT NOT NULL DEFAULT 'google-drive',
  file_name         TEXT,
  last_synced_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(hotel_id, content_hash)
);
