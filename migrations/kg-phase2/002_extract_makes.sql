-- =============================================================================
-- KG PHASE 2 — EXTRACT AND NORMALIZE EQUIPMENT MAKES
-- File: 002_extract_makes.sql
-- Purpose: Extract unique equipment manufacturer names from equipment_applications
--          JSONB, normalize via embedded mapping table, insert into kg_equipment_makes
-- Safe to run: YES (ON CONFLICT DO UPDATE — idempotent)
-- Affects elimfilters_catalog: NO (read-only access)
-- Depends on: 001_schema.sql (kg_equipment_makes table must exist)
-- =============================================================================

-- =============================================================================
-- STEP 1: INSERT KNOWN MAKES FROM NORMALIZATION TABLE
-- These are the ~50 makes identified from EQUIPMENT_NORMALIZATION_REPORT.md.
-- Inserted first so JSONB extraction can resolve against them.
-- ON CONFLICT DO UPDATE allows re-running to correct display_name/metadata.
-- =============================================================================

INSERT INTO kg_equipment_makes (slug, display_name, country_of_origin, industry_type)
VALUES
  -- Tier 1: Major OEM truck/engine manufacturers
  ('cummins',          'Cummins Inc.',                     'United States', 'construction,mining,marine,power-generation,agriculture'),
  ('caterpillar',      'Caterpillar Inc.',                 'United States', 'construction,mining'),
  ('john-deere',       'John Deere',                       'United States', 'agriculture,construction'),
  ('volvo',            'Volvo',                            'Sweden',        'automotive,construction'),
  ('komatsu',          'Komatsu Ltd.',                     'Japan',         'construction,mining'),
  ('kenworth',         'Kenworth Truck Co.',               'United States', 'automotive'),
  ('peterbilt',        'Peterbilt Motors',                 'United States', 'automotive'),
  ('freightliner',     'Freightliner LLC',                 'United States', 'automotive'),
  ('mack',             'Mack Trucks',                      'United States', 'automotive'),
  ('mercedes-benz',    'Mercedes-Benz',                    'Germany',       'automotive,construction'),
  -- Tier 2: Construction & mining equipment
  ('liebherr',         'Liebherr Group',                   'Germany',       'construction,mining'),
  ('case',             'CNH Industrial / CASE',            'United States', 'agriculture,construction'),
  ('case-ih',          'Case IH Agriculture',              'United States', 'agriculture'),
  ('new-holland',      'New Holland Agriculture',          'United States', 'agriculture'),
  ('jcb',              'JCB',                              'United Kingdom','construction,agriculture'),
  ('hitachi',          'Hitachi Construction',             'Japan',         'construction,mining'),
  ('doosan',           'Doosan Infracore',                 'South Korea',   'construction,mining'),
  ('kobelco',          'Kobelco Construction',             'Japan',         'construction,mining'),
  ('hyundai',          'Hyundai Construction Equipment',   'South Korea',   'construction,mining'),
  ('navistar',         'Navistar International',           'United States', 'automotive,agriculture'),
  -- Tier 3: Agriculture equipment
  ('fendt',            'AGCO / Fendt',                     'Germany',       'agriculture'),
  ('claas',            'CLAAS KGaA mbH',                   'Germany',       'agriculture'),
  ('massey-ferguson',  'Massey Ferguson',                  'United States', 'agriculture'),
  ('deutz',            'Deutz AG',                         'Germany',       'agriculture,construction,power-generation'),
  ('deutz-fahr',       'Deutz-Fahr',                       'Germany',       'agriculture'),
  ('same',             'SAME Deutz-Fahr',                  'Italy',         'agriculture'),
  ('kubota',           'Kubota Corporation',               'Japan',         'agriculture'),
  ('yanmar',           'Yanmar Co. Ltd.',                  'Japan',         'marine,agriculture'),
  -- Tier 4: Engine manufacturers
  ('perkins',          'Perkins Engines',                  'United Kingdom','agriculture,construction,marine'),
  ('detroit',          'Detroit Diesel',                   'United States', 'automotive,marine'),
  ('isuzu',            'Isuzu Motors',                     'Japan',         'automotive,agriculture'),
  ('hino',             'Hino Motors',                      'Japan',         'automotive'),
  ('mitsubishi',       'Mitsubishi',                       'Japan',         'automotive,construction'),
  ('ford',             'Ford Motor Company',               'United States', 'automotive,agriculture'),
  -- Tier 5: Marine & European truck
  ('mtu',              'MTU Friedrichshafen',              'Germany',       'marine,power-generation'),
  ('baudouin',         'Baudouin',                         'France',        'marine'),
  ('scania',           'Scania AB',                        'Sweden',        'automotive'),
  ('daf',              'DAF Trucks',                       'Netherlands',   'automotive'),
  ('iveco',            'Iveco',                            'Italy',         'automotive'),
  ('man',              'MAN Truck & Bus',                  'Germany',       'automotive'),
  -- Additional makes from audit
  ('atlas-copco',      'Atlas Copco',                      'Sweden',        'construction,mining'),
  ('ingersoll-rand',   'Ingersoll Rand',                   'United States', 'construction,mining'),
  ('gardner-denver',   'Gardner Denver',                   'United States', 'construction,mining')
