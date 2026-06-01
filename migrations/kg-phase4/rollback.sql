-- =============================================================================
-- KG PHASE 4 — ROLLBACK SCRIPT
-- File: rollback.sql
-- Purpose: Remove all Phase 4 objects (kg_canonical_blocks, kg_concept_links)
-- Safe to run: YES (IF EXISTS prevents errors on empty DB)
-- Affects Phase 1 tables: NO (kg_technologies, kg_systems are NOT dropped)
-- Affects elimfilters_catalog: NO
--
-- Rollback options:
--   Full rollback:    DROP both tables (removes all Phase 4 objects)
--   Partial rollback: TRUNCATE or DELETE by concept_type (preserves table structure)
-- =============================================================================

-- =============================================================================
-- FULL ROLLBACK — DROP TABLES
-- Use when: re-running Phase 4 from scratch, or abandoning Phase 4
-- =============================================================================

-- Step 1: Drop kg_concept_links first (no FK to canonical_blocks, but conceptually dependent)
-- Note: kg_concept_links has no FK constraint to kg_canonical_blocks — slugs are text references
-- DROP CASCADE is safe — no other tables reference kg_concept_links
DROP TABLE IF EXISTS kg_concept_links CASCADE;
-- Expected: DROP TABLE

-- Step 2: Drop kg_canonical_blocks
-- Note: No FK constraints from other tables point to kg_canonical_blocks in Phase 4
-- Phase 5 kg_embeddings will reference canonical blocks by entity_id — if Phase 5 exists,
-- delete from kg_embeddings first: DELETE FROM kg_embeddings WHERE entity_type = 'canonical_block';
DROP TABLE IF EXISTS kg_canonical_blocks CASCADE;
-- Expected: DROP TABLE

-- Note: kg_set_updated_at() function is NOT dropped — shared with Phase 1 tables
-- To remove: DROP FUNCTION IF EXISTS kg_set_updated_at() CASCADE;
-- WARNING: This will also remove triggers on kg_systems and kg_technologies (Phase 1)
-- Only run the function drop if you are also rolling back Phase 1.


-- =============================================================================
-- PARTIAL ROLLBACK OPTIONS
-- Use when: correcting content errors without full re-seed
-- Comment out the full rollback above before using partial options
-- =============================================================================

-- Option A: Remove only technology canonical blocks
-- Use when: technology content needs correction, system/contamination blocks are correct
--
-- DELETE FROM kg_concept_links
--   WHERE source_type = 'technology' OR target_type = 'technology';
-- DELETE FROM kg_canonical_blocks WHERE concept_type = 'technology';
-- Then re-run: 002_seed_technology_blocks.sql

-- Option B: Remove only system canonical blocks
--
-- DELETE FROM kg_concept_links
--   WHERE source_type = 'system' OR target_type = 'system';
-- DELETE FROM kg_canonical_blocks WHERE concept_type = 'system';
-- Then re-run: 003_seed_system_blocks.sql (Section A only)

-- Option C: Remove only contamination mode canonical blocks
--
-- DELETE FROM kg_concept_links
--   WHERE source_type = 'contamination_mode' OR target_type = 'contamination_mode';
-- DELETE FROM kg_canonical_blocks WHERE concept_type = 'contamination_mode';
-- Then re-run: 003_seed_system_blocks.sql (Section B only)

-- Option D: Remove all concept links (re-seed graph edges only)
--
-- TRUNCATE TABLE kg_concept_links;
-- Then re-run: 004_seed_concept_links.sql

-- Option E: Correct a single canonical block definition
-- (preferred when only one block needs correction — no rollback needed)
--
-- UPDATE kg_canonical_blocks
-- SET
--   definition   = 'CORRECTED DEFINITION TEXT HERE',
--   version      = version + 1,
--   last_updated = CURRENT_DATE,
--   updated_at   = NOW()
-- WHERE concept_slug = '[slug]' AND concept_type = '[type]';


-- =============================================================================
-- VERIFY ROLLBACK COMPLETE
-- Run after full rollback to confirm tables are removed
-- =============================================================================

-- Verify Phase 4 tables gone
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('kg_canonical_blocks', 'kg_concept_links');
-- Expected: 0 rows (both tables dropped)

-- Verify Phase 1 tables still exist (Phase 1 NOT affected by rollback)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('kg_systems', 'kg_technologies', 'kg_product_systems', 'kg_product_technologies')
ORDER BY table_name;
-- Expected: 4 rows (all Phase 1 tables intact)

-- Verify elimfilters_catalog unchanged
SELECT COUNT(*) AS catalog_product_count FROM elimfilters_catalog;
-- Expected: 4622 (unchanged)

-- =============================================================================
-- Recovery: Re-run sequence to restore Phase 4
-- =============================================================================
-- 1. migrations/kg-phase4/001_schema.sql
-- 2. migrations/kg-phase4/002_seed_technology_blocks.sql
-- 3. migrations/kg-phase4/003_seed_system_blocks.sql
-- 4. migrations/kg-phase4/004_seed_concept_links.sql
-- 5. migrations/kg-phase4/validate.sql (verify)
-- Estimated recovery time: < 5 minutes
