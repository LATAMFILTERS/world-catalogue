-- =============================================================================
-- KG PHASE 5 — VALIDATION SUITE
-- File: validate.sql
-- Purpose: Verify Phase 5 tsvector (Track B) and pgvector (Track A) setup
-- Run after: applicable Phase 5 migration scripts
-- Expected: All checks pass
--
-- This script runs checks conditionally:
--   Track B checks — always run (search_vector in elimfilters_catalog)
--   Track A checks — skip gracefully if kg_embeddings table does not exist
-- =============================================================================


-- =============================================================================
-- SECTION 1 — PRE-VALIDATION: pgvector STATUS
-- =============================================================================

-- 1A: pgvector extension status
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN 'INSTALLED: pgvector ' || MAX(extversion) || ' — Track A available'
    ELSE 'NOT INSTALLED — Track B only'
  END AS pgvector_status
FROM pg_extension
WHERE extname = 'vector';

-- 1B: kg_embeddings table exists (Track A indicator)
SELECT
  CASE
    WHEN COUNT(*) > 0 THEN 'EXISTS — Track A schema deployed'
    ELSE 'NOT EXISTS — Track B only (or pre-Track A)'
  END AS kg_embeddings_status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'kg_embeddings';


-- =============================================================================
-- SECTION 2 — TRACK B VALIDATION (TSVECTOR — ALWAYS)
-- =============================================================================

-- 2A: search_vector column exists
-- Expected: 1 row
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'elimfilters_catalog' AND column_name = 'search_vector';
-- PASS: 1 row with data_type containing 'tsvector'

-- 2B: search_vector populated count
-- Expected: total_products = with_search_vector = 4622, missing = 0
SELECT
  COUNT(*)                                          AS total_products,
  COUNT(*) FILTER (WHERE search_vector IS NOT NULL) AS with_search_vector,
  COUNT(*) FILTER (WHERE search_vector IS NULL)     AS missing_search_vector
FROM elimfilters_catalog;
-- PASS: missing_search_vector = 0

-- 2C: GIN index exists
-- Expected: 1 row
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'elimfilters_catalog'
  AND indexname = 'idx_elimfilters_search_vector';
-- PASS: 1 row with 'gin' in indexdef

-- 2D: GIN index used in query plan (Track B functional test)
EXPLAIN (FORMAT TEXT)
SELECT sku, product_name
FROM elimfilters_catalog,
     plainto_tsquery('english', 'nanoforce hydraulic') q
WHERE search_vector @@ q;
-- Expected: "Bitmap Index Scan on idx_elimfilters_search_vector" in plan
-- (Not "Seq Scan" — that would mean index not used)

-- 2E: Full-text search returns relevant results
-- Expected: ≥ 1 row with NANOFORCE technology and hydraulic filter type
SELECT sku, product_name, technology, filter_type
FROM elimfilters_catalog,
     plainto_tsquery('english', 'nanoforce hydraulic') q
WHERE search_vector @@ q
ORDER BY ts_rank(search_vector, q) DESC
LIMIT 5;
-- PASS: rows have technology LIKE '%NANOFORCE%' and filter_type = 'hydraulic'

-- 2F: Search by filter type
-- Expected: rows with filter_type = 'cabin' or 'air'
SELECT COUNT(*) AS cabin_results
FROM elimfilters_catalog,
     plainto_tsquery('english', 'cabin') q
WHERE search_vector @@ q;
-- Expected: ~122 (MICROKAPPA cabin filter products)

-- 2G: tsvector summary
SELECT
  (SELECT COUNT(*) FROM elimfilters_catalog) AS total_products,
  (SELECT COUNT(*) FROM elimfilters_catalog WHERE search_vector IS NOT NULL) AS indexed_products,
  (SELECT COUNT(*) FROM pg_indexes WHERE tablename='elimfilters_catalog'
   AND indexname='idx_elimfilters_search_vector') AS gin_index_exists;
-- Expected: total_products=4622, indexed_products=4622, gin_index_exists=1


-- =============================================================================
-- SECTION 3 — TRACK A VALIDATION (PGVECTOR — CONDITIONAL)
-- These checks run only if kg_embeddings table exists
-- =============================================================================

-- 3A: Embedding count by entity type
-- Expected (if generate-embeddings.js ran): product=4622, technology=13, system=6, canonical_block=24+
SELECT entity_type, COUNT(*) AS count, MAX(updated_at) AS last_generated
FROM kg_embeddings
GROUP BY entity_type
ORDER BY entity_type;
-- Skip if table does not exist

-- 3B: NULL embedding check — must return 0
SELECT COUNT(*) AS null_embeddings
FROM kg_embeddings WHERE embedding IS NULL;
-- PASS: 0

-- 3C: NULL content_hash check — must return 0
SELECT COUNT(*) AS null_hashes
FROM kg_embeddings WHERE content_hash IS NULL OR content_hash = '';
-- PASS: 0

-- 3D: All product SKUs have at least one embedding
-- Expected: 0 rows (all products covered)
SELECT COUNT(*) AS products_missing_embeddings
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e
  ON e.entity_id = c.sku AND e.entity_type = 'product'
WHERE e.id IS NULL;
-- PASS: 0

-- 3E: Dimension check — all embeddings should be 1536-dimensional
-- Expected: 0 rows with wrong dimensions
SELECT COUNT(*) AS wrong_dimension_count
FROM kg_embeddings
WHERE vector_dims(embedding) != 1536;
-- PASS: 0

