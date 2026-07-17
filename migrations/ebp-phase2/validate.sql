-- =============================================================================
-- EBP PHASE 2 — VALIDATION
-- File: validate.sql
-- Purpose: Confirm the migration applied correctly and constraints hold.
-- Safe to run: YES (read-only)
-- =============================================================================

-- 1. All 8 tables exist
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
  )
ORDER BY tablename;
-- Expected: 8 rows

-- 2. The effective-certification view exists
SELECT viewname FROM pg_views WHERE viewname = 'ebp_manufacturer_certifications_effective';
-- Expected: 1 row

-- 3. Phase 1 tables are untouched (still present, EBP Phase 2 never modifies them)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('ebp_engineering_passports', 'ebp_passport_engineering', 'ebp_passport_packaging')
ORDER BY tablename;
-- Expected: 3 rows (Phase 1 present and untouched)

-- 4. elimfilters_catalog / technologies are untouched
SELECT COUNT(*) AS catalog_row_count FROM elimfilters_catalog;
SELECT COUNT(*) AS technologies_row_count FROM technologies;

-- 5. The manufacturer_code immutability trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_ebp_prevent_manufacturer_code_change';
-- Expected: 1 row

-- 6. The one-active-primary-contact partial unique index exists
SELECT indexname FROM pg_indexes WHERE indexname = 'uq_ebp_mfr_contacts_one_active_primary';
-- Expected: 1 row

-- 7. The composite FK (id, manufacturer_id) unique constraint on locations exists
SELECT conname FROM pg_constraint WHERE conname = 'ebp_manufacturer_locations_id_manufacturer_id_key';
-- Expected: 1 row

-- 8. No manufacturer has more than one active primary contact (redundant with #6
--    but confirms actual data, not just the index definition)
SELECT manufacturer_id, COUNT(*) AS active_primary_count
FROM ebp_manufacturer_contacts
WHERE is_primary = TRUE AND is_active = TRUE
GROUP BY manufacturer_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 9. No orphaned child rows (all FKs are real FKs with CASCADE, so this should
--    always be empty, but confirms no partial state slipped through)
SELECT c.id FROM ebp_manufacturer_contacts c
  LEFT JOIN ebp_manufacturers m ON m.id = c.manufacturer_id WHERE m.id IS NULL;
SELECT l.id FROM ebp_manufacturer_locations l
  LEFT JOIN ebp_manufacturers m ON m.id = l.manufacturer_id WHERE m.id IS NULL;
SELECT q.id FROM ebp_manufacturer_qualifications q
  LEFT JOIN ebp_manufacturers m ON m.id = q.manufacturer_id WHERE m.id IS NULL;
-- Expected: 0 rows each
