-- ============================================================================
-- 009_hydrocore_series_housing_sku.sql
-- Assigns ELIMFILTERS internal SKUs to original HYDROCORE/SERIES™ housings
-- added in migration 002_hydrocore_seed_data.sql.
--
-- SKU mapping:
--   ET90900  → 900FH  (900 Series, bowl class 2020, no heater)
--   ET90902  → 902FH  (900 Series, bowl class 2020, with heater)
--   ET91000  → 1000FH (1000 Series, bowl class 2040, no heater)
--   ET91002  → 1002FH (1000 Series, bowl class 2040, with heater)
--
-- Step 1: Insert SKUs into elimfilters_catalog (required by FK constraint).
-- Step 2: Link product_model records.
-- All statements idempotent — ON CONFLICT DO NOTHING / safe to re-run.
-- ============================================================================

BEGIN;

-- ── Step 1: Insert SKUs into elimfilters_catalog ──────────────────────────────

INSERT INTO elimfilters_catalog (
  sku, technology, filter_type, description,
  brand_crossrefs, oem_codes, competitor_codes
) VALUES
  (
    'ET90900',
    'HYDROCORE/SERIES™',
    'Fuel Housing',
    'HYDROCORE/SERIES™ 900 Series fuel filter/water separator housing. '
    'Bowl class 2020. No heater. Accepts 2020-series elements. '
    'Cross-reference: Racor 900FH.',
    '{"RACOR": ["900FH"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET90902',
    'HYDROCORE/SERIES™',
    'Fuel Housing',
    'HYDROCORE/SERIES™ 900 Series fuel filter/water separator housing. '
    'Bowl class 2020. With heater. Accepts 2020-series elements. '
    'Cross-reference: Racor 902FH.',
    '{"RACOR": ["902FH"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET91000',
    'HYDROCORE/SERIES™',
    'Fuel Housing',
    'HYDROCORE/SERIES™ 1000 Series fuel filter/water separator housing. '
    'Bowl class 2040. No heater. Accepts 2040-series elements. '
    'Cross-reference: Racor 1000FH.',
    '{"RACOR": ["1000FH"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET91002',
    'HYDROCORE/SERIES™',
    'Fuel Housing',
    'HYDROCORE/SERIES™ 1000 Series fuel filter/water separator housing. '
    'Bowl class 2040. With heater. Accepts 2040-series elements. '
    'Cross-reference: Racor 1002FH.',
    '{"RACOR": ["1002FH"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;

-- ── Step 2: Link product_model records ───────────────────────────────────────

UPDATE product_model SET elimfilters_sku = 'ET90900' WHERE model_code = '900FH';
UPDATE product_model SET elimfilters_sku = 'ET90902' WHERE model_code = '902FH';
UPDATE product_model SET elimfilters_sku = 'ET91000' WHERE model_code = '1000FH';
UPDATE product_model SET elimfilters_sku = 'ET91002' WHERE model_code = '1002FH';

COMMIT;
