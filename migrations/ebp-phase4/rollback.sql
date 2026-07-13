-- =============================================================================
-- EBP PHASE 4 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 4 EBP changes if needed.
-- DOES NOT modify elimfilters_catalog, technologies, the Knowledge Graph,
-- Phase 1 (ebp_engineering_passports and children), Phase 2
-- (ebp_manufacturers and children), or Phase 3 (ebp_manufacturer_offers,
-- ebp_manufacturer_request_batches and children) — Phase 4 only adds new
-- tables plus incoming FKs from ebp_validation_runs to
-- ebp_engineering_passports and ebp_manufacturer_offers, and from
-- ebp_engineering_exceptions to ebp_manufacturer_offers. This rollback
-- drops those FKs from the Phase 4 side only (dropping the Phase 4 table
-- removes the FK; the Phase 1/2/3 tables themselves are never touched).
--
-- Phase 4 also performs a plain UPDATE (never ALTER TABLE) against Phase 3's
-- pre-existing ebp_manufacturer_offer_technical_fields.compliance_status
-- column (see phase-04-validation-engine.md, Integration Points, and the
-- 2026-07-13 consistency-audit finding). This rollback does NOT revert
-- those UPDATE writes by default — see Option E below if a full data-level
-- revert of that projection is required.
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 4 EBP tables, views, and data
-- ⚠️  Run only if Phase 4 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step 1: Drop the analytics view (depends on ebp_validation_runs and
-- ebp_engineering_decisions)
DROP VIEW IF EXISTS ebp_analytics_validation_summary;

-- Step 2: Drop leaf/child tables first
DROP TABLE IF EXISTS ebp_engineering_conditions       CASCADE;
DROP TABLE IF EXISTS ebp_engineering_decisions        CASCADE;
DROP TABLE IF EXISTS ebp_engineering_exceptions       CASCADE;
DROP TABLE IF EXISTS ebp_rule_results                 CASCADE;
DROP TABLE IF EXISTS ebp_validation_runs              CASCADE;

-- Step 3: Drop the Rule Catalog and role-assignment tables
DROP TABLE IF EXISTS ebp_rule_versions                CASCADE;
DROP TABLE IF EXISTS ebp_engineering_role_assignments CASCADE;

-- Step 4: Drop the shared Activity Events ledger
-- NOTE: ebp_activity_events is the first real implementation of the
-- ADR-0037 shared, platform-wide event ledger. If a later phase has
-- already written non-Phase-4 events into this table, dropping it here
-- would destroy that data too. Confirm no other phase depends on it
-- before running this statement; comment it out if in doubt.
DROP TABLE IF EXISTS ebp_activity_events              CASCADE;

-- Step 5: Verify rollback complete
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_role_assignments',
    'ebp_rule_versions',
    'ebp_validation_runs',
    'ebp_rule_results',
    'ebp_engineering_decisions',
    'ebp_engineering_exceptions',
    'ebp_engineering_conditions',
    'ebp_activity_events'
  );
-- Expected: 0 rows (all Phase 4 tables dropped)

SELECT viewname FROM pg_views WHERE viewname = 'ebp_analytics_validation_summary';
-- Expected: 0 rows

-- Step 6: Verify Phase 1, Phase 2, Phase 3, catalog, and technologies are untouched
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports', 'ebp_passport_engineering', 'ebp_passport_packaging',
    'ebp_manufacturers', 'ebp_manufacturer_locations', 'ebp_manufacturer_qualifications',
    'ebp_manufacturer_offers', 'ebp_manufacturer_offer_technical_fields',
    'ebp_manufacturer_request_batches', 'ebp_factory_users'
  )
ORDER BY tablename;
-- Expected: 10 rows (Phase 1 + Phase 2 + Phase 3 fully intact)

SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_intact FROM technologies;
SELECT COUNT(*) AS manufacturers_intact FROM ebp_manufacturers;
SELECT COUNT(*) AS offers_intact FROM ebp_manufacturer_offers;
SELECT COUNT(*) AS passports_intact FROM ebp_engineering_passports;

-- Confirm Phase 3's frozen compliance_status CHECK constraint still holds
-- its original 3-value definition (Phase 4 never widened it)
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conname = 'ebp_manufacturer_offer_technical_fields_compliance_status_check';
-- Expected: 1 row, definition still CHECK (compliance_status IN ('PENDING','COMPLIANT','NON_COMPLIANT'))

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK OPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Option A: Clear Phase 4 data only, keep schema (re-run 001_schema.sql's
-- CREATE TABLE statements are a no-op since IF NOT EXISTS). Order respects
-- FK dependencies:
/*
TRUNCATE ebp_engineering_conditions;
TRUNCATE ebp_engineering_decisions CASCADE;
TRUNCATE ebp_engineering_exceptions;
TRUNCATE ebp_rule_results;
TRUNCATE ebp_validation_runs CASCADE;
TRUNCATE ebp_rule_versions CASCADE;
TRUNCATE ebp_engineering_role_assignments;
-- ebp_activity_events intentionally not truncated here — it is a shared,
-- append-only, platform-wide ledger (ADR-0037), not Phase-4-exclusive data.
*/

-- Option B: Revoke a single engineering role assignment (soft — never a
-- hard DELETE of role history, only mark it revoked):
/*
UPDATE ebp_engineering_role_assignments
SET revoked_at = now(), revoked_by = 'declared-actor-label'
WHERE declared_actor = 'declared-actor-label' AND role = 'ENGINEERING_APPROVER'
  AND revoked_at IS NULL;
*/

-- Option C: Retire a Rule Catalog version without deleting it (per
-- Decision 10 / ADR-0048, published rule_versions are never edited or
-- deleted, only superseded/retired):
/*
UPDATE ebp_rule_versions
SET status = 'RETIRED'
WHERE rule_id = 'RULE-XXXX' AND rule_version = 1;
*/

-- Option D: Mark a single Validation Run STALE without a full reset
-- (normally done automatically by the re-validation trigger logic, per
-- Decision 12 / ADR-0050 — this is the manual/emergency equivalent):
/*
UPDATE ebp_validation_runs
SET status = 'STALE'
WHERE id = '00000000-0000-0000-0000-000000000000' AND status = 'CURRENT';
*/

-- Option E: Revert the coarse compliance_status projection written into
-- Phase 3's ebp_manufacturer_offer_technical_fields back to PENDING for a
-- specific offer (only needed if a full data-level revert of the Phase 4
-- projection is required; ebp_rule_results itself, being dropped above,
-- remains the authoritative record that was lost):
/*
UPDATE ebp_manufacturer_offer_technical_fields
SET compliance_status = 'PENDING'
WHERE offer_id = '00000000-0000-0000-0000-000000000000';
*/
