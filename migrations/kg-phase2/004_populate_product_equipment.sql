-- =============================================================================
-- KG PHASE 2 — POPULATE PRODUCT-EQUIPMENT LINKS
-- File: 004_populate_product_equipment.sql
-- Purpose: Map elimfilters_catalog products to kg_equipment_models by
--          re-parsing equipment_applications JSONB and resolving to model IDs
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Affects elimfilters_catalog: NO (read-only access)
-- Depends on: 003_extract_models.sql (kg_equipment_models must be populated)
-- =============================================================================

-- Pre-flight check: models must exist before linking products
DO $$
DECLARE v_model_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_model_count FROM kg_equipment_models;
  IF v_model_count = 0 THEN
    RAISE EXCEPTION '004_populate_product_equipment.sql: kg_equipment_models is empty — run 003_extract_models.sql first';
  END IF;
  RAISE NOTICE '004_populate_product_equipment.sql starting — % models available for lookup', v_model_count;
END;
$$;


-- =============================================================================
-- MAIN POPULATION
-- Parse JSONB → derive make_slug + model_slug → JOIN to kg_equipment_models
-- ON CONFLICT DO NOTHING: if a link already exists, skip it (idempotent)
-- =============================================================================

WITH
-- ── Normalization alias table (same as 002 and 003) ─────────────────────────
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

-- ── Extract all JSONB elements ───────────────────────────────────────────────
raw_elements AS (
  SELECT
    ec.sku AS product_sku,
    elem,
    jsonb_typeof(elem) AS elem_typeof,
    CASE
      WHEN jsonb_typeof(elem) = 'string'    THEN UPPER(TRIM(elem #>> '{}'))
      WHEN elem->>'equipment' IS NOT NULL   THEN UPPER(TRIM(elem->>'equipment'))
      WHEN elem->>'model' IS NOT NULL       THEN UPPER(TRIM(elem->>'model'))
      WHEN elem->>'machine' IS NOT NULL     THEN UPPER(TRIM(elem->>'machine'))
      ELSE NULL
    END AS primary_name_upper,
    CASE
      WHEN jsonb_typeof(elem) = 'string'    THEN 'format_4_plain_string'
      WHEN elem->>'equipment' IS NOT NULL   THEN 'format_1_or_3_equipment_field'
      WHEN elem->>'model' IS NOT NULL       THEN 'format_2_model_machine'
      ELSE 'unknown'
    END AS source_format
  FROM elimfilters_catalog ec,
       jsonb_array_elements(COALESCE(ec.equipment_applications, '[]'::jsonb)) AS elem
  WHERE ec.equipment_applications IS NOT NULL
    AND jsonb_array_length(ec.equipment_applications) > 0
    AND elem IS NOT NULL
),

-- ── Multi-word make prefix + model name extraction ───────────────────────────
make_model_extracted AS (
  SELECT
    product_sku,
    primary_name_upper,
    source_format,
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

-- ── Resolve make slug, compute model slug ────────────────────────────────────
resolved AS (
  SELECT
    mme.product_sku,
    COALESCE(ma.canonical_slug,
      LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(mme.raw_make_upper, '[^A-Z0-9]+', '-', 'g'),
        '^-|-$', '', 'g'
      ))
    ) AS make_slug,
    -- Model slug from remainder after prefix strip
    LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          TRIM(
            -- Strip make prefix from primary_name
            SUBSTR(mme.primary_name_upper,
              CASE
                WHEN mme.raw_make_upper = 'INTERNATIONAL HARVESTER' THEN LENGTH('INTERNATIONAL HARVESTER') + 2
                WHEN mme.raw_make_upper = 'NEW HOLLAND'             THEN LENGTH('NEW HOLLAND') + 2
                WHEN mme.raw_make_upper = 'MASSEY FERGUSON'         THEN LENGTH('MASSEY FERGUSON') + 2
                WHEN mme.raw_make_upper = 'MASSEY-FERGUSON'         THEN LENGTH('MASSEY-FERGUSON') + 2
                WHEN mme.raw_make_upper = 'MERCEDES-BENZ'           THEN LENGTH('MERCEDES-BENZ') + 2
                WHEN mme.raw_make_upper = 'MERCEDES BENZ'           THEN LENGTH('MERCEDES BENZ') + 2
                WHEN mme.raw_make_upper = 'GARDNER DENVER'          THEN LENGTH('GARDNER DENVER') + 2
                WHEN mme.raw_make_upper = 'INGERSOLL-RAND'          THEN LENGTH('INGERSOLL-RAND') + 2
                WHEN mme.raw_make_upper = 'INGERSOLL RAND'          THEN LENGTH('INGERSOLL RAND') + 2
                WHEN mme.raw_make_upper = 'ATLAS COPCO'             THEN LENGTH('ATLAS COPCO') + 2
                WHEN mme.raw_make_upper = 'DETROIT DIESEL'          THEN LENGTH('DETROIT DIESEL') + 2
                WHEN mme.raw_make_upper = 'JOHN DEERE'              THEN LENGTH('JOHN DEERE') + 2
                WHEN mme.raw_make_upper = 'CASE IH'                 THEN LENGTH('CASE IH') + 2
                WHEN mme.raw_make_upper = 'MAN TRUCK & BUS'         THEN LENGTH('MAN TRUCK') + 2
                WHEN mme.raw_make_upper = 'DAF TRUCKS'              THEN LENGTH('DAF TRUCKS') + 2
                WHEN mme.raw_make_upper = 'VOLVO TRUCKS'            THEN LENGTH('VOLVO TRUCKS') + 2
                WHEN mme.raw_make_upper = 'HINO MOTORS'             THEN LENGTH('HINO MOTORS') + 2
                WHEN mme.raw_make_upper = 'PERKINS ENGINES'         THEN LENGTH('PERKINS ENGINES') + 2
                WHEN mme.raw_make_upper = 'KOMATSU LTD.'            THEN LENGTH('KOMATSU LTD.') + 2
                WHEN mme.raw_make_upper = 'CATERPILLAR INC.'        THEN LENGTH('CATERPILLAR INC.') + 2
                WHEN mme.raw_make_upper = 'CUMMINS INC.'            THEN LENGTH('CUMMINS INC.') + 2
                WHEN mme.raw_make_upper = 'DEUTZ-FAHR'              THEN LENGTH('DEUTZ-FAHR') + 2
                ELSE LENGTH(mme.raw_make_upper) + 2
              END
            )
          ),
          '[^A-Z0-9]+', '-', 'g'
        ),
        '^-|-$', '', 'g'
      )
    ) AS model_slug,
    mme.source_format
  FROM make_model_extracted mme
  LEFT JOIN make_aliases ma ON ma.raw_upper = mme.raw_make_upper
),

