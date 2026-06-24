-- ============================================================================
-- 010_hydrocore_elements_sku.sql
-- Assigns ELIMFILTERS internal SKUs to HYDROCORE/SERIES™ 2020 and 2040
-- series elements added in migration 002_hydrocore_seed_data.sql.
--
-- Naming convention (confirmed from 500FG series):
--   P = Primary Micron  → 30µm (OEM baseline)
--   T = Turbine Media   → 10µm (enhanced)
--   S = Super Micron    →  2µm (maximum protection)
--
-- SKU mapping:
--   ET92020P → 2020SM-OR  (30µm primary — OEM baseline)
--   ET92020T → 2020TM-OR  (10µm turbine-grade)
--   ET92020S → 2020PM-OR  (2µm super micron — maximum protection)
--   ET92040P → 2040SM-OR  (30µm primary — OEM baseline)
--   ET92040T → 2040TM-OR  (10µm turbine-grade)
--   ET92040S → 2040PM-OR  (2µm super micron — maximum protection)
--
-- Step 1: Insert SKUs into elimfilters_catalog (required by FK constraint).
-- Step 2: Link product_element records.
-- All statements idempotent — ON CONFLICT DO NOTHING / safe to re-run.
-- ============================================================================

BEGIN;

-- ── Step 1: Insert SKUs into elimfilters_catalog ──────────────────────────────

INSERT INTO elimfilters_catalog (
  sku, technology, filter_type, description,
  brand_crossrefs, oem_codes, competitor_codes
) VALUES
  -- 2020 series
  (
    'ET92020P',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2020 PM — Primary Media Element. 30µm nominal. '
    'O-ring seal. Bowl class 2020. Free water separation 95%. '
    'OEM-equivalent filtration for 900FH/902FH housings. '
    'Cross-reference: Racor 2020PM-OR.',
    '{"RACOR": ["2020PM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92020T',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2020 TM — Turbine-Grade Media Element. 10µm nominal. '
    'O-ring seal. Bowl class 2020. Free water separation 99%, emulsified 95%. '
    'Enhanced protection for EFI systems. '
    'Cross-reference: Racor 2020TM-OR.',
    '{"RACOR": ["2020TM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92020S',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2020 SM — Super Micron Element. 2µm nominal. '
    'O-ring seal. Bowl class 2020. Free water separation 99.9%, emulsified 99%. '
    'Maximum protection for HPCR injector systems. '
    'Cross-reference: Racor 2020SM-OR.',
    '{"RACOR": ["2020SM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  -- 2040 series
  (
    'ET92040P',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2040 PM — Primary Media Element. 30µm nominal. '
    'O-ring seal. Bowl class 2040. Free water separation 95%. '
    'OEM-equivalent filtration for 1000FH/1002FH housings. '
    'Cross-reference: Racor 2040PM-OR.',
    '{"RACOR": ["2040PM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92040T',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2040 TM — Turbine-Grade Media Element. 10µm nominal. '
    'O-ring seal. Bowl class 2040. Free water separation 99%, emulsified 95%. '
    'Enhanced protection for EFI systems. '
    'Cross-reference: Racor 2040TM-OR.',
    '{"RACOR": ["2040TM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ),
  (
    'ET92040S',
    'HYDROCORE/SERIES™',
    'Fuel Filter Element',
    'HYDROCORE/SERIES™ 2040 SM — Super Micron Element. 2µm nominal. '
    'O-ring seal. Bowl class 2040. Free water separation 99.9%, emulsified 99%. '
    'Maximum protection for HPCR injector systems. '
    'Cross-reference: Racor 2040SM-OR.',
    '{"RACOR": ["2040SM-OR"]}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (sku) DO NOTHING;

-- ── Step 2: Link product_element records ─────────────────────────────────────

UPDATE product_element SET elimfilters_sku = 'ET92020P' WHERE element_code = '2020PM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92020T' WHERE element_code = '2020TM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92020S' WHERE element_code = '2020SM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92040P' WHERE element_code = '2040PM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92040T' WHERE element_code = '2040TM-OR';
UPDATE product_element SET elimfilters_sku = 'ET92040S' WHERE element_code = '2040SM-OR';

COMMIT;
