-- =============================================================================
-- KG PHASE 3 — POPULATE OEM CROSS-REFERENCES
-- File: 002_populate_oem_crossrefs.sql
-- Purpose: Extract cross-references from oem_codes JSONB column.
--          Classify as 'oem' (equipment OEM) or 'competitor' (filter brand)
--          using the COMPETITOR_BRANDS set from server.js.
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Affects elimfilters_catalog: NO (read-only)
-- Depends on: 001_schema.sql (kg_crossrefs must exist)
--
-- SECURITY: This file reads ONLY from oem_codes JSONB.
--   It does NOT reference: codigo_base, BASE, MATCHED BY
--   These are internal catalog fields and are NEVER extracted into kg_crossrefs.
--
-- FORMATS HANDLED (from OEM_JSONB_AUDIT.md):
--   Format A: [{"manufacturer":"CUMMINS","code":"3315476"}] — standard object
--   Format B: [{"manufacturer":"VOLVO","code":"466634","partNumber":"466634"}] — partNumber alias
--   Format C: ["CUMMINS | 3315476"] — legacy pipe-separated string (rare)
--   Format D: oem_codes containing filter brands post-consolidation
--             (DONALDSON, FLEETGUARD mixed in — classified to 'competitor' by COMPETITOR_BRANDS check)
-- =============================================================================

-- Pre-flight check
DO $$
DECLARE v_cr_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_cr_exists FROM pg_tables
  WHERE schemaname = 'public' AND tablename = 'kg_crossrefs';
  IF v_cr_exists = 0 THEN
    RAISE EXCEPTION '002_populate_oem_crossrefs.sql: kg_crossrefs does not exist — run 001_schema.sql first';
  END IF;
  RAISE NOTICE '002_populate_oem_crossrefs.sql starting — extracting from oem_codes JSONB';
END;
$$;


-- =============================================================================
-- MAIN EXTRACTION FROM oem_codes
-- Handles Formats A, B, C, D in a single pass
-- =============================================================================

WITH
-- ── COMPETITOR_BRANDS set (mirrors server.js COMPETITOR_BRANDS Set) ─────────
-- This is the authoritative classification list.
-- Any manufacturer matching this list → ref_type = 'competitor'
-- All others → ref_type = 'oem'
competitor_brands (brand_upper) AS (
  VALUES
    ('DONALDSON'), ('BALDWIN'), ('FLEETGUARD'), ('MANN'), ('MANN+HUMMEL'),
    ('MANN-HUMMEL'),    -- normalize → MANN+HUMMEL in brand_aliases below
    ('WIX'), ('FRAM'), ('PUROLATOR'), ('NAPA'), ('AC DELCO'), ('ACDELCO'),
    ('BOSCH'), ('MAHLE'), ('HENGST'), ('SAKURA'), ('HASTINGS'),
    ('LUBER-FINER'), ('LUBERFINER'),    -- normalize → LUBER-FINER in aliases
    ('PARKER'), ('PALL'), ('HYDAC'), ('MP FILTRI'), ('MPFILTRI'),    -- normalize → MP FILTRI
    ('UFI'), ('CHAMPION'), ('COOPERSFILTERS'), ('MOTORCRAFT'), ('KNECHT'),
    ('SOGEFI'), ('FILTRON'), ('SOFIMA'), ('FIAAM'), ('NIPPARTS'), ('STARLINE'),
    ('CHAMPION LABS'), ('CARQUEST'), ('PRONTO'), ('EUROPART'), ('DINEX'),
    ('TRUCKTEC'), ('FEBI'), ('SWAG'), ('MEYLE'), ('VALEO'), ('ELOFIC'),
    ('WABCO'), ('KNORR'), ('ALLISON'), ('ZF'),
    -- Atlas Copco and compressor brands in COMPETITOR_BRANDS (server.js includes these)
    ('ATLAS COPCO'), ('SULLAIR'), ('INGERSOLL RAND'), ('COMPAIR'),
    ('GARDNER DENVER'), ('QUINCY'), ('LEROI'), ('KOBELCO COMPRESSORS'),
    -- Oil/chemical brands
    ('DEFENSE'), ('PENNZOIL'), ('CASTROL'), ('MOBIL'), ('SHELL'), ('TOTAL'),
    -- Other brands
    ('DENSO'), ('TISCO'), ('AGCO')
),

-- ── Brand alias normalization: raw → canonical ────────────────────────────
brand_aliases (raw_upper, canonical_brand) AS (
  VALUES
    ('MANN-HUMMEL',    'MANN+HUMMEL'),
    ('MANN HUMMEL',    'MANN+HUMMEL'),
    ('ACDELCO',        'AC DELCO'),
    ('LUBERFINER',     'LUBER-FINER'),
    ('MPFILTRI',       'MP FILTRI'),
    ('COOPERSFILTERS', 'COOPERS FILTERS'),
    ('INGERSOLL-RAND', 'INGERSOLL RAND')
),

-- ── Extract from oem_codes: Formats A, B, D (object elements) ────────────
oem_objects AS (
  SELECT
    ec.sku AS product_sku,
    UPPER(TRIM(elem->>'manufacturer')) AS brand_raw,
    UPPER(TRIM(REPLACE(
      COALESCE(elem->>'code', elem->>'partNumber', ''),
      '"', ''
    ))) AS part_number_raw,
    'format_A_B_D_object' AS source_format
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.oem_codes, '[]'::jsonb)) AS elem
  WHERE ec.oem_codes IS NOT NULL
    AND jsonb_array_length(ec.oem_codes) > 0
    AND jsonb_typeof(elem) = 'object'
    AND elem->>'manufacturer' IS NOT NULL
    AND TRIM(elem->>'manufacturer') != ''
    AND (elem->>'code' IS NOT NULL OR elem->>'partNumber' IS NOT NULL)
),

