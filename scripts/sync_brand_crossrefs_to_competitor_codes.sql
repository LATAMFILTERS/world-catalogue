-- Backfill fix (additive only — never removes or replaces existing entries).
--
-- competitor_codes is the flat JSONB array ([{manufacturer, code}, ...])
-- that feeds the search resolver behind GET /api/search (v_api_resolver_v4
-- / v_api_resolver_v5). brand_crossrefs is a separate, independently
-- maintained JSONB object column ({MANUFACTURER: [code, ...]}) that the
-- product-detail response also returns. The two have drifted apart for at
-- least EA17682 (Donaldson P527682): brand_crossrefs.FLEETGUARD includes
-- "AF25139M", but competitor_codes only has "AF25139" and "AF4908" for
-- FLEETGUARD, so a direct search for "AF25139M" returns no results.
--
-- This script copies every (sku, code) pair found in brand_crossrefs but
-- missing from competitor_codes into competitor_codes, for every SKU in the
-- catalog. It does not touch brand_crossrefs, oem_codes, or any existing
-- competitor_codes entry — it only appends what's missing.
--
-- Run scripts/audit_missing_competitor_codes.sql FIRST to see how many
-- SKUs/codes this will touch before running this.
--
-- Run: psql "$DATABASE_URL" -f scripts/sync_brand_crossrefs_to_competitor_codes.sql
--
-- This runs inside a transaction and prints the affected row count via
-- RAISE NOTICE before COMMIT. If the count looks wrong, replace the final
-- COMMIT with ROLLBACK and investigate instead of trusting a first run.

BEGIN;

DO $$
DECLARE
  affected_skus INT;
BEGIN
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
  ),
  missing_agg AS (
    SELECT
      sku,
      jsonb_agg(jsonb_build_object('manufacturer', manufacturer, 'code', code)) AS to_add
    FROM missing
    GROUP BY sku
  ),
  updated AS (
    UPDATE elimfilters_catalog c
    SET competitor_codes = COALESCE(c.competitor_codes, '[]'::jsonb) || ma.to_add
    FROM missing_agg ma
    WHERE ma.sku = c.sku
    RETURNING c.sku
  )
  SELECT COUNT(*) INTO affected_skus FROM updated;

  RAISE NOTICE 'SKUs updated: %', affected_skus;
END $$;

-- Verify EA17682 specifically before trusting the rest:
-- SELECT sku, competitor_codes FROM elimfilters_catalog WHERE sku = 'EA17682';
-- Should now include {"manufacturer": "FLEETGUARD", "code": "AF25139M"}.

-- Re-run scripts/audit_missing_competitor_codes.sql's summary query here —
-- it should now report codes_missing = 0. If it doesn't, ROLLBACK.

COMMIT;
