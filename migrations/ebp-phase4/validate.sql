-- =============================================================================
-- EBP PHASE 4 — VALIDATION
-- File: validate.sql
-- Purpose: Confirm the Phase 4 migration applied correctly and constraints hold.
-- Safe to run: YES (read-only)
-- =============================================================================

-- 1. All 8 Phase 4 tables exist
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
  )
ORDER BY tablename;
-- Expected: 8 rows

-- 2. The analytics view exists
SELECT viewname FROM pg_views WHERE viewname = 'ebp_analytics_validation_summary';
-- Expected: 1 row

-- 3. Phase 1, Phase 2 and Phase 3 tables are untouched (still present)
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
-- Expected: 10 rows

-- 4. Phase 1/2/3 row counts are unaffected by this migration (schema-only change)
SELECT 'ebp_engineering_passports' AS t, COUNT(*) FROM ebp_engineering_passports
UNION ALL SELECT 'ebp_manufacturers', COUNT(*) FROM ebp_manufacturers
UNION ALL SELECT 'ebp_manufacturer_offers', COUNT(*) FROM ebp_manufacturer_offers
UNION ALL SELECT 'ebp_manufacturer_offer_technical_fields', COUNT(*) FROM ebp_manufacturer_offer_technical_fields;
-- Expected: same counts as before the Phase 4 migration was applied

-- 5. Phase 3's frozen compliance_status CHECK constraint is unmodified
-- (Phase 4 only ever writes it via UPDATE, never ALTER TABLE)
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'ebp_manufacturer_offer_technical_fields'
  AND column_name = 'compliance_status';
-- Expected: 1 row, varchar(20)

SELECT conname FROM pg_constraint
WHERE conname = 'ebp_manufacturer_offer_technical_fields_compliance_status_check';
-- Expected: 1 row (frozen constraint, name may vary by Postgres version — see note below)

-- 6. Rule Catalog: rule_id + rule_version uniqueness and one-active-per-lineage index
SELECT conname FROM pg_constraint WHERE conname = 'ebp_rule_versions_rule_id_rule_version_key';
-- Expected: 1 row

SELECT indexname FROM pg_indexes WHERE indexname = 'uq_ebp_rule_versions_one_active';
-- Expected: 1 row

-- 7. Validation Runs: one-current-per-offer-revision partial unique index
SELECT indexname FROM pg_indexes WHERE indexname = 'uq_ebp_validation_runs_one_current';
-- Expected: 1 row

-- 8. Composite FKs (rule_id, rule_version) resolve correctly
SELECT conname, conrelid::regclass AS child, confrelid::regclass AS parent
FROM pg_constraint
WHERE conname IN (
  'ebp_rule_results_rule_id_rule_version_fkey',
  'ebp_engineering_exceptions_rule_id_rule_version_fkey'
)
ORDER BY conname;
-- Expected: 2 rows, both parent = ebp_rule_versions

-- 9. Exception scope uniqueness: exactly (offer_id, offer_revision, rule_id, rule_version)
SELECT conname FROM pg_constraint
WHERE conname = 'ebp_engineering_exceptions_offer_id_offer_revision_rule_id__key';
-- Expected: 1 row

-- 10. No orphaned child rows
SELECT rr.id FROM ebp_rule_results rr
  LEFT JOIN ebp_validation_runs vr ON vr.id = rr.validation_run_id WHERE vr.id IS NULL;
SELECT vr.id FROM ebp_validation_runs vr
  LEFT JOIN ebp_engineering_passports p ON p.id = vr.passport_id WHERE p.id IS NULL;
SELECT vr.id FROM ebp_validation_runs vr
  LEFT JOIN ebp_manufacturer_offers o ON o.id = vr.offer_id WHERE o.id IS NULL;
SELECT ed.id FROM ebp_engineering_decisions ed
  LEFT JOIN ebp_validation_runs vr ON vr.id = ed.validation_run_id WHERE vr.id IS NULL;
SELECT ec.id FROM ebp_engineering_conditions ec
  LEFT JOIN ebp_engineering_decisions ed ON ed.id = ec.engineering_decision_id WHERE ed.id IS NULL;
SELECT ee.id FROM ebp_engineering_exceptions ee
  LEFT JOIN ebp_manufacturer_offers o ON o.id = ee.offer_id WHERE o.id IS NULL;
-- Expected: 0 rows each

-- 11. Never more than one CURRENT validation run per (offer_id, offer_revision)
SELECT offer_id, offer_revision, COUNT(*) AS current_count
FROM ebp_validation_runs
WHERE status = 'CURRENT'
GROUP BY offer_id, offer_revision
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 12. Never more than one ACTIVE rule_version per rule_id
SELECT rule_id, COUNT(*) AS active_count
FROM ebp_rule_versions
WHERE status = 'ACTIVE'
GROUP BY rule_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 13. Global Result Model separation: no validation run's mechanical_result column
-- is ever an Engineering Decision value or Offer Approval value (structural check —
-- the CHECK constraint enforces this, this just confirms current data compliance)
SELECT id, mechanical_result FROM ebp_validation_runs
WHERE mechanical_result NOT IN ('MECHANICALLY_PASS', 'MECHANICALLY_FAIL', 'REQUIRES_ENGINEERING_REVIEW');
-- Expected: 0 rows

-- 14. Every rule_result state is one of the six decided states
SELECT id, state FROM ebp_rule_results
WHERE state NOT IN ('PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE', 'REQUIRES_REVIEW', 'REQUIRES_EXCEPTION');
-- Expected: 0 rows

-- 15. Activity Events table has no orphaned event_type values outside the Dashboard
-- Readiness list is NOT enforced by CHECK (events are extensible); this simply
-- reports distinct event_type values seen so far, for visual audit
SELECT DISTINCT event_type FROM ebp_activity_events ORDER BY event_type;
-- Expected: 0 rows on a fresh migration (no data yet)

-- =============================================================================
-- CORRECTION ROUND (002_correction.sql) CHECKS
-- =============================================================================

-- 16. Correction-round tables/columns exist
SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('ebp_alerts', 'ebp_engineering_admin_bootstrap');
-- Expected: 2 rows

SELECT column_name FROM information_schema.columns WHERE table_name = 'ebp_engineering_decisions' AND column_name = 'status';
-- Expected: 1 row

-- 17. At most one row ever in the bootstrap table (PK id=TRUE enforces this structurally)
SELECT COUNT(*) AS bootstrap_row_count FROM ebp_engineering_admin_bootstrap;
-- Expected: 0 or 1, never more (PK guarantees this; informational only)

-- 18. Alert dedup: never more than one OPEN/ACKNOWLEDGED alert per (alert_type, entity_type, entity_id)
SELECT alert_type, entity_type, entity_id, COUNT(*) AS open_count
FROM ebp_alerts
WHERE status IN ('OPEN', 'ACKNOWLEDGED')
GROUP BY alert_type, entity_type, entity_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 19. validation_runs.trigger CHECK includes the exception-decision-specific values
SELECT pg_get_constraintdef(oid) AS definition FROM pg_constraint WHERE conname = 'ebp_validation_runs_trigger_check';
-- Expected: 1 row, definition mentions EXCEPTION_APPROVED and EXCEPTION_REJECTED

-- 20. Every engineering_decisions.status is one of the two decided values
SELECT id, status FROM ebp_engineering_decisions WHERE status NOT IN ('CURRENT', 'NEEDS_REVIEW');
-- Expected: 0 rows

-- 21. Every alerts.status is one of the four decided values
SELECT alert_id, status FROM ebp_alerts WHERE status NOT IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
-- Expected: 0 rows
