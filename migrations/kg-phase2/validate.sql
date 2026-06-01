-- =============================================================================
-- KG PHASE 2 — VALIDATION QUERIES
-- File: validate.sql
-- Purpose: Run after all Phase 2 scripts (001–004) to verify correctness
-- Run on Render Shell after executing all Phase 2 scripts
--
-- EXPECTED RANGES are documented inline.
-- All queries should return within the documented ranges for Phase 2 to pass.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION A: SCHEMA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- A1: All Phase 2 tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
ORDER BY tablename;
-- Expected: 3 rows

-- A2: Indexes created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
ORDER BY tablename, indexname;
-- Expected: minimum 6 rows (2 per table; UNIQUE constraints add additional indexes)

-- A3: UNIQUE constraints and FK constraints
SELECT
  tc.table_name,
  tc.constraint_type,
  tc.constraint_name,
  string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
GROUP BY tc.table_name, tc.constraint_type, tc.constraint_name
ORDER BY tc.table_name, tc.constraint_type;
-- Expected:
--   kg_equipment_makes:     PK(id), UNIQUE(slug)
--   kg_equipment_models:    PK(id), UNIQUE(make_id, slug), FK(make_id)
--   kg_product_equipment:   PK(id), UNIQUE(product_sku, model_id), FK(model_id)

-- A4: Triggers active
SELECT tgname, tgrelid::regclass AS table_name, tgenabled
FROM pg_trigger
WHERE tgname IN ('trg_kg_equipment_makes_updated_at', 'trg_kg_equipment_models_updated_at');
-- Expected: 2 rows, tgenabled = 'O'

-- A5: CHECK constraints on year range columns
SELECT
  tc.table_name,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'kg_equipment_models'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.constraint_name;
-- Expected: 3 rows (chk_year_range, chk_year_from_range, chk_year_to_range)


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION B: MAKE DATA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- B1: Make count (PASS range: 20–120)
SELECT COUNT(*) AS make_count FROM kg_equipment_makes;
-- Expected: BETWEEN 20 AND 120

-- B2: Slug format validation — no invalid slugs
SELECT slug AS invalid_slug
FROM kg_equipment_makes
WHERE slug !~ '^[a-z][a-z0-9-]*$';
-- Expected: 0 rows

-- B3: Duplicate slug detection (should be prevented by UNIQUE, but verify)
SELECT slug, COUNT(*) AS occurrences
FROM kg_equipment_makes
GROUP BY slug
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- B4: NULL field check
SELECT
  COUNT(*) FILTER (WHERE slug IS NULL)         AS null_slugs,
  COUNT(*) FILTER (WHERE display_name IS NULL) AS null_display_names
FROM kg_equipment_makes;
-- Expected: null_slugs = 0, null_display_names = 0

-- B5: Makes by country (distribution — informational)
SELECT
  COALESCE(country_of_origin, 'UNKNOWN') AS country,
  COUNT(*) AS make_count
FROM kg_equipment_makes
GROUP BY 1
ORDER BY 2 DESC;
-- Expected: United States, Germany, Japan as top 3

-- B6: Unmatched makes needing manual review
SELECT slug, display_name, notes
FROM kg_equipment_makes
WHERE notes LIKE '%UNMATCHED%'
   OR notes LIKE '%requires review%'
ORDER BY slug;
-- Expected: ideally 0 rows; <10 is acceptable


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION C: MODEL DATA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- C1: Model count (PASS range: 100–2,500)
SELECT COUNT(*) AS model_count FROM kg_equipment_models;
-- Expected: BETWEEN 100 AND 2,500

-- C2: Orphan models (FK violation — should be 0)
SELECT COUNT(*) AS orphan_models
FROM kg_equipment_models em
LEFT JOIN kg_equipment_makes mk ON mk.id = em.make_id
WHERE mk.id IS NULL;
-- Expected: 0

-- C3: Year range validation
SELECT
  COUNT(*) FILTER (WHERE year_from IS NOT NULL AND (year_from < 1950 OR year_from > 2030)) AS invalid_year_from,
  COUNT(*) FILTER (WHERE year_to   IS NOT NULL AND (year_to   < 1950 OR year_to   > 2030)) AS invalid_year_to,
  COUNT(*) FILTER (WHERE year_from IS NOT NULL AND year_to IS NOT NULL AND year_from > year_to) AS year_inversion
FROM kg_equipment_models;
-- Expected: 0, 0, 0

-- C4: Models per make (top 15 — informational)
SELECT
  mk.slug AS make_slug,
  mk.display_name,
  COUNT(em.id) AS model_count
FROM kg_equipment_makes mk
LEFT JOIN kg_equipment_models em ON em.make_id = mk.id
GROUP BY mk.id, mk.slug, mk.display_name
ORDER BY model_count DESC
LIMIT 15;
-- Expected: cummins, caterpillar, john-deere near top with 30–200 models each
-- Flag: any make with >300 models (possible deduplication failure)

-- C5: Makes with zero models (should not exist after successful extraction)
SELECT mk.slug, mk.display_name
FROM kg_equipment_makes mk
LEFT JOIN kg_equipment_models em ON em.make_id = mk.id
WHERE em.make_id IS NULL
ORDER BY mk.slug;
-- Expected: 0 rows
-- If rows appear: extraction failed for those makes — investigate

-- C6: Flagged models (informational)
SELECT
  COUNT(*) FILTER (WHERE notes LIKE '%plain string%')         AS plain_string_extractions,
  COUNT(*) FILTER (WHERE notes LIKE '%numeric only%')         AS numeric_only_models,
  COUNT(*) FILTER (WHERE notes LIKE '%model name empty%')     AS empty_model_names,
  COUNT(*) FILTER (WHERE notes IS NOT NULL)                   AS total_flagged
