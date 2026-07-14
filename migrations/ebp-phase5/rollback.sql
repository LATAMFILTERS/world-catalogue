-- =============================================================================
-- EBP PHASE 5 — ROLLBACK
-- File: rollback.sql
-- Purpose: Completely undo all Phase 5 EBP changes if needed.
-- DOES NOT modify elimfilters_catalog, technologies, the Knowledge Graph,
-- Phase 1 (ebp_engineering_passports and children), Phase 2
-- (ebp_manufacturers and children), Phase 3 (ebp_manufacturer_offers and
-- children), or Phase 4 (ebp_validation_runs, ebp_engineering_decisions,
-- ebp_activity_events, ebp_alerts, and children) — Phase 5 only adds new
-- tables plus incoming FKs from its own tables to Phase 1/2/3/4 tables.
-- This rollback drops those FKs from the Phase 5 side only (dropping the
-- Phase 5 table removes the FK; the Phase 1/2/3/4 tables themselves are
-- never touched, and ebp_activity_events/ebp_alerts — reused, not owned,
-- by Phase 5 — are never dropped by this file).
--
-- ⚠️  DESTRUCTIVE — this drops all Phase 5 EBP tables, views, and data
-- ⚠️  Run only if Phase 5 needs to be reversed
-- ⚠️  Idempotent (IF EXISTS on all drops)
-- =============================================================================

-- Step -1: Drop the 002_override_guard.sql trigger/function first.
DROP TRIGGER IF EXISTS trg_ebp_enforce_selection_override_guard ON ebp_selection_overrides;
DROP FUNCTION IF EXISTS ebp_enforce_selection_override_guard();

-- Step 0: Drop the analytics view (depends on several tables below).
DROP VIEW IF EXISTS ebp_analytics_selection_summary;

-- Step 1: Drop tables in dependency order (children before parents).
DROP TABLE IF EXISTS ebp_selection_overrides           CASCADE;
DROP TABLE IF EXISTS ebp_selection_decisions            CASCADE;
DROP TABLE IF EXISTS ebp_selection_factor_scores        CASCADE;
DROP TABLE IF EXISTS ebp_selection_candidates           CASCADE;
DROP TABLE IF EXISTS ebp_selection_runs                 CASCADE;
DROP TABLE IF EXISTS ebp_preferred_manufacturers        CASCADE;
DROP TABLE IF EXISTS ebp_demand_signals                 CASCADE;
DROP TABLE IF EXISTS ebp_offer_commercial_approvals     CASCADE;
DROP TABLE IF EXISTS ebp_selection_policies             CASCADE;
DROP TABLE IF EXISTS ebp_selection_admin_bootstrap       CASCADE;
DROP TABLE IF EXISTS ebp_selection_role_assignments      CASCADE;

-- Step 2: Confirm Phase 1/2/3/4 tables are untouched (manual check after
-- running this file):
--   SELECT tablename FROM pg_tables WHERE schemaname = 'public'
--     AND tablename IN ('ebp_engineering_passports', 'ebp_manufacturers',
--       'ebp_manufacturer_offers', 'ebp_validation_runs',
--       'ebp_engineering_decisions', 'ebp_activity_events', 'ebp_alerts');
--   Expected: 7 rows, unchanged row counts.
