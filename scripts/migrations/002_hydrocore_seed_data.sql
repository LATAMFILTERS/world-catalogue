-- ============================================================================
-- 002_hydrocore_seed_data.sql
-- HYDROCORE/SERIES™ — First Implementation Seed Data
-- ============================================================================
-- Run AFTER 001_product_catalog_schema.sql.
-- All statements idempotent (ON CONFLICT DO NOTHING).
-- Source document: Parker Racor 900/1000 FH Series Datasheet
-- ============================================================================

BEGIN;

-- ── Step 1: product_family ───────────────────────────────────────────────────

INSERT INTO product_family (
  family_code,
  family_name,
  technology,
  system,
  description,
  source_doc
) VALUES (
  'HYDROCORE/SERIES',
  'HYDROCORE/SERIES™',
  'HYDROCORE',
  'Fuel Cleanliness',
  'HYDROCORE/SERIES™ is a turbine fuel filter/water separator housing system '
  'for heavy-duty diesel applications. Designed for high-flow fuel circuits '
  'requiring both particle filtration and free/emulsified water separation. '
  'Primary failure mode addressed: water contamination in fuel (free and '
  'emulsified) leading to injector corrosion and stiction in high-pressure '
  'common rail injection systems. Standards: ASTM D6304, ISO 12937.',
  'Parker Racor 900/1000 FH Series Product Datasheet'
)
ON CONFLICT (family_code) DO NOTHING;

-- ── Step 2: product_model — 4 housings ──────────────────────────────────────

INSERT INTO product_model (
  family_id, model_code, racor_equivalent, model_type, accepts_elements,
  compatibility_class, has_heater, heater_voltage_v, description
)
SELECT
  pf.id,
  '900FH',
  '900FH',
  'durable',
  TRUE,
  '2020',
  FALSE,
  NULL,
  'HYDROCORE/SERIES™ 900 Series fuel filter/water separator housing. '
  'Bowl class 2020. Single-stage coalescing water separation for '
  'standard high-flow diesel fuel circuits. Accepts all 2020-series elements.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (model_code) DO NOTHING;

INSERT INTO product_model (
  family_id, model_code, racor_equivalent, model_type, accepts_elements,
  compatibility_class, has_heater, heater_voltage_v, description
)
SELECT
  pf.id,
  '902FH',
  '902FH',
  'durable',
  TRUE,
  '2020',
  TRUE,
  12,
  'HYDROCORE/SERIES™ 902 Series fuel filter/water separator housing with '
  '12V electric heater element. Bowl class 2020. For cold-climate diesel '
  'fuel systems where wax crystallization risk requires fuel heating. '
  'Accepts all 2020-series elements.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (model_code) DO NOTHING;

INSERT INTO product_model (
  family_id, model_code, racor_equivalent, model_type, accepts_elements,
  compatibility_class, has_heater, heater_voltage_v, description
)
SELECT
  pf.id,
  '1000FH',
  '1000FH',
  'durable',
  TRUE,
  '2040',
  FALSE,
  NULL,
  'HYDROCORE/SERIES™ 1000 Series fuel filter/water separator housing. '
  'Bowl class 2040. High-capacity coalescing water separation for larger '
  'diesel engines and high-flow primary fuel circuits. '
  'Accepts all 2040-series elements.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (model_code) DO NOTHING;

INSERT INTO product_model (
  family_id, model_code, racor_equivalent, model_type, accepts_elements,
  compatibility_class, has_heater, heater_voltage_v, description
)
SELECT
  pf.id,
  '1002FH',
  '1002FH',
  'durable',
  TRUE,
  '2040',
  TRUE,
  12,
  'HYDROCORE/SERIES™ 1002 Series fuel filter/water separator housing with '
  '12V electric heater element. Bowl class 2040. High-capacity design for '
  'cold-climate operations with larger diesel engines. '
  'Accepts all 2040-series elements.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (model_code) DO NOTHING;

