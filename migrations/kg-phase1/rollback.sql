-- =============================================================================
-- KG PHASE 1 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 1 changes if needed
-- DOES NOT modify elimfilters_catalog — catalog is untouched by Phase 1
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 1 KG tables and data
-- ⚠️  Run only if Phase 1 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step 1: Drop join tables first (they have FK references to the node tables)
DROP TABLE IF EXISTS kg_product_technologies CASCADE;
DROP TABLE IF EXISTS kg_product_systems     CASCADE;

-- Step 2: Drop node tables
-- (ORDER matters: kg_technologies references kg_systems)
DROP TABLE IF EXISTS kg_technologies CASCADE;
DROP TABLE IF EXISTS kg_systems      CASCADE;

-- Step 3: Drop helper function (only if no other tables use it)
DROP FUNCTION IF EXISTS kg_set_updated_at() CASCADE;

-- Step 4: Verify rollback complete
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'kg_systems',
    'kg_technologies',
    'kg_product_systems',
    'kg_product_technologies'
  );
-- Expected: 0 rows (all tables dropped)

-- Step 5: Verify catalog is untouched
SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
-- Expected: 4,622 (same as before Phase 1)

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK OPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Option A: Clear population data only (keep schema + seeds, re-run migration)
-- Use if migration scripts need to be re-run with different logic:
/*
TRUNCATE kg_product_technologies;
TRUNCATE kg_product_systems;
-- Then re-run 004_populate_product_systems.sql and 005_populate_product_technologies.sql
*/

-- Option B: Re-seed technologies only (keep schema + product data)
-- Use if technology seed data needs corrections:
/*
-- First remove product links to technologies being modified
DELETE FROM kg_product_technologies;
-- Then truncate and re-seed
TRUNCATE kg_technologies RESTART IDENTITY CASCADE;
-- Re-run 003_seed_technologies.sql
-- Re-run 005_populate_product_technologies.sql
*/

-- Option C: Correct a single technology entry
-- Use for targeted data corrections without full rollback:
/*
UPDATE kg_technologies
SET
  category    = 'Correct Category',
  description = 'Updated description',
  updated_at  = NOW()
WHERE slug = 'slug-to-fix';
*/
