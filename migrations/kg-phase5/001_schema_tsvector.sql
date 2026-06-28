-- =============================================================================
-- KG PHASE 5 — TSVECTOR FULL-TEXT SEARCH (TRACK B)
-- File: 001_schema_tsvector.sql
-- Purpose: Add full-text search capability to elimfilters_catalog
-- Safe to run: YES (IF NOT EXISTS + full table UPDATE — idempotent)
-- Run: ALWAYS (both Track A and Track B)
-- Depends on: elimfilters_catalog must exist and be populated
-- Affects elimfilters_catalog: YES — adds search_vector column (safe, non-destructive)
--
-- This script runs regardless of pgvector availability.
-- It provides functional full-text search as the Track B fallback.
-- When Track A (pgvector) is also available, tsvector complements vector search.
-- =============================================================================

-- ─── STEP 1: Add search_vector column ─────────────────────────────────────────
-- Adds tsvector column to elimfilters_catalog for full-text search.
-- IF NOT EXISTS prevents errors on re-run.

ALTER TABLE elimfilters_catalog
  ADD COLUMN IF NOT EXISTS search_vector tsvector;

COMMENT ON COLUMN elimfilters_catalog.search_vector
  IS 'Full-text search vector populated from sku, product_name, technology, filter_type. '
     'Maintained manually — re-run this script section after catalog updates.';

-- ─── STEP 2: Populate search_vector ──────────────────────────────────────────
-- Weighted full-text search vector combining key product columns.
--
-- Weight assignments (PostgreSQL tsvector weights A–D):
--   A (highest) — SKU and product_name: exact product identity
--   B (high)    — technology and filter_type: system classification
--   C (medium)  — additional context columns if they exist
--
-- The COALESCE handles NULL values in any column.
-- to_tsvector('english', ...) applies English stemming (filter → filter, filters → filter).
--
-- Note: This UPDATE affects all 4,622 rows.
-- Estimated time: 5–30 seconds depending on DB load.

UPDATE elimfilters_catalog
SET search_vector = (
  setweight(to_tsvector('english', COALESCE(sku, '')),          'A') ||
  setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(technology, '')),   'B') ||
  setweight(to_tsvector('english', COALESCE(filter_type, '')),  'B')
);
-- Expected: UPDATE 4622

-- ─── STEP 3: Create GIN Index ─────────────────────────────────────────────────
-- GIN (Generalized Inverted Index) is required for performant tsvector @@ tsquery.
-- Without GIN index, tsvector search is a full sequential scan.
-- GIN is the standard index type for tsvector — faster build than GiST, faster @@ queries.

CREATE INDEX IF NOT EXISTS idx_elimfilters_search_vector
  ON elimfilters_catalog
  USING GIN(search_vector);
-- Expected: CREATE INDEX

COMMENT ON INDEX idx_elimfilters_search_vector
  IS 'GIN index for full-text search on elimfilters_catalog. '
     'Required for performant tsvector @@ tsquery operations. '
     'Rebuild after bulk catalog updates: DROP INDEX; re-run CREATE INDEX.';


-- ─── STEP 4: Verify population ────────────────────────────────────────────────
-- Verify search_vector is populated for all rows.

SELECT
  COUNT(*)                                          AS total_products,
  COUNT(*) FILTER (WHERE search_vector IS NOT NULL) AS with_search_vector,
  COUNT(*) FILTER (WHERE search_vector IS NULL)     AS missing_search_vector
FROM elimfilters_catalog;
-- Expected: total_products=4622, with_search_vector=4622, missing_search_vector=0

-- ─── STEP 5: Functional test ──────────────────────────────────────────────────
-- Quick smoke test of full-text search functionality.

SELECT sku, product_name, technology,
       ts_rank(search_vector, q) AS rank
FROM elimfilters_catalog,
     plainto_tsquery('english', 'nanoforce hydraulic') q
WHERE search_vector @@ q
ORDER BY rank DESC
LIMIT 5;
-- Expected: 5 NANOFORCE hydraulic filter products, highest rank first

-- =============================================================================
-- MAINTENANCE NOTE
-- =============================================================================
-- The search_vector column is NOT automatically updated when elimfilters_catalog rows change.
-- To refresh after catalog updates:
--
-- Option A: Full refresh (re-run UPDATE above)
--   UPDATE elimfilters_catalog
--   SET search_vector = (
--     setweight(to_tsvector('english', COALESCE(sku, '')),          'A') ||
--     setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
--     setweight(to_tsvector('english', COALESCE(technology, '')),   'B') ||
--     setweight(to_tsvector('english', COALESCE(filter_type, '')),  'B')
--   );
--
-- Option B: Add trigger for automatic maintenance (Phase 7 enhancement)
--   CREATE OR REPLACE FUNCTION update_catalog_search_vector()
--   RETURNS TRIGGER AS $$
--   BEGIN
--     NEW.search_vector := (
--       setweight(to_tsvector('english', COALESCE(NEW.sku, '')),          'A') ||
--       setweight(to_tsvector('english', COALESCE(NEW.product_name, '')), 'A') ||
--       setweight(to_tsvector('english', COALESCE(NEW.technology, '')),   'B') ||
--       setweight(to_tsvector('english', COALESCE(NEW.filter_type, '')),  'B')
--     );
--     RETURN NEW;
--   END;
--   $$ LANGUAGE plpgsql;
--
--   CREATE TRIGGER trg_catalog_search_vector
--     BEFORE INSERT OR UPDATE ON elimfilters_catalog
--     FOR EACH ROW EXECUTE FUNCTION update_catalog_search_vector();
--
-- =============================================================================
-- Expected output after successful run:
--   ALTER TABLE
--   UPDATE 4622
--   CREATE INDEX
--   (verification queries return: 4622 total, 4622 with_search_vector, 0 missing)
--   (smoke test returns 5 NANOFORCE hydraulic products)
-- =============================================================================
