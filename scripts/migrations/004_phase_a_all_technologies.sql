-- ============================================================================
-- 004_phase_a_all_technologies.sql
-- Phase A: product_family + product_model/product_element for all remaining
-- technology families. Migrates structure from elimfilters_catalog into the
-- product_catalog tables so findCrossReferenceRE returns structured data for
-- every technology, not only HYDROCORE/SERIES™.
--
-- Technologies migrated:
--   Standalone/Assembly → product_model:
--     SYNTRAX (Lube Oil), SYNTEPORE (Fuel/Hydraulic), THERMACORE (Coolant),
--     DRYCORE (Compressed Air), HYDROCORE standalone (Fuel — formerly AQUAGUARD™),
--     NANOFORCE (Hydraulic), INTEKCORE (Air cleaner assemblies)
--
--   Consumable elements → product_element:
--     MACROCORE (Air intake elements), MICROKAPPA (Cabin air panels)
--
-- What is NOT created here (Phase B):
--   - alternative_group / alternative_group_member records
--   - model_element_compatibility (INTEKCORE ↔ MACROCORE links)
--   - NANOFORCE housing ↔ element pairings
--
-- Orphan product_element records are expected after this migration.
-- The validate endpoint will report them. This is intentional.
--
-- Run after 001_product_catalog_schema.sql.
-- All statements idempotent — ON CONFLICT DO NOTHING.
-- ============================================================================

BEGIN;

-- ── Step 1: product_family — 9 technology families ──────────────────────────

