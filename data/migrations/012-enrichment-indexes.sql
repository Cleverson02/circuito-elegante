-- Migration 012: Enrichment indexes, generated columns, full-text search, and RLS
-- Story 1.7 — Ingestão de Dados Enriquecidos v2

-- ============================================================
-- 1. GIN pathops index on JSONB data (3x smaller than default GIN)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hotels_data_pathops
  ON hotels USING GIN (data jsonb_path_ops);

-- ============================================================
-- 2. Generated columns for high-frequency query fields
-- ============================================================

-- lodging_type (identity.lodging_type or flat lodging_type)
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS lodging_type text
  GENERATED ALWAYS AS (
    COALESCE(data #>> '{identity,lodging_type}', data ->> 'lodging_type')
  ) STORED;

-- star_rating (reputation.star_rating or flat star_rating) — safe cast for non-numeric values
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS star_rating int
  GENERATED ALWAYS AS (
    CASE
      WHEN COALESCE(data #>> '{reputation,star_rating}', data ->> 'star_rating') ~ '^[0-9]+$'
      THEN (COALESCE(data #>> '{reputation,star_rating}', data ->> 'star_rating'))::int
      ELSE NULL
    END
  ) STORED;

-- price_range (reputation.price_range or flat price_range)
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS price_range text
  GENERATED ALWAYS AS (
    COALESCE(data #>> '{reputation,price_range}', data ->> 'price_range')
  ) STORED;

-- ============================================================
-- 3. Full-text search vector (Portuguese) on key text fields
-- ============================================================
ALTER TABLE hotels
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('portuguese',
      COALESCE(name, '') || ' ' ||
      COALESCE(data ->> 'description', data #>> '{identity,description}', '') || ' ' ||
      COALESCE(data ->> 'differentials', data #>> '{reputation,differentials}', '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_hotels_search_vector
  ON hotels USING GIN (search_vector);

-- ============================================================
-- 4. Indexes on generated columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hotels_lodging_type ON hotels (lodging_type);
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON hotels (star_rating);
CREATE INDEX IF NOT EXISTS idx_hotels_price_range ON hotels (price_range);

-- ============================================================
-- 5. RLS Policies
-- ============================================================
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;

-- Service role (Stella): READ-only
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'hotels_service_read'
  ) THEN
    CREATE POLICY hotels_service_read ON hotels
      FOR SELECT
      TO service_role
      USING (true);
  END IF;
END $$;

-- Anon role: NO access
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'hotels_anon_deny'
  ) THEN
    CREATE POLICY hotels_anon_deny ON hotels
      FOR ALL
      TO anon
      USING (false);
  END IF;
END $$;

-- Admin/postgres: Full CRUD (bypass RLS by default, but explicit policy for clarity)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'hotels_admin_all'
  ) THEN
    CREATE POLICY hotels_admin_all ON hotels
      FOR ALL
      TO postgres
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Authenticated role: READ-only (for admin dashboard)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hotels' AND policyname = 'hotels_authenticated_read'
  ) THEN
    CREATE POLICY hotels_authenticated_read ON hotels
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
