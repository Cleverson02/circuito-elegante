-- Migration 001: Enable required PostgreSQL extensions
-- Stella — Concierge Digital (Circuito Elegante)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";       -- pgvector for RAG embeddings
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy match for hotel names
