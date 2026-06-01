-- =============================================================================
-- KG PHASE 3 — VALIDATION QUERIES
-- File: validate.sql
-- Purpose: Run after all Phase 3 scripts (001–003) to verify correctness
-- Run on Render Shell after executing all Phase 3 scripts
--
-- EXPECTED RANGES are documented inline.
-- SECURITY: This file does NOT reference codigo_base, BASE, or MATCHED BY.
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION A: SCHEMA INTEGRITY
-- ─────────────────────────────────────────────────────────────────────────────

-- A1: Table exists
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs';
-- Expected: 1 row

-- A2: All indexes present
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs'
ORDER BY indexname;
-- Expected: minimum 4 indexes:
--   kg_crossrefs_pkey (PK)
--   idx_kg_cr_product_sku
--   idx_kg_cr_part_number
--   idx_kg_cr_brand_part
--   idx_kg_cr_ref_type
--   uq_crossref (UNIQUE constraint index)

-- A3: Constraints
SELECT
  tc.constraint_type,
  tc.constraint_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc
  ON tc.constraint_name = cc.constraint_name AND tc.constraint_schema = cc.constraint_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'kg_crossrefs'
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'CHECK')
ORDER BY tc.constraint_type;
-- Expected: PK on id, UNIQUE on (product_sku, ref_type, brand, part_number), CHECK on ref_type

-- A4: Column structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'kg_crossrefs'
ORDER BY ordinal_position;
-- Expected: 7 columns — id, product_sku, ref_type, brand, part_number, notes, created_at


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION B: OEM CROSS-REFERENCES COUNT AND SAMPLE
-- ─────────────────────────────────────────────────────────────────────────────

-- B1: OEM count (PASS range: 3,000–50,000)
SELECT COUNT(*) AS oem_count
FROM kg_crossrefs
WHERE ref_type = 'oem';
-- Expected: BETWEEN 3,000 AND 50,000
-- If 0: 002_populate_oem_crossrefs.sql failed or oem_codes column is empty
-- If <3000: oem_codes coverage is lower than expected (~70–80% of catalog expected)

-- B2: Top OEM brands (distribution check)
SELECT brand, COUNT(*) AS ref_count
FROM kg_crossrefs
WHERE ref_type = 'oem'
GROUP BY brand
ORDER BY ref_count DESC
LIMIT 20;
-- Expected: CUMMINS, CATERPILLAR, JOHN DEERE, VOLVO, KOMATSU, FORD near top
-- Any brand with >5,000 entries warrants investigation (possible duplicate data)

-- B3: NULL/empty check for OEM rows (should both be 0)
SELECT
  COUNT(*) FILTER (WHERE brand IS NULL OR brand = '')       AS null_empty_brands,
  COUNT(*) FILTER (WHERE part_number IS NULL OR part_number = '') AS null_empty_parts
FROM kg_crossrefs
WHERE ref_type = 'oem';
-- Expected: 0, 0

-- B4: Sample OEM entries (spot check)
SELECT product_sku, brand, part_number, notes
FROM kg_crossrefs
WHERE ref_type = 'oem'
ORDER BY created_at DESC
LIMIT 10;
-- Expected: reasonable part numbers (4–20 chars), uppercase, no spaces


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION C: COMPETITOR AND BRAND CROSS-REFERENCES
-- ─────────────────────────────────────────────────────────────────────────────

-- C1: Competitor count (PASS range: 1,000–30,000)
SELECT COUNT(*) AS competitor_count
FROM kg_crossrefs
WHERE ref_type = 'competitor';
-- Expected: BETWEEN 1,000 AND 30,000
-- If 0: competitor_codes column is empty for all products OR classification is wrong
-- If <1000: recovery script (recover-competitor-codes.js) may not have been run widely

-- C2: Brand count (PASS range: 0–10,000)
SELECT COUNT(*) AS brand_count
FROM kg_crossrefs
WHERE ref_type = 'brand';
-- Expected: BETWEEN 0 AND 10,000
-- 0 is valid if brand_crossrefs column is sparsely populated

-- C3: Top competitor brands
SELECT brand, COUNT(*) AS ref_count
FROM kg_crossrefs
WHERE ref_type = 'competitor'
GROUP BY brand
ORDER BY ref_count DESC
LIMIT 20;
-- Expected: DONALDSON, BALDWIN, FLEETGUARD, MANN, WIX at top

-- C4: Unexpected brands in competitor rows (classification error check)
SELECT DISTINCT brand, COUNT(*) AS count
FROM kg_crossrefs
WHERE ref_type = 'competitor'
  AND brand NOT IN (
    'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL','WIX','FRAM',
    'PUROLATOR','NAPA','AC DELCO','BOSCH','MAHLE','HENGST','SAKURA',
    'HASTINGS','LUBER-FINER','PARKER','PALL','HYDAC','MP FILTRI','UFI',
    'CHAMPION','COOPERS FILTERS','MOTORCRAFT','KNECHT','SOGEFI','FILTRON',
    'SOFIMA','FIAAM','NIPPARTS','STARLINE','CHAMPION LABS','CARQUEST',
    'PRONTO','EUROPART','DINEX','TRUCKTEC','FEBI','SWAG','MEYLE','VALEO',
    'ELOFIC','WABCO','KNORR','ALLISON','ZF','ATLAS COPCO','SULLAIR',
    'INGERSOLL RAND','COMPAIR','GARDNER DENVER','QUINCY','LEROI',
    'DEFENSE','PENNZOIL','CASTROL','MOBIL','SHELL','TOTAL','DENSO','AGCO'
  )
  AND brand NOT LIKE '%FILTER%'
  AND brand NOT LIKE '%FILTR%'
  AND brand NOT LIKE '%FILTRO%'
