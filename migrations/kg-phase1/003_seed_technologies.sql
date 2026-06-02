-- =============================================================================
-- KG PHASE 1 — SEED: kg_technologies
-- File: 003_seed_technologies.sql
-- Purpose: Insert the 11 canonical ELIMFILTERS technologies into kg_technologies
-- Safe to run: YES (ON CONFLICT DO UPDATE — idempotent)
-- Depends on: 002_seed_systems.sql (kg_systems must exist)
--
-- TECHNOLOGY COUNT: 11 (reduced from 13 — see exclusions below)
--
-- STATUS VALUES:
--   ACTIVE     — 9 technologies with products in elimfilters_catalog
--   PRE_LAUNCH — 2 technologies with pages built but no catalog products yet
--
-- ACTIVE TECHNOLOGIES (9):
--   macrocore, intekcore, drycore, syntrax, cooltech, nanoforce,
--   aquaguard, syntepore, microkappa
--
-- PRE_LAUNCH TECHNOLOGIES (2):
--   duratech   — Fleet maintenance kit system. Pages exist in techPagesData.ts.
--                No products in elimfilters_catalog yet. Full KG participation.
--   marineclean — Marine filtration. Pages exist in techPagesData.ts.
--                No products in elimfilters_catalog yet. Full KG participation.
--
-- EXCLUDED FROM KG (NOT seeded here):
--   BLUECLEAN™ — Excluded. No products in catalog. No canonical block. No
--                technical content defined. No semantic value in current KG.
--                Retained only in server.js TECH_LOGO_MAP for future activation.
--                Activate by adding a row here when catalog products are loaded.
--
--   GASULTRA™  — Excluded. Same reasons as BLUECLEAN. Placeholder-only status.
--                No products, no technical content, no canonical block, no
--                semantic value. Retained in TECH_LOGO_MAP only.
--                Activate by adding a row here when catalog products are loaded.
--
-- DATA CORRECTIONS vs knowledge-architecture.ts (source: SEMANTIC_MODEL_REPORT.md):
--   MICROKAPPA: category = 'Cabin Air Filtration'
--               (TS incorrectly had 'Coolant & Specialty')
--   SYNTRAX:    category = 'Lube / Engine Oil Filtration'
--               (TS incorrectly had 'Synthetic Fluid / Hydraulic')
--   NANOFORCE:  category = 'Hydraulic Filtration'
--               (confirmed correct — documented here for consistency)
-- =============================================================================

INSERT INTO kg_technologies (slug, display_name, primary_system_id, category, description, logo_file, status)
SELECT
  t.slug,
  t.display_name,
  ks.id AS primary_system_id,
  t.category,
  t.description,
  t.logo_file,
  t.status
