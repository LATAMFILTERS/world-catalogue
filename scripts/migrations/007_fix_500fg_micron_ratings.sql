-- ============================================================================
-- 007_fix_500fg_micron_ratings.sql
-- Corrects micron ratings for 500FG series elements per Parker Racor
-- 500FG Turbine Series datasheet (Part Number 15332 Rev G, page 5 & 6).
--
-- Error in migration 005: SM-OR and PM-OR micron ratings were inverted.
-- Racor naming convention:
--   SM = Super Micron  →  2µm  (finest — maximum protection)
--   TM = Turbine Media → 10µm  (enhanced)
--   PM = Primary Micron → 30µm (coarsest — OEM/primary fuel circuit)
--
-- Corrections applied:
--   1. product_element.protection_spec — micron_nominal + water_sep specs
--   2. product_element.description
--   3. alternative_group_member — is_baseline, protection_level,
--      operational_objective, compatibility_note, rank_in_group
--   4. model_element_compatibility — is_primary (PM-OR is OEM standard)
--
-- All statements idempotent — safe to re-run.
-- ============================================================================

BEGIN;

-- ── Step 1: Fix product_element.protection_spec and description ───────────────

-- 2010SM-OR: 30µm → 2µm (Super Micron — maximum protection)
UPDATE product_element
SET
  protection_spec = '{
    "micron_nominal": 2,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 99.9,
    "water_sep_emulsified_pct": 99.0,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  description =
    'HYDROCORE/SERIES™ 2010 SM — Super Micron Element. 2µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 99.9%, emulsified 99%. '
    'Maximum protection for high-pressure common rail injector systems (HPCR). '
    'Addresses injector stiction failure mode from emulsified water contamination.'
WHERE element_code = '2010SM-OR';

-- 2010TM-OR: 10µm — already correct, description refresh for consistency
UPDATE product_element
SET
  description =
    'HYDROCORE/SERIES™ 2010 TM — Turbine-Grade Media Element. 10µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 99%, emulsified 95%. '
    'Enhanced protection for electronic fuel injection and low-sulfur diesel.'
WHERE element_code = '2010TM-OR';

-- 2010PM-OR: 2µm → 30µm (Primary Micron — OEM baseline)
UPDATE product_element
SET
  protection_spec = '{
    "micron_nominal": 30,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 95.0,
    "water_sep_emulsified_pct": null,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  description =
    'HYDROCORE/SERIES™ 2010 PM — Primary Media Element. 30µm nominal. '
    'O-ring seal. Bowl class 2010. Free water separation 95%. '
    'OEM-equivalent filtration level for standard diesel fuel circuits.'
WHERE element_code = '2010PM-OR';


-- ── Step 2: Fix alternative_group_member for HYDROCORE-2010 ──────────────────
-- PM-OR (30µm) = baseline OEM equivalent
-- TM-OR (10µm) = enhanced (TYPE A)
-- SM-OR (2µm)  = maximum protection (TYPE A)

-- 2010PM-OR → baseline
UPDATE alternative_group_member
SET
  is_baseline          = TRUE,
  protection_level     = 1,
  operational_objective = 'oem_equivalent',
  compatibility_note   =
    'O-ring seat match confirmed; same bowl class 2010. Primary 30µm media. '
    'Free water separation 95%. OEM-equivalent protection level. '
    'Direct cross-reference to Racor 2010PM-OR. '
    'Recommended for suction-side primary filtration per Racor installation guide.',
  rank_in_group        = 1
WHERE element_id = (SELECT id FROM product_element WHERE element_code = '2010PM-OR')
  AND group_id   = (SELECT id FROM alternative_group WHERE group_code = 'HYDROCORE-2010');

-- 2010TM-OR → enhanced (TYPE A, level 3)
UPDATE alternative_group_member
SET
  is_baseline          = FALSE,
  protection_level     = 3,
  operational_objective = 'enhanced_protection',
  compatibility_note   =
    'Same O-ring seat and bowl class 2010. Turbine-grade 10µm media. '
    'Free water separation upgraded from 95% to 99%; emulsified water 95%. '
    'TYPE A upgrade. Recommended for EFI systems with water contamination history.',
  rank_in_group        = 2
WHERE element_id = (SELECT id FROM product_element WHERE element_code = '2010TM-OR')
  AND group_id   = (SELECT id FROM alternative_group WHERE group_code = 'HYDROCORE-2010');

-- 2010SM-OR → maximum protection (TYPE A, level 5)
UPDATE alternative_group_member
SET
  is_baseline          = FALSE,
  protection_level     = 5,
  operational_objective = 'maximum_protection',
  compatibility_note   =
    'Same O-ring seat and bowl class 2010. Super Micron 2µm media. '
    'Free water 99.9%, emulsified water 99%. Maximum protection. '
    'TYPE A upgrade. Required for HPCR injector systems where emulsified '
    'water causes injector stiction and corrosion failures.',
  rank_in_group        = 3
WHERE element_id = (SELECT id FROM product_element WHERE element_code = '2010SM-OR')
  AND group_id   = (SELECT id FROM alternative_group WHERE group_code = 'HYDROCORE-2010');


-- ── Step 3: Fix model_element_compatibility — correct primary element ─────────
-- is_primary = TRUE should be 2010PM-OR (30µm — OEM standard primary filter)

UPDATE model_element_compatibility
SET is_primary = TRUE
WHERE product_model_id   = (SELECT id FROM product_model   WHERE model_code   = '500FG')
  AND product_element_id = (SELECT id FROM product_element WHERE element_code = '2010PM-OR');

UPDATE model_element_compatibility
SET is_primary = FALSE
WHERE product_model_id   = (SELECT id FROM product_model   WHERE model_code   = '500FG')
  AND product_element_id = (SELECT id FROM product_element WHERE element_code = '2010SM-OR');


COMMIT;
