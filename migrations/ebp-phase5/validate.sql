-- =============================================================================
-- EBP PHASE 5 — VALIDATION
-- File: validate.sql
-- Purpose: Confirm the Phase 5 migration applied correctly and constraints hold.
-- Safe to run: YES (read-only)
-- =============================================================================

-- 1. All 11 Phase 5 tables exist
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_selection_role_assignments',
    'ebp_selection_admin_bootstrap',
    'ebp_selection_policies',
    'ebp_offer_commercial_approvals',
    'ebp_demand_signals',
    'ebp_preferred_manufacturers',
    'ebp_selection_runs',
    'ebp_selection_candidates',
    'ebp_selection_factor_scores',
    'ebp_selection_decisions',
    'ebp_selection_overrides'
  )
ORDER BY tablename;
-- Expected: 11 rows

-- 2. The analytics view exists
SELECT viewname FROM pg_views WHERE viewname = 'ebp_analytics_selection_summary';
-- Expected: 1 row

-- 3. The override-guard trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'trg_ebp_enforce_selection_override_guard';
-- Expected: 1 row

-- 4. Phase 1/2/3/4 tables are untouched (still present)
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ebp_engineering_passports', 'ebp_manufacturers', 'ebp_manufacturer_offers',
    'ebp_validation_runs', 'ebp_engineering_decisions', 'ebp_activity_events', 'ebp_alerts'
  )
ORDER BY tablename;
-- Expected: 7 rows

-- 5. Phase 1-4 row counts are unaffected by this migration (schema-only change)
SELECT 'ebp_engineering_passports' AS t, COUNT(*) FROM ebp_engineering_passports
UNION ALL SELECT 'ebp_manufacturers', COUNT(*) FROM ebp_manufacturers
UNION ALL SELECT 'ebp_manufacturer_offers', COUNT(*) FROM ebp_manufacturer_offers
UNION ALL SELECT 'ebp_validation_runs', COUNT(*) FROM ebp_validation_runs
UNION ALL SELECT 'ebp_engineering_decisions', COUNT(*) FROM ebp_engineering_decisions;
-- Expected: same counts as before the Phase 5 migration was applied

-- 6. At most one ACTIVE Selection Policy per (scope_type, scope_value)
SELECT scope_type, scope_value, COUNT(*)
FROM ebp_selection_policies
WHERE status = 'ACTIVE'
GROUP BY scope_type, scope_value
HAVING COUNT(*) > 1;
-- Expected: 0 rows

-- 7. At most one non-STALE run per Passport is the "current" one used by
-- ebp_analytics_selection_summary (informational — multiple RECOMMENDATION_READY
-- rows across different selection_version values are fine as long as only the
-- highest version per passport is non-STALE in practice)
SELECT passport_id, COUNT(*) AS non_stale_runs
FROM ebp_selection_runs
WHERE run_result <> 'STALE'
GROUP BY passport_id
HAVING COUNT(*) > 1;
-- Expected: 0 rows once service.js discipline is followed (informational check)

-- 8. Every eligible candidate has at least one factor score row
SELECT c.id
FROM ebp_selection_candidates c
WHERE c.eligible
  AND NOT EXISTS (SELECT 1 FROM ebp_selection_factor_scores f WHERE f.selection_candidate_id = c.id);
-- Expected: 0 rows (once real data exists)

-- 9. No selection override has requested_by = decided_by
SELECT id FROM ebp_selection_overrides WHERE decided_by IS NOT NULL AND decided_by = requested_by;
-- Expected: 0 rows (enforced by trigger; this is a redundant data check)
