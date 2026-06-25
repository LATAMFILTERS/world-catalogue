-- Migration 013: Drop ux_catalog_codigo_base unique constraint for LD compatibility
--
-- Problem: UNIQUE(codigo_base) was created when only HD products existed.
-- HD products have no overlap in codigo_base across filter types (different
-- numeric ranges per type). But LD (Mann) products can share the last-4-digit
-- suffix across filter types (e.g. Oil Filter '1210' and Fuel Filter '1210'
-- both produce codigo_base='1210', colliding on this constraint).
--
-- Fix: Drop the unique index. SKU uniqueness (sku = prefix + codigo_base) is
-- already enforced by the primary key / ON CONFLICT (sku) in the catalog table.
-- codigo_base is a secondary identifier for lookups, not a uniqueness guarantee.
--
-- Run on Render Shell:
--   psql $DATABASE_URL -f scripts/migrations/013_drop_codigo_base_unique_for_ld.sql

DROP INDEX IF EXISTS ux_catalog_codigo_base;

-- Add a non-unique index for codigo_base lookups (performance, not uniqueness)
CREATE INDEX IF NOT EXISTS idx_catalog_codigo_base
  ON elimfilters_catalog(codigo_base);
