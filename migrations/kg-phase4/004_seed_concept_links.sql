-- =============================================================================
-- KG PHASE 4 — SEED CONCEPT LINKS (GRAPH EDGES)
-- File: 004_seed_concept_links.sql
-- Purpose: Create directed relationships between canonical concepts
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Depends on: 001_schema.sql, 002_seed_technology_blocks.sql, 003_seed_system_blocks.sql
--             (source and target slugs must exist in kg_canonical_blocks)
-- Affects elimfilters_catalog: NO
--
-- Link type semantics:
--   controls   — technology controls a contamination mode or system
--   measures   — standard provides measurement framework for system or contamination mode
--   applies_to — contamination mode applies to / occurs in a filtration system
--   related    — bidirectional non-directional conceptual relationship
--   requires   — system compliance requires a standard
--
-- Weight: 1=weak, 2=moderate, 3=strong/primary
-- =============================================================================

-- ─── SECTION 1: CONTAMINATION MODE → SYSTEM (applies_to) ─────────────────────
-- Which contamination modes occur in which filtration systems

INSERT INTO kg_concept_links (source_concept_slug, source_type, target_concept_slug, target_type, link_type, weight)
VALUES
  -- particle-wear occurs in multiple systems
  ('particle-wear', 'contamination_mode', 'lube-oil',   'system', 'applies_to', 3),
  ('particle-wear', 'contamination_mode', 'hydraulic',  'system', 'applies_to', 3),
  ('particle-wear', 'contamination_mode', 'air-intake', 'system', 'applies_to', 2),  -- air intake ingestion initiates particle wear
  ('particle-wear', 'contamination_mode', 'fuel',       'system', 'applies_to', 2),  -- fuel system particle wear on injectors

  -- diesel-water contamination in fuel systems
  ('diesel-water',  'contamination_mode', 'fuel',       'system', 'applies_to', 3),

  -- hydraulic contamination in hydraulic systems
  ('hydraulic-contamination', 'contamination_mode', 'hydraulic', 'system', 'applies_to', 3),
  ('hydraulic-contamination', 'contamination_mode', 'lube-oil',  'system', 'applies_to', 1),  -- overlap: shared contamination mechanisms

  -- varnish formation in hydraulic and lube systems
  ('varnish-formation', 'contamination_mode', 'hydraulic', 'system', 'applies_to', 3),
  ('varnish-formation', 'contamination_mode', 'lube-oil',  'system', 'applies_to', 2),

  -- microbial growth in fuel (primary) and hydraulic (water-based fluids)
  ('microbial-growth', 'contamination_mode', 'fuel',      'system', 'applies_to', 3),
  ('microbial-growth', 'contamination_mode', 'hydraulic', 'system', 'applies_to', 1)  -- HFA/HFB water-based hydraulic fluids

ON CONFLICT (source_concept_slug, source_type, target_concept_slug, target_type, link_type) DO NOTHING;


-- ─── SECTION 2: TECHNOLOGY → CONTAMINATION MODE (controls) ───────────────────
-- Which technologies control which contamination modes