ON CONFLICT (slug) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  country_of_origin = EXCLUDED.country_of_origin,
  industry_type     = EXCLUDED.industry_type,
  updated_at        = NOW();

DO $$
DECLARE
  v_seed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_seed_count FROM kg_equipment_makes;
  RAISE NOTICE '002_extract_makes.sql — seed step: % known makes inserted/updated', v_seed_count;
END;
$$;


-- =============================================================================
-- STEP 2: EXTRACT MAKES FROM JSONB (discover additional makes not in seed table)
-- Handles all 4 JSONB format variants.
-- Multi-word prefix matching using CASE WHEN chains (longest prefix first).
-- Unknown makes inserted with auto-generated slug and flagged in notes.
-- =============================================================================

WITH
-- ── Normalization alias table: raw_upper → canonical slug ──────────────────
make_aliases (raw_upper, canonical_slug) AS (
  VALUES
    -- Cummins variants
    ('CUMMINS',                   'cummins'),
    ('CUMMINS INC.',              'cummins'),
    ('CUMMINS INC',               'cummins'),
    -- Caterpillar variants
    ('CATERPILLAR',               'caterpillar'),
    ('CATERPILLAR INC.',          'caterpillar'),
    ('CAT',                       'caterpillar'),
    -- John Deere variants
    ('JOHN DEERE',                'john-deere'),
    ('JOHNDEERE',                 'john-deere'),
    ('JD',                        'john-deere'),
    -- Volvo variants
    ('VOLVO',                     'volvo'),
    ('VOLVO TRUCKS',              'volvo'),
    ('VOLVO PENTA',               'volvo'),
    -- Komatsu variants
    ('KOMATSU',                   'komatsu'),
    ('KOMATSU LTD.',              'komatsu'),
    -- Kenworth variants
    ('KENWORTH',                  'kenworth'),
    ('KENWORTH TRUCK',            'kenworth'),
    -- Peterbilt variants
    ('PETERBILT',                 'peterbilt'),
    ('PETERBILT MOTORS',          'peterbilt'),
    -- Freightliner variants
    ('FREIGHTLINER',              'freightliner'),
    ('FREIGHTLINER LLC',          'freightliner'),
    -- Mack variants
    ('MACK',                      'mack'),
    ('MACK TRUCKS',               'mack'),
    -- Mercedes variants
    ('MERCEDES-BENZ',             'mercedes-benz'),
    ('MERCEDES BENZ',             'mercedes-benz'),
    ('MERCEDES',                  'mercedes-benz'),
    -- Liebherr variants
    ('LIEBHERR',                  'liebherr'),
    ('LIEBHERR GROUP',            'liebherr'),
    -- Case variants
    ('CASE IH',                   'case-ih'),
    ('CASE',                      'case'),
    -- New Holland variants
    ('NEW HOLLAND',               'new-holland'),
    ('NEW HOLLAND AGRICULTURE',   'new-holland'),
    -- JCB variants
    ('JCB',                       'jcb'),
    ('J.C. BAMFORD',              'jcb'),
    ('J.C. BAMFORD EXCAVATORS',   'jcb'),
    -- Hitachi variants
    ('HITACHI',                   'hitachi'),
    ('HITACHI CONSTRUCTION',      'hitachi'),
    -- Doosan variants
    ('DOOSAN',                    'doosan'),
    ('DOOSAN INFRACORE',          'doosan'),
    -- Kobelco variants
    ('KOBELCO',                   'kobelco'),
    ('KOBELCO CONSTRUCTION',      'kobelco'),
    -- Hyundai variants
    ('HYUNDAI',                   'hyundai'),
    ('HYUNDAI CONSTRUCTION',      'hyundai'),
    -- Navistar / International variants
    ('INTERNATIONAL',             'navistar'),
    ('NAVISTAR',                  'navistar'),
    ('INTERNATIONAL HARVESTER',   'navistar'),
    -- Agriculture Tier 3
    ('FENDT',                     'fendt'),
    ('CLAAS',                     'claas'),
    ('MASSEY FERGUSON',           'massey-ferguson'),
    ('MASSEY-FERGUSON',           'massey-ferguson'),
    ('MF',                        'massey-ferguson'),
    ('DEUTZ',                     'deutz'),
    ('DEUTZ AG',                  'deutz'),
    ('DEUTZ-FAHR',                'deutz-fahr'),
    ('SAME',                      'same'),
    ('KUBOTA',                    'kubota'),
    ('KUBOTA CORPORATION',        'kubota'),
    ('YANMAR',                    'yanmar'),
    ('YANMAR CO.',                'yanmar'),
    -- Engine manufacturers
    ('PERKINS',                   'perkins'),
    ('PERKINS ENGINES',           'perkins'),
    ('DETROIT',                   'detroit'),
    ('DETROIT DIESEL',            'detroit'),
    ('ISUZU',                     'isuzu'),
    ('ISUZU MOTORS',              'isuzu'),
    ('HINO',                      'hino'),
    ('HINO MOTORS',               'hino'),
    ('MITSUBISHI',                'mitsubishi'),
    ('FORD',                      'ford'),
    ('FORD MOTOR',                'ford'),
    ('FORD MOTOR COMPANY',        'ford'),
    -- Marine & European truck
    ('MTU',                       'mtu'),
    ('MTU FRIEDRICHSHAFEN',       'mtu'),
    ('BAUDOUIN',                  'baudouin'),
    ('SCANIA',                    'scania'),
    ('SCANIA AB',                 'scania'),
    ('DAF',                       'daf'),
    ('DAF TRUCKS',                'daf'),
    ('IVECO',                     'iveco'),
    ('MAN',                       'man'),
    ('MAN TRUCK & BUS',           'man'),
    ('MAN TRUCK AND BUS',         'man'),
    -- Industrial equipment
    ('ATLAS COPCO',               'atlas-copco'),
    ('INGERSOLL RAND',            'ingersoll-rand'),
    ('INGERSOLL-RAND',            'ingersoll-rand'),
    ('GARDNER DENVER',            'gardner-denver')
),

