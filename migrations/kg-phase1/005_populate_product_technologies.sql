-- =============================================================================
-- KG PHASE 1 — POPULATE: kg_product_technologies
-- File: 005_populate_product_technologies.sql
-- Purpose: Map all products from elimfilters_catalog → kg_technologies via technology column
-- Safe to run: YES (ON CONFLICT DO NOTHING — idempotent)
-- Depends on: 003_seed_technologies.sql (kg_technologies must be seeded)
--
-- CONFIRMED technology values in DB (from live audit Q1, Q13):
--   NANOFORCE™   → 1,962  → slug: nanoforce
--   MACROCORE™   → 1,366  → slug: macrocore
--   SYNTAPORE™   →   500  → slug: syntepore  ← DEPRECATED NAME, maps to syntepore
--   SYNTRAX™     →   351  → slug: syntrax
--   INTAKCORE™   →   243  → slug: intekcore  ← DB TYPO, canonical is intekcore
--   MICROKAPPA™  →   122  → slug: microkappa
--   COOLTECH™    →    59  → slug: cooltech
--   AQUAGUARD™   →    16  → slug: aquaguard
--   DRYCORE™     →     3  → slug: drycore
--   TOTAL: 4,622  (100% technology fill rate)
--
-- ADDITIONAL aliases handled defensively (may appear after new imports):
--   SINTRAX™     → slug: syntrax   (known alias)
--   INTEKCORE™   → slug: intekcore (canonical form — not yet in DB but may appear)
--   SYNTEPORE™   → slug: syntepore (correct name — not yet in DB but may appear)
--   DURATECH™    → slug: duratech  (in logo map, 0 products currently)
--   GASULTRA™    → slug: gasultra
--   MARINECLEAN™ → slug: marineclean
--   BLUECLEAN™   → slug: blueclean
-- =============================================================================

-- Step 1: Dry-run — show what will be mapped
-- Uncomment to verify before Step 2:
/*
SELECT
  raw_tech,
  resolved_slug,
  COUNT(*) AS product_count
FROM (
  SELECT
    ec.technology AS raw_tech,
    LOWER(
      REGEXP_REPLACE(
        CASE UPPER(REGEXP_REPLACE(ec.technology, '[™®\s]', '', 'g'))
          WHEN 'SYNTAPORE'  THEN 'SYNTEPORE'
          WHEN 'SINTRAX'    THEN 'SYNTRAX'
          WHEN 'INTAKCORE'  THEN 'INTEKCORE'
        ELSE REGEXP_REPLACE(ec.technology, '[™®\s]', '', 'g')
        END,
        '[™®\s]', '', 'g'
      )
    ) AS resolved_slug
  FROM elimfilters_catalog ec
  WHERE ec.technology IS NOT NULL
) AS normalized
GROUP BY raw_tech, resolved_slug
ORDER BY product_count DESC;
*/

-- Step 2: Populate kg_product_technologies
-- Normalization logic:
--   1. Strip ™, ®, whitespace chars
--   2. Apply alias corrections (SYNTAPORE→SYNTEPORE, SINTRAX→SYNTRAX, INTAKCORE→INTEKCORE)
--   3. Lowercase → join to kg_technologies.slug

INSERT INTO kg_product_technologies (product_sku, technology_id)
SELECT
  ec.sku,
  kt.id
FROM elimfilters_catalog ec
JOIN kg_technologies kt ON kt.slug = LOWER(
    REGEXP_REPLACE(
      CASE UPPER(REGEXP_REPLACE(ec.technology, '[™®[:space:]]', '', 'g'))
        WHEN 'SYNTAPORE'  THEN 'SYNTEPORE'
        WHEN 'SINTRAX'    THEN 'SYNTRAX'
        WHEN 'INTAKCORE'  THEN 'INTEKCORE'
      ELSE REGEXP_REPLACE(ec.technology, '[™®[:space:]]', '', 'g')
      END,
      '[™®[:space:]]', '', 'g'
    )
  )
WHERE ec.technology IS NOT NULL
ON CONFLICT (product_sku, technology_id) DO NOTHING;

-- Step 3: Capture unmapped technology values
-- These are products with a technology value that didn't match any kg_technologies.slug
-- Expected: 0 rows
CREATE TEMP TABLE IF NOT EXISTS kg_phase1_unmapped_technologies AS
SELECT
  ec.sku,
  ec.technology,
  ec.filter_type
FROM elimfilters_catalog ec
LEFT JOIN kg_product_technologies kpt ON kpt.product_sku = ec.sku
WHERE ec.technology IS NOT NULL
  AND kpt.product_sku IS NULL;

SELECT COUNT(*) AS unmapped_product_count FROM kg_phase1_unmapped_technologies;

-- If > 0, investigate:
-- SELECT technology, COUNT(*) FROM kg_phase1_unmapped_technologies GROUP BY technology ORDER BY COUNT(*) DESC;
-- Then add the missing alias to the CASE expression above and re-run.

-- Step 4: Products with NULL technology
SELECT COUNT(*) AS null_technology_products
FROM elimfilters_catalog
WHERE technology IS NULL;
-- Expected: 0 (audit confirmed 100% fill rate)

-- Step 5: Products with no technology mapping in KG (may differ from NULL)
SELECT COUNT(*) AS products_without_kg_technology
FROM elimfilters_catalog ec
LEFT JOIN kg_product_technologies kpt ON kpt.product_sku = ec.sku
WHERE kpt.product_sku IS NULL;
-- Expected: 0


-- Step 6: Verification — final counts per technology
SELECT
  kt.slug,
  kt.display_name,
  kt.category,
  COUNT(kptec.product_sku) AS mapped_products
FROM kg_technologies kt
LEFT JOIN kg_product_technologies kptec ON kptec.technology_id = kt.id
GROUP BY kt.id, kt.slug, kt.display_name, kt.category
ORDER BY COUNT(kptec.product_sku) DESC;

-- Expected output:
-- slug        | display_name   | category               | mapped_products
-- nanoforce   | NANOFORCE™     | Hydraulic Filtration   | 1,962
-- macrocore   | MACROCORE™     | Air Intake Filtration  | 1,366
-- syntepore   | SYNTEPORE™     | Fuel Filtration        |   500  ← was SYNTAPORE in DB
-- syntrax     | SYNTRAX™       | Lube / Oil Filtration  |   351
-- intekcore   | INTEKCORE™     | Air Housing & Precl.   |   243  ← was INTAKCORE in DB
-- microkappa  | MICROKAPPA™    | Cabin Air Filtration   |   122
-- cooltech    | COOLTECH™      | Coolant Filtration     |    59
-- aquaguard   | AQUAGUARD™     | Fuel/Water Separation  |    16
-- drycore     | DRYCORE™       | Air Dryer Technology   |     3
-- duratech    | DURATECH™      | Heavy-Duty Engine Oil  |     0  ← expected, no products yet
-- gasultra    | GASULTRA™      | Compressed Air         |     0  ← expected
-- marineclean | MARINECLEAN™   | Marine Filtration      |     0  ← expected
-- blueclean   | BLUECLEAN™     | Specialty Filtration   |     0  ← expected
-- TOTAL mapped                                          | 4,622
