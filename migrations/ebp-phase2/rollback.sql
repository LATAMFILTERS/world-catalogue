-- =============================================================================
-- EBP PHASE 2 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 2 EBP changes if needed (schema from
-- 001_schema.sql, including the effective-certification view and the
-- manufacturer_code immutability trigger/function).
-- DOES NOT modify elimfilters_catalog, technologies, the Knowledge Graph, or
-- any Phase 1 EBP table (ebp_engineering_passports, ebp_passport_engineering,
-- ebp_passport_packaging, ebp_passport_status_history,
-- ebp_field_applicability_matrix) — Phase 2 only adds new
-- ebp_manufacturer*-prefixed tables/objects.
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 2 EBP tables, views, and data
-- ⚠️  Run only if Phase 2 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step 1: Drop the effective-certification view (depends on
-- ebp_manufacturer_certifications, must go before the table)
DROP VIEW IF EXISTS ebp_manufacturer_certifications_effective;

-- Step 2: Drop leaf/child tables first (FK references to qualifications,
-- certifications, contacts, locations)
DROP TABLE IF EXISTS ebp_manufacturer_qualification_conditions CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_capabilities             CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_certifications            CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_qualifications             CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_contacts                   CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_locations                  CASCADE;

-- Step 3: Drop the status history table (FK to the header table)
DROP TABLE IF EXISTS ebp_manufacturers_status_history CASCADE;

-- Step 4: Drop the header table last (everything above FKs into it)
DROP TABLE IF EXISTS ebp_manufacturers CASCADE;

-- Step 5: Drop the manufacturer_code immutability trigger function
-- (CASCADE also drops the trigger itself if the table still existed;
-- harmless no-op if the table above is already gone)
DROP FUNCTION IF EXISTS ebp_prevent_manufacturer_code_change() CASCADE;

-- Step 6: Verify rollback complete
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_manufacturers',
    'ebp_manufacturers_status_history',
    'ebp_manufacturer_contacts',
    'ebp_manufacturer_locations',
    'ebp_manufacturer_certifications',
    'ebp_manufacturer_qualifications',
    'ebp_manufacturer_qualification_conditions',
    'ebp_manufacturer_capabilities'
  );
-- Expected: 0 rows (all Phase 2 tables dropped)

SELECT viewname FROM pg_views WHERE viewname = 'ebp_manufacturer_certifications_effective';
-- Expected: 0 rows

-- Step 7: Verify Phase 1, catalog, KG, and technologies are untouched
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports',
    'ebp_passport_engineering',
    'ebp_passport_packaging',
    'ebp_passport_status_history',
    'ebp_field_applicability_matrix'
  )
ORDER BY tablename;
-- Expected: 5 rows (Phase 1 fully intact)

SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_intact FROM technologies;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK OPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Option A: Clear manufacturer data only, keep schema (re-run 001_schema.sql's
-- CREATE TABLE statements are a no-op since IF NOT EXISTS; this only clears
-- data for a fresh start). Order respects FK dependencies:
/*
TRUNCATE ebp_manufacturer_qualification_conditions;
TRUNCATE ebp_manufacturer_capabilities;
TRUNCATE ebp_manufacturer_certifications;
TRUNCATE ebp_manufacturer_qualifications;
TRUNCATE ebp_manufacturer_contacts;
TRUNCATE ebp_manufacturer_locations;
TRUNCATE ebp_manufacturers_status_history;
TRUNCATE ebp_manufacturers CASCADE;
*/

-- Option B: Correct a single manufacturer's status without a full reset
-- (must still go through the transition + history rules enforced by the
-- service layer in normal operation — this is an emergency data-fix path
-- only, e.g. reverting a mistaken manual UPDATE):
/*
UPDATE ebp_manufacturers
SET status = 'UNDER_REVIEW',
    status_reason = 'Corrected per ELIMFILTERS operations review 2026-XX-XX'
WHERE manufacturer_code = 'EFM-XXXX';
*/

-- Option C: Retire a single manufacturer (soft delete — never a hard DELETE;
-- history and all child records are preserved):
/*
UPDATE ebp_manufacturers
SET status = 'RETIRED',
    retired_at = now(),
    status_reason = 'Retired per ELIMFILTERS operations decision 2026-XX-XX'
WHERE manufacturer_code = 'EFM-XXXX';
*/

-- Option D: Manually mark a certification as VERIFIED after document review
-- (normal path is the service-layer certification-verification endpoint;
-- this is the emergency data-fix equivalent):
/*
UPDATE ebp_manufacturer_certifications
SET status = 'VERIFIED'
WHERE id = '00000000-0000-0000-0000-000000000000';
*/

-- Option E: Manually mark a qualification condition as satisfied after
-- evidence review (emergency data-fix equivalent of the normal service path):
/*
UPDATE ebp_manufacturer_qualification_conditions
SET is_satisfied = TRUE,
    satisfied_at = now(),
    notes = 'Verified per initial sample review 2026-XX-XX'
WHERE id = '00000000-0000-0000-0000-000000000000';
*/