INSERT INTO product_family (
  family_code, family_name, technology, system, description, source_doc
) VALUES

  (
    'NANOFORCE',
    'NANOFORCE™',
    'NANOFORCE',
    'Hydraulic',
    'NANOFORCE™ synthetic media filters for hydraulic and fuel systems. '
    'High-precision pore geometry engineered for proportional valve protection '
    'and ISO 4406 cleanliness targets. Addresses sub-micron contamination in '
    'hydraulic circuits where spool clearances are 5–13µm. Primary failure mode: '
    'particle contamination degrading proportional valve response and service life. '
    'Standards: ISO 16889, ISO 4406, NFPA T2.14.',
    'ELIMFILTERS product catalog — NANOFORCE™ series'
  ),

  (
    'MACROCORE',
    'MACROCORE™',
    'MACROCORE',
    'Air Intake',
    'MACROCORE™ dry-media air intake filter elements for diesel engines and '
    'off-highway equipment. Cellulose, synthetic, and blended media in Round, '
    'Radialseal, Panel, and Finned configurations. Addresses SAE J1539 dust '
    'efficiency and restriction requirements. Primary failure mode: abrasive '
    'silica dust ingestion causing accelerated cylinder bore wear and piston ring '
    'erosion. Cross-compatible with INTEKCORE™ air cleaner assemblies.',
    'ELIMFILTERS product catalog — MACROCORE™ series'
  ),

  (
    'SYNTEPORE',
    'SYNTEPORE™',
    'SYNTEPORE',
    'Fuel Cleanliness',
    'SYNTEPORE™ synthetic polymer media filters for fuel and hydraulic '
    'applications. Consistent pore geometry with high dirt-holding capacity. '
    'Compatible with biodiesel blends up to B20 and ultra-low-sulfur diesel. '
    'Addresses ISO 12937 water content and ISO 16889 particle contamination '
    'requirements. Spin-on, cartridge, and in-line configurations.',
    'ELIMFILTERS product catalog — SYNTEPORE™ series'
  ),

  (
    'SYNTRAX',
    'SYNTRAX™',
    'SYNTRAX',
    'Lube Oil',
    'SYNTRAX™ synthetic media engine lube oil filters. Spin-on and cartridge '
    'designs for diesel engine crankcase circuits. Extended service interval '
    'capable media with high dirt-holding capacity. Addresses ISO 4406 '
    'cleanliness targets for bearing journal protection. Primary failure mode: '
    'particle contamination causing abrasive wear in engine bearing clearances. '
    'Standards: ISO 16889, ISO 4406, SAE J1211.',
    'ELIMFILTERS product catalog — SYNTRAX™ series'
  ),

  (
    'INTEKCORE',
    'INTEKCORE™',
    'INTEKCORE',
    'Air Intake',
    'INTEKCORE™ air cleaner housing assemblies for diesel engines and '
    'off-highway equipment. Accepts MACROCORE™ primary and safety elements. '
    'Round and panel configurations for agricultural, construction, and mining '
    'applications. Designed for high-dust environments requiring multi-stage '
    'pre-separation and primary filtration. Standard mounting interfaces. '
    'Standards: SAE J1539, ISO 5011.',
    'ELIMFILTERS product catalog — INTEKCORE™ series'
  ),

  (
    'HYDROCORE',
    'HYDROCORE™',
    'HYDROCORE',
    'Fuel Cleanliness',
    'HYDROCORE™ standalone fuel filter/water separator units. Formerly marketed '
    'as AQUAGUARD™ — technology renamed, product specifications unchanged. '
    'Complete spin-on and in-line fuel/water separation for diesel and biodiesel '
    'applications. Free and emulsified water removal in a single-stage unit. '
    'Primary failure mode: water contamination in fuel causing injector corrosion '
    'and stiction in high-pressure common rail systems. '
    'Standards: ASTM D6304, ISO 12937.',
    'ELIMFILTERS product catalog — HYDROCORE™ series (formerly AQUAGUARD™)'
  ),

  (
    'MICROKAPPA',
    'MICROKAPPA™',
    'MICROKAPPA',
    'Cabin Air',
    'MICROKAPPA™ cabin air filter elements for operator health and safety. '
    'Panel filter configurations for agricultural and construction equipment '
    'operator cabs. Controls PM10 particle exposure and reduces operator '
    'respiratory contamination risk in high-dust environments. '
    'Available in standard and activated-carbon variants. '
    'Standards: ISO 11155, DIN 71220.',
    'ELIMFILTERS product catalog — MICROKAPPA™ series'
  ),

  (
    'THERMACORE',
    'THERMACORE™',
    'THERMACORE',
    'Coolant',
    'THERMACORE™ engine coolant filter elements. Formerly marketed as COOLTECH™ '
    '— technology renamed, product specifications unchanged. Spin-on '
    'supplemental coolant additive (SCA) release filters for diesel engine '
    'cooling circuits. Controls cavitation erosion, cylinder liner pitting, '
    'and scale buildup. Compatible with OAT, HOAT, and conventional coolant '
    'formulations.',
    'ELIMFILTERS product catalog — THERMACORE™ series (formerly COOLTECH™)'
  ),

  (
    'DRYCORE',
    'DRYCORE™',
    'DRYCORE',
    'Compressed Air',
    'DRYCORE™ compressed air dryer elements for air brake and compressed air '
    'circuits. Spin-on desiccant and coalescing designs for commercial vehicle '
    'and industrial compressed air systems. Addresses ISO 8573-1 purity class '
    'requirements for moisture and oil aerosol removal. Primary application: '
    'commercial vehicle air brake protection and pneumatic actuator reliability.',
    'ELIMFILTERS product catalog — DRYCORE™ series'
  )

ON CONFLICT (family_code) DO NOTHING;