INSERT INTO kg_concept_links (source_concept_slug, source_type, target_concept_slug, target_type, link_type, weight)
VALUES
  -- MACROCORE controls air-intake particle wear
  ('macrocore',   'technology', 'particle-wear',            'contamination_mode', 'controls', 3),

  -- INTEKCORE pre-cleaner reduces particle wear initiation
  ('intekcore',   'technology', 'particle-wear',            'contamination_mode', 'controls', 2),

  -- NANOFORCE controls hydraulic contamination and particle wear in hydraulic systems
  ('nanoforce',   'technology', 'hydraulic-contamination',  'contamination_mode', 'controls', 3),
  ('nanoforce',   'technology', 'particle-wear',            'contamination_mode', 'controls', 3),
  ('nanoforce',   'technology', 'varnish-formation',        'contamination_mode', 'controls', 2),  -- removes precursor particles

  -- SYNTRAX controls lube oil particle wear
  ('syntrax',     'technology', 'particle-wear',            'contamination_mode', 'controls', 3),

  -- DURATECH controls lube oil particle wear (extended drain)
  ('duratech',    'technology', 'particle-wear',            'contamination_mode', 'controls', 3),

  -- THERMACORE controls coolant contamination (coolant degradation mode)
  ('thermacore',    'technology', 'particle-wear',            'contamination_mode', 'controls', 1),  -- removes coolant-borne particles

  -- MARINECLEAN controls particle wear in marine environment
  ('marineclean', 'technology', 'particle-wear',            'contamination_mode', 'controls', 3),

  -- AQUAGUARD controls diesel water and microbial growth (by removing water)
  ('TURBOCORE',   'technology', 'diesel-water',             'contamination_mode', 'controls', 3),
  ('TURBOCORE',   'technology', 'microbial-growth',         'contamination_mode', 'controls', 3),  -- removes water substrate
  ('TURBOCORE',   'technology', 'hydraulic-contamination',  'contamination_mode', 'controls', 2),  -- water removal from hydraulic fluid

  -- SYNTAPORE controls particle wear in fuel injection systems
  ('SYNTAPORE',   'technology', 'particle-wear',            'contamination_mode', 'controls', 2),
  ('SYNTAPORE',   'technology', 'diesel-water',             'contamination_mode', 'controls', 1),  -- downstream of water separator

  -- BLUECLEAN controls particle wear in ATF/specialty fluid systems
  ('blueclean',   'technology', 'particle-wear',            'contamination_mode', 'controls', 2)

ON CONFLICT (source_concept_slug, source_type, target_concept_slug, target_type, link_type) DO NOTHING;


-- ─── SECTION 3: TECHNOLOGY → SYSTEM (controls/applies_to) ────────────────────
-- Which technologies protect which filtration systems

INSERT INTO kg_concept_links (source_concept_slug, source_type, target_concept_slug, target_type, link_type, weight)
VALUES
  -- Air intake technologies
  ('macrocore',     'technology', 'air-intake',     'system', 'controls', 3),
  ('intekcore',     'technology', 'air-intake',     'system', 'controls', 3),

  -- Hydraulic technology
  ('nanoforce',     'technology', 'hydraulic',      'system', 'controls', 3),

  -- Lube oil technologies
  ('syntrax',       'technology', 'lube-oil',       'system', 'controls', 3),
  ('duratech',      'technology', 'lube-oil',       'system', 'controls', 3),
  ('thermacore',      'technology', 'lube-oil',       'system', 'controls', 2),  -- coolant is lube system adjacent
  ('marineclean',   'technology', 'lube-oil',       'system', 'controls', 3),
  ('blueclean',     'technology', 'lube-oil',       'system', 'controls', 2),  -- ATF/specialty fluid

  -- Fuel technologies
  ('TURBOCORE',     'technology', 'fuel',           'system', 'controls', 3),
  ('SYNTAPORE',     'technology', 'fuel',           'system', 'controls', 3),

  -- Cabin technology
  ('microkappa',    'technology', 'cabin',          'system', 'controls', 3),

  -- Compressed air technologies
  ('drycore',       'technology', 'compressed-air', 'system', 'controls', 3),
  ('gasultra',      'technology', 'compressed-air', 'system', 'controls', 3),

  -- Cross-system links (technologies with secondary system coverage)
  ('nanoforce',     'technology', 'fuel',           'system', 'controls', 1),  -- water removal in some fuel applications
  ('TURBOCORE',     'technology', 'hydraulic',      'system', 'controls', 2),  -- water removal from hydraulic fluid
  ('syntrax',       'technology', 'hydraulic',      'system', 'controls', 1)   -- some SYNTRAX products overlap hydraulic-adjacent

ON CONFLICT (source_concept_slug, source_type, target_concept_slug, target_type, link_type) DO NOTHING;


