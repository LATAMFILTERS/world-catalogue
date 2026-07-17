-- =============================================================================
-- EBP PHASE 1 — SEED FIELD APPLICABILITY MATRIX
-- File: 002_seed_applicability_matrix.sql
-- Purpose: Seed an initial, defensible field-applicability dataset.
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
--
-- ⚠️  This seed data is a reasonable starting point grounded in general
-- ⚠️  filtration engineering practice. It is explicitly NOT asserted as an
-- ⚠️  ELIMFILTERS-engineering-reviewed authority. See
-- ⚠️  docs/ebp/phases/phase-01-product-engineering-passport.md "Risks".
-- =============================================================================

INSERT INTO ebp_field_applicability_matrix (product_category, product_subtype, field_name, applicability) VALUES
  ('OIL',        'SPIN_ON',         'bypass_valve_applicability',        'REQUIRED'),
  ('OIL',        'SPIN_ON',         'antidrainback_valve_applicability', 'REQUIRED'),
  ('OIL',        'SPIN_ON',         'beta_ratio',                        'REQUIRED'),
  ('OIL',        'SPIN_ON',         'micron_rating',                     'REQUIRED'),

  ('OIL',        'CARTRIDGE',       'bypass_valve_applicability',        'REQUIRED'),
  ('OIL',        'CARTRIDGE',       'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('OIL',        'CARTRIDGE',       'beta_ratio',                        'REQUIRED'),
  ('OIL',        'CARTRIDGE',       'micron_rating',                     'REQUIRED'),

  ('FUEL',       'SPIN_ON',         'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('FUEL',       'SPIN_ON',         'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('FUEL',       'SPIN_ON',         'beta_ratio',                        'REQUIRED'),
  ('FUEL',       'SPIN_ON',         'micron_rating',                     'REQUIRED'),

  ('FUEL',       'WATER_SEPARATOR', 'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('FUEL',       'WATER_SEPARATOR', 'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('FUEL',       'WATER_SEPARATOR', 'beta_ratio',                        'REQUIRED'),
  ('FUEL',       'WATER_SEPARATOR', 'micron_rating',                     'REQUIRED'),

  ('AIR',        'PANEL',           'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('AIR',        'PANEL',           'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('AIR',        'PANEL',           'beta_ratio',                        'NOT_APPLICABLE'),
  ('AIR',        'PANEL',           'micron_rating',                     'NOT_APPLICABLE'),

  ('AIR',        'RADIAL_SEAL',     'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('AIR',        'RADIAL_SEAL',     'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('AIR',        'RADIAL_SEAL',     'beta_ratio',                        'NOT_APPLICABLE'),
  ('AIR',        'RADIAL_SEAL',     'micron_rating',                     'NOT_APPLICABLE'),

  ('HYDRAULIC',  'SPIN_ON',         'bypass_valve_applicability',        'REQUIRED'),
  ('HYDRAULIC',  'SPIN_ON',         'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('HYDRAULIC',  'SPIN_ON',         'beta_ratio',                        'REQUIRED'),
  ('HYDRAULIC',  'SPIN_ON',         'micron_rating',                     'REQUIRED'),

  ('HYDRAULIC',  'CARTRIDGE',       'bypass_valve_applicability',        'REQUIRED'),
  ('HYDRAULIC',  'CARTRIDGE',       'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('HYDRAULIC',  'CARTRIDGE',       'beta_ratio',                        'REQUIRED'),
  ('HYDRAULIC',  'CARTRIDGE',       'micron_rating',                     'REQUIRED'),

  ('CABIN',      'PARTICULATE',     'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('CABIN',      'PARTICULATE',     'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('CABIN',      'PARTICULATE',     'beta_ratio',                        'NOT_APPLICABLE'),
  ('CABIN',      'PARTICULATE',     'micron_rating',                     'NOT_APPLICABLE'),

  ('CABIN',      'COMBINATION',     'bypass_valve_applicability',        'NOT_APPLICABLE'),
  ('CABIN',      'COMBINATION',     'antidrainback_valve_applicability', 'NOT_APPLICABLE'),
  ('CABIN',      'COMBINATION',     'beta_ratio',                        'NOT_APPLICABLE'),
  ('CABIN',      'COMBINATION',     'micron_rating',                     'NOT_APPLICABLE')
ON CONFLICT (product_category, product_subtype, field_name) DO NOTHING;
