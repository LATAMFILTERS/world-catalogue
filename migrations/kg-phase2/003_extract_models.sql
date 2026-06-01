-- =============================================================================
-- KG PHASE 2 — EXTRACT AND NORMALIZE EQUIPMENT MODELS
-- File: 003_extract_models.sql
-- Purpose: Extract model identifiers from equipment_applications JSONB,
--          link to kg_equipment_makes, insert into kg_equipment_models
-- Safe to run: YES (ON CONFLICT DO UPDATE merges year ranges — idempotent)
-- Affects elimfilters_catalog: NO (read-only access)
-- Depends on: 002_extract_makes.sql (kg_equipment_makes must be populated)
-- =============================================================================

-- Pre-flight check: makes must exist
DO $$
DECLARE v_make_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_make_count FROM kg_equipment_makes;
  IF v_make_count = 0 THEN
    RAISE EXCEPTION '003_extract_models.sql: kg_equipment_makes is empty — run 002_extract_makes.sql first';
  END IF;
  RAISE NOTICE '003_extract_models.sql starting — % makes available for FK lookup', v_make_count;
END;
$$;


-- =============================================================================
-- MAIN EXTRACTION
-- Handles all 4 JSONB format variants (from EQUIPMENT_NORMALIZATION_REPORT.md):
--   Format 1: {equipment, engine, year, type}
--   Format 2: {model, machine}
--   Format 3: {equipment}
--   Format 4: plain string
-- =============================================================================

WITH
-- ── Normalization alias table (same as 002, needed for make→slug resolution) ─
make_aliases (raw_upper, canonical_slug) AS (
  VALUES
    ('CUMMINS', 'cummins'), ('CUMMINS INC.', 'cummins'), ('CUMMINS INC', 'cummins'),
    ('CATERPILLAR', 'caterpillar'), ('CATERPILLAR INC.', 'caterpillar'), ('CAT', 'caterpillar'),
    ('JOHN DEERE', 'john-deere'), ('JOHNDEERE', 'john-deere'), ('JD', 'john-deere'),
    ('VOLVO', 'volvo'), ('VOLVO TRUCKS', 'volvo'), ('VOLVO PENTA', 'volvo'),
    ('KOMATSU', 'komatsu'), ('KOMATSU LTD.', 'komatsu'),
    ('KENWORTH', 'kenworth'), ('KENWORTH TRUCK', 'kenworth'),
    ('PETERBILT', 'peterbilt'), ('PETERBILT MOTORS', 'peterbilt'),
    ('FREIGHTLINER', 'freightliner'), ('FREIGHTLINER LLC', 'freightliner'),
    ('MACK', 'mack'), ('MACK TRUCKS', 'mack'),
    ('MERCEDES-BENZ', 'mercedes-benz'), ('MERCEDES BENZ', 'mercedes-benz'), ('MERCEDES', 'mercedes-benz'),
    ('LIEBHERR', 'liebherr'), ('LIEBHERR GROUP', 'liebherr'),
    ('CASE IH', 'case-ih'), ('CASE', 'case'),
    ('NEW HOLLAND', 'new-holland'), ('NEW HOLLAND AGRICULTURE', 'new-holland'),
    ('JCB', 'jcb'), ('J.C. BAMFORD', 'jcb'), ('J.C. BAMFORD EXCAVATORS', 'jcb'),
    ('HITACHI', 'hitachi'), ('HITACHI CONSTRUCTION', 'hitachi'),
    ('DOOSAN', 'doosan'), ('DOOSAN INFRACORE', 'doosan'),
    ('KOBELCO', 'kobelco'), ('KOBELCO CONSTRUCTION', 'kobelco'),
    ('HYUNDAI', 'hyundai'), ('HYUNDAI CONSTRUCTION', 'hyundai'),
    ('INTERNATIONAL', 'navistar'), ('NAVISTAR', 'navistar'), ('INTERNATIONAL HARVESTER', 'navistar'),
    ('FENDT', 'fendt'), ('CLAAS', 'claas'),
    ('MASSEY FERGUSON', 'massey-ferguson'), ('MASSEY-FERGUSON', 'massey-ferguson'), ('MF', 'massey-ferguson'),
    ('DEUTZ', 'deutz'), ('DEUTZ AG', 'deutz'), ('DEUTZ-FAHR', 'deutz-fahr'), ('SAME', 'same'),
    ('KUBOTA', 'kubota'), ('KUBOTA CORPORATION', 'kubota'),
    ('YANMAR', 'yanmar'), ('YANMAR CO.', 'yanmar'),
    ('PERKINS', 'perkins'), ('PERKINS ENGINES', 'perkins'),
    ('DETROIT', 'detroit'), ('DETROIT DIESEL', 'detroit'),
    ('ISUZU', 'isuzu'), ('ISUZU MOTORS', 'isuzu'),
    ('HINO', 'hino'), ('HINO MOTORS', 'hino'),
    ('MITSUBISHI', 'mitsubishi'), ('FORD', 'ford'), ('FORD MOTOR', 'ford'), ('FORD MOTOR COMPANY', 'ford'),
    ('MTU', 'mtu'), ('MTU FRIEDRICHSHAFEN', 'mtu'), ('BAUDOUIN', 'baudouin'),
    ('SCANIA', 'scania'), ('SCANIA AB', 'scania'),
    ('DAF', 'daf'), ('DAF TRUCKS', 'daf'), ('IVECO', 'iveco'),
    ('MAN', 'man'), ('MAN TRUCK & BUS', 'man'), ('MAN TRUCK AND BUS', 'man'),
    ('ATLAS COPCO', 'atlas-copco'), ('INGERSOLL RAND', 'ingersoll-rand'), ('INGERSOLL-RAND', 'ingersoll-rand'),
    ('GARDNER DENVER', 'gardner-denver')
),

