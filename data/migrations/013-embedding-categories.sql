-- Migration 013: Embedding Categories & HNSW Index
-- Story 1.8 — Vetorização Full-Content para RAG
-- Adds category-based pre-filtering and HNSW index for semantic search

-- 1. Add category column (5 types: faq, description, experience, policy, location)
ALTER TABLE faq_embeddings ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'faq';

-- 2. Add metadata JSONB for hotel_slug, hotel_name, field_name, source context
ALTER TABLE faq_embeddings ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- 3. Create composite index for pre-filtering (hotel_id + category)
CREATE INDEX IF NOT EXISTS idx_embeddings_hotel_category ON faq_embeddings (hotel_id, category);

-- 4. Drop IVFFlat index if exists (replaced by HNSW)
DROP INDEX IF EXISTS idx_faq_embedding_ivfflat;
DROP INDEX IF EXISTS idx_faq_embedding;

-- 5. Create HNSW index for vector similarity search
-- m=16: connections per node (balanced speed/recall)
-- ef_construction=64: build-time accuracy (high recall >99%)
CREATE INDEX IF NOT EXISTS idx_embedding_hnsw
  ON faq_embeddings USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