-- ─── SECTION 4: SYSTEM → STANDARD (requires) ─────────────────────────────────
-- Which standards are required for each system's compliance and measurement
-- Using text slugs that will be canonical block slugs when standard blocks are added
-- NOTE: Standard canonical blocks are seeded in a later phase (Phase 4F)
-- These links are pre-populated with known slugs; they will resolve once standard
-- blocks exist. Link integrity validator in validate.sql Section D checks this.

-- For now, linking systems to each other via 'related' where systems share standards

INSERT INTO kg_concept_links (source_concept_slug, source_type, target_concept_slug, target_type, link_type, weight)
VALUES
  -- Systems related to each other (share contamination or technology overlap)
  ('lube-oil',       'system', 'hydraulic',      'system', 'related', 2),  -- shared ISO 4406 / ISO 16889
  ('lube-oil',       'system', 'fuel',            'system', 'related', 1),  -- shared diesel engine context
  ('air-intake',     'system', 'lube-oil',        'system', 'related', 2),  -- air intake contamination feeds lube system
  ('air-intake',     'system', 'cabin',           'system', 'related', 2),  -- both deal with atmospheric particulate
  ('fuel',           'system', 'hydraulic',       'system', 'related', 1),  -- both use ISO 16889 filter testing
  ('compressed-air', 'system', 'cabin',           'system', 'related', 1),  -- compressed air used in some cab systems
  ('hydraulic',      'system', 'lube-oil',        'system', 'related', 2)   -- shared varnish formation concern

ON CONFLICT (source_concept_slug, source_type, target_concept_slug, target_type, link_type) DO NOTHING;


-- ─── SECTION 5: CROSS-TECHNOLOGY LINKS (related) ─────────────────────────────
-- Technologies that are commonly deployed together on the same equipment platform

INSERT INTO kg_concept_links (source_concept_slug, source_type, target_concept_slug, target_type, link_type, weight)
VALUES
  -- Pre-cleaner + primary filter relationship
  ('intekcore',   'technology', 'macrocore',    'technology', 'related', 3),

  -- Fuel water separator + fuel particle filter (two-stage fuel filtration)
  ('TURBOCORE',   'technology', 'SYNTAPORE',    'technology', 'related', 3),

  -- Desiccant dryer + coalescer (compressed air treatment train)
  ('drycore',     'technology', 'gasultra',     'technology', 'related', 3),

  -- Air intake + lube oil (same diesel engine platform)
  ('macrocore',   'technology', 'syntrax',      'technology', 'related', 2),
  ('macrocore',   'technology', 'duratech',     'technology', 'related', 2),

  -- Lube oil technologies (related within lube system family)
  ('syntrax',     'technology', 'duratech',     'technology', 'related', 2),
  ('syntrax',     'technology', 'thermacore',     'technology', 'related', 2),

  -- Marine technology relationships
  ('marineclean', 'technology', 'TURBOCORE',    'technology', 'related', 2)

ON CONFLICT (source_concept_slug, source_type, target_concept_slug, target_type, link_type) DO NOTHING;


-- =============================================================================
-- Expected after successful run:
--   Section 1: 11 applies_to links (contamination → system)
--   Section 2: ~16 controls links (technology → contamination mode)
--   Section 3: ~17 controls links (technology → system)
--   Section 4: 7 related links (system → system)
--   Section 5: 8 related links (technology → technology)
--   Total: ~59 concept link rows
--
-- Verify with:
--   SELECT link_type, COUNT(*) FROM kg_concept_links
--   GROUP BY link_type ORDER BY link_type;
--
--   SELECT source_type, target_type, link_type, COUNT(*)
--   FROM kg_concept_links
--   GROUP BY source_type, target_type, link_type
--   ORDER BY source_type, target_type, link_type;
--
-- Check for orphan links (should return 0 rows after all seed scripts run):
--   SELECT cl.source_concept_slug, cl.source_type
--   FROM kg_concept_links cl
--   LEFT JOIN kg_canonical_blocks b
--     ON b.concept_slug = cl.source_concept_slug AND b.concept_type = cl.source_type
--   WHERE b.id IS NULL;
-- =============================================================================