-- ── Extract all JSONB elements with full field set ─────────────────────────
raw_elements AS (
  SELECT
    ec.sku AS product_sku,
    elem,
    jsonb_typeof(elem) AS elem_typeof,
    -- Primary equipment name (used for make+model extraction)
    CASE
      WHEN jsonb_typeof(elem) = 'string'
        THEN UPPER(TRIM(elem #>> '{}'))
      WHEN elem->>'equipment' IS NOT NULL
        THEN UPPER(TRIM(elem->>'equipment'))
      WHEN elem->>'model' IS NOT NULL
        THEN UPPER(TRIM(elem->>'model'))
      WHEN elem->>'machine' IS NOT NULL
        THEN UPPER(TRIM(elem->>'machine'))
      ELSE NULL
    END AS primary_name_upper,
    -- Engine type from type or machine field
    COALESCE(elem->>'type', elem->>'machine') AS engine_type_raw,
    -- Year range raw string
    elem->>'year' AS year_raw,
    -- Explicit model field (Format 2: useful when make is inferred from context)
    elem->>'model' AS explicit_model,
    -- Format indicator for notes
    CASE
      WHEN jsonb_typeof(elem) = 'string'           THEN 'format_4_plain_string'
      WHEN elem->>'equipment' IS NOT NULL           THEN 'format_1_or_3_equipment_field'
      WHEN elem->>'model' IS NOT NULL               THEN 'format_2_model_machine'
      ELSE 'unknown'
    END AS source_format
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.equipment_applications, '[]'::jsonb)) AS elem
  WHERE ec.equipment_applications IS NOT NULL
    AND jsonb_array_length(ec.equipment_applications) > 0
    AND elem IS NOT NULL
),

-- ── Multi-word make prefix extraction ─────────────────────────────────────
make_prefix_extract AS (
  SELECT
    product_sku,
    primary_name_upper,
    engine_type_raw,
    year_raw,
    explicit_model,
    source_format,
    -- Identify the raw make string using longest-first prefix matching
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
      ELSE SPLIT_PART(primary_name_upper, ' ', 1)
    END AS raw_make_upper
  FROM raw_elements
  WHERE primary_name_upper IS NOT NULL
    AND LENGTH(TRIM(primary_name_upper)) >= 3
),

