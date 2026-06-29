-- =============================================================================
-- KG PHASE 5 — ROLLBACK SCRIPT
-- File: rollback.sql
-- Purpose: Remove Phase 5 objects (kg_embeddings, search_vector column)
-- Safe to run: YES (IF EXISTS prevents errors on empty DB)
-- Affects Phase 1–4 tables: NO
-- Affects elimfilters_catalog: ONLY search_vector column — NOT product data
--
-- WARNING: Removing search_vector degrades search performance.
--   Without search_vector, text search falls back to ILIKE/~~ pattern matching
--   which performs sequential scans (O(n) vs GIN O(log n)).
--   For 4,622 products, ILIKE scans are acceptable (~50ms) but non-optimal.
--
-- WARNING: Dropping vector extension removes vector type from ALL tables.
--   Verify no other tables have vector columns before DROP EXTENSION.
-- =============================================================================

-- =============================================================================
-- SECTION A — TRACK A ROLLBACK (pgvector and embeddings)
-- Use when: Track A is deployed and needs removal
-- =============================================================================

-- A1: Safety check — verify no other tables use vector columns
-- Run this BEFORE dropping extension:
SELECT table_name, column_name, udt_name
FROM information_schema.columns
WHERE udt_name = 'vector' AND table_schema = 'public';
-- Expected: only kg_embeddings.embedding
-- If other tables appear: do NOT drop extension, only drop kg_embeddings table

-- A2: Drop kg_embeddings table
-- Note: kg_embeddings has no FK references from other tables in Phase 4
-- CASCADE is safe — no dependent objects to drop
DROP TABLE IF EXISTS kg_embeddings CASCADE;
-- Expected: DROP TABLE (or NOTICE: table does not exist)

-- A3: Drop pgvector extension
-- ONLY run if A1 query above shows ONLY kg_embeddings uses vector columns.
-- CASCADE removes the vector type — safe after dropping kg_embeddings.
-- Comment this out if other tables use vector columns.
DROP EXTENSION IF EXISTS vector CASCADE;
-- Expected: DROP EXTENSION (or NOTICE: extension does not exist)

-- A4: Verify Track A rollback complete
SELECT COUNT(*) AS kg_embeddings_exists
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'kg_embeddings';
-- Expected: 0

SELECT COUNT(*) AS pgvector_installed
FROM pg_extension WHERE extname = 'vector';
-- Expected: 0


-- =============================================================================
-- SECTION B — TRACK B ROLLBACK (tsvector column)
-- Use when: search_vector column needs removal
-- NOTE: Removing search_vector degrades text search performance — document if done
-- =============================================================================

-- B1: Drop search_vector column (drops GIN index automatically via CASCADE)
-- This is safe — product data is preserved, only the derived search index removed
ALTER TABLE elimfilters_catalog DROP COLUMN IF EXISTS search_vector CASCADE;
-- Expected: ALTER TABLE (or NOTICE: column does not exist)

-- B2: Verify GIN index removed
SELECT indexname FROM pg_indexes
WHERE tablename = 'elimfilters_catalog' AND indexname = 'idx_elimfilters_search_vector';
-- Expected: 0 rows (index dropped with column)

-- B3: Verify Track B rollback complete
SELECT column_name FROM information_schema.columns
WHERE table_name = 'elimfilters_catalog' AND column_name = 'search_vector';
-- Expected: 0 rows


-- =============================================================================
-- POST-ROLLBACK VERIFICATION
-- =============================================================================

-- Verify elimfilters_catalog data unchanged
SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
-- Expected: 4622 (no product data affected by rollback)

-- Verify Phase 1–4 tables intact
SELECT table_name, (
  SELECT COUNT(*) FROM information_schema.tables t2
  WHERE t2.table_schema = 'public' AND t2.table_name = t1.table_name
) AS exists
FROM (VALUES
  ('kg_systems'), ('kg_technologies'),
  ('kg_product_systems'), ('kg_product_technologies'),
  ('kg_canonical_blocks'), ('kg_concept_links')
) AS t1(table_name);
-- Expected: all 6 Phase 1-4 tables show exists=1


-- =============================================================================
-- PARTIAL ROLLBACK OPTIONS
-- =============================================================================

-- Option A: Remove only product embeddings (keep knowledge entity embeddings)
-- DELETE FROM kg_embeddings WHERE entity_type = 'product';
-- Recovery: node scripts/generate-embeddings.js --entity-type=product

-- Option B: Remove stale embeddings for re-generation
-- DELETE FROM kg_embeddings
-- WHERE entity_type = 'product'
--   AND entity_id IN (
--     SELECT c.sku FROM elimfilters_catalog c
--     JOIN kg_embeddings e ON e.entity_id = c.sku AND e.entity_type = 'product'
--     WHERE e.content_hash != MD5(
--       COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
--       COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
--     )
--   );
-- Recovery: node scripts/generate-embeddings.js

-- Option C: Remove IVFFlat index only (for rebuild)
-- DROP INDEX IF EXISTS idx_kg_emb_vector;
-- Recovery: CREATE INDEX USING ivfflat ... (see 002_schema_pgvector.sql notes)

-- Option D: Reset for model upgrade (e.g., ada-002 to text-embedding-3-small)
-- DELETE FROM kg_embeddings WHERE model = 'text-embedding-ada-002';
-- Recovery: EMBEDDING_PROVIDER=openai node scripts/generate-embeddings.js

-- Option E: Refresh tsvector only (without dropping column)
-- UPDATE elimfilters_catalog
-- SET search_vector = (
--   setweight(to_tsvector('english', COALESCE(sku, '')),          'A') ||
--   setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
--   setweight(to_tsvector('english', COALESCE(technology, '')),   'B') ||
--   setweight(to_tsvector('english', COALESCE(filter_type, '')),  'B')
-- );
-- This refreshes search_vector without dropping and recreating the column/index


-- =============================================================================
-- RECOVERY SEQUENCE (restore Phase 5 after full rollback)
-- =============================================================================
-- 1. migrations/kg-phase5/001_schema_tsvector.sql  (Track B — always)
-- 2. Verify pgvector: SELECT extname FROM pg_extension WHERE extname = 'vector';
-- 3. If available: migrations/kg-phase5/002_schema_pgvector.sql  (Track A)
-- 4. If Track A: node scripts/generate-embeddings.js
-- 5. If Track A: CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists=100)
-- 6. migrations/kg-phase5/validate.sql  (verify)
-- Estimated recovery time: ~5 minutes (Track B) or ~10 minutes (Track A + B)
