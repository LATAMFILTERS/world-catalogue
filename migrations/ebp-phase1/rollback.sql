-- =============================================================================
-- EBP PHASE 1 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 1 EBP changes if needed (schema from
-- 001_schema.sql plus the additive columns from
-- 003_actor_identity_and_applicability_approval.sql — dropping a table
-- drops its columns, no separate step is needed for those).
-- DOES NOT modify elimfilters_catalog, technologies, or any other existing
-- catalog/KG table — Phase 1 only adds ebp_-prefixed tables.
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 1 EBP tables and data
-- ⚠️  Run only if Phase 1 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step 1: Drop child/dependent tables first (FK references to the header table)
DROP TABLE IF EXISTS ebp_passport_status_history CASCADE;
DROP TABLE IF EXISTS ebp_passport_packaging       CASCADE;
DROP TABLE IF EXISTS ebp_passport_engineering     CASCADE;

-- Step 2: Drop the header table (self-referencing FK via supersedes_passport_id
-- is handled by CASCADE)
DROP TABLE IF EXISTS ebp_engineering_passports CASCADE;

-- Step 3: Drop the standalone lookup table
DROP TABLE IF EXISTS ebp_field_applicability_matrix CASCADE;

-- Step 4: Verify rollback complete
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports',
    'ebp_passport_engineering',
    'ebp_passport_packaging',
    'ebp_field_applicability_matrix',
    'ebp_passport_status_history'
  );
-- Expected: 0 rows (all tables dropped)

-- Step 5: Verify catalog and technologies are untouched
SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_intact FROM technologies;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK OPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Option A: Clear passport data only, keep schema + applicability matrix
-- (re-run 001_schema.sql's table creation is a no-op since IF NOT EXISTS;
-- this only clears data for a fresh start):
/*
TRUNCATE ebp_passport_status_history;
TRUNCATE ebp_passport_packaging;
TRUNCATE ebp_passport_engineering;
TRUNCATE ebp_engineering_passports CASCADE;
*/

-- Option B: Re-seed the applicability matrix only (e.g., after ELIMFILTERS
-- engineering reviews and corrects it):
/*
TRUNCATE ebp_field_applicability_matrix RESTART IDENTITY;
-- Re-run 002_seed_applicability_matrix.sql with corrected values
*/

-- Option C: Correct a single applicability matrix entry without a full reset:
/*
UPDATE ebp_field_applicability_matrix
SET applicability = 'REQUIRED',
    notes = 'Corrected per ELIMFILTERS engineering review 2026-XX-XX'
WHERE product_category = 'AIR' AND product_subtype = 'PANEL' AND field_name = 'micron_rating';
*/

-- Option D: Approve a matrix row after ELIMFILTERS engineering review
-- (ADR-0014) — this is the normal, non-destructive way a row moves out of
-- PROVISIONAL and unblocks activation for Passports that depend on it:
/*
UPDATE ebp_field_applicability_matrix
SET approval_status = 'ENGINEERING_APPROVED'
WHERE product_category = 'OIL' AND product_subtype = 'SPIN_ON' AND field_name = 'beta_ratio';
*/