FROM (VALUES

  -- ─── AIR INTAKE SYSTEMS ────────────────────────────────────────────────────

  (
    'macrocore',
    'MACROCORE™',
    'air-intake',
    'Air Intake Filtration',
    'Primary and secondary air filtration technology for industrial engines and heavy equipment. Controls airborne particulate contamination (silica dust, carbon, combustion soot) entering intake systems. Multi-stage media construction with radial, axial, Tetramax, and PowerCore configurations. Addresses PARTICLE_WEAR contamination mode.',
    'logo-macrocore.png',
    'ACTIVE'
  ),
  (
    'intekcore',
    'INTEKCORE™',
    'air-intake',
    'Air Housing & Precleaner',
    'Precleaner and air housing technology for air intake systems. Pre-separates coarse debris and high-load particulate before primary filter stage. Used in extreme-duty agricultural, mining, and construction environments where primary filter life would otherwise be unacceptably short.',
    'logo-intekcore.png',
    'ACTIVE'
  ),

  -- ─── COMPRESSED AIR SYSTEMS ────────────────────────────────────────────────
  -- NOTE: GASULTRA™ excluded from this section — no products, no technical
  -- content, placeholder only. See file header for exclusion rationale.

  (
    'drycore',
    'DRYCORE™',
    'compressed-air',
    'Air Dryer Technology',
    'Desiccant and coalescing dryer technology for compressed air systems. Controls atmospheric moisture and condensation to achieve ISO 8573 dew point targets. Prevents downstream corrosion, freeze-up of pneumatic controls, and contamination of process air. Desiccant and coalescing filter configurations.',
    'logo-drycore.png',
    'ACTIVE'
  ),

  -- ─── LUBE / OIL SYSTEMS ────────────────────────────────────────────────────
  -- NOTE: BLUECLEAN™ excluded from this section — no products, no technical
  -- content, placeholder only. See file header for exclusion rationale.

  (
    'syntrax',
    'SYNTRAX™',
    'lube-oil',
    'Lube / Engine Oil Filtration',
    'Advanced synthetic media technology for engine oil (lube) filtration. Spin-on and cartridge configurations for heavy-duty diesel engines across agriculture, construction, marine, and automotive applications. Controls PARTICLE_WEAR contamination in crankcase oil circuits. High dirt capacity synthetic media. NOTE: Lube/oil filtration only — NOT hydraulic filtration.',
    'logo-sintrax.png',
    'ACTIVE'
  ),
  (
    'duratech',
    'DURATECH™',
    'lube-oil',
    'Heavy-Duty Engine Oil Filtration',
    'Fleet maintenance kit system consolidating all filter elements for a defined vehicle platform into a single service event. Oil, fuel, air, and cabin filters coordinated to a unified service interval. Heavy-duty lube filter technology for extreme-duty applications in mining, construction, and high-load diesel engines. Extended service interval capability. Spin-on configuration.',
    'logo-duratech.png',
    'PRE_LAUNCH'
  ),
  (
    'cooltech',
    'COOLTECH™',
    'lube-oil',
    'Coolant Filtration',
    'Coolant filter technology for engine cooling systems. Spin-on configuration. Controls corrosion particles, scale deposits, and chemical degradation byproducts in coolant circuits. Adjacent to lube-oil system domain in the thermal management context.',
    'logo-cooltech.png',
    'ACTIVE'
  ),
  (
    'marineclean',
    'MARINECLEAN™',
    'lube-oil',
    'Marine Filtration',
    'Marine-specific filtration technology for lube oil and fuel systems in marine diesel engines. Salt-resistant architecture with epoxy-coated external surfaces and brine-rejection geometry. IMO-certified for commercial and offshore vessel operation. Addresses salt water ingress and marine-environment contamination modes. Vessel applications: fishing vessels, cargo ships, offshore platforms.',
    'logo-marineclean.png',
    'PRE_LAUNCH'
  ),

  -- ─── HYDRAULIC SYSTEMS ─────────────────────────────────────────────────────

  (
    'nanoforce',
    'NANOFORCE™',
    'hydraulic',
    'Hydraulic Filtration',
    'Sub-micron hydraulic filtration technology achieving tight ISO 4406 cleanliness targets for proportional and servo valve protection. Spin-on and cartridge configurations. Controls HYDRAULIC_CONTAMINATION: valve spool stiction, orifice blockage, pump swashplate stiction. Beta ratio efficiency down to 1 µm. NOTE: Hydraulic filtration — NOT lube oil filtration.',
    'logo-nanoforce.png',
    'ACTIVE'
  ),

  -- ─── FUEL SYSTEMS ──────────────────────────────────────────────────────────

  (
    'aquaguard',
    'AQUAGUARD™',
    'fuel',
    'Fuel/Water Separation',
    'Fuel/water separator technology removing free and emulsified water from diesel fuel. Spin-on and cartridge configurations. Addresses DIESEL_WATER contamination mode: prevents injector stiction, microbial growth, and fuel gum formation. Applied in agriculture, marine, automotive, and power generation.',
    'logo-aquaguard.png',
    'ACTIVE'
  ),
  (
    'syntepore',
    'SYNTEPORE™',
    'fuel',
    'Fuel Filtration',
    'Synthetic media fuel filter technology removing particulates from diesel fuel systems. Inline, spin-on, and cartridge configurations. Controls fuel cleanliness to protect high-pressure common rail injector systems. Replaces deprecated SYNTAPORE designation.',
    'logo-syntepore.png',
    'ACTIVE'
  ),

  -- ─── CABIN / OPERATOR SAFETY ───────────────────────────────────────────────

  (
    'microkappa',
    'MICROKAPPA™',
    'cabin',
    'Cabin Air Filtration',
    'Cabin air filter technology combining electrostatic attraction, HEPA-class mechanical filtration, and activated carbon adsorption. Removes PM2.5, PM10, chemical vapors, allergens, and biological contaminants from operator cabin air in heavy equipment, trucks, and agricultural machinery. Applies ISO 11155 and DIN 71220 standards. NOTE: Cabin air filtration — NOT coolant or specialty filtration.',
    'logo-microkappa.png',
    'ACTIVE'
  )

) AS t(slug, display_name, primary_system_slug, category, description, logo_file, status)
JOIN kg_systems ks ON ks.slug = t.primary_system_slug

ON CONFLICT (slug) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  primary_system_id = EXCLUDED.primary_system_id,
  category          = EXCLUDED.category,
  description       = EXCLUDED.description,
  logo_file         = EXCLUDED.logo_file,
  status            = EXCLUDED.status,
  updated_at        = NOW();

-- Verification — expected: 11 rows
SELECT
  kt.id,
  kt.slug,
  kt.display_name,
  ks.slug  AS system_slug,
  kt.category,
  kt.status,
  kt.logo_file
FROM kg_technologies kt
LEFT JOIN kg_systems ks ON ks.id = kt.primary_system_id
ORDER BY kt.status DESC, ks.sort_order, kt.slug;

-- Expected output:
-- status      | slug        | display_name   | system_slug    | category
-- ACTIVE      | macrocore   | MACROCORE™     | air-intake     | Air Intake Filtration
-- ACTIVE      | intekcore   | INTEKCORE™     | air-intake     | Air Housing & Precleaner
-- ACTIVE      | drycore     | DRYCORE™       | compressed-air | Air Dryer Technology
-- ACTIVE      | syntrax     | SYNTRAX™       | lube-oil       | Lube / Engine Oil Filtration
-- ACTIVE      | cooltech    | COOLTECH™      | lube-oil       | Coolant Filtration
-- ACTIVE      | nanoforce   | NANOFORCE™     | hydraulic      | Hydraulic Filtration
-- ACTIVE      | aquaguard   | AQUAGUARD™     | fuel           | Fuel/Water Separation
-- ACTIVE      | syntepore   | SYNTEPORE™     | fuel           | Fuel Filtration
-- ACTIVE      | microkappa  | MICROKAPPA™    | cabin          | Cabin Air Filtration
-- PRE_LAUNCH  | duratech    | DURATECH™      | lube-oil       | Heavy-Duty Engine Oil Filtration
-- PRE_LAUNCH  | marineclean | MARINECLEAN™   | lube-oil       | Marine Filtration
-- (11 rows)
