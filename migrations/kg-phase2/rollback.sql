-- =============================================================================
-- KG PHASE 2 — ROLLBACK
-- File: rollback.sql
-- Purpose: Undo Phase 2 schema creation and data extraction
-- Safe to run: YES (IF EXISTS prevents errors if tables don't exist)
-- Effect on elimfilters_catalog: NONE — source data is never modified
-- Effect on Phase 1 tables: NONE — Phase 2 tables are independent
-- =============================================================================

-- =============================================================================
-- OPTION A: FULL ROLLBACK
-- Drops all 3 Phase 2 tables in dependency order (child first, then parent)
-- Use when: Phase 2 needs to be completely re-designed or re-run from scratch
-- After full rollback: re-run 001_schema.sql through 004_populate_product_equipment.sql
-- =============================================================================

-- Step 1: Drop join table first (references kg_equipment_models)
DROP TABLE IF EXISTS kg_product_equipment;

-- Step 2: Drop models (references kg_equipment_makes)
DROP TABLE IF EXISTS kg_equipment_models;

-- Step 3: Drop makes (root Phase 2 table)
DROP TABLE IF EXISTS kg_equipment_makes;

-- Step 4: Drop triggers (tables already gone, but clean up if needed)
-- Note: triggers are dropped automatically when tables are dropped
-- This is here for explicit documentation:
-- DROP TRIGGER IF EXISTS trg_kg_equipment_makes_updated_at  ON kg_equipment_makes;  -- auto-dropped
-- DROP TRIGGER IF EXISTS trg_kg_equipment_models_updated_at ON kg_equipment_models; -- auto-dropped


-- ─────────────────────────────────────────────────────────────────────────────
-- POST-FULL-ROLLBACK VERIFICATION
-- Run after Option A to confirm clean state
-- ─────────────────────────────────────────────────────────────────────────────

-- Verify Phase 2 tables are gone
SELECT COUNT(*) AS phase2_tables_remaining
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment');
-- Expected: 0

-- Verify Phase 1 tables are intact
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
ORDER BY tablename;
-- Expected: 4 rows (all Phase 1 tables still exist)

-- Verify catalog is untouched
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: ~4622 (unchanged)


-- =============================================================================
-- OPTION B: PARTIAL ROLLBACK — CLEAR PRODUCT LINKS ONLY
-- Truncates kg_product_equipment but keeps kg_equipment_makes and kg_equipment_models
-- Use when: product-equipment links are wrong/incomplete but makes+models are correct
-- After Option B: re-run 004_populate_product_equipment.sql only
-- =============================================================================

/*
TRUNCATE TABLE kg_product_equipment;
-- Expected: table is empty, 0 rows
-- Re-run: psql $DATABASE_URL -f migrations/kg-phase2/004_populate_product_equipment.sql
*/


-- =============================================================================
-- OPTION C: PARTIAL ROLLBACK — CLEAR MODELS AND LINKS (KEEP MAKES)
-- Truncates kg_product_equipment and kg_equipment_models, keeps kg_equipment_makes
-- Use when: model slug strategy changed, but make reference data is correct
-- After Option C: re-run 003_extract_models.sql and 004_populate_product_equipment.sql
-- =============================================================================

/*
TRUNCATE TABLE kg_product_equipment;
TRUNCATE TABLE kg_equipment_models RESTART IDENTITY CASCADE;
-- CASCADE ensures product_equipment is also cleared (belt-and-suspenders)
-- RESTART IDENTITY resets the serial sequence so IDs start at 1 again
-- Expected: both tables empty, 0 rows
-- Re-run: scripts 003 and 004
*/


-- =============================================================================
-- OPTION D: PARTIAL ROLLBACK — TRUNCATE ALL, KEEP SCHEMA
-- Truncates all 3 Phase 2 tables but keeps the schema (tables, indexes, triggers)
-- Use when: normalization table changed significantly, full re-extraction needed
-- After Option D: re-run 002_extract_makes.sql, 003_extract_models.sql, 004_populate_product_equipment.sql
-- =============================================================================

/*
TRUNCATE TABLE kg_product_equipment;
TRUNCATE TABLE kg_equipment_models RESTART IDENTITY CASCADE;
TRUNCATE TABLE kg_equipment_makes  RESTART IDENTITY CASCADE;
-- CASCADE on equipment_makes clears equipment_models (FK dependency),
-- which cascades to product_equipment
-- Expected: all 3 tables empty, 0 rows
-- Re-run: scripts 002, 003, 004 (schema already exists from 001)
*/


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK VERIFICATION QUERIES
-- Run these after Option B, C, or D to confirm expected state
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- After Option B (clear links only):
SELECT COUNT(*) AS pe_rows   FROM kg_product_equipment;  -- Expected: 0
SELECT COUNT(*) AS model_rows FROM kg_equipment_models;  -- Expected: unchanged (100–2500)
SELECT COUNT(*) AS make_rows  FROM kg_equipment_makes;   -- Expected: unchanged (20–120)

-- After Option C (clear models + links):
SELECT COUNT(*) AS pe_rows    FROM kg_product_equipment; -- Expected: 0
SELECT COUNT(*) AS model_rows FROM kg_equipment_models;  -- Expected: 0
SELECT COUNT(*) AS make_rows  FROM kg_equipment_makes;   -- Expected: unchanged (20–120)

-- After Option D (clear all):
SELECT COUNT(*) AS pe_rows    FROM kg_product_equipment; -- Expected: 0
SELECT COUNT(*) AS model_rows FROM kg_equipment_models;  -- Expected: 0
SELECT COUNT(*) AS make_rows  FROM kg_equipment_makes;   -- Expected: 0

-- In all cases: catalog must be unchanged
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog; -- Expected: ~4622

-- In all cases: Phase 1 tables must be intact
SELECT COUNT(*) FROM kg_systems;      -- Expected: 6
SELECT COUNT(*) FROM kg_technologies; -- Expected: 11
*/