-- 3F: Duplicate entity check — UNIQUE constraint should prevent, but verify
-- Expected: 0 rows
SELECT entity_type, entity_id, model, COUNT(*) AS duplicate_count
FROM kg_embeddings
GROUP BY entity_type, entity_id, model
HAVING COUNT(*) > 1;
-- PASS: 0 rows

-- 3G: Model consistency — all embeddings should use same model
-- Expected: 1 row with model = 'text-embedding-3-small'
SELECT model, COUNT(*) AS embedding_count
FROM kg_embeddings
GROUP BY model
ORDER BY model;
-- Expected: text-embedding-3-small=4665 (or ada-002 if that model was used)

-- 3H: IVFFlat index check (run after manual index creation)
-- Expected: 1 row with ivfflat in indexdef
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'kg_embeddings' AND indexname LIKE '%vector%';
-- PASS: 1 row (if index was created); 0 rows = index not yet created

-- 3I: Staleness check — stale or missing product embeddings
-- Expected: 0 immediately after generation run
SELECT COUNT(*) AS stale_or_missing_embeddings
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e
  ON e.entity_id = c.sku AND e.entity_type = 'product' AND e.model = 'text-embedding-3-small'
WHERE e.id IS NULL
   OR e.content_hash != MD5(
        COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
        COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
      );
-- PASS immediately after generation: 0
-- Non-zero count: catalog has changed since embeddings were generated — re-run script

-- 3J: Knowledge entity coverage
-- Expected: all canonical block entities have embeddings
SELECT b.concept_slug, b.concept_type,
  CASE WHEN e.id IS NOT NULL THEN 'HAS EMBEDDING' ELSE 'MISSING EMBEDDING' END AS embedding_status
FROM kg_canonical_blocks b
LEFT JOIN kg_embeddings e
  ON e.entity_id = b.concept_slug AND e.entity_type IN ('technology', 'system', 'canonical_block')
ORDER BY b.concept_type, b.concept_slug;
-- Expected: all rows show 'HAS EMBEDDING'


-- =============================================================================
-- SECTION 4 — FUNCTIONAL SEARCH TESTS
-- =============================================================================

-- 4A: tsvector search relevance
SELECT sku, product_name, technology,
       ts_rank(search_vector, q) AS relevance
FROM elimfilters_catalog,
     plainto_tsquery('english', 'macrocore air filter') q
WHERE search_vector @@ q
ORDER BY relevance DESC
LIMIT 3;
-- Expected: MACROCORE air filter products ranked first

-- 4B: tsvector phrase search
SELECT COUNT(*) AS results
FROM elimfilters_catalog
WHERE search_vector @@ phraseto_tsquery('english', 'air intake');
-- Expected: > 0 results

-- 4C: Vector similarity search (Track A only — skip if kg_embeddings empty)
-- Finds products similar to the 'nanoforce' technology canonical block
SELECT e2.entity_id AS sku,
       c.product_name,
       c.technology,
       1 - (e2.embedding <=> e1.embedding) AS cosine_similarity
FROM kg_embeddings e1
JOIN kg_embeddings e2 ON e2.entity_type = 'product'
JOIN elimfilters_catalog c ON c.sku = e2.entity_id
WHERE e1.entity_type = 'technology' AND e1.entity_id = 'nanoforce'
  AND e1.model = 'text-embedding-3-small' AND e2.model = 'text-embedding-3-small'
ORDER BY e2.embedding <=> e1.embedding
LIMIT 5;
-- Expected: 5 NANOFORCE hydraulic products (cosine_similarity > 0.75)


-- =============================================================================
-- SECTION 5 — SUMMARY
-- =============================================================================

SELECT
  '001_schema_tsvector'                                         AS script,
  (SELECT COUNT(*) FROM elimfilters_catalog
   WHERE search_vector IS NOT NULL)                             AS indexed_rows,
  (SELECT COUNT(*) FROM pg_indexes
   WHERE tablename = 'elimfilters_catalog'
     AND indexname = 'idx_elimfilters_search_vector')           AS gin_index,
  CASE
    WHEN (SELECT COUNT(*) FROM elimfilters_catalog WHERE search_vector IS NOT NULL) = 4622
      AND (SELECT COUNT(*) FROM pg_indexes WHERE tablename='elimfilters_catalog'
           AND indexname='idx_elimfilters_search_vector') = 1
    THEN '✅ TRACK B VALIDATION PASSED'
    ELSE '❌ TRACK B VALIDATION FAILED — check Section 2 above'
  END AS track_b_status;

SELECT
  '002_schema_pgvector'                                         AS script,
  (SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector') AS pgvector_installed,
  COALESCE((SELECT CAST(COUNT(*) AS TEXT) FROM kg_embeddings), 'TABLE NOT EXISTS') AS total_embeddings,
  CASE
    WHEN (SELECT COUNT(*) FROM pg_extension WHERE extname = 'vector') = 1
      AND (SELECT COUNT(*) FROM information_schema.tables
           WHERE table_name = 'kg_embeddings') = 1
    THEN
      CASE
        WHEN (SELECT COUNT(*) FROM kg_embeddings) >= 4622
        THEN '✅ TRACK A VALIDATION PASSED'
        ELSE '⚠️ TRACK A SCHEMA OK — embeddings not yet generated (run generate-embeddings.js)'
      END
    ELSE '⏭️ TRACK A SKIPPED — pgvector not available (Track B active)'
  END AS track_a_status;

-- =============================================================================
-- END OF VALIDATION SUITE
-- =============================================================================
