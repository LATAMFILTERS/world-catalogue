-- ============================================================================
-- 003_validation_queries.sql
-- Post-migration validation suite for product catalog schema
-- ============================================================================
-- Run after 001 and 002. Each query is labeled with expected result.
-- Execute via: GET /api/migrate/product-catalog-validate?key=elim2026admin
-- or manually in Render Shell / Railway SQL console.
-- ============================================================================

-- ── V1: Schema presence ───────────────────────────────────────────────────────
-- Expected: 6 rows, one per table. All must be present.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'product_family',
    'product_model',
    'product_element',
    'model_element_compatibility',
    'alternative_group',
    'alternative_group_member'
  )
ORDER BY table_name;
-- PASS: 6 rows returned
-- FAIL: any table missing → re-run 001_product_catalog_schema.sql

-- ── V2: Row counts (seed data) ────────────────────────────────────────────────
-- Expected after 002: product_family=1, product_model=4, product_element=6,
--   model_element_compatibility=12, alternative_group=2, alternative_group_member=6
SELECT 'product_family'              AS tbl, COUNT(*) AS rows FROM product_family
UNION ALL
SELECT 'product_model',                       COUNT(*) FROM product_model
UNION ALL
SELECT 'product_element',                     COUNT(*) FROM product_element
UNION ALL
SELECT 'model_element_compatibility',         COUNT(*) FROM model_element_compatibility
UNION ALL
SELECT 'alternative_group',                   COUNT(*) FROM alternative_group
UNION ALL
SELECT 'alternative_group_member',            COUNT(*) FROM alternative_group_member
ORDER BY tbl;

-- ── V3: One baseline per alternative group ────────────────────────────────────
-- Expected: 2 rows. baseline_count = 1 for each group.
-- FAIL if baseline_count = 0 (missing baseline) or > 1 (duplicate baseline).
-- Uses LEFT JOIN so groups with zero baseline members are also detected.
SELECT
  ag.group_code,
  COUNT(agm.element_id) AS baseline_count,
  CASE
    WHEN COUNT(agm.element_id) = 1 THEN 'PASS'
    WHEN COUNT(agm.element_id) = 0 THEN 'FAIL — NO BASELINE'
    ELSE                                 'FAIL — DUPLICATE BASELINE'
  END AS status
FROM alternative_group ag
LEFT JOIN alternative_group_member agm
  ON agm.group_id = ag.id AND agm.is_baseline = TRUE
GROUP BY ag.group_code
ORDER BY ag.group_code;

-- ── V4: Compatibility class integrity ─────────────────────────────────────────
-- Expected: 0 mismatches. All model↔element pairs must share compatibility_class.
SELECT
  pm.model_code,
  pe.element_code,
  pm.compatibility_class  AS model_compat,
  pe.compatibility_class  AS element_compat,
  CASE
    WHEN pm.compatibility_class = pe.compatibility_class THEN 'PASS'
    ELSE 'FAIL — MISMATCH'
  END AS status
FROM model_element_compatibility mec
JOIN product_model  pm ON pm.id = mec.product_model_id
JOIN product_element pe ON pe.id = mec.product_element_id
ORDER BY pm.model_code, pe.element_code;
-- PASS: all rows show 'PASS'
-- FAIL: any row shows 'FAIL — MISMATCH' → data import error, investigate

-- ── V5: Element coverage per model ────────────────────────────────────────────
-- Expected: each durable model has exactly 3 elements and exactly 1 primary.
SELECT
  pm.model_code,
  pm.compatibility_class,
  COUNT(mec.product_element_id)                          AS total_elements,
  SUM(CASE WHEN mec.is_primary THEN 1 ELSE 0 END)        AS primary_count,
  CASE
    WHEN COUNT(mec.product_element_id) = 3
     AND SUM(CASE WHEN mec.is_primary THEN 1 ELSE 0 END) = 1
    THEN 'PASS'
    ELSE 'FAIL'
  END AS status
FROM product_model pm
LEFT JOIN model_element_compatibility mec ON mec.product_model_id = pm.id
WHERE pm.accepts_elements = TRUE
GROUP BY pm.model_code, pm.compatibility_class
ORDER BY pm.model_code;