-- ── Resolve make string to canonical slug, extract model name ──────────────
make_model_resolved AS (
  SELECT
    mpe.product_sku,
    mpe.primary_name_upper,
    mpe.raw_make_upper,
    mpe.engine_type_raw,
    mpe.year_raw,
    mpe.explicit_model,
    mpe.source_format,
    -- Resolve to canonical slug
    COALESCE(
      ma.canonical_slug,
      LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(mpe.raw_make_upper, '[^A-Z0-9]+', '-', 'g'),
        '^-|-$', '', 'g'
      ))
    ) AS make_slug,
    -- Extract model name: strip make prefix from primary_name, trim result
    TRIM(
      CASE
        -- Multi-word prefix stripping
        WHEN mpe.primary_name_upper LIKE 'INTERNATIONAL HARVESTER %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('INTERNATIONAL HARVESTER') + 2)
        WHEN mpe.primary_name_upper LIKE 'NEW HOLLAND %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('NEW HOLLAND') + 2)
        WHEN mpe.primary_name_upper LIKE 'MASSEY FERGUSON %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('MASSEY FERGUSON') + 2)
        WHEN mpe.primary_name_upper LIKE 'MASSEY-FERGUSON %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('MASSEY-FERGUSON') + 2)
        WHEN mpe.primary_name_upper LIKE 'MERCEDES-BENZ %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('MERCEDES-BENZ') + 2)
        WHEN mpe.primary_name_upper LIKE 'MERCEDES BENZ %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('MERCEDES BENZ') + 2)
        WHEN mpe.primary_name_upper LIKE 'GARDNER DENVER %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('GARDNER DENVER') + 2)
        WHEN mpe.primary_name_upper LIKE 'INGERSOLL-RAND %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('INGERSOLL-RAND') + 2)
        WHEN mpe.primary_name_upper LIKE 'INGERSOLL RAND %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('INGERSOLL RAND') + 2)
        WHEN mpe.primary_name_upper LIKE 'ATLAS COPCO %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('ATLAS COPCO') + 2)
        WHEN mpe.primary_name_upper LIKE 'DETROIT DIESEL %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('DETROIT DIESEL') + 2)
        WHEN mpe.primary_name_upper LIKE 'JOHN DEERE %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('JOHN DEERE') + 2)
        WHEN mpe.primary_name_upper LIKE 'CASE IH %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('CASE IH') + 2)
        WHEN mpe.primary_name_upper LIKE 'VOLVO TRUCKS %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('VOLVO TRUCKS') + 2)
        WHEN mpe.primary_name_upper LIKE 'HINO MOTORS %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('HINO MOTORS') + 2)
        WHEN mpe.primary_name_upper LIKE 'PERKINS ENGINES %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('PERKINS ENGINES') + 2)
        WHEN mpe.primary_name_upper LIKE 'KOMATSU LTD. %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('KOMATSU LTD.') + 2)
        WHEN mpe.primary_name_upper LIKE 'CATERPILLAR INC. %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('CATERPILLAR INC.') + 2)
        WHEN mpe.primary_name_upper LIKE 'CUMMINS INC. %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('CUMMINS INC.') + 2)
        WHEN mpe.primary_name_upper LIKE 'DEUTZ-FAHR %'
          THEN SUBSTR(mpe.primary_name_upper, LENGTH('DEUTZ-FAHR') + 2)
        -- Single-word prefix: strip first word
        ELSE SUBSTR(mpe.primary_name_upper, LENGTH(mpe.raw_make_upper) + 2)
      END
    ) AS model_name_upper,
    -- Notes accumulation
    CASE
      WHEN source_format = 'format_4_plain_string'
        THEN 'extracted from plain string — requires review'
      WHEN mpe.primary_name_upper = mpe.raw_make_upper
        THEN 'model name empty after make strip — make-only entry'
      ELSE NULL
    END AS extraction_notes
  FROM make_prefix_extract mpe
  LEFT JOIN make_aliases ma ON ma.raw_upper = mpe.raw_make_upper
),

-- ── Year range parsing ─────────────────────────────────────────────────────
parsed AS (
  SELECT
    product_sku,
    make_slug,
    model_name_upper,
    engine_type_raw,
    explicit_model,
    source_format,
    extraction_notes,
    -- year_from
    CASE
      WHEN year_raw ~ '^\d{4}-\d{4}$'
        THEN CAST(SPLIT_PART(year_raw, '-', 1) AS SMALLINT)
      WHEN year_raw ~ '^\d{4}$'
        THEN CAST(year_raw AS SMALLINT)
      ELSE NULL
    END AS year_from_raw,
    -- year_to
    CASE
      WHEN year_raw ~ '^\d{4}-\d{4}$'
        THEN CAST(SPLIT_PART(year_raw, '-', 2) AS SMALLINT)
      ELSE NULL
    END AS year_to_raw
  FROM make_model_resolved
  WHERE model_name_upper IS NOT NULL
    AND LENGTH(TRIM(model_name_upper)) >= 2
    AND model_name_upper <> ''
),