-- ── Step 2a: product_model — SYNTRAX™ (Lube Oil standalone) ─────────────────

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'standalone',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'SYNTRAX'
WHERE REPLACE(ec.technology, '™', '') = 'SYNTRAX'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2b: product_model — SYNTEPORE™ (Fuel/Hydraulic standalone) ─────────

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'standalone',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'SYNTEPORE'
WHERE REPLACE(ec.technology, '™', '') = 'SYNTEPORE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2c: product_model — THERMACORE™ (Coolant standalone) ───────────────
-- Note: descriptions may reference old name COOLTECH™ — this is expected.

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'standalone',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'THERMACORE'
WHERE REPLACE(ec.technology, '™', '') = 'THERMACORE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2d: product_model — DRYCORE™ (Compressed Air standalone) ───────────

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'standalone',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'DRYCORE'
WHERE REPLACE(ec.technology, '™', '') = 'DRYCORE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2e: product_model — HYDROCORE™ standalone (formerly AQUAGUARD™) ─────
-- Complete spin-on and in-line fuel/water separators.
-- Distinct from HYDROCORE/SERIES™ (turbine housing+element system).

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'standalone',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'HYDROCORE'
WHERE REPLACE(ec.technology, '™', '') = 'HYDROCORE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2f: product_model — NANOFORCE™ (Hydraulic) ─────────────────────────
-- Housings → model_type='durable' (Phase B will set accepts_elements=TRUE
-- and add element compatibility records once element pairings are confirmed).
-- Hydraulic Head → model_type='assembly'.
-- All others (Spin-On, Cartridge, In-Line, Fuel variants) → 'standalone'.
-- accepts_elements=FALSE for all records in this phase.

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  CASE ec.installation_type
    WHEN 'Hydraulic Filter Housing' THEN 'durable'
    WHEN 'Hydraulic Head'           THEN 'assembly'
    ELSE                                 'standalone'
  END,
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'NANOFORCE'
WHERE REPLACE(ec.technology, '™', '') = 'NANOFORCE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 2g: product_model — INTEKCORE™ (Air Cleaner Assemblies) ────────────
-- Air cleaner housings that accept MACROCORE™ primary and safety elements.
-- model_type='assembly' for Phase A. Phase B migration will:
--   UPDATE product_model SET model_type='durable', accepts_elements=TRUE,
--          compatibility_class=<macrocore-class> WHERE elimfilters_sku IN (...)
-- and then insert model_element_compatibility rows.

INSERT INTO product_model (
  family_id, elimfilters_sku, model_code,
  model_type, accepts_elements, has_heater, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'assembly',
  FALSE,
  FALSE,
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'INTEKCORE'
WHERE REPLACE(ec.technology, '™', '') = 'INTEKCORE'
ON CONFLICT (model_code) DO NOTHING;


-- ── Step 3a: product_element — MACROCORE™ (Air filter elements) ─────────────
-- Consumable elements installed in INTEKCORE™ assemblies.
-- compatibility_class = 'macrocore-<installation_type>' (lowercase, normalized).
-- Examples: 'macrocore-round', 'macrocore-radialseal', 'macrocore-panel',
--           'macrocore-finned'.
-- Phase B will set INTEKCORE model compatibility_class to match these values.
-- seal_type='OR' (schema default) — correctable per product in Phase B.
-- Orphan status expected — alternative_groups created in Phase B.

INSERT INTO product_element (
  family_id, elimfilters_sku, element_code,
  compatibility_class, seal_type, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'macrocore-' || LOWER(
    REGEXP_REPLACE(COALESCE(ec.installation_type, 'generic'), '[^a-zA-Z0-9]+', '-', 'g')
  ),
  'OR',
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'MACROCORE'
WHERE REPLACE(ec.technology, '™', '') = 'MACROCORE'
ON CONFLICT (element_code) DO NOTHING;


-- ── Step 3b: product_element — MICROKAPPA™ (Cabin air panel filters) ─────────
-- Consumable cabin filter panels.
-- compatibility_class = 'microkappa-<installation_type>' (lowercase, normalized).
-- Typically 'microkappa-panel'. seal_type='FS' (flat seal for panel filters).
-- Orphan status expected — alternative_groups created in Phase B.

INSERT INTO product_element (
  family_id, elimfilters_sku, element_code,
  compatibility_class, seal_type, description
)
SELECT
  pf.id,
  ec.sku,
  ec.sku,
  'microkappa-' || LOWER(
    REGEXP_REPLACE(COALESCE(ec.installation_type, 'panel'), '[^a-zA-Z0-9]+', '-', 'g')
  ),
  'FS',
  ec.description
FROM elimfilters_catalog ec
JOIN product_family pf ON pf.family_code = 'MICROKAPPA'
WHERE REPLACE(ec.technology, '™', '') = 'MICROKAPPA'
ON CONFLICT (element_code) DO NOTHING;


COMMIT;