-- ── Step 3: product_element — 6 elements ─────────────────────────────────────
-- protection_spec micron values are nominal from Parker Racor datasheet.
-- Absolute micron and beta_ratio to be updated when ELIMFILTERS lab data available.

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2020SM-OR',
  '2020SM-OR',
  '2020',
  'SM',
  'OR',
  '{
    "micron_nominal": 30,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 95.0,
    "water_sep_emulsified_pct": null,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2020 SM — Standard Media Element. 30µm nominal. '
  'O-ring seal. Bowl class 2020. Free water separation 95%. '
  'OEM-equivalent filtration level for standard diesel fuel circuits.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2020TM-OR',
  '2020TM-OR',
  '2020',
  'TM',
  'OR',
  '{
    "micron_nominal": 10,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 99.0,
    "water_sep_emulsified_pct": 95.0,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2020 TM — Turbine-Grade Media Element. 10µm nominal. '
  'O-ring seal. Bowl class 2020. Free water separation 99%, emulsified 95%. '
  'Enhanced protection for electronic fuel injection and low-sulfur diesel.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2020PM-OR',
  '2020PM-OR',
  '2020',
  'PM',
  'OR',
  '{
    "micron_nominal": 2,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 99.9,
    "water_sep_emulsified_pct": 99.0,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2020 PM — Premium Media Element. 2µm nominal. '
  'O-ring seal. Bowl class 2020. Free water separation 99.9%, emulsified 99%. '
  'Maximum protection for high-pressure common rail injector systems (HPCR). '
  'Addresses injector stiction failure mode from emulsified water contamination.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2040SM-OR',
  '2040SM-OR',
  '2040',
  'SM',
  'OR',
  '{
    "micron_nominal": 30,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 95.0,
    "water_sep_emulsified_pct": null,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2040 SM — Standard Media Element. 30µm nominal. '
  'O-ring seal. Bowl class 2040. Free water separation 95%. '
  'OEM-equivalent filtration level for high-capacity diesel fuel circuits.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2040TM-OR',
  '2040TM-OR',
  '2040',
  'TM',
  'OR',
  '{
    "micron_nominal": 10,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 99.0,
    "water_sep_emulsified_pct": 95.0,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2040 TM — Turbine-Grade Media Element. 10µm nominal. '
  'O-ring seal. Bowl class 2040. Free water separation 99%, emulsified 95%. '
  'Enhanced protection for high-capacity electronic fuel injection circuits.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2040PM-OR',
  '2040PM-OR',
  '2040',
  'PM',
  'OR',
  '{
    "micron_nominal": 2,
    "micron_absolute": null,
    "beta_ratio": null,
    "water_sep_free_pct": 99.9,
    "water_sep_emulsified_pct": 99.0,
    "dirt_capacity_g": null,
    "standard_refs": ["ASTM D6304", "ISO 12937"]
  }'::jsonb,
  'HYDROCORE/SERIES™ 2040 PM — Premium Media Element. 2µm nominal. '
  'O-ring seal. Bowl class 2040. Free water separation 99.9%, emulsified 99%. '
  'Maximum protection for high-capacity HPCR injector systems. '
  'Recommended for marine, mining, and off-highway high-hour applications.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

-- ── Step 4: model_element_compatibility — 12 rows ────────────────────────────
-- 900FH (compatibility_class=2020) → 2020SM/TM/PM
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id, is_primary,
  compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
)
SELECT
  pm.id,
  pe.id,
  (pe.media_grade = 'SM'),
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'datasheet',
  'CONFIRMED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code = '900FH'
  AND pe.element_code IN ('2020SM-OR', '2020TM-OR', '2020PM-OR')
ON CONFLICT (product_model_id, product_element_id) DO NOTHING;

-- 902FH (compatibility_class=2020) → 2020SM/TM/PM
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id, is_primary,
  compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
)
SELECT
  pm.id,
  pe.id,
  (pe.media_grade = 'SM'),
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'datasheet',
  'CONFIRMED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code = '902FH'
  AND pe.element_code IN ('2020SM-OR', '2020TM-OR', '2020PM-OR')
ON CONFLICT (product_model_id, product_element_id) DO NOTHING;

-- 1000FH (compatibility_class=2040) → 2040SM/TM/PM
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id, is_primary,
  compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
)
SELECT
  pm.id,
  pe.id,
  (pe.media_grade = 'SM'),
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'datasheet',
  'CONFIRMED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code = '1000FH'
  AND pe.element_code IN ('2040SM-OR', '2040TM-OR', '2040PM-OR')
ON CONFLICT (product_model_id, product_element_id) DO NOTHING;

-- 1002FH (compatibility_class=2040) → 2040SM/TM/PM
INSERT INTO model_element_compatibility (
  product_model_id, product_element_id, is_primary,
  compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
)
SELECT
  pm.id,
  pe.id,
  (pe.media_grade = 'SM'),
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'datasheet',
  'CONFIRMED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code = '1002FH'
  AND pe.element_code IN ('2040SM-OR', '2040TM-OR', '2040PM-OR')
