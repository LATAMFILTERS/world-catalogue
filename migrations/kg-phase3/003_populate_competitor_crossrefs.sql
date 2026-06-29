-- =============================================================================
-- KG PHASE 3 — POPULATE COMPETITOR AND BRAND CROSS-REFERENCES
-- File: 003_populate_competitor_crossrefs.sql
-- Purpose: Extract cross-references from competitor_codes and brand_crossrefs
--          JSONB columns. Insert as ref_type='competitor' and ref_type='brand'.
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Affects elimfilters_catalog: NO (read-only)
-- Depends on: 001_schema.sql (kg_crossrefs must exist)
--
-- SECURITY: This file reads ONLY from competitor_codes and brand_crossrefs JSONB.
--   It does NOT reference: codigo_base, BASE, MATCHED BY
--   These are internal catalog fields and are NEVER extracted into kg_crossrefs.
--
-- SOURCE 1: competitor_codes JSONB
--   Format A: [{"manufacturer":"BALDWIN","code":"BT292"}] — standard object
--   Format B: [{"manufacturer":"WIX","code":"51516"}] — same as A (from recover script)
--   Format C: null or [] — product not processed by recover-competitor-codes.js (skip)
--
-- SOURCE 2: brand_crossrefs JSONB
--   Format: {"DONALDSON":["P552100"],"MANN":["W940/25"]} — keyed object
--   Key = brand name (may have inconsistent casing)
--   Value = array of part number strings
-- =============================================================================

-- Pre-flight check
DO $$
DECLARE v_cr_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_cr_exists FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'kg_crossrefs';
  IF v_cr_exists = 0 THEN
    RAISE EXCEPTION '003_populate_competitor_crossrefs.sql: kg_crossrefs does not exist — run 001_schema.sql first';
  END IF;
  RAISE NOTICE '003_populate_competitor_crossrefs.sql starting — extracting from competitor_codes and brand_crossrefs JSONB';
END;
$$;


-- =============================================================================
-- STEP 1: EXTRACT FROM competitor_codes JSONB
-- All entries from competitor_codes → ref_type = 'competitor'
-- Note: competitor_codes is expected to contain ONLY filter brand cross-refs
--       (Formats A/B from recover-competitor-codes.js scraper)
-- =============================================================================

WITH
-- ── Brand alias normalization ──────────────────────────────────────────────
brand_aliases (raw_upper, canonical_brand) AS (
  VALUES
    ('MANN-HUMMEL',    'MANN+HUMMEL'),
    ('MANN HUMMEL',    'MANN+HUMMEL'),
    ('ACDELCO',        'AC DELCO'),
    ('LUBERFINER',     'LUBER-FINER'),
    ('MPFILTRI',       'MP FILTRI'),
    ('COOPERSFILTERS', 'COOPERS FILTERS'),
    ('INGERSOLL-RAND', 'INGERSOLL RAND'),
    ('CHAMPION LABS',  'CHAMPION LABS'),
    -- Common competitor_codes brands (identity mappings for documentation):
    ('DONALDSON',      'DONALDSON'),
    ('BALDWIN',        'BALDWIN'),
    ('FLEETGUARD',     'FLEETGUARD'),
    ('MANN',           'MANN'),
    ('WIX',            'WIX'),
    ('FRAM',           'FRAM'),
    ('PUROLATOR',      'PUROLATOR'),
    ('NAPA',           'NAPA'),
    ('BOSCH',          'BOSCH'),
    ('MAHLE',          'MAHLE'),
    ('HENGST',         'HENGST'),
    ('SAKURA',         'SAKURA'),
    ('HASTINGS',       'HASTINGS'),
    ('PARKER',         'PARKER'),
    ('PALL',           'PALL'),
    ('HYDAC',          'HYDAC'),
    ('UFI',            'UFI'),
    ('MOTORCRAFT',     'MOTORCRAFT'),
    ('KNECHT',         'KNECHT'),
    ('FILTRON',        'FILTRON'),
    ('CARQUEST',       'CARQUEST')
),

-- ── Extract from competitor_codes: standard object format ─────────────────
competitor_extracted AS (
  SELECT
    ec.sku AS product_sku,
    UPPER(TRIM(elem->>'manufacturer')) AS brand_raw,
    UPPER(TRIM(REPLACE(
      COALESCE(elem->>'code', elem->>'partNumber', ''),
      '"', ''
    ))) AS part_number_raw,
    'competitor_codes_source' AS source_info
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.competitor_codes, '[]'::jsonb)) AS elem
  WHERE ec.competitor_codes IS NOT NULL
    AND jsonb_array_length(ec.competitor_codes) > 0
    AND jsonb_typeof(elem) = 'object'
    AND elem->>'manufacturer' IS NOT NULL
    AND TRIM(elem->>'manufacturer') != ''
    AND (elem->>'code' IS NOT NULL OR elem->>'partNumber' IS NOT NULL)
),

