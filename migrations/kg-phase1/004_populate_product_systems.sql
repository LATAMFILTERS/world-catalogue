-- =============================================================================
-- KG PHASE 1 — POPULATE: kg_product_systems
-- File: 004_populate_product_systems.sql
-- Purpose: Map all products from elimfilters_catalog → kg_systems via filter_type
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Depends on: 002_seed_systems.sql (kg_systems must be seeded)
--
-- DATA SOURCE: elimfilters_catalog.filter_type (character varying, NOT JSONB)
-- CONFIRMED filter_type values in DB (from live audit Q2, Q13):
--   air         → 1,366 products (MACROCORE air intake primary + secondary)
--   air-intake  →   243 products (INTAKCORE housing/precleaner)
--   air-dryer   →     3 products (DRYCORE)
--   fuel        →   500 products (SYNTAPORE → SYNTEPORE)
--   hydraulic   → 1,962 products (NANOFORCE)
--   lube        →   351 products (SYNTRAX)
--   cabin       →   122 products (MICROKAPPA)
--   coolant     →    59 products (COOLTECH)
--   turbine     →    16 products (AQUAGUARD — turbine fuel system)
--   TOTAL: 4,622 products (100% expected coverage)
-- =============================================================================

-- Step 1: Dry-run count before population
-- Uncomment to verify before running Step 2:
/*
SELECT
  ec.filter_type,
  ks.slug AS maps_to_system,
  COUNT(*) AS product_count
FROM elimfilters_catalog ec
JOIN (VALUES
  ('air',         'air-intake'),
  ('air-intake',  'air-intake'),
  ('air-dryer',   'compressed-air'),
  ('fuel',        'fuel'),
  ('hydraulic',   'hydraulic'),
  ('lube',        'lube-oil'),
  ('cabin',       'cabin'),
  ('coolant',     'lube-oil'),
  ('turbine',     'fuel')
) AS ft_map(filter_type_val, system_slug)
  ON LOWER(TRIM(ec.filter_type)) = ft_map.filter_type_val
JOIN kg_systems ks ON ks.slug = ft_map.system_slug
GROUP BY ec.filter_type, ks.slug
ORDER BY ks.slug, COUNT(*) DESC;
*/

-- Step 2: Populate kg_product_systems
WITH filter_type_map AS (
  SELECT * FROM (VALUES
    ('air',         'air-intake'),
    ('air-intake',  'air-intake'),
    ('air-dryer',   'compressed-air'),
    ('fuel',        'fuel'),
    ('hydraulic',   'hydraulic'),
    ('lube',        'lube-oil'),
    ('cabin',       'cabin'),
    ('coolant',     'lube-oil'),
    ('turbine',     'fuel')
  ) AS t(filter_type_val, system_slug)
)
INSERT INTO kg_product_systems (product_sku, system_id)
SELECT
  ec.sku,
  ks.id
FROM elimfilters_catalog ec
JOIN filter_type_map ftm
  ON LOWER(TRIM(ec.filter_type)) = ftm.filter_type_val
JOIN kg_systems ks
  ON ks.slug = ftm.system_slug
WHERE ec.filter_type IS NOT NULL
ON CONFLICT (product_sku, system_id) DO NOTHING;

-- Step 3: Capture unmapped products (filter_type present but not in mapping)
-- Expected: 0 rows if DB data matches audit results
CREATE TEMP TABLE IF NOT EXISTS kg_phase1_unmapped_systems AS
SELECT
  ec.sku,
  ec.filter_type,
  ec.technology
FROM elimfilters_catalog ec
LEFT JOIN (VALUES
  ('air'), ('air-intake'), ('air-dryer'), ('fuel'),
  ('hydraulic'), ('lube'), ('cabin'), ('coolant'), ('turbine')
) AS known_types(ft) ON LOWER(TRIM(ec.filter_type)) = known_types.ft
WHERE ec.filter_type IS NOT NULL
  AND known_types.ft IS NULL;

SELECT COUNT(*) AS unmapped_products_with_filter_type FROM kg_phase1_unmapped_systems;

-- If > 0: review with:
-- SELECT filter_type, COUNT(*) FROM kg_phase1_unmapped_systems GROUP BY filter_type ORDER BY COUNT(*) DESC;

-- Step 4: Products with NULL filter_type (cannot be mapped)
SELECT COUNT(*) AS products_with_null_filter_type
FROM elimfilters_catalog
WHERE filter_type IS NULL;


-- Step 5: Verification — final counts
SELECT
  ks.slug AS system,
  ks.name,
  COUNT(kps.product_sku) AS mapped_products
FROM kg_systems ks
LEFT JOIN kg_product_systems kps ON kps.system_id = ks.id
GROUP BY ks.id, ks.slug, ks.name
ORDER BY ks.sort_order;

-- Expected output:
-- system          | name                      | mapped_products
-- air-intake      | Air Intake Filtration     | 1,609  (1366 air + 243 air-intake)
-- fuel            | Fuel Filtration           |   516  (500 fuel + 16 turbine)
-- hydraulic       | Hydraulic Systems         | 1,962
-- lube-oil        | Lube / Oil Filtration     |   410  (351 lube + 59 coolant)
-- cabin           | Cabin / Operator Safety   |   122
-- compressed-air  | Compressed Air Systems    |     3
-- TOTAL                                       | 4,622  ← should equal SELECT COUNT(*) FROM elimfilters_catalog
