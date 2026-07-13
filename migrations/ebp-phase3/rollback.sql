-- =============================================================================
-- EBP PHASE 3 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 3 EBP changes if needed.
-- DOES NOT modify elimfilters_catalog, technologies, the Knowledge Graph,
-- Phase 1 (ebp_engineering_passports and children), or Phase 2
-- (ebp_manufacturers and children) — Phase 3 only adds new tables plus
-- exactly one incoming FK from ebp_manufacturer_request_batch_items to
-- ebp_engineering_passports, which this rollback drops from the Phase 3
-- side only (dropping the Phase 3 table removes the FK; Phase 1's table
-- itself is never touched).
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 3 EBP tables, views, and data
-- ⚠️  Run only if Phase 3 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step 1: Drop the effective-Offer view (depends on ebp_manufacturer_offers)
DROP VIEW IF EXISTS ebp_manufacturer_offers_effective;

-- Step 2: Drop leaf/child tables first
DROP TABLE IF EXISTS ebp_manufacturer_excel_staging                    CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_documents                        CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_offer_packaging                  CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_offer_technical_fields           CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_offer_status_history             CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_offers                           CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_request_batch_items              CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_request_batch_status_history     CASCADE;
DROP TABLE IF EXISTS ebp_manufacturer_request_batches                  CASCADE;

-- Step 3: Drop factory-auth tables
DROP TABLE IF EXISTS ebp_factory_user_audit_log       CASCADE;
DROP TABLE IF EXISTS ebp_factory_sessions             CASCADE;
DROP TABLE IF EXISTS ebp_factory_user_invitations     CASCADE;
DROP TABLE IF EXISTS ebp_factory_users                CASCADE;

-- Step 4: Verify rollback complete
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_factory_users',
    'ebp_factory_user_invitations',
    'ebp_factory_sessions',
    'ebp_factory_user_audit_log',
    'ebp_manufacturer_request_batches',
    'ebp_manufacturer_request_batch_status_history',
    'ebp_manufacturer_request_batch_items',
    'ebp_manufacturer_offers',
    'ebp_manufacturer_offer_status_history',
    'ebp_manufacturer_offer_technical_fields',
    'ebp_manufacturer_offer_packaging',
    'ebp_manufacturer_documents',
    'ebp_manufacturer_excel_staging'
  );
-- Expected: 0 rows (all Phase 3 tables dropped)

SELECT viewname FROM pg_views WHERE viewname = 'ebp_manufacturer_offers_effective';
-- Expected: 0 rows

-- Step 5: Verify Phase 1, Phase 2, catalog, and technologies are untouched
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports', 'ebp_passport_engineering', 'ebp_passport_packaging',
    'ebp_manufacturers', 'ebp_manufacturer_locations', 'ebp_manufacturer_qualifications',
    'ebp_manufacturer_certifications', 'ebp_manufacturer_capabilities'
  )
ORDER BY tablename;
-- Expected: 8 rows (Phase 1 + Phase 2 fully intact)

SELECT COUNT(*) AS catalog_intact FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_intact FROM technologies;
SELECT COUNT(*) AS manufacturers_intact FROM ebp_manufacturers;

-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK OPTIONS
-- ─────────────────────────────────────────────────────────────────────────────

-- Option A: Clear Phase 3 data only, keep schema (re-run 001_schema.sql's
-- CREATE TABLE statements are a no-op since IF NOT EXISTS). Order respects
-- FK dependencies:
/*
TRUNCATE ebp_manufacturer_excel_staging;
TRUNCATE ebp_manufacturer_documents;
TRUNCATE ebp_manufacturer_offer_packaging;
TRUNCATE ebp_manufacturer_offer_technical_fields;
TRUNCATE ebp_manufacturer_offer_status_history;
TRUNCATE ebp_manufacturer_offers CASCADE;
TRUNCATE ebp_manufacturer_request_batch_items CASCADE;
TRUNCATE ebp_manufacturer_request_batch_status_history;
TRUNCATE ebp_manufacturer_request_batches CASCADE;
TRUNCATE ebp_factory_user_audit_log;
TRUNCATE ebp_factory_sessions;
TRUNCATE ebp_factory_user_invitations;
TRUNCATE ebp_factory_users CASCADE;
*/

-- Option B: Revoke every active session for a factory user (emergency,
-- e.g. suspected credential compromise) without disabling the account:
/*
UPDATE ebp_factory_sessions
SET revoked_at = now()
WHERE factory_user_id = '00000000-0000-0000-0000-000000000000' AND revoked_at IS NULL;
*/

-- Option C: Disable a factory user account (soft — never a hard DELETE,
-- history and documents are preserved):
/*
UPDATE ebp_factory_users
SET status = 'DISABLED'
WHERE id = '00000000-0000-0000-0000-000000000000';
*/

-- Option D: Cancel a single batch without a full reset:
/*
UPDATE ebp_manufacturer_request_batches
SET status = 'CANCELLED'
WHERE batch_code = 'MRB-XXXXXX';
*/