-- ── Apply brand alias normalization ──────────────────────────────────────
competitor_normalized AS (
  SELECT
    ce.product_sku,
    COALESCE(ba.canonical_brand, ce.brand_raw) AS brand,
    ce.part_number_raw AS part_number,
    'competitor' AS ref_type,
    CASE
      WHEN LENGTH(ce.part_number_raw) > 80
        THEN 'part_number length >80 chars — possible data corruption'
      ELSE 'competitor_codes_source'
    END AS notes
  FROM competitor_extracted ce
  LEFT JOIN brand_aliases ba ON ba.raw_upper = ce.brand_raw
  WHERE ce.brand_raw IS NOT NULL
    AND LENGTH(ce.brand_raw) >= 2
    AND ce.part_number_raw IS NOT NULL
    AND LENGTH(ce.part_number_raw) BETWEEN 2 AND 150
    AND ce.part_number_raw != ''
)

INSERT INTO kg_crossrefs (product_sku, ref_type, brand, part_number, notes)
SELECT DISTINCT product_sku, ref_type, brand, part_number, notes
FROM competitor_normalized
ON CONFLICT (product_sku, ref_type, brand, part_number) DO NOTHING;

DO $$
DECLARE v_comp_inserted INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_comp_inserted
  FROM kg_crossrefs WHERE ref_type = 'competitor';
  RAISE NOTICE 'Step 1 (competitor_codes) complete — total competitor rows in kg_crossrefs: %', v_comp_inserted;
END;
$$;


-- =============================================================================
-- STEP 2: EXTRACT FROM brand_crossrefs JSONB
-- brand_crossrefs format: {"BRAND": ["part1", "part2"], "BRAND2": ["part3"]}
-- Key = brand name (normalize with UPPER + TRIM)
-- Value = array of part number strings
-- All entries → ref_type = 'brand'
-- =============================================================================

WITH
-- ── Brand alias normalization (same table as Step 1) ──────────────────────
brand_aliases (raw_upper, canonical_brand) AS (
  VALUES
    ('MANN-HUMMEL',    'MANN+HUMMEL'),
    ('MANN HUMMEL',    'MANN+HUMMEL'),
    ('ACDELCO',        'AC DELCO'),
    ('LUBERFINER',     'LUBER-FINER'),
    ('MPFILTRI',       'MP FILTRI'),
    ('COOPERSFILTERS', 'COOPERS FILTERS'),
    ('INGERSOLL-RAND', 'INGERSOLL RAND'),
    ('DONALDSON',      'DONALDSON'), ('BALDWIN', 'BALDWIN'), ('FLEETGUARD', 'FLEETGUARD'),
    ('MANN', 'MANN'), ('WIX', 'WIX'), ('FRAM', 'FRAM'), ('PUROLATOR', 'PUROLATOR')
),

