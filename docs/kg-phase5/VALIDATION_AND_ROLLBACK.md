# VALIDATION_AND_ROLLBACK.md
# ELIMFILTERS — KG Phase 5: Embeddings Validation & Rollback
# Knowledge Graph Phase 5

**Date prepared:** 2026-06-01
**Branch:** claude/create-elimfilters-manuals-iFz1q

---

## 1. PRE-EXECUTION CHECKS

### pgvector Check (Required Before Track A)

```sql
-- Run on Render Shell before 002_schema_pgvector.sql
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

**Results:**
- 1 row returned → pgvector already enabled. Proceed with Track A.
- 0 rows → Attempt enablement:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

- Still 0 rows after CREATE → Track A not available on this plan.
- Proceed with Track B only. Document decision in deployment notes.

### Catalog Integrity Pre-Check

```sql
-- Verify catalog is in expected state before Phase 5
SELECT COUNT(*) AS product_count FROM elimfilters_catalog;
-- Expected: 4622

SELECT COUNT(DISTINCT technology) AS distinct_technologies FROM elimfilters_catalog;
-- Expected: 9 (NANOFORCE™, MACROCORE™, SYNTAPORE™, SYNTRAX™, INTAKCORE™, MICROKAPPA™, COOLTECH™, AQUAGUARD™, DRYCORE™)
```

---

## 2. VALIDATION CHECKLIST

### Track B — tsvector (Always Required)

```
□ search_vector column exists in elimfilters_catalog
□ GIN index idx_elimfilters_search_vector exists
□ 4622 rows have non-NULL search_vector
□ Full-text search returns relevant results for test queries
□ GIN index used in query plan (check EXPLAIN output)
```

### Track A — pgvector (Conditional)

```
□ pgvector extension verified available (pg_extension check passed)
□ kg_embeddings table exists with vector(1536) column
□ embedding column is NOT NULL
□ Total embedding count ≥ 4622 (products) + 13 (tech) + 6 (systems) + 24 (blocks)
□ No NULL embeddings in kg_embeddings
□ content_hash populated for all rows
□ All 4622 product SKUs have at least one embedding
□ IVFFlat index built after population
□ Vector similarity search returns results (L2 and cosine distance)
□ Model = 'text-embedding-3-small' for all generated embeddings
□ Staleness check query returns 0 stale products
```

---

## 3. SQL VALIDATION QUERIES

These are also in `migrations/kg-phase5/validate.sql`. Run individually during debugging:

```sql
-- TB1: search_vector column exists (Track B)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'elimfilters_catalog' AND column_name = 'search_vector';
-- Expected: 1 row with data_type = 'tsvector'

-- TB2: search_vector populated count (Track B)
SELECT COUNT(*) AS populated_count
FROM elimfilters_catalog
WHERE search_vector IS NOT NULL;
-- Expected: 4622

-- TB3: GIN index exists (Track B)
SELECT indexname FROM pg_indexes
WHERE tablename = 'elimfilters_catalog' AND indexname = 'idx_elimfilters_search_vector';
-- Expected: 1 row

-- TB4: Full-text search functional test (Track B)
SELECT sku, product_name
FROM elimfilters_catalog,
     plainto_tsquery('english', 'nanoforce hydraulic') q
WHERE search_vector @@ q
LIMIT 5;
-- Expected: rows with NANOFORCE hydraulic products

-- TA1: kg_embeddings table exists (Track A)
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'kg_embeddings';
-- Expected: 1 row

-- TA2: Total embedding count (Track A)
SELECT COUNT(*) AS total_embeddings FROM kg_embeddings;
-- Expected: ≥ 4665

-- TA3: Embedding count by entity type (Track A)
SELECT entity_type, COUNT(*) AS count
FROM kg_embeddings GROUP BY entity_type ORDER BY entity_type;
-- Expected: product=4622, technology=13, system=6, canonical_block=24

-- TA4: NULL embedding check (Track A) — must return 0
SELECT COUNT(*) AS null_embeddings
FROM kg_embeddings WHERE embedding IS NULL;
-- PASS: 0

-- TA5: NULL content_hash check (Track A) — must return 0
SELECT COUNT(*) AS null_hashes
FROM kg_embeddings WHERE content_hash IS NULL OR content_hash = '';
-- PASS: 0

-- TA6: All product SKUs have embeddings (Track A)
SELECT COUNT(*) AS products_missing_embeddings
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e ON e.entity_id = c.sku AND e.entity_type = 'product'
WHERE e.id IS NULL;
-- PASS: 0

-- TA7: Dimension check (Track A) — all embeddings are 1536-dimensional
SELECT COUNT(*) AS wrong_dimension_count
FROM kg_embeddings
WHERE vector_dims(embedding) != 1536;
-- PASS: 0

-- TA8: IVFFlat index exists (Track A) — run after index creation
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'kg_embeddings' AND indexname = 'idx_kg_emb_vector';
-- Expected: 1 row with 'ivfflat' in indexdef

-- TA9: Staleness check — stale or missing product embeddings (Track A)
SELECT COUNT(*) AS stale_product_embeddings
FROM elimfilters_catalog c
LEFT JOIN kg_embeddings e
  ON e.entity_id = c.sku AND e.entity_type = 'product' AND e.model = 'text-embedding-3-small'
WHERE e.id IS NULL
   OR e.content_hash != MD5(
        COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
        COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
      );
