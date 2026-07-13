-- =============================================================================
-- EBP PHASE 3 — VALIDATION
-- File: validate.sql
-- Purpose: Confirm the migration applied correctly and constraints hold.
-- Safe to run: YES (read-only)
-- =============================================================================

-- 1. All 13 tables exist (12 from 001_schema.sql + ebp_manufacturer_excel_staging from 002_excel_staging.sql)
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
  )
ORDER BY tablename;
-- Expected: 13 rows

-- 2. The effective-Offer view exists
SELECT viewname FROM pg_views WHERE viewname = 'ebp_manufacturer_offers_effective';
-- Expected: 1 row

-- 3. Phase 1 and Phase 2 tables are untouched (still present)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports', 'ebp_passport_engineering', 'ebp_passport_packaging',
    'ebp_manufacturers', 'ebp_manufacturer_locations', 'ebp_manufacturer_qualifications'
  )
ORDER BY tablename;
-- Expected: 6 rows

-- 4. elimfilters_catalog / technologies are untouched
SELECT COUNT(*) AS catalog_row_count FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_row_count FROM technologies;

-- 5. The one-active-lineage partial unique index on offers exists
SELECT indexname FROM pg_indexes WHERE indexname = 'uq_ebp_offers_one_active_lineage';
-- Expected: 1 row

-- 6. The Batch Item -> Passport FK (the one real cross-phase FK) exists
SELECT conname FROM pg_constraint
WHERE conname = 'ebp_manufacturer_request_batch_items_passport_id_fkey';
-- Expected: 1 row

-- 7. The deferred evidence_document_id FK was wired after ebp_manufacturer_documents was created
SELECT conname FROM pg_constraint WHERE conname = 'fk_offer_tech_fields_evidence_document';
-- Expected: 1 row

-- 8. No manufacturer has more than one active-lineage Offer per (passport_id, engineering_revision)
SELECT passport_id, engineering_revision, manufacturer_id, COUNT(*) AS active_count
FROM ebp_manufacturer_offers
WHERE status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED')
GROUP BY passport_id, engineering_revision, manufacturer_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 9. No orphaned child rows
SELECT bi.id FROM ebp_manufacturer_request_batch_items bi
  LEFT JOIN ebp_manufacturer_request_batches b ON b.id = bi.batch_id WHERE b.id IS NULL;
SELECT o.id FROM ebp_manufacturer_offers o
  LEFT JOIN ebp_manufacturer_request_batch_items bi ON bi.id = o.batch_item_id WHERE bi.id IS NULL;
SELECT d.id FROM ebp_manufacturer_documents d
  LEFT JOIN ebp_manufacturers m ON m.id = d.manufacturer_id WHERE m.id IS NULL;
SELECT fu.id FROM ebp_factory_users fu
  LEFT JOIN ebp_manufacturers m ON m.id = fu.manufacturer_id WHERE m.id IS NULL;
-- Expected: 0 rows each

-- 10. Every ebp_manufacturer_offers.fob_price is stored as NUMERIC, never float/real/double
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'ebp_manufacturer_offers'
  AND column_name IN ('fob_price', 'tooling_cost', 'sample_cost');
-- Expected: 3 rows, all data_type = 'numeric'

-- 11. No password_hash or token_hash column is ever exposed via a view (only real tables hold them)
SELECT viewname FROM pg_views WHERE viewname LIKE '%factory%';
-- Expected: 0 rows (no view exists over factory auth tables at all)

-- 12. Excel staging table has a status CHECK and no orphaned rows against its parents
SELECT conname FROM pg_constraint WHERE conname = 'ebp_manufacturer_excel_staging_status_check';
-- Expected: 1 row
SELECT s.id FROM ebp_manufacturer_excel_staging s
  LEFT JOIN ebp_manufacturer_request_batches b ON b.id = s.batch_id WHERE b.id IS NULL;
SELECT s.id FROM ebp_manufacturer_excel_staging s
  LEFT JOIN ebp_manufacturers m ON m.id = s.manufacturer_id WHERE m.id IS NULL;
-- Expected: 0 rows each

-- 13. No staging row is ever both CONSUMED and still returnable by take() a second time
-- (structural guarantee: take() is a single atomic UPDATE ... WHERE status = 'STAGED',
-- so a CONSUMED row can never match that predicate again — verified by application-level
-- regression test, this is a read-only sanity check that no CONSUMED row lacks consumed_at)
SELECT id FROM ebp_manufacturer_excel_staging WHERE status = 'CONSUMED' AND consumed_at IS NULL;
-- Expected: 0 rows

-- 14. The centralized Batch effective-status view exists (ADR-0031)
SELECT viewname FROM pg_views WHERE viewname = 'ebp_manufacturer_request_batches_effective';
-- Expected: 1 row

-- 15. Every factory session has a CSRF token (ADR-0033); the column is NOT NULL
SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'ebp_factory_sessions' AND column_name = 'csrf_token';
-- Expected: 1 row, is_nullable = 'NO'
SELECT id FROM ebp_factory_sessions WHERE csrf_token IS NULL OR length(csrf_token) <> 64;
-- Expected: 0 rows
