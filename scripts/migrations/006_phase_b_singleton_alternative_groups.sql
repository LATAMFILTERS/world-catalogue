-- ============================================================================
-- 006_phase_b_singleton_alternative_groups.sql
-- Creates one alternative_group per orphan MACROCORE and MICROKAPPA element.
--
-- Each element becomes its own group baseline:
--   protection_level = 1, operational_objective = 'oem_equivalent'
--
-- Purpose:
--   - Fixes no_orphan_elements FAIL in the validate endpoint
--   - RE can now respond to any MACROCORE/MICROKAPPA element query (returns BASELINE)
--   - Groups are scaffolded: when real compatibility data arrives, additional
--     members (TYPE_A / TYPE_B) can be added to existing groups via ON CONFLICT
--
-- Only processes elements with no existing alternative_group membership.
-- All statements idempotent — ON CONFLICT DO NOTHING.
-- ============================================================================

BEGIN;

-- ── MACROCORE™ — alternative_group per orphan element ────────────────────────

INSERT INTO alternative_group (
  group_code,
  group_name,
  technology,
  system,
  compatibility_class,
  differentiation_axis,
  compatibility_basis,
  compatibility_verified_at,
  compatibility_verified_by
)
SELECT
  'MACROCORE-' || pe.element_code,
  'MACROCORE™ ' || pe.element_code,
  'MACROCORE',
  'Air Intake',
  pe.compatibility_class,
  'dust_efficiency + media_grade',
  'compatibility_class_match',
  NOW(),
  'admin_import'
FROM product_element pe
JOIN  product_family           pf  ON pf.id  = pe.family_id
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
WHERE pf.family_code   = 'MACROCORE'
  AND agm.element_id IS NULL
ON CONFLICT (group_code) DO NOTHING;

-- ── MACROCORE™ — alternative_group_member (baseline) per orphan element ───────

INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, rank_in_group
)
SELECT
  ag.id,
  pe.id,
  TRUE,
  1,
  'oem_equivalent',
  1
FROM product_element pe
JOIN  product_family           pf  ON pf.id  = pe.family_id
JOIN  alternative_group        ag  ON ag.group_code = 'MACROCORE-' || pe.element_code
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
WHERE pf.family_code   = 'MACROCORE'
  AND agm.element_id IS NULL
ON CONFLICT (group_id, element_id) DO NOTHING;


-- ── MICROKAPPA™ — alternative_group per orphan element ───────────────────────

INSERT INTO alternative_group (
  group_code,
  group_name,
  technology,
  system,
  compatibility_class,
  differentiation_axis,
  compatibility_basis,
  compatibility_verified_at,
  compatibility_verified_by
)
SELECT
  'MICROKAPPA-' || pe.element_code,
  'MICROKAPPA™ ' || pe.element_code,
  'MICROKAPPA',
  'Cabin Air',
  pe.compatibility_class,
  'pm25_efficiency + media_grade',
  'compatibility_class_match',
  NOW(),
  'admin_import'
FROM product_element pe
JOIN  product_family           pf  ON pf.id  = pe.family_id
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
WHERE pf.family_code   = 'MICROKAPPA'
  AND agm.element_id IS NULL
ON CONFLICT (group_code) DO NOTHING;

-- ── MICROKAPPA™ — alternative_group_member (baseline) per orphan element ──────

INSERT INTO alternative_group_member (
  group_id, element_id, is_baseline, protection_level,
  operational_objective, rank_in_group
)
SELECT
  ag.id,
  pe.id,
  TRUE,
  1,
  'oem_equivalent',
  1
FROM product_element pe
JOIN  product_family           pf  ON pf.id  = pe.family_id
JOIN  alternative_group        ag  ON ag.group_code = 'MICROKAPPA-' || pe.element_code
LEFT JOIN alternative_group_member agm ON agm.element_id = pe.id
WHERE pf.family_code   = 'MICROKAPPA'
  AND agm.element_id IS NULL
ON CONFLICT (group_id, element_id) DO NOTHING;


COMMIT;