ON CONFLICT (product_model_id, product_element_id) DO NOTHING;

-- ── Step 5: alternative_group — 2 groups ─────────────────────────────────────

INSERT INTO alternative_group (
  group_code,
  group_name,
  technology,
  system,
  compatibility_class,
  differentiation_axis,
  compatibility_basis,
  compatibility_source,
  compatibility_verified_at,
  compatibility_verified_by,
  description
) VALUES
(
  'HYDROCORE-2020',
  'HYDROCORE/SERIES™ 2020 Series Elements',
  'HYDROCORE',
  'Fuel Cleanliness',
  '2020',
  'micron_rating + water_separation_efficiency',
  'compatibility_class_match',
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'admin_import',
  'Interchangeable elements for 900FH and 902FH housings. SM, TM, and PM '
  'share the same bowl thread, O-ring seat geometry, and bowl class 2020. '
  'Members differ in micron rating (30/10/2µm) and water separation '
  'efficiency. Physical installation procedure is identical across all members.'
),
(
  'HYDROCORE-2040',
  'HYDROCORE/SERIES™ 2040 Series Elements',
  'HYDROCORE',
  'Fuel Cleanliness',
  '2040',
  'micron_rating + water_separation_efficiency',
  'compatibility_class_match',
  'Parker Racor 900/1000 FH Series Datasheet — element interchange table',
  NOW(),
  'admin_import',
  'Interchangeable elements for 1000FH and 1002FH housings. SM, TM, and PM '
  'share the same bowl thread, O-ring seat geometry, and bowl class 2040. '
  'Members differ in micron rating (30/10/2µm) and water separation '
  'efficiency. Physical installation procedure is identical across all members.'
)
ON CONFLICT (group_code) DO NOTHING;

-- ── Step 6: alternative_group_member — 6 members ─────────────────────────────

-- HYDROCORE-2020: 2020SM-OR (baseline)
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  TRUE, 1,
  'oem_equivalent',
  'O-ring seat match confirmed; same bowl class 2020. Standard 30µm media. '
  'Free water separation 95%. OEM-equivalent protection level. '
  'Direct cross-reference to Racor 2020SM-OR.',
  1
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2020'
  AND pe.element_code = '2020SM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- HYDROCORE-2020: 2020TM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 3,
  'enhanced_protection',
  'Same O-ring seat and bowl class 2020. Turbine-grade 10µm media. '
  'Free water separation upgraded from 95% to 99%; emulsified water 95%. '
  'TYPE A upgrade. Recommended for EFI systems with water contamination history.',
  2
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2020'
  AND pe.element_code = '2020TM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- HYDROCORE-2020: 2020PM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 5,
  'maximum_protection',
  'Same O-ring seat and bowl class 2020. Premium sub-2µm media. '
  'Free water 99.9%, emulsified water 99%. Maximum protection. '
  'TYPE A upgrade. Required for HPCR injector systems where emulsified '
  'water causes injector stiction and corrosion failures.',
  3
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2020'
  AND pe.element_code = '2020PM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- HYDROCORE-2040: 2040SM-OR (baseline)
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  TRUE, 1,
  'oem_equivalent',
  'O-ring seat match confirmed; same bowl class 2040. Standard 30µm media. '
  'Free water separation 95%. OEM-equivalent protection level. '
  'Direct cross-reference to Racor 2040SM-OR.',
  1
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2040'
  AND pe.element_code = '2040SM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- HYDROCORE-2040: 2040TM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 3,
  'enhanced_protection',
  'Same O-ring seat and bowl class 2040. Turbine-grade 10µm media. '
  'Free water separation upgraded from 95% to 99%; emulsified water 95%. '
  'TYPE A upgrade. For high-capacity EFI circuits with water ingress risk.',
  2
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2040'
  AND pe.element_code = '2040TM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- HYDROCORE-2040: 2040PM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 5,
  'maximum_protection',
  'Same O-ring seat and bowl class 2040. Premium sub-2µm media. '
  'Free water 99.9%, emulsified water 99%. Maximum protection. '
  'TYPE A upgrade. Required for high-capacity HPCR systems. '
  'Recommended for marine, mining, and off-highway high-hour operations.',
  3
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2040'
  AND pe.element_code = '2040PM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

COMMIT;