-- ── Extract from oem_codes: Format C (pipe-separated string elements) ────
oem_strings AS (
  SELECT
    ec.sku AS product_sku,
    UPPER(TRIM(SPLIT_PART(elem #>> '{}', ' | ', 1))) AS brand_raw,
    UPPER(TRIM(
      -- Join all parts after the first pipe (handles edge case of part# containing ' | ')
      SUBSTRING(
        elem #>> '{}',
        LENGTH(SPLIT_PART(elem #>> '{}', ' | ', 1)) + 4  -- skip 'BRAND | '
      )
    )) AS part_number_raw,
    'format_C_pipe_string' AS source_format
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.oem_codes, '[]'::jsonb)) AS elem
  WHERE ec.oem_codes IS NOT NULL
    AND jsonb_array_length(ec.oem_codes) > 0
    AND jsonb_typeof(elem) = 'string'
    AND elem #>> '{}' LIKE '% | %'  -- only pipe-separated strings
),

-- ── Combine both extraction paths ─────────────────────────────────────────
all_raw AS (
  SELECT product_sku, brand_raw, part_number_raw, source_format FROM oem_objects
  UNION ALL
  SELECT product_sku, brand_raw, part_number_raw, source_format FROM oem_strings
),

-- ── Apply brand alias normalization ──────────────────────────────────────
brand_normalized AS (
  SELECT
    ar.product_sku,
    COALESCE(ba.canonical_brand, ar.brand_raw) AS brand_canonical,
    ar.part_number_raw,
    ar.source_format
  FROM all_raw ar
  LEFT JOIN brand_aliases ba ON ba.raw_upper = ar.brand_raw
  WHERE ar.brand_raw IS NOT NULL
    AND LENGTH(ar.brand_raw) >= 2
    AND ar.part_number_raw IS NOT NULL
    AND LENGTH(ar.part_number_raw) >= 2
    AND ar.part_number_raw != ''
),

-- ── Classify ref_type using COMPETITOR_BRANDS set ─────────────────────────
classified AS (
  SELECT
    bn.product_sku,
    bn.brand_canonical AS brand,
    bn.part_number_raw AS part_number,
    -- Classification: competitor_brands set + fallback filter pattern
    CASE
      WHEN bn.brand_canonical IN (SELECT brand_upper FROM competitor_brands)
        THEN 'competitor'
      WHEN bn.brand_canonical LIKE '%FILTER%'
        OR bn.brand_canonical LIKE '%FILTR%'
        OR bn.brand_canonical LIKE '%FILTRO%'
        THEN 'competitor'
      ELSE 'oem'
    END AS ref_type,
    bn.source_format,
    -- Notes for flagged records
    CASE
      WHEN LENGTH(bn.part_number_raw) > 80
        THEN 'part_number length >80 chars — possible data corruption'
      WHEN bn.source_format = 'format_C_pipe_string'
        THEN 'extracted from legacy pipe-separated string format'
      ELSE NULL
    END AS notes
  FROM brand_normalized bn
)

-- ── Insert into kg_crossrefs ──────────────────────────────────────────────
INSERT INTO kg_crossrefs (product_sku, ref_type, brand, part_number, notes)
SELECT DISTINCT
  product_sku,
  ref_type,
  brand,
  part_number,
  notes
FROM classified
WHERE LENGTH(part_number) BETWEEN 2 AND 150  -- safety guard on part number length
ON CONFLICT (product_sku, ref_type, brand, part_number) DO NOTHING;


-- =============================================================================
-- DIAGNOSTIC OUTPUT
-- =============================================================================

DO $$
DECLARE
  v_oem_count          INTEGER;
  v_competitor_count   INTEGER;
  v_total_inserted     INTEGER;
  v_products_with_oem  INTEGER;
  v_products_total     INTEGER;
  v_null_oem           INTEGER;
  v_format_c_notes     INTEGER;
BEGIN
  SELECT COUNT(*) FILTER (WHERE ref_type = 'oem')        INTO v_oem_count        FROM kg_crossrefs;
  SELECT COUNT(*) FILTER (WHERE ref_type = 'competitor') INTO v_competitor_count  FROM kg_crossrefs;
  SELECT COUNT(*)                                         INTO v_total_inserted    FROM kg_crossrefs;
  SELECT COUNT(DISTINCT product_sku)                      INTO v_products_with_oem FROM kg_crossrefs;
  SELECT COUNT(*)                                         INTO v_products_total    FROM elimfilters_catalog;
  SELECT COUNT(*) INTO v_null_oem FROM elimfilters_catalog
    WHERE oem_codes IS NULL OR jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) = 0;
  SELECT COUNT(*) INTO v_format_c_notes FROM kg_crossrefs
    WHERE notes LIKE '%pipe-separated%';

  RAISE NOTICE '002_populate_oem_crossrefs.sql COMPLETE';
  RAISE NOTICE '  kg_crossrefs rows inserted (oem source):   %', v_total_inserted;
  RAISE NOTICE '    ref_type=oem:         %', v_oem_count;
  RAISE NOTICE '    ref_type=competitor:  % (filter brands found in oem_codes — Format D)', v_competitor_count;
  RAISE NOTICE '  Products with at least 1 crossref:  %', v_products_with_oem;
  RAISE NOTICE '  Products with NULL/empty oem_codes: % (skipped)', v_null_oem;
  RAISE NOTICE '  Format C (pipe-string) extractions:  %', v_format_c_notes;
  RAISE NOTICE '  Expected total range: 5,000–50,000';
  IF v_total_inserted < 5000 THEN
    RAISE WARNING '  LOW ROW COUNT: % — investigate oem_codes extraction', v_total_inserted;
  END IF;
END;
$$;
