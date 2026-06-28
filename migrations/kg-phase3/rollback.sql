-- =============================================================================
-- KG PHASE 3 — ROLLBACK
-- File: rollback.sql
-- Purpose: Undo Phase 3 schema creation and data extraction
-- Safe to run: YES (IF EXISTS prevents errors if table doesn't exist)
-- Effect on elimfilters_catalog: NONE — source data is never modified
-- Effect on Phase 1 tables: NONE — kg_crossrefs has no FK dependencies on Phase 1/2 tables
-- Effect on Phase 2 tables: NONE — kg_crossrefs is independent of Phase 2
-- =============================================================================

-- =============================================================================
-- OPTION A: FULL ROLLBACK
-- Drops kg_crossrefs entirely.
-- No cascade effects on other KG tables (kg_crossrefs is a leaf table with no dependents).
-- After full rollback: re-run 001_schema.sql, 002_populate_oem_crossrefs.sql,
--                      003_populate_competitor_crossrefs.sql
-- =============================================================================

DROP TABLE IF EXISTS kg_crossrefs;


-- ─────────────────────────────────────────────────────────────────────────────
-- POST-FULL-ROLLBACK VERIFICATION
-- ─────────────────────────────────────────────────────────────────────────────

-- Verify kg_crossrefs is gone
SELECT COUNT(*) AS crossrefs_table_exists
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'kg_crossrefs';
-- Expected: 0

-- Verify Phase 1 tables are intact
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
ORDER BY tablename;
-- Expected: 4 rows

-- Verify Phase 2 tables are intact (if Phase 2 was run)
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment')
ORDER BY tablename;
-- Expected: 3 rows (if Phase 2 was run); 0 rows (if Phase 2 was not run)

-- Verify catalog is untouched
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;
-- Expected: ~4622 (unchanged)


-- =============================================================================
-- OPTION B: PARTIAL ROLLBACK — TRUNCATE (KEEP SCHEMA)
-- Removes all data from kg_crossrefs but keeps the table structure.
-- Use when: extraction logic has changed, full re-extraction needed.
-- After truncate: re-run scripts 002 and 003
-- =============================================================================

/*
TRUNCATE TABLE kg_crossrefs RESTART IDENTITY;
-- Expected: table empty (0 rows), schema intact
-- Re-run: 002_populate_oem_crossrefs.sql, 003_populate_competitor_crossrefs.sql
*/


-- =============================================================================
-- OPTION C: PARTIAL ROLLBACK BY REF_TYPE
-- Remove only a specific category of cross-references.
-- Useful when only one source had issues.
-- =============================================================================

-- Remove only OEM cross-references (from oem_codes JSONB source)
-- Use when: Format D classification logic needs correction for OEM entries
/*
DELETE FROM kg_crossrefs WHERE ref_type = 'oem';
-- Re-run: 002_populate_oem_crossrefs.sql
*/

-- Remove only competitor cross-references (from competitor_codes JSONB source)
-- Use when: competitor_codes parsing or classification had issues
/*
DELETE FROM kg_crossrefs WHERE ref_type = 'competitor';
-- Re-run: 003_populate_competitor_crossrefs.sql (Step 1)
*/

-- Remove only brand cross-references (from brand_crossrefs JSONB source)
-- Use when: brand_crossrefs parsing logic needs correction
/*
DELETE FROM kg_crossrefs WHERE ref_type = 'brand';
-- Re-run: 003_populate_competitor_crossrefs.sql (Step 2)
*/

-- Remove competitor cross-references from both oem_codes and competitor_codes
-- Use when: COMPETITOR_BRANDS classification was incorrect
/*
DELETE FROM kg_crossrefs WHERE ref_type = 'competitor';
-- Then re-run both scripts 002 and 003 (both insert competitor rows)
*/


-- ─────────────────────────────────────────────────────────────────────────────
-- PARTIAL ROLLBACK VERIFICATION QUERIES
-- ─────────────────────────────────────────────────────────────────────────────

/*
-- After Option B (truncate):
SELECT COUNT(*) AS total_rows FROM kg_crossrefs;  -- Expected: 0

-- After Option C (delete by ref_type):
SELECT ref_type, COUNT(*) AS count
FROM kg_crossrefs
GROUP BY ref_type
ORDER BY ref_type;
-- Expected: shows remaining ref_types only (deleted type returns 0 or no row)

-- In all cases: catalog must be unchanged
SELECT COUNT(*) AS catalog_count FROM elimfilters_catalog;  -- Expected: ~4622

-- In all cases: Phase 1 tables must be intact
SELECT COUNT(*) FROM kg_systems;      -- Expected: 6
SELECT COUNT(*) FROM kg_technologies; -- Expected: 13
*/