-- ── Extract all JSONB array elements with format dispatch ──────────────────
raw_elements AS (
  SELECT
    ec.sku,
    elem,
    jsonb_typeof(elem) AS elem_typeof,
    -- Primary name: equipment field > model field > machine field > plain string
    CASE
      WHEN jsonb_typeof(elem) = 'string'
        THEN UPPER(TRIM(elem #>> '{}'))           -- Format 4: plain string
      WHEN elem->>'equipment' IS NOT NULL
        THEN UPPER(TRIM(elem->>'equipment'))      -- Format 1 or 3
      WHEN elem->>'model' IS NOT NULL
        THEN UPPER(TRIM(elem->>'model'))          -- Format 2 (model only)
      WHEN elem->>'machine' IS NOT NULL
        THEN UPPER(TRIM(elem->>'machine'))        -- machine-only fallback
      ELSE NULL
    END AS primary_name_upper
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.equipment_applications, '[]'::jsonb)) AS elem
  WHERE ec.equipment_applications IS NOT NULL
    AND jsonb_array_length(ec.equipment_applications) > 0
),

-- ── Extract make string using multi-word prefix matching (longest first) ───
make_extraction AS (
  SELECT
    sku,
    primary_name_upper,
    elem_typeof,
    -- Multi-word prefix matching in length-descending order
    CASE
      WHEN primary_name_upper LIKE 'INTERNATIONAL HARVESTER%' THEN 'INTERNATIONAL HARVESTER'
      WHEN primary_name_upper LIKE 'NEW HOLLAND%'             THEN 'NEW HOLLAND'
      WHEN primary_name_upper LIKE 'MASSEY FERGUSON%'         THEN 'MASSEY FERGUSON'
      WHEN primary_name_upper LIKE 'MASSEY-FERGUSON%'         THEN 'MASSEY-FERGUSON'
      WHEN primary_name_upper LIKE 'MERCEDES-BENZ%'           THEN 'MERCEDES-BENZ'
      WHEN primary_name_upper LIKE 'MERCEDES BENZ%'           THEN 'MERCEDES BENZ'
      WHEN primary_name_upper LIKE 'GARDNER DENVER%'          THEN 'GARDNER DENVER'
      WHEN primary_name_upper LIKE 'INGERSOLL-RAND%'          THEN 'INGERSOLL-RAND'
      WHEN primary_name_upper LIKE 'INGERSOLL RAND%'          THEN 'INGERSOLL RAND'
      WHEN primary_name_upper LIKE 'ATLAS COPCO%'             THEN 'ATLAS COPCO'
      WHEN primary_name_upper LIKE 'DETROIT DIESEL%'          THEN 'DETROIT DIESEL'
      WHEN primary_name_upper LIKE 'JOHN DEERE%'              THEN 'JOHN DEERE'
      WHEN primary_name_upper LIKE 'CASE IH%'                 THEN 'CASE IH'
      WHEN primary_name_upper LIKE 'MAN TRUCK%'               THEN 'MAN TRUCK & BUS'
      WHEN primary_name_upper LIKE 'DAF TRUCKS%'              THEN 'DAF TRUCKS'
      WHEN primary_name_upper LIKE 'VOLVO TRUCKS%'            THEN 'VOLVO TRUCKS'
      WHEN primary_name_upper LIKE 'HINO MOTORS%'             THEN 'HINO MOTORS'
      WHEN primary_name_upper LIKE 'PERKINS ENGINES%'         THEN 'PERKINS ENGINES'
      WHEN primary_name_upper LIKE 'KOMATSU LTD%'             THEN 'KOMATSU LTD.'
      WHEN primary_name_upper LIKE 'CATERPILLAR INC%'         THEN 'CATERPILLAR INC.'
      WHEN primary_name_upper LIKE 'CUMMINS INC%'             THEN 'CUMMINS INC.'
      WHEN primary_name_upper LIKE 'DEUTZ-FAHR%'              THEN 'DEUTZ-FAHR'
      -- Single-word prefix fallback
      ELSE SPLIT_PART(primary_name_upper, ' ', 1)
    END AS raw_make_upper
  FROM raw_elements
  WHERE primary_name_upper IS NOT NULL
    AND LENGTH(TRIM(primary_name_upper)) >= 3
),