GROUP BY brand
ORDER BY count DESC;
-- Expected: 0 rows ideally
-- If rows appear: COMPETITOR_BRANDS set may need updating for these brands

-- C5: Top brand_crossrefs brands
SELECT brand, COUNT(*) AS ref_count
FROM kg_crossrefs
WHERE ref_type = 'brand'
GROUP BY brand
ORDER BY ref_count DESC
LIMIT 10;
-- Expected: DONALDSON, MANN, FLEETGUARD typical for brand_crossrefs entries


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION D: PART NUMBER FORMAT CHECK
-- ─────────────────────────────────────────────────────────────────────────────

-- D1: Part numbers with leading/trailing spaces (TRIM must have eliminated these)
SELECT COUNT(*) AS parts_with_spaces
FROM kg_crossrefs
WHERE part_number != TRIM(part_number);
-- Expected: 0

-- D2: Lowercase characters in part numbers (UPPER must have eliminated these)
SELECT COUNT(*) AS lowercase_parts
FROM kg_crossrefs
WHERE part_number != UPPER(part_number);
-- Expected: 0

-- D3: Part numbers too short (< 2 chars, should be filtered in extraction)
SELECT product_sku, brand, part_number, ref_type
FROM kg_crossrefs
WHERE LENGTH(part_number) < 2;
-- Expected: 0 rows

-- D4: Suspiciously long part numbers (>80 chars, possible data corruption)
SELECT COUNT(*) AS long_part_numbers,
  MAX(LENGTH(part_number)) AS max_length
FROM kg_crossrefs
WHERE LENGTH(part_number) > 80;
-- Expected: 0 rows; <10 is acceptable (flagged in notes)

-- D5: Part number format sample — spot check key brands
SELECT brand, part_number, LENGTH(part_number) AS len
FROM kg_crossrefs
WHERE brand IN ('CUMMINS', 'DONALDSON', 'MANN+HUMMEL', 'CATERPILLAR', 'JOHN DEERE')
ORDER BY brand, part_number
LIMIT 25;
-- Expected: uppercase, trimmed, 4–20 chars typical, no surrounding quotes


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION E: ORPHAN CHECK
-- ─────────────────────────────────────────────────────────────────────────────

-- E1: Orphan crossrefs (product_sku not in elimfilters_catalog)
SELECT COUNT(*) AS orphan_crossrefs
FROM kg_crossrefs cr
LEFT JOIN elimfilters_catalog ec ON ec.sku = cr.product_sku
WHERE ec.sku IS NULL;
-- Expected: 0
-- Any non-zero result indicates product_sku values were extracted from JSONB
-- that do not correspond to active catalog entries — investigate

-- E2: CRITICAL — catalog must not be modified (permanent check)
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: ~4622 (same as pre-Phase 3 baseline)
-- CRITICAL: if this changes, Phase 3 has a bug — rollback immediately

-- E3: Duplicate (product_sku, ref_type, brand, part_number) — UNIQUE prevents, verify
SELECT product_sku, ref_type, brand, part_number, COUNT(*) AS dupes
FROM kg_crossrefs
GROUP BY product_sku, ref_type, brand, part_number
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- E4: Products with oem_codes JSONB data but no OEM links in kg_crossrefs
SELECT COUNT(*) AS products_with_oem_jsonb_but_no_kg_link
FROM elimfilters_catalog
WHERE oem_codes IS NOT NULL
  AND jsonb_array_length(oem_codes) > 0
  AND sku NOT IN (
    SELECT DISTINCT product_sku FROM kg_crossrefs WHERE ref_type IN ('oem', 'competitor')
  );
-- Expected: BETWEEN 0 AND 300
-- A small gap is acceptable for malformed JSONB elements that fail parsing
-- >500 rows suggests a systematic extraction issue


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION F: SUMMARY COUNTS BY REF_TYPE
-- ─────────────────────────────────────────────────────────────────────────────

SELECT
  ref_type,
  COUNT(*) AS crossref_count,
  COUNT(DISTINCT product_sku) AS products_covered,
  COUNT(DISTINCT brand) AS distinct_brands
FROM kg_crossrefs
GROUP BY ref_type
ORDER BY crossref_count DESC;

SELECT 'kg_crossrefs total'                             AS metric, COUNT(*)                AS value FROM kg_crossrefs
UNION ALL
SELECT 'distinct products covered',                               COUNT(DISTINCT product_sku)      FROM kg_crossrefs
UNION ALL
SELECT 'distinct brands',                                         COUNT(DISTINCT brand)             FROM kg_crossrefs
UNION ALL
SELECT 'elimfilters_catalog (source, must be unchanged)',         COUNT(*)                          FROM elimfilters_catalog;

-- Phase 3 COMPLETE if ALL of the following are true:
--   kg_crossrefs total:    5,000 ≤ count ≤ 100,000
--   ref_type='oem':        3,000 ≤ count ≤ 50,000
--   ref_type='competitor': 1,000 ≤ count ≤ 30,000
--   ref_type='brand':          0 ≤ count ≤ 10,000
--   orphan_crossrefs (E1):     0
--   lowercase/space parts (D1, D2): 0
--   elimfilters_catalog: unchanged from baseline (~4622)
