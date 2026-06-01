-- =============================================================================
-- KG PHASE 1 — VALIDATION QUERIES
-- File: validate.sql
-- Purpose: Run after all Phase 1 scripts complete to verify correctness
-- Run on Render Shell after executing 001–005 scripts
--
-- EXPECTED RESULTS are documented inline based on confirmed DB audit data.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION A: SCHEMA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- A1: All 4 Phase 1 tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
ORDER BY tablename;
-- Expected: 4 rows

-- A2: Indexes created
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
ORDER BY tablename, indexname;
-- Expected: at least 8 indexes (2 per table)

-- A3: Constraints in place
SELECT
  tc.constraint_name,
  tc.constraint_type,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
ORDER BY tc.table_name, tc.constraint_type;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION B: SEED DATA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- B1: System count and content
SELECT id, slug, name, sort_order FROM kg_systems ORDER BY sort_order;
-- Expected: 6 rows
-- Expected slugs: air-intake, fuel, hydraulic, lube-oil, cabin, compressed-air

-- B2: Technology count and system assignments
SELECT
  kt.slug,
  kt.display_name,
  kt.category,
  ks.slug AS primary_system,
  kt.logo_file
FROM kg_technologies kt
LEFT JOIN kg_systems ks ON ks.id = kt.primary_system_id
ORDER BY ks.sort_order, kt.slug;
-- Expected: 13 rows

-- B3: Technology → system assignment completeness
SELECT COUNT(*) AS technologies_without_system
FROM kg_technologies
WHERE primary_system_id IS NULL;
-- Expected: 0

-- B4: CRITICAL — Verify category corrections
SELECT slug, display_name, category,
  CASE
    WHEN slug = 'microkappa' AND category LIKE '%Cabin%' THEN '✅ CORRECT'
    WHEN slug = 'microkappa' THEN '❌ WRONG — should be Cabin Air Filtration'
    WHEN slug = 'syntrax' AND category LIKE '%Lube%' THEN '✅ CORRECT'
    WHEN slug = 'syntrax' THEN '❌ WRONG — should be Lube / Oil Filtration'
    WHEN slug = 'nanoforce' AND category LIKE '%Hydraulic%' THEN '✅ CORRECT'
    WHEN slug = 'nanoforce' THEN '❌ WRONG — should be Hydraulic Filtration'
    ELSE '✅ OK'
  END AS category_check
FROM kg_technologies
WHERE slug IN ('microkappa', 'syntrax', 'nanoforce')
ORDER BY slug;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION C: TECHNOLOGY COVERAGE VALIDATION
-- ─────────────────────────────────────────────────────────────────────────────

-- C1: Total products mapped to technologies
SELECT COUNT(DISTINCT product_sku) AS products_with_technology
FROM kg_product_technologies;
-- Expected: 4,622

-- C2: Products per technology
SELECT
  kt.slug,
  kt.display_name,
  COUNT(kpt.product_sku) AS product_count
FROM kg_technologies kt
LEFT JOIN kg_product_technologies kpt ON kpt.technology_id = kt.id
GROUP BY kt.id, kt.slug, kt.display_name
ORDER BY product_count DESC;
-- Expected:
--   nanoforce:    1,962
--   macrocore:    1,366
--   syntepore:      500
--   syntrax:        351
--   intekcore:      243
--   microkappa:     122
--   cooltech:        59
--   aquaguard:       16
--   drycore:          3
--   duratech:         0  (no products in current catalog)
--   gasultra:         0
--   marineclean:      0
--   blueclean:        0

-- C3: Products NOT mapped to any technology
SELECT COUNT(*) AS unmapped_products
FROM elimfilters_catalog ec
LEFT JOIN kg_product_technologies kpt ON kpt.product_sku = ec.sku
WHERE kpt.product_sku IS NULL;
-- Expected: 0

-- C4: Normalization verification — raw technology values that were remapped
SELECT DISTINCT
  ec.technology AS raw_value,
  kt.slug AS mapped_to_slug,
  COUNT(*) OVER (PARTITION BY ec.technology) AS count_products
FROM elimfilters_catalog ec
JOIN kg_product_technologies kpt ON kpt.product_sku = ec.sku
JOIN kg_technologies kt ON kt.id = kpt.technology_id
WHERE UPPER(REGEXP_REPLACE(ec.technology, '[™®[:space:]]', '', 'g'))
  != UPPER(kt.slug)
ORDER BY raw_value;
-- Expected:
--   SYNTAPORE™  → syntepore  (500 products)
--   INTAKCORE™  → intekcore  (243 products)
-- Any other rows = unexpected normalization, investigate


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION D: FILTER TYPE / SYSTEM COVERAGE VALIDATION
-- ─────────────────────────────────────────────────────────────────────────────

-- D1: Total products mapped to systems
SELECT COUNT(DISTINCT product_sku) AS products_with_system
FROM kg_product_systems;
-- Expected: 4,622

-- D2: Products per system
SELECT
  ks.slug AS system,
  COUNT(kps.product_sku) AS product_count