-- PASS: 0 (immediately after generation run)
```

---

## 4. FUNCTIONAL TESTS

### Full-Text Search Test (Track B)

```sql
-- Test 1: Search by technology name
SELECT sku, product_name, ts_rank(search_vector, q) AS rank
FROM elimfilters_catalog,
     plainto_tsquery('english', 'NANOFORCE hydraulic') q
WHERE search_vector @@ q
ORDER BY rank DESC LIMIT 5;
-- Expected: NANOFORCE hydraulic products ranked first

-- Test 2: Search by filter type
SELECT sku, product_name, filter_type
FROM elimfilters_catalog,
     plainto_tsquery('english', 'cabin air filter') q
WHERE search_vector @@ q
ORDER BY ts_rank(search_vector, q) DESC LIMIT 5;
-- Expected: cabin filter products

-- Test 3: Phrase search
SELECT COUNT(*) AS phrase_results
FROM elimfilters_catalog
WHERE search_vector @@ phraseto_tsquery('english', 'air intake');
-- Expected: > 0 results
```

### Vector Similarity Test (Track A)

```sql
-- Test: Retrieve embedding for a known entity and find nearest neighbors
-- First, get an existing embedding
SELECT embedding FROM kg_embeddings
WHERE entity_type = 'technology' AND entity_id = 'nanoforce' LIMIT 1;

-- Then find nearest products by cosine similarity
-- (Replace $1 with the actual vector returned above)
SELECT e.entity_id AS sku, c.product_name,
       1 - (e.embedding <=> (
         SELECT embedding FROM kg_embeddings
         WHERE entity_type = 'technology' AND entity_id = 'nanoforce'
       )) AS cosine_similarity
FROM kg_embeddings e
JOIN elimfilters_catalog c ON c.sku = e.entity_id
WHERE e.entity_type = 'product'
ORDER BY e.embedding <=> (
  SELECT embedding FROM kg_embeddings
  WHERE entity_type = 'technology' AND entity_id = 'nanoforce'
) LIMIT 10;
-- Expected: NANOFORCE hydraulic products ranked highest
```

---

## 5. ROLLBACK STRATEGY

### Full Track A Rollback (remove pgvector and embeddings)

```sql
-- Step 1: Remove kg_embeddings table
DROP TABLE IF EXISTS kg_embeddings CASCADE;

-- Step 2: Remove pgvector extension
-- WARNING: This removes vector type from ALL tables in the database.
-- Only run if no other tables use vector columns.
DROP EXTENSION IF EXISTS vector CASCADE;
-- Expected: DROP EXTENSION (or NOTICE if not installed)
```

**Note:** Dropping the vector extension removes the `vector` type. If any other table
has a vector column, CASCADE will drop those columns too. Verify no other vector columns
exist before dropping the extension:
```sql
SELECT table_name, column_name FROM information_schema.columns
WHERE udt_name = 'vector';
```

### Full Track B Rollback (remove tsvector column)

```sql
-- Remove search_vector column (drops GIN index automatically via CASCADE)
ALTER TABLE elimfilters_catalog DROP COLUMN IF EXISTS search_vector CASCADE;
```

**Performance impact:** Removing `search_vector` degrades full-text search performance.
The `elimfilters_catalog` table can still be queried with `ILIKE` or `~~` pattern matching,
but without GIN index these are full table scans. Acceptable for small tables (<100K rows)
but noticeable for end-user search response time.

### Partial Rollback — Remove Specific Entity Type Embeddings

```sql
-- Remove product embeddings only (keep knowledge entity embeddings)
DELETE FROM kg_embeddings WHERE entity_type = 'product';
-- Re-run: node scripts/generate-embeddings.js --entity-type=product

-- Remove only stale embeddings (partial refresh)
DELETE FROM kg_embeddings
WHERE entity_type = 'product'
  AND entity_id IN (
    SELECT c.sku
    FROM elimfilters_catalog c
    JOIN kg_embeddings e ON e.entity_id = c.sku AND e.entity_type = 'product'
    WHERE e.content_hash != MD5(
      COALESCE(c.sku,'') || '|' || COALESCE(c.product_name,'') || '|' ||
      COALESCE(c.technology,'') || '|' || COALESCE(c.filter_type,'')
    )
  );
-- Re-run: node scripts/generate-embeddings.js (staleness detection re-embeds deleted rows)

-- Reset all embeddings for a model upgrade
DELETE FROM kg_embeddings WHERE model = 'text-embedding-ada-002';
-- Set EMBEDDING_PROVIDER=openai and re-run: node scripts/generate-embeddings.js
```

---

## 6. KNOWN RISKS AND MITIGATIONS

| Risk | Detection | Rollback |
|------|-----------|---------|
| pgvector not available on Render | Pre-execution check (Section 1) | Proceed with Track B only; defer Track A |
| OPENAI_API_KEY expired or invalid | Script exits with auth error | Fix key; re-run script |
| Embedding generation interrupted mid-batch | Validate TA6: missing products > 0 | Re-run script; staleness detection fills gaps |
| Wrong model used (dimension mismatch) | Validate TA7: wrong dimension count > 0 | DELETE WHERE model='wrong-model'; re-run |
| search_vector not updated after catalog changes | Validate TB2: populated_count < 4622 | Re-run 001_schema_tsvector.sql UPDATE section |
| IVFFlat index built before population complete | Index recall degraded | DROP INDEX; rebuild after full population |
| Phase 2/3 data missing from product embeddings | Embedding content less rich | Acceptable degradation; re-run after Phase 2/3 |