FROM kg_equipment_models;
-- Informational — no hard pass/fail. Over 200 total_flagged warrants investigation.

-- C7: Duplicate (make_id, slug) pairs — UNIQUE constraint should prevent, verify
SELECT make_id, slug, COUNT(*) AS dupes
FROM kg_equipment_models
GROUP BY make_id, slug
HAVING COUNT(*) > 1;
-- Expected: 0 rows


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION D: PRODUCT COVERAGE
-- ─────────────────────────────────────────────────────────────────────────────

-- D1: kg_product_equipment row count (PASS range: 500–8,000)
SELECT COUNT(*) AS total_product_equipment_rows FROM kg_product_equipment;
-- Expected: BETWEEN 500 AND 8,000

-- D2: Products with at least one equipment link
SELECT
  COUNT(DISTINCT product_sku) AS products_linked,
  (SELECT COUNT(*) FROM elimfilters_catalog) AS total_catalog,
  ROUND(100.0 * COUNT(DISTINCT product_sku) /
    NULLIF((SELECT COUNT(*) FROM elimfilters_catalog), 0), 1) AS coverage_pct
FROM kg_product_equipment;
-- Expected: coverage_pct BETWEEN 15.0 AND 75.0
-- If <15%: extraction failed or equipment scraper very incomplete
-- If >75%: verify no phantom SKUs inserted

-- D3: Orphan product_equipment rows (product_sku not in catalog)
SELECT COUNT(*) AS orphan_product_equipment
FROM kg_product_equipment pe
LEFT JOIN elimfilters_catalog ec ON ec.sku = pe.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0

-- D4: Products with equipment JSONB but no model link (extraction gap)
SELECT COUNT(*) AS products_with_jsonb_but_not_linked
FROM elimfilters_catalog
WHERE equipment_applications IS NOT NULL
  AND jsonb_array_length(equipment_applications) > 0
  AND sku NOT IN (SELECT DISTINCT product_sku FROM kg_product_equipment);
-- Expected: BETWEEN 0 AND 500
-- >500 suggests normalization table is missing common makes

-- D5: Top 20 most-referenced models (distribution check)
SELECT
  mk.slug AS make_slug,
  em.display_name AS model_name,
  COUNT(pe.product_sku) AS product_count
FROM kg_product_equipment pe
JOIN kg_equipment_models em ON em.id = pe.model_id
JOIN kg_equipment_makes mk ON mk.id = em.make_id
GROUP BY mk.slug, em.display_name
ORDER BY product_count DESC
LIMIT 20;
-- Expected: High-volume models (ISX 15.0L, C15, 6068, etc.) at top

-- D6: Duplicate (product_sku, model_id) pairs — UNIQUE constraint prevents, verify
SELECT product_sku, model_id, COUNT(*) AS dupes
FROM kg_product_equipment
GROUP BY product_sku, model_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION E: CONSISTENCY CHECKS
-- ─────────────────────────────────────────────────────────────────────────────

-- E1: CRITICAL — elimfilters_catalog must not be modified
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: ~4622 (same as pre-Phase 2 baseline)
-- CRITICAL: if this differs from your baseline, Phase 2 has a bug — rollback immediately

-- E2: Orphan kg_equipment_models (make_id not in kg_equipment_makes)
SELECT COUNT(*) AS orphan_model_fk_violations
FROM kg_equipment_models em
LEFT JOIN kg_equipment_makes mk ON mk.id = em.make_id
WHERE mk.id IS NULL;
-- Expected: 0

-- E3: Orphan kg_product_equipment (model_id not in kg_equipment_models)
SELECT COUNT(*) AS orphan_pe_fk_violations
FROM kg_product_equipment pe
LEFT JOIN kg_equipment_models em ON em.id = pe.model_id
WHERE em.id IS NULL;
-- Expected: 0

-- E4: Models with no product links (informational — valid for some makes)
SELECT COUNT(*) AS models_with_no_product_links
FROM kg_equipment_models em
LEFT JOIN kg_product_equipment pe ON pe.model_id = em.id
WHERE pe.model_id IS NULL;
-- Informational only. Expected: <100 (some models extracted but no products linked)
-- >200 warrants investigation of link population step

-- E5: Products with multiple model links (normal — one product fits many models)
SELECT
  product_sku,
  COUNT(*) AS models_count
FROM kg_product_equipment
GROUP BY product_sku
HAVING COUNT(*) > 1
ORDER BY models_count DESC
LIMIT 10;
-- Expected: rows present (normal — one product fits multiple models)
-- Flag: if any product links to >50 models (data quality issue)


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION F: ROW COUNT SUMMARY (final go/no-go check)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'kg_equipment_makes'         AS table_name, COUNT(*) AS row_count FROM kg_equipment_makes
UNION ALL
SELECT 'kg_equipment_models',                       COUNT(*) FROM kg_equipment_models
UNION ALL
SELECT 'kg_product_equipment',                      COUNT(*) FROM kg_product_equipment
UNION ALL
SELECT 'elimfilters_catalog (source, must match baseline)', COUNT(*) FROM elimfilters_catalog;

-- Phase 2 is COMPLETE if ALL of the following are true:
--   kg_equipment_makes row count:    20 ≤ count ≤ 120
--   kg_equipment_models row count:  100 ≤ count ≤ 2,500
--   kg_product_equipment row count: 500 ≤ count ≤ 8,000
--   elimfilters_catalog count:      unchanged from pre-Phase 2 baseline (~4622)
--
-- Additionally:
--   Section A: all tables, indexes, constraints present
--   Section C orphan checks (C2): 0
--   Section D orphan check (D3): 0
--   Section E catalog check (E1): matches baseline