-- ── Join to kg_equipment_makes + kg_equipment_models ─────────────────────────
linked AS (
  SELECT
    r.product_sku,
    em.id AS model_id,
    r.source_format AS notes
  FROM resolved r
  JOIN kg_equipment_makes mk ON mk.slug = r.make_slug
  JOIN kg_equipment_models em
    ON em.make_id = mk.id
   AND em.slug = r.model_slug
  WHERE r.model_slug IS NOT NULL
    AND LENGTH(r.model_slug) >= 2
    AND r.model_slug != '-'
)

-- ── Insert product-equipment links ───────────────────────────────────────────
INSERT INTO kg_product_equipment (product_sku, model_id, notes)
SELECT DISTINCT
  product_sku,
  model_id,
  notes
FROM linked
ON CONFLICT (product_sku, model_id) DO NOTHING;


-- =============================================================================
-- DIAGNOSTIC OUTPUT
-- =============================================================================

DO $$
DECLARE
  v_pe_rows           INTEGER;
  v_linked_products   INTEGER;
  v_total_products    INTEGER;
  v_products_with_eq  INTEGER;
  v_unlinked_with_eq  INTEGER;
BEGIN
  SELECT COUNT(*)          INTO v_pe_rows         FROM kg_product_equipment;
  SELECT COUNT(DISTINCT product_sku) INTO v_linked_products FROM kg_product_equipment;
  SELECT COUNT(*)          INTO v_total_products   FROM elimfilters_catalog;
  SELECT COUNT(*)          INTO v_products_with_eq
    FROM elimfilters_catalog
    WHERE equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0;

  -- Products with equipment JSONB but no kg_product_equipment link
  SELECT COUNT(*) INTO v_unlinked_with_eq
    FROM elimfilters_catalog
    WHERE equipment_applications IS NOT NULL
      AND jsonb_array_length(equipment_applications) > 0
      AND sku NOT IN (SELECT DISTINCT product_sku FROM kg_product_equipment);

  RAISE NOTICE '004_populate_product_equipment.sql COMPLETE';
  RAISE NOTICE '  kg_product_equipment total rows:              %', v_pe_rows;
  RAISE NOTICE '  Products linked to at least 1 model:          %', v_linked_products;
  RAISE NOTICE '  Total catalog products:                        %', v_total_products;
  RAISE NOTICE '  Products with equipment JSONB:                 %', v_products_with_eq;
  RAISE NOTICE '  Products with JSONB but no model link:         % (unresolved makes/models)', v_unlinked_with_eq;
  RAISE NOTICE '  Coverage: %.1f%% of catalog has equipment links',
    ROUND(100.0 * v_linked_products / NULLIF(v_total_products, 0), 1);
  RAISE NOTICE '  Expected range: 500–8,000 rows in kg_product_equipment';
  IF v_pe_rows < 500 THEN
    RAISE WARNING '  LOW ROW COUNT in kg_product_equipment: % — investigate extraction', v_pe_rows;
  END IF;
  IF v_unlinked_with_eq > 500 THEN
    RAISE WARNING '  % products have JSONB but no model link — check normalization table', v_unlinked_with_eq;
  END IF;
END;
$$;