-- ── Extract from brand_crossrefs: keyed object format ────────────────────
brand_crossrefs_extracted AS (
  SELECT
    ec.sku AS product_sku,
    UPPER(TRIM(kv.key)) AS brand_raw,
    UPPER(TRIM(REPLACE(part_val #>> '{}', '"', ''))) AS part_number_raw
  FROM elimfilters_catalog ec,
       -- jsonb_each expands the top-level object into (key, value) pairs
       jsonb_each(ec.brand_crossrefs) AS kv,
       -- jsonb_array_elements expands the brand's array of part numbers
       jsonb_array_elements(kv.value) AS part_val
  WHERE ec.brand_crossrefs IS NOT NULL
    AND ec.brand_crossrefs != '{}'::jsonb
    AND ec.brand_crossrefs::text != 'null'
    AND jsonb_typeof(ec.brand_crossrefs) = 'object'
    AND jsonb_typeof(kv.value) = 'array'     -- value must be an array
    AND part_val #>> '{}' IS NOT NULL
    AND TRIM(part_val #>> '{}') != ''
    AND TRIM(REPLACE(part_val #>> '{}', '"', '')) != ''
),

-- ── Apply brand alias normalization ──────────────────────────────────────
brand_crossrefs_normalized AS (
  SELECT
    bce.product_sku,
    COALESCE(ba.canonical_brand, bce.brand_raw) AS brand,
    bce.part_number_raw AS part_number,
    'brand' AS ref_type,
    CASE
      WHEN LENGTH(bce.part_number_raw) > 80
        THEN 'brand_crossrefs_source — part_number length >80 chars'
      ELSE 'brand_crossrefs_source'
    END AS notes
  FROM brand_crossrefs_extracted bce
  LEFT JOIN brand_aliases ba ON ba.raw_upper = bce.brand_raw
  WHERE bce.brand_raw IS NOT NULL
    AND LENGTH(bce.brand_raw) >= 2
    AND bce.part_number_raw IS NOT NULL
    AND LENGTH(bce.part_number_raw) BETWEEN 2 AND 150
    AND bce.part_number_raw != ''
)

INSERT INTO kg_crossrefs (product_sku, ref_type, brand, part_number, notes)
SELECT DISTINCT product_sku, ref_type, brand, part_number, notes
FROM brand_crossrefs_normalized
ON CONFLICT (product_sku, ref_type, brand, part_number) DO NOTHING;

DO $$
DECLARE v_brand_inserted INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_brand_inserted
  FROM kg_crossrefs WHERE ref_type = 'brand';
  RAISE NOTICE 'Step 2 (brand_crossrefs) complete — total brand rows in kg_crossrefs: %', v_brand_inserted;
END;
$$;


-- =============================================================================
-- DIAGNOSTIC OUTPUT — COMBINED SUMMARY
-- =============================================================================

DO $$
DECLARE
  v_oem_count             INTEGER;
  v_competitor_count      INTEGER;
  v_brand_count           INTEGER;
  v_total_count           INTEGER;
  v_distinct_products     INTEGER;
  v_products_total        INTEGER;
  v_null_competitor_codes INTEGER;
  v_null_brand_crossrefs  INTEGER;
BEGIN
  SELECT COUNT(*) FILTER (WHERE ref_type = 'oem')        INTO v_oem_count        FROM kg_crossrefs;
  SELECT COUNT(*) FILTER (WHERE ref_type = 'competitor') INTO v_competitor_count  FROM kg_crossrefs;
  SELECT COUNT(*) FILTER (WHERE ref_type = 'brand')      INTO v_brand_count       FROM kg_crossrefs;
  SELECT COUNT(*)                                         INTO v_total_count       FROM kg_crossrefs;
  SELECT COUNT(DISTINCT product_sku)                      INTO v_distinct_products FROM kg_crossrefs;
  SELECT COUNT(*)                                         INTO v_products_total    FROM elimfilters_catalog;

  SELECT COUNT(*) INTO v_null_competitor_codes FROM elimfilters_catalog
    WHERE competitor_codes IS NULL OR jsonb_array_length(COALESCE(competitor_codes, '[]'::jsonb)) = 0;
  SELECT COUNT(*) INTO v_null_brand_crossrefs FROM elimfilters_catalog
    WHERE brand_crossrefs IS NULL
       OR brand_crossrefs = '{}'::jsonb
       OR brand_crossrefs::text = 'null';

  RAISE NOTICE '003_populate_competitor_crossrefs.sql COMPLETE';
  RAISE NOTICE '  kg_crossrefs final state:';
  RAISE NOTICE '    ref_type=oem:          % rows (from 002 script)', v_oem_count;
  RAISE NOTICE '    ref_type=competitor:   % rows', v_competitor_count;
  RAISE NOTICE '    ref_type=brand:        % rows', v_brand_count;
  RAISE NOTICE '    TOTAL:                 % rows', v_total_count;
  RAISE NOTICE '  Distinct products covered: %  of % (%.1f%%)',
    v_distinct_products, v_products_total,
    ROUND(100.0 * v_distinct_products / NULLIF(v_products_total, 0), 1);
  RAISE NOTICE '  Products with NULL/empty competitor_codes: % (expected — scraper incomplete)', v_null_competitor_codes;
  RAISE NOTICE '  Products with NULL/empty brand_crossrefs:  % (expected — partially populated)', v_null_brand_crossrefs;
  RAISE NOTICE '  Expected total count range: 5,000–100,000';

  IF v_total_count < 5000 THEN
    RAISE WARNING '  LOW TOTAL: % rows — investigate extraction', v_total_count;
  END IF;
  IF v_competitor_count = 0 THEN
    RAISE WARNING '  ZERO competitor rows — check competitor_codes column population in catalog';
  END IF;
END;
$$;