-- ── V6: Orphan elements (not in any alternative group) ────────────────────────
-- Expected: 0 rows. Every element must belong to exactly one alternative group.
SELECT
  pe.element_code,
  pe.compatibility_class,
  'ORPHAN — not in any alternative group' AS status
FROM product_element pe
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
WHERE agm.element_id IS NULL;

-- ── V7: Alternative group member coverage ─────────────────────────────────────
-- Expected: HYDROCORE-2020 = 3 members, HYDROCORE-2040 = 3 members.
-- Protection levels 1, 3, 5 present in each group.
SELECT
  ag.group_code,
  COUNT(agm.element_id)                     AS member_count,
  STRING_AGG(
    CAST(agm.protection_level AS TEXT),
    ', ' ORDER BY agm.protection_level
  )                                          AS protection_levels,
  STRING_AGG(
    pe.element_code,
    ', ' ORDER BY agm.rank_in_group
  )                                          AS elements
FROM alternative_group ag
JOIN alternative_group_member agm ON agm.group_id = ag.id
JOIN product_element pe ON pe.id = agm.element_id
GROUP BY ag.group_code
ORDER BY ag.group_code;

-- ── V8: Compatibility traceability completeness ───────────────────────────────
-- Expected: 0 rows with missing traceability on CONFIRMED records.
SELECT
  pm.model_code,
  pe.element_code,
  mec.compatibility_confidence,
  mec.compatibility_source,
  CASE
    WHEN mec.compatibility_confidence = 'CONFIRMED'
     AND mec.compatibility_source IS NULL
    THEN 'FAIL — CONFIRMED without source'
    WHEN mec.compatibility_confidence = 'PENDING'
    THEN 'WARNING — PENDING: will cap Recommendation Engine confidence at LOW'
    ELSE 'PASS'
  END AS status
FROM model_element_compatibility mec
JOIN product_model  pm ON pm.id = mec.product_model_id
JOIN product_element pe ON pe.id = mec.product_element_id
WHERE mec.compatibility_confidence != 'CONFIRMED'
   OR mec.compatibility_source IS NULL
ORDER BY mec.compatibility_confidence, pm.model_code;

-- ── V9: Full join audit — housing → element → group ──────────────────────────
-- Provides complete view of the HYDROCORE/SERIES™ data structure.
-- Use for manual review after import.
SELECT
  pf.family_name,
  pm.model_code,
  pm.has_heater,
  pe.element_code,
  pe.media_grade,
  (pe.protection_spec->>'micron_nominal')::TEXT  AS micron,
  (pe.protection_spec->>'water_sep_free_pct')    AS water_sep_free,
  mec.is_primary,
  mec.compatibility_confidence,
  ag.group_code,
  agm.protection_level,
  agm.is_baseline,
  agm.operational_objective
FROM product_family pf
JOIN product_model               pm  ON pm.family_id = pf.id
JOIN model_element_compatibility mec ON mec.product_model_id = pm.id
JOIN product_element             pe  ON pe.id = mec.product_element_id
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
LEFT JOIN alternative_group        ag  ON ag.id = agm.group_id
WHERE pf.family_code = 'HYDROCORE/SERIES'
ORDER BY pm.model_code, agm.rank_in_group;

-- ── V10: FK integrity — elimfilters_sku linkage ──────────────────────────────
-- Expected (before SKU assignment): all NULL. After SKU assignment: all populated.
SELECT
  'product_model'  AS source_table,
  model_code       AS record_code,
  elimfilters_sku,
  CASE WHEN elimfilters_sku IS NULL THEN 'PENDING SKU ASSIGNMENT' ELSE 'LINKED' END AS status
FROM product_model
UNION ALL
SELECT
  'product_element',
  element_code,
  elimfilters_sku,
  CASE WHEN elimfilters_sku IS NULL THEN 'PENDING SKU ASSIGNMENT' ELSE 'LINKED' END
FROM product_element
ORDER BY source_table, record_code;
