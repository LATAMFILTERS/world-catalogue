-- =============================================================================
-- KG PHASE 1 — SEED: kg_technologies
-- File: 003_seed_technologies.sql
-- Purpose: Insert the 13 canonical ELIMFILTERS technologies
-- Safe to run: YES (ON CONFLICT DO UPDATE — idempotent)
-- Depends on: 002_seed_systems.sql (kg_systems must exist)
--
-- DATA CORRECTIONS vs knowledge-architecture.ts (source: SEMANTIC_MODEL_REPORT.md):
--   MICROKAPPA: category = 'Cabin Air' (TS incorrectly said 'Coolant & Specialty')
--   SYNTRAX:    category = 'Lube / Oil' (TS incorrectly said 'Synthetic Fluid / Hydraulic')
--   NANOFORCE:  category = 'Hydraulic' (confirmed correct in DB)
-- =============================================================================

INSERT INTO kg_technologies (slug, display_name, primary_system_id, category, description, logo_file)
SELECT
  t.slug,
  t.display_name,
  ks.id AS primary_system_id,
  t.category,
  t.description,
  t.logo_file
FROM (VALUES

  -- Air Intake systems
  (
    'macrocore',
    'MACROCORE™',
    'air-intake',
    'Air Intake Filtration',
    'Primary and secondary air filtration technology for industrial engines and heavy equipment. Controls airborne particulate contamination (silica dust, carbon, combustion soot) entering intake systems. Multi-stage media construction with radial, axial, Tetramax, and PowerCore configurations. Addresses PARTICLE_WEAR contamination mode.',
    'logo-macrocore.png'
  ),
  (
    'intekcore',
    'INTEKCORE™',
    'air-intake',
    'Air Housing & Precleaner',
    'Precleaner and air housing technology for air intake systems. Pre-separates coarse debris and high-load particulate before primary filter stage. Used in extreme-duty agricultural, mining, and construction environments where primary filter life would otherwise be unacceptably short.',
    'logo-intekcore.png'
  ),

  -- Compressed Air systems
  (
    'drycore',
    'DRYCORE™',
    'compressed-air',
    'Air Dryer Technology',
    'Desiccant and coalescing dryer technology for compressed air systems. Controls atmospheric moisture and condensation to achieve ISO 8573 dew point targets. Prevents downstream corrosion, freeze-up of pneumatic controls, and contamination of process air. Desiccant and coalescing filter configurations.',
    'logo-drycore.png'
  ),
  (
    'gasultra',
    'GASULTRA™',
    'compressed-air',
    'Compressed Air Filtration',
    'Compressed air purity filtration achieving ISO 8573-1 purity classes. Removes oil mist, sub-micron particulates, and residual moisture from compressed air streams. Applied in manufacturing, mining instrument air, and industrial pneumatic control systems.',
    'logo-gasultra.png'
  ),

  -- Lube / Oil systems
  (
    'syntrax',
    'SYNTRAX™',
    'lube-oil',
    'Lube / Engine Oil Filtration',
    'Advanced synthetic media technology for engine oil (lube) filtration. Spin-on and cartridge configurations for heavy-duty diesel engines across agriculture, construction, marine, and automotive applications. Controls PARTICLE_WEAR contamination in crankcase oil circuits. High dirt capacity synthetic media. NOTE: Used for lube/oil filtration — NOT hydraulic filtration.',
    'logo-sintrax.png'
  ),
  (
    'duratech',
    'DURATECH™',
    'lube-oil',
    'Heavy-Duty Engine Oil Filtration',
    'Heavy-duty lube filter technology for extreme-duty applications in mining, construction, and high-load diesel engines. Extended service interval capability. Spin-on configuration. Addresses PARTICLE_WEAR contamination in high-load engine oil circuits.',
    'logo-duratech.png'
  ),
  (
    'cooltech',
    'COOLTECH™',
    'lube-oil',
    'Coolant Filtration',
    'Coolant filter technology for engine cooling systems. Spin-on configuration. Controls corrosion particles, scale deposits, and chemical degradation byproducts in coolant circuits. Adjacent to lube-oil system domain in the thermal management context.',
    'logo-cooltech.png'
  ),
  (
    'marineclean',
    'MARINECLEAN™',
    'lube-oil',
    'Marine Filtration',
    'Marine-specific filtration technology for lube oil and fuel systems in marine diesel engines. Vessel applications: fishing vessels, cargo ships, recreational marine. Addresses salt water ingress and marine-environment contamination modes.',
    'logo-marineclean.png'
  ),
  (
    'blueclean',
    'BLUECLEAN™',
    'lube-oil',
    'Specialty Filtration',
    'Specialty filtration technology for non-standard or high-purity lube oil applications. Applied where standard media configurations are insufficient due to fluid chemistry or contamination profile.',
    'logo-blueclean.png'
  ),

  -- Hydraulic systems
  (
    'nanoforce',
    'NANOFORCE™',
    'hydraulic',
    'Hydraulic Filtration',
    'Sub-micron hydraulic filtration technology achieving tight ISO 4406 cleanliness targets for proportional and servo valve protection. Spin-on and cartridge configurations. Controls HYDRAULIC_CONTAMINATION: valve spool stiction, orifice blockage, pump swashplate stiction. Beta ratio efficiency down to 1 µm. NOTE: Hydraulic filtration — NOT lube oil filtration.',
    'logo-nanoforce.png'
  ),

  -- Fuel systems
  (
    'aquaguard',
    'AQUAGUARD™',
    'fuel',
    'Fuel/Water Separation',
    'Fuel/water separator technology removing free and emulsified water from diesel fuel. Spin-on and cartridge configurations. Addresses DIESEL_WATER contamination mode: prevents injector stiction, microbial growth, and fuel gum formation. Applied in agriculture, marine, automotive, and power generation.',
    'logo-aquaguard.png'
  ),
  (
    'syntepore',
    'SYNTEPORE™',
    'fuel',
    'Fuel Filtration',
    'Synthetic media fuel filter technology removing particulates from diesel fuel systems. Inline, spin-on, and cartridge configurations. Controls fuel cleanliness to protect high-pressure common rail injector systems. Replaces deprecated SYNTAPORE designation.',
    'logo-syntepore.png'
  ),

  -- Cabin / Operator Safety
  (
    'microkappa',
    'MICROKAPPA™',
    'cabin',
    'Cabin Air Filtration',
    'Cabin air filter technology combining electrostatic attraction, HEPA-class mechanical filtration, and activated carbon adsorption. Removes PM2.5, PM10, chemical vapors, allergens, and biological contaminants from operator cabin air in heavy equipment, trucks, and agricultural machinery. Applies ISO 11155 and DIN 71220 standards. NOTE: Cabin air filtration — NOT coolant or specialty filtration.',
    'logo-microkappa.png'
  )

) AS t(slug, display_name, primary_system_slug, category, description, logo_file)
JOIN kg_systems ks ON ks.slug = t.primary_system_slug

ON CONFLICT (slug) DO UPDATE SET
  display_name      = EXCLUDED.display_name,
  primary_system_id = EXCLUDED.primary_system_id,
  category          = EXCLUDED.category,
  description       = EXCLUDED.description,
  logo_file         = EXCLUDED.logo_file,
  updated_at        = NOW();

-- Verification
SELECT
  kt.id,
  kt.slug,
  kt.display_name,
  ks.slug AS system_slug,
  kt.category,
  kt.logo_file
FROM kg_technologies kt
LEFT JOIN kg_systems ks ON ks.id = kt.primary_system_id
ORDER BY ks.sort_order, kt.slug;
