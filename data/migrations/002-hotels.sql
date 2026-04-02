-- Migration 002: Create hotels table
-- 92 hotels (32 Elevare API + 60 manual)

CREATE TABLE IF NOT EXISTS hotels (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  region          TEXT NOT NULL CHECK (region IN ('nordeste','sudeste','sul','centro-oeste','norte')),
  experience      TEXT NOT NULL CHECK (experience IN ('praia','campo','serra','cidade')),
  destination     TEXT NOT NULL,
  municipality    TEXT NOT NULL,
  uf              CHAR(2) NOT NULL,
  has_api         BOOLEAN NOT NULL DEFAULT false,
  elevare_hotel_id TEXT UNIQUE,
  bradesco_coupon BOOLEAN NOT NULL DEFAULT false,
  pet_friendly    BOOLEAN NOT NULL DEFAULT false,
  pool_heated     BOOLEAN NOT NULL DEFAULT false,
  data            JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
