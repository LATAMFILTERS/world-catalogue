-- Read-only diagnostic (no writes). Run this first.
--
-- Finds every (sku, manufacturer, code) that exists in brand_crossrefs
-- (a per-manufacturer JSONB object column) but is absent from
-- competitor_codes (the flat JSONB array that actually feeds the search
-- resolver used by GET /api/search).
--
-- Origin: AF25139M (Fleetguard) failed to resolve to EA17682 (Donaldson
-- P527682) even though brand_crossrefs.FLEETGUARD already listed it —
-- because competitor_codes only had AF25139 and AF4908 for FLEETGUARD, not
-- AF25139M. The two columns are maintained by different pipeline steps and
-- have drifted apart; this audit shows how widespread that drift is before
-- any fix is applied catalog-wide.
--
-- Run: psql "$DATABASE_URL" -f scripts/audit_missing_competitor_codes.sql

WITH bc_flat AS (
  SELECT
    c.sku,
    kv.key       AS manufacturer,
    code_elem    AS code
  FROM elimfilters_catalog c,
       LATERAL jsonb_each(COALESCE(c.brand_crossrefs, '{}'::jsonb)) AS kv(key, val),
       LATERAL jsonb_array_elements_text(val) AS code_elem
),
cc_flat AS (
  SELECT
    c.sku,
    elem ->> 'code' AS code
  FROM elimfilters_catalog c,
       LATERAL jsonb_array_elements(COALESCE(c.competitor_codes, '[]'::jsonb)) AS elem
),
missing AS (
  SELECT bc.sku, bc.manufacturer, bc.code
  FROM bc_flat bc
  WHERE NOT EXISTS (
    SELECT 1 FROM cc_flat cc
    WHERE cc.sku = bc.sku AND UPPER(cc.code) = UPPER(bc.code)
  )
)
-- Summary first:
SELECT COUNT(DISTINCT sku) AS skus_affected, COUNT(*) AS codes_missing FROM missing;

-- Detail (comment out the summary above and uncomment this to see every row):
-- WITH bc_flat AS ( ... ) -- (repeat CTEs above)
-- SELECT * FROM missing ORDER BY sku, manufacturer, code;

-- Quick check for the specific part number that started this investigation:
SELECT sku, manufacturer, code
FROM (
  SELECT
    c.sku,
    kv.key       AS manufacturer,
    code_elem    AS code
  FROM elimfilters_catalog c,
       LATERAL jsonb_each(COALESCE(c.brand_crossrefs, '{}'::jsonb)) AS kv(key, val),
       LATERAL jsonb_array_elements_text(val) AS code_elem
  WHERE c.sku = 'EA17682'
) bc
WHERE NOT EXISTS (
  SELECT 1
  FROM elimfilters_catalog c2,
       LATERAL jsonb_array_elements(COALESCE(c2.competitor_codes, '[]'::jsonb)) AS elem
  WHERE c2.sku = 'EA17682' AND UPPER(elem ->> 'code') = UPPER(bc.code)
);
