-- Fix incorrect OEM code mapping for Donaldson P552100
-- Issue: P552100 was incorrectly mapped to EA10695
-- Correct: P552100 should map to EL82100

-- VERIFICATION QUERY: Check current state
SELECT
  sku,
  duty,
  oem_codes,
  competitor_codes
FROM elimfilters_catalog
WHERE sku = 'EL82100'
  OR oem_codes::text ILIKE '%P552100%'
  OR competitor_codes::text ILIKE '%P552100%'
ORDER BY sku;

-- UPDATE: Ensure EL82100 has correct OEM code mapping
-- Database structure: oem_codes is JSONB array of objects
-- Expected format: [{"manufacturer": "DONALDSON", "code": "P552100"}, ...]

UPDATE elimfilters_catalog
SET oem_codes =
  CASE
    WHEN oem_codes IS NULL THEN
      jsonb_build_array(jsonb_build_object('manufacturer', 'DONALDSON', 'code', 'P552100'))
    WHEN NOT (oem_codes::text ILIKE '%P552100%') THEN
      oem_codes || jsonb_build_array(jsonb_build_object('manufacturer', 'DONALDSON', 'code', 'P552100'))
    ELSE
      oem_codes
  END
WHERE sku = 'EL82100'
  AND (oem_codes IS NULL OR NOT (oem_codes::text ILIKE '%P552100%'));

-- CLEANUP: Remove any incorrect P552100 mappings from other SKUs (if any)
UPDATE elimfilters_catalog
SET oem_codes = (
  SELECT jsonb_agg(elem)
  FROM jsonb_array_elements(oem_codes) AS elem
  WHERE NOT (elem->>'code' = 'P552100')
)
WHERE sku != 'EL82100'
  AND oem_codes::text ILIKE '%P552100%';

-- VERIFICATION: Confirm P552100 is now correctly mapped to EL82100
SELECT
  sku,
  duty,
  oem_codes
FROM elimfilters_catalog
WHERE oem_codes::text ILIKE '%P552100%'
ORDER BY sku;