-- ── Resolve raw make to canonical slug via alias table ─────────────────────
make_resolved AS (
  SELECT
    me.sku,
    me.primary_name_upper,
    me.raw_make_upper,
    me.elem_typeof,
    ma.canonical_slug,
    -- Auto-generate slug for unmatched makes
    CASE
      WHEN ma.canonical_slug IS NOT NULL
        THEN ma.canonical_slug
      ELSE
        LOWER(REGEXP_REPLACE(
          REGEXP_REPLACE(me.raw_make_upper, '[^A-Z0-9]+', '-', 'g'),
          '^-|-$', '', 'g'
        ))
    END AS resolved_slug,
    -- Flag unmatched makes for manual review
    CASE
      WHEN ma.canonical_slug IS NULL
        THEN 'UNMATCHED MAKE — auto-slug generated, requires manual review'
      ELSE NULL
    END AS extraction_notes
  FROM make_extraction me
  LEFT JOIN make_aliases ma ON ma.raw_upper = me.raw_make_upper
  WHERE me.raw_make_upper IS NOT NULL
    AND LENGTH(TRIM(me.raw_make_upper)) >= 2
),

-- ── Deduplicate: one row per resolved slug ──────────────────────────────────
deduped_makes AS (
  SELECT DISTINCT ON (resolved_slug)
    resolved_slug,
    raw_make_upper,
    extraction_notes,
    -- Prefer matched makes over auto-generated ones for display_name
    CASE
      WHEN extraction_notes IS NULL
        THEN INITCAP(LOWER(raw_make_upper))     -- normalize case for display
      ELSE raw_make_upper                       -- keep as-is for manual review
    END AS auto_display_name
  FROM make_resolved
  ORDER BY resolved_slug, extraction_notes NULLS FIRST  -- prefer matched over unmatched
)

