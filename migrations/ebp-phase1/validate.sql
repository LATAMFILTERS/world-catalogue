-- =============================================================================
-- EBP PHASE 1 — VALIDATION
-- File: validate.sql
-- Purpose: Confirm the migration applied correctly and constraints hold.
-- Safe to run: YES (read-only)
-- =============================================================================

-- 1. All 5 tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports',
    'ebp_passport_engineering',
    'ebp_passport_packaging',
    'ebp_field_applicability_matrix',
    'ebp_passport_status_history'
  )
ORDER BY tablename;
-- Expected: 5 rows

-- 2. Applicability matrix seed populated
SELECT COUNT(*) AS applicability_rows FROM ebp_field_applicability_matrix;
-- Expected: 40 (10 category/subtype pairs x 4 fields)

-- 3. elimfilters_catalog is untouched (EBP never modifies it)
SELECT COUNT(*) AS catalog_row_count FROM elimfilters_catalog;

-- 4. The partial unique index enforcing "one ACTIVE passport per SKU" exists
SELECT indexname
FROM pg_indexes
WHERE tablename = 'ebp_engineering_passports'
  AND indexname = 'uq_ebp_passports_one_active';
-- Expected: 1 row

-- 5. No orphaned ebp_passport_engineering / ebp_passport_packaging rows
--    (both are 1:1 with ebp_engineering_passports via FK + CASCADE, so this
--    should always be empty, but confirms no manual/partial insert slipped
--    through)
SELECT pe.passport_id
FROM ebp_passport_engineering pe
LEFT JOIN ebp_engineering_passports p ON p.id = pe.passport_id
WHERE p.id IS NULL;
-- Expected: 0 rows

SELECT pp.passport_id
FROM ebp_passport_packaging pp
LEFT JOIN ebp_engineering_passports p ON p.id = pp.passport_id
WHERE p.id IS NULL;
-- Expected: 0 rows

-- 6. No SKU has more than one ACTIVE passport revision
SELECT elimfilters_code, COUNT(*) AS active_count
FROM ebp_engineering_passports
WHERE status = 'ACTIVE'
GROUP BY elimfilters_code
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 7. All seeded applicability rows start PROVISIONAL (ADR-0014) — none may
--    be silently treated as ELIMFILTERS-engineering-approved by default
SELECT COUNT(*) AS non_provisional_seed_rows
FROM ebp_field_applicability_matrix
WHERE approval_status <> 'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL';
-- Expected: 0 (until engineering explicitly approves specific rows)

-- 8. identity_mechanism columns exist and default correctly
SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'ebp_engineering_passports' AND column_name = 'identity_mechanism';
-- Expected: 1 row, default containing 'ADMIN_KEY_SHARED'

SELECT column_name, column_default
FROM information_schema.columns
WHERE table_name = 'ebp_passport_status_history' AND column_name = 'identity_mechanism';
-- Expected: 1 row, default containing 'ADMIN_KEY_SHARED'

-- 9. field_applicability_source column exists on ebp_passport_engineering
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'ebp_passport_engineering' AND column_name = 'field_applicability_source';
-- Expected: 1 row