FROM kg_systems ks
LEFT JOIN kg_product_systems kps ON kps.system_id = ks.id
GROUP BY ks.id, ks.slug, ks.sort_order
ORDER BY ks.sort_order;
-- Expected:
--   air-intake:     1,609  (1,366 air + 243 air-intake)
--   fuel:             516  (500 fuel + 16 turbine)
--   hydraulic:      1,962
--   lube-oil:         410  (351 lube + 59 coolant)
--   cabin:            122
--   compressed-air:     3
--   TOTAL:          4,622

-- D3: Products NOT mapped to any system
SELECT COUNT(*) AS unmapped_products
FROM elimfilters_catalog ec
LEFT JOIN kg_product_systems kps ON kps.product_sku = ec.sku
WHERE kps.product_sku IS NULL;
-- Expected: 0

-- D4: filter_type values that did NOT map to a system
SELECT
  ec.filter_type,
  COUNT(*) AS product_count
FROM elimfilters_catalog ec
LEFT JOIN kg_product_systems kps ON kps.product_sku = ec.sku
WHERE ec.filter_type IS NOT NULL
  AND kps.product_sku IS NULL
GROUP BY ec.filter_type
ORDER BY product_count DESC;
-- Expected: 0 rows


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION E: CONSISTENCY CHECKS
-- ─────────────────────────────────────────────────────────────────────────────

-- E1: Technology ↔ System consistency
-- Each product's technology should map to the same system as its filter_type
SELECT
  kpt.product_sku,
  kt.slug    AS tech_slug,
  ks_tech.slug AS tech_primary_system,
  ks_prod.slug AS product_system
FROM kg_product_technologies kpt
JOIN kg_technologies kt ON kt.id = kpt.technology_id
JOIN kg_systems ks_tech ON ks_tech.id = kt.primary_system_id
JOIN kg_product_systems kps ON kps.product_sku = kpt.product_sku
JOIN kg_systems ks_prod ON ks_prod.id = kps.system_id
WHERE ks_tech.slug != ks_prod.slug
LIMIT 20;
-- Expected: 0 rows (tech system = product system for all products)
-- If rows appear: investigate cooltech (lube-oil) and turbine (fuel/aquaguard) assignments

-- E2: Products with multiple technology assignments (should not exist for Phase 1)
SELECT product_sku, COUNT(*) AS tech_count
FROM kg_product_technologies
GROUP BY product_sku
HAVING COUNT(*) > 1;
-- Expected: 0 rows (1:1 in current catalog)

-- E3: Products with multiple system assignments (could legitimately exist for combo products)
SELECT product_sku, COUNT(*) AS system_count
FROM kg_product_systems
GROUP BY product_sku
HAVING COUNT(*) > 1;
-- Expected: 0 rows (based on current DB structure)

-- E4: Orphan check — KG product records with no matching catalog entry
SELECT COUNT(*) AS orphan_technology_records
FROM kg_product_technologies kpt
LEFT JOIN elimfilters_catalog ec ON ec.sku = kpt.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0

SELECT COUNT(*) AS orphan_system_records
FROM kg_product_systems kps
LEFT JOIN elimfilters_catalog ec ON ec.sku = kps.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0

-- E5: Logo file consistency check
SELECT slug, logo_file,
  CASE
    WHEN logo_file IS NULL THEN '⚠️ MISSING LOGO'
    ELSE '✅ OK'
  END AS logo_status
FROM kg_technologies
ORDER BY slug;
-- Expected: all 13 rows have logo_file populated

-- E6: slug format check (should be lowercase, hyphen-separated, no special chars)
SELECT slug,
  CASE
    WHEN slug ~ '^[a-z][a-z0-9-]*$' THEN '✅ VALID'
    ELSE '❌ INVALID FORMAT'
  END AS slug_check
FROM kg_technologies
UNION ALL
SELECT slug,
  CASE
    WHEN slug ~ '^[a-z][a-z0-9-]*$' THEN '✅ VALID'
    ELSE '❌ INVALID FORMAT'
  END AS slug_check
FROM kg_systems;
-- Expected: all ✅ VALID


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION F: ROW COUNT SUMMARY (final go/no-go check)
-- ─────────────────────────────────────────────────────────────────────────────

SELECT 'kg_systems'              AS table_name, COUNT(*) AS row_count FROM kg_systems
UNION ALL
SELECT 'kg_technologies',                       COUNT(*) FROM kg_technologies
UNION ALL
SELECT 'kg_product_systems',                    COUNT(*) FROM kg_product_systems
UNION ALL
SELECT 'kg_product_technologies',               COUNT(*) FROM kg_product_technologies
UNION ALL
SELECT 'elimfilters_catalog (source)',           COUNT(*) FROM elimfilters_catalog;

-- Expected:
-- kg_systems:               6
-- kg_technologies:         13
-- kg_product_systems:   4,622
-- kg_product_technologies: 4,622
-- elimfilters_catalog:     4,622  ← source (unchanged)

-- Phase 1 is COMPLETE if:
--   kg_product_systems count   = elimfilters_catalog count (4,622)
--   kg_product_technologies count = elimfilters_catalog count (4,622)
--   Section C/D orphan queries = 0
--   Section E consistency query E1 = 0 rows