-- ── Validate year ranges and build final row set ───────────────────────────
validated AS (
  SELECT
    product_sku,
    make_slug,
    model_name_upper,
    -- Normalize display name: Title Case the model string
    INITCAP(LOWER(model_name_upper)) AS model_display_name,
    -- Slug: lowercase, non-alphanumeric → hyphen, strip edges
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(model_name_upper),
          '[^A-Z0-9]+', '-', 'g'
        ),
        '^-|-$', '', 'g'
      )
    ) AS model_slug,
    -- Validated year range (NULL out-of-range values)
    CASE
      WHEN year_from_raw BETWEEN 1950 AND 2030 THEN year_from_raw
      ELSE NULL
    END AS year_from,
    CASE
      WHEN year_to_raw BETWEEN 1950 AND 2030 THEN year_to_raw
      ELSE NULL
    END AS year_to,
    engine_type_raw,
    COALESCE(
      extraction_notes,
      -- Flag numeric-only model names
      CASE
        WHEN model_name_upper ~ '^[0-9]+$' THEN 'model name is numeric only — may be product code'
        ELSE NULL
      END
    ) AS notes
  FROM parsed
  WHERE make_slug IS NOT NULL
    AND LENGTH(make_slug) >= 2
),

-- ── Join to kg_equipment_makes to get make_id ──────────────────────────────
with_make_id AS (
  SELECT
    v.product_sku,
    km.id AS make_id,
    v.model_slug,
    v.model_display_name,
    v.year_from,
    v.year_to,
    v.engine_type_raw,
    v.notes
  FROM validated v
  JOIN kg_equipment_makes km ON km.slug = v.make_slug
  WHERE v.model_slug IS NOT NULL
    AND LENGTH(v.model_slug) >= 2
    AND v.model_slug != '-'
    AND v.model_slug != ''
),

-- ── Deduplicate by (make_id, model_slug): take best year range ─────────────
deduped_models AS (
  SELECT DISTINCT ON (make_id, model_slug)
    make_id,
    model_slug,
    model_display_name,
    MIN(year_from) OVER (PARTITION BY make_id, model_slug) AS year_from_min,
    MAX(year_to)   OVER (PARTITION BY make_id, model_slug) AS year_to_max,
    engine_type_raw,
    notes
  FROM with_make_id
  ORDER BY make_id, model_slug, year_from NULLS LAST
)

-- ── Insert models ──────────────────────────────────────────────────────────
INSERT INTO kg_equipment_models (
  make_id, slug, display_name, year_from, year_to, engine_type, notes
)
SELECT
  make_id,
  model_slug,
  model_display_name,
  -- Use min year_from, max year_to across all deduped entries
  year_from_min,
  year_to_max,
  engine_type_raw,
  notes
FROM deduped_models

ON CONFLICT (make_id, slug) DO UPDATE SET
  -- Merge year ranges on re-run (extend range if new data found)
  year_from    = LEAST(EXCLUDED.year_from, kg_equipment_models.year_from),
  year_to      = GREATEST(EXCLUDED.year_to, kg_equipment_models.year_to),
  -- Update engine_type if currently NULL and new value available
  engine_type  = COALESCE(kg_equipment_models.engine_type, EXCLUDED.engine_type),
  updated_at   = NOW();


-- =============================================================================
-- DIAGNOSTIC OUTPUT
-- =============================================================================

DO $$
DECLARE
  v_model_count     INTEGER;
  v_flagged_count   INTEGER;
  v_makes_with_models INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_model_count   FROM kg_equipment_models;
  SELECT COUNT(*) INTO v_flagged_count FROM kg_equipment_models WHERE notes IS NOT NULL;
  SELECT COUNT(DISTINCT make_id) INTO v_makes_with_models FROM kg_equipment_models;

  RAISE NOTICE '003_extract_models.sql COMPLETE';
  RAISE NOTICE '  Total models in kg_equipment_models:    %', v_model_count;
  RAISE NOTICE '  Models with extraction flags (notes):   %', v_flagged_count;
  RAISE NOTICE '  Distinct makes with at least 1 model:   %', v_makes_with_models;
  RAISE NOTICE '  Expected model count range: 100–2,500';
  IF v_model_count < 100 THEN
    RAISE WARNING '  LOW MODEL COUNT: % is below expected minimum of 100', v_model_count;
  ELSIF v_model_count > 2500 THEN
    RAISE WARNING '  HIGH MODEL COUNT: % exceeds expected max of 2,500 — review deduplication', v_model_count;
  END IF;
END;
$$;
