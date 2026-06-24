-- ============================================================================
-- 008_500fg_elimfilters_sku.sql  (corrected)
-- Assigns ELIMFILTERS internal SKUs to 500FG series housing and elements.
--
-- product_model.elimfilters_sku and product_element.elimfilters_sku have
-- FK constraints to elimfilters_catalog(sku). SKUs must exist there first.
--
-- Step 1: Insert 4 SKUs into elimfilters_catalog (if not already present).
-- Step 2: Link product_model and product_element records.
--
-- SKU mapping:
--   ET90500   → 500FG housing
--   ET92010P  → 2010PM-OR (30µm primary — OEM baseline)
--   ET92010T  → 2010TM-OR (10µm turbine-grade)
--   ET92010S  → 2010SM-OR (2µm super micron — maximum protection)
--
-- All statements idempotent — ON CONFLICT DO NOTHING / safe to re-run.
-- ============================================================================

BEGIN;

-- ── Step 1: Insert SKUs into elimfilters_catalog ──────────────────────────────

INSERT INTO elimfilters_catalog (
  sku, technology, filter_type, description,
  brand_crossrefs, oem_codes, competitor_codes
) VALUES
  (
    'ET90500',
    'HYDROCORE/SERIES™',
    'Fuel Housing',
    'HYDROCORE/SERIES™ 500 Series fuel filter/water separator housing. '
    'Bowl class 2010. Three-stage turbine separation, coalescing, and filtration. '
    'Max flow 60 GPH. Port 3/4"-16 UNF (SAE J1926). Max 25 PSI. '
    'Accepts 2010-series elements. Cross-reference: Racor 500FG.',
    '{"RACOR": ["500FG"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92010P',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2010 PM — Primary Media Element. 30µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 95%. '
    'OEM-equivalent filtration level for standard diesel fuel circuits. '
    'Cross-reference: Racor 2010PM-OR.',
    '{"RACOR": ["2010PM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92010T',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2010 TM — Turbine-Grade Media Element. 10µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 99%, emulsified 95%. '
    'Enhanced protection for electronic fuel injection and low-sulfur diesel. '
    'Cross-reference: Racor 2010TM-OR.',
    '{"RACOR": ["2010TM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92010S',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2010 SM — Super Micron Element. 2µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 99.9%, emulsified 99%. '
    'Maximum protection for high-pressure common rail injector systems (HPCR). '
    'Cross-reference: Racor 2010SM-OR.',
    '{"RACOR": ["2010SM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;

-- ── Step 2: Link product_model and product_element to their SKUs ──────────────

UPDATE product_model   SET elimfilters_sku = 'ET90500'  WHERE model_code   = '500FG';
UPDATE product_element SET elimfilters_sku = 'ET92010P' WHERE element_code = '2010PM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92010T' WHERE element_code = '2010TM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92010S' WHERE element_code = '2010SM-OR';

COMMIT;
