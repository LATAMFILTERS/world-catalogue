-- ============================================================================
-- 005_hydrocore_500fg_series.sql
-- HYDROCORE/SERIES™ 500FG — Racor 500 Series housing + 2010 bowl elements
-- ============================================================================
-- Adds the smaller-capacity HYDROCORE/SERIES™ housing and its three elements.
-- Same structure as 002_hydrocore_seed_data.sql (900/1000 series).
--
-- Housing:  500FG  (bowl class 2010, no heater)
-- Elements: 2010SM-OR (30µm, OEM baseline)
--           2010TM-OR (10µm, enhanced — TYPE A)
--           2010PM-OR (2µm,  maximum  — TYPE A)
--
-- Source: Parker Racor 500 FG Series Product Datasheet
-- Run after 001_product_catalog_schema.sql and 002_hydrocore_seed_data.sql.
-- All statements idempotent (ON CONFLICT DO NOTHING).
-- ============================================================================

BEGIN;

-- ── Step 1: product_model — 500FG housing ────────────────────────────────────

INSERT INTO product_model (
  family_id, model_code, racor_equivalent, model_type, accepts_elements,
  compatibility_class, has_heater, heater_voltage_v, description
)
SELECT
  pf.id,
  '500FG',
  '500FG',
  'durable',
  TRUE,
  '2010',
  FALSE,
  NULL,
  'HYDROCORE/SERIES™ 500 Series fuel filter/water separator housing. '
  'Bowl class 2010. Compact single-stage coalescing water separation for '
  'smaller diesel engines and secondary fuel circuits. '
  'Accepts all 2010-series elements.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (model_code) DO NOTHING;

-- ── Step 2: product_element — 3 elements ─────────────────────────────────────

INSERT INTO product_element (
  family_id, element_code, racor_equivalent, compatibility_class,
  media_grade, seal_type, protection_spec, description
)
SELECT
  pf.id,
  '2010SM-OR',
  '2010SM-OR',
  '2010',
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
  'HYDROCORE/SERIES™ 2010 SM — Standard Media Element. 30µm nominal. '
  'O-ring seal. Bowl class 2010. Free water separation 95%. '
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
  '2010TM-OR',
  '2010TM-OR',
  '2010',
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
  'HYDROCORE/SERIES™ 2010 TM — Turbine-Grade Media Element. 10µm nominal. '
  'O-ring seal. Bowl class 2010. Free water separation 99%, emulsified 95%. '
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
  '2010PM-OR',
  '2010PM-OR',
  '2010',
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
  'HYDROCORE/SERIES™ 2010 PM — Premium Media Element. 2µm nominal. '
  'O-ring seal. Bowl class 2010. Free water separation 99.9%, emulsified 99%. '
  'Maximum protection for high-pressure common rail injector systems (HPCR). '
  'Addresses injector stiction failure mode from emulsified water contamination.'
FROM product_family pf
WHERE pf.family_code = 'HYDROCORE/SERIES'
ON CONFLICT (element_code) DO NOTHING;

-- ── Step 3: model_element_compatibility — 3 rows ─────────────────────────────
-- 500FG (compatibility_class=2010) → 2010SM/TM/PM

INSERT INTO model_element_compatibility (
  product_model_id, product_element_id, is_primary,
  compatibility_source, compatibility_verified_at,
  compatibility_method, compatibility_confidence
)
SELECT
  pm.id,
  pe.id,
  (pe.media_grade = 'SM'),
  'Parker Racor 500 FG Series Datasheet — element interchange table',
  NOW(),
  'datasheet',
  'CONFIRMED'
FROM product_model pm
CROSS JOIN product_element pe
WHERE pm.model_code = '500FG'
  AND pe.element_code IN ('2010SM-OR', '2010TM-OR', '2010PM-OR')
ON CONFLICT (product_model_id, product_element_id) DO NOTHING;

-- ── Step 4: alternative_group — HYDROCORE-2010 ───────────────────────────────

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
) VALUES (
  'HYDROCORE-2010',
  'HYDROCORE/SERIES™ 2010 Series Elements',
  'HYDROCORE',
  'Fuel Cleanliness',
  '2010',
  'micron_rating + water_separation_efficiency',
  'compatibility_class_match',
  'Parker Racor 500 FG Series Datasheet — element interchange table',
  NOW(),
  'admin_import',
  'Interchangeable elements for 500FG housing. SM, TM, and PM share the '
  'same bowl thread, O-ring seat geometry, and bowl class 2010. '
  'Members differ in micron rating (30/10/2µm) and water separation '
  'efficiency. Physical installation procedure is identical across all members.'
)
ON CONFLICT (group_code) DO NOTHING;

-- ── Step 5: alternative_group_member — 3 members ─────────────────────────────

-- 2010SM-OR (baseline)
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  TRUE, 1,
  'oem_equivalent',
  'O-ring seat match confirmed; same bowl class 2010. Standard 30µm media. '
  'Free water separation 95%. OEM-equivalent protection level. '
  'Direct cross-reference to Racor 2010SM-OR.',
  1
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2010'
  AND pe.element_code = '2010SM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- 2010TM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 3,
  'enhanced_protection',
  'Same O-ring seat and bowl class 2010. Turbine-grade 10µm media. '
  'Free water separation upgraded from 95% to 99%; emulsified water 95%. '
  'TYPE A upgrade. Recommended for EFI systems with water contamination history.',
  2
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2010'
  AND pe.element_code = '2010TM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

-- 2010PM-OR
INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, compatibility_note, rank_in_group
)
SELECT
  ag.id, pe.id,
  FALSE, 5,
  'maximum_protection',
  'Same O-ring seat and bowl class 2010. Premium sub-2µm media. '
  'Free water 99.9%, emulsified water 99%. Maximum protection. '
  'TYPE A upgrade. Required for HPCR injector systems where emulsified '
  'water causes injector stiction and corrosion failures.',
  3
FROM alternative_group ag
CROSS JOIN product_element pe
WHERE ag.group_code = 'HYDROCORE-2010'
  AND pe.element_code = '2010PM-OR'
ON CONFLICT (group_id, element_id) DO NOTHING;

COMMIT;