-- ── Insert: skip makes already inserted in Step 1 (seed table) ────────────
INSERT INTO kg_equipment_makes (slug, display_name, notes)
SELECT
  dm.resolved_slug,
  dm.auto_display_name,
  dm.extraction_notes
FROM deduped_makes dm
WHERE dm.resolved_slug NOT IN (SELECT slug FROM kg_equipment_makes)  -- skip already-seeded
  AND LENGTH(dm.resolved_slug) >= 2
ON CONFLICT (slug) DO UPDATE SET
  -- Only update notes for newly-discovered unmatched makes
  notes      = COALESCE(EXCLUDED.notes, kg_equipment_makes.notes),
  updated_at = NOW();


-- =============================================================================
-- DIAGNOSTIC OUTPUT
-- =============================================================================

DO $$
DECLARE
  v_total_makes     INTEGER;
  v_seeded_makes    INTEGER;
  v_unmatched_makes INTEGER;
  v_products_with_eq INTEGER;
  v_products_total   INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_makes     FROM kg_equipment_makes;
  SELECT COUNT(*) INTO v_unmatched_makes FROM kg_equipment_makes WHERE notes LIKE '%UNMATCHED%';
  SELECT COUNT(*) INTO v_products_with_eq
    FROM elimfilters_catalog
    WHERE equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0;
  SELECT COUNT(*) INTO v_products_total FROM elimfilters_catalog;

  v_seeded_makes := v_total_makes - v_unmatched_makes;

  RAISE NOTICE '002_extract_makes.sql COMPLETE';
  RAISE NOTICE '  Total makes in kg_equipment_makes:   %', v_total_makes;
  RAISE NOTICE '  Known/seeded makes:                  %', v_seeded_makes;
  RAISE NOTICE '  Unmatched (auto-generated) makes:    % -- manual review required', v_unmatched_makes;
  RAISE NOTICE '  Products with equipment_applications: % of % (%.1f%%)',
    v_products_with_eq, v_products_total,
    ROUND(100.0 * v_products_with_eq / NULLIF(v_products_total, 0), 1);
  RAISE NOTICE '  Expected make count range: 20–120';
  IF v_total_makes < 20 THEN
    RAISE WARNING '  LOW MAKE COUNT: % is below expected minimum of 20 — investigate', v_total_makes;
  ELSIF v_total_makes > 120 THEN
    RAISE WARNING '  HIGH MAKE COUNT: % is above expected maximum of 120 — review unmatched', v_total_makes;
  END IF;
END;
$$;
