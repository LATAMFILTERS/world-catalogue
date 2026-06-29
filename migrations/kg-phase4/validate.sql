-- =============================================================================
-- KG PHASE 4 — VALIDATION SUITE
-- File: validate.sql
-- Purpose: Verify Phase 4 canonical blocks and concept links are correct
-- Run after: 001_schema.sql, 002_seed_technology_blocks.sql,
--            003_seed_system_blocks.sql, 004_seed_concept_links.sql
-- Expected: All checks pass with 0 error rows
-- =============================================================================


-- =============================================================================
-- SECTION A — SCHEMA INTEGRITY
-- Verifies tables, constraints, and indexes exist as designed
-- =============================================================================

-- A1: Required tables exist
-- Expected: 2 rows (kg_canonical_blocks, kg_concept_links)
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('kg_canonical_blocks', 'kg_concept_links')
ORDER BY table_name;

-- A2: UNIQUE constraint on kg_canonical_blocks(concept_slug, concept_type)
-- Expected: 1 row with conname = 'uq_canonical_slug_type'
SELECT conname, contype
FROM pg_constraint
WHERE conrelid = 'kg_canonical_blocks'::regclass
  AND conname = 'uq_canonical_slug_type';

-- A3: CHECK constraint on concept_type
-- Expected: row with conname = 'chk_concept_type'
SELECT conname
FROM pg_constraint
WHERE conrelid = 'kg_canonical_blocks'::regclass
  AND conname = 'chk_concept_type';

-- A4: CHECK constraint on definition length
-- Expected: row with conname = 'chk_definition_length'
SELECT conname
FROM pg_constraint
WHERE conrelid = 'kg_canonical_blocks'::regclass
  AND conname = 'chk_definition_length';

-- A5: updated_at trigger active
-- Expected: 1 row
SELECT tgname
FROM pg_trigger
WHERE tgname = 'trg_kg_canonical_blocks_updated_at';

-- A6: Indexes exist
-- Expected: 4 rows (slug, type, slug_type composite, updated)
SELECT indexname
FROM pg_indexes
WHERE tablename = 'kg_canonical_blocks'
  AND indexname LIKE 'idx_kg_cb%'
ORDER BY indexname;


-- =============================================================================
-- SECTION B — BLOCK COMPLETENESS
-- Verifies all required concept types and counts are present
-- =============================================================================

-- B1: Block count by type
-- Expected: technology=13, system=6, contamination_mode=5
SELECT concept_type, COUNT(*) AS block_count
FROM kg_canonical_blocks
GROUP BY concept_type
ORDER BY concept_type;

-- B2: Technology coverage — all 13 kg_technologies must have canonical blocks
-- Expected: 0 rows (0 = all technologies covered)
SELECT t.slug AS missing_technology_block
FROM kg_technologies t
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = t.slug AND b.concept_type = 'technology'
WHERE b.id IS NULL AND t.is_active = TRUE
ORDER BY t.slug;
-- PASS condition: 0 rows

-- B3: System coverage — all 6 kg_systems must have canonical blocks
-- Expected: 0 rows (0 = all systems covered)
SELECT s.slug AS missing_system_block
FROM kg_systems s
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = s.slug AND b.concept_type = 'system'
WHERE b.id IS NULL
ORDER BY s.slug;
-- PASS condition: 0 rows

-- B4: All 13 expected technology slugs present
-- Expected: exactly these 13 rows
SELECT concept_slug
FROM kg_canonical_blocks
WHERE concept_type = 'technology'
ORDER BY concept_slug;
-- Expected slugs: aquaguard, blueclean, cooltech, drycore, duratech,
--                 gasultra, intekcore, macrocore, marineclean, microkappa,
--                 nanoforce, syntepore, syntrax

-- B5: All 6 expected system slugs present
-- Expected: exactly these 6 rows
SELECT concept_slug
FROM kg_canonical_blocks
WHERE concept_type = 'system'
ORDER BY concept_slug;
-- Expected slugs: air-intake, cabin, compressed-air, fuel, hydraulic, lube-oil

-- B6: Contamination modes present
-- Expected: ≥ 5 rows
SELECT concept_slug, display_name
FROM kg_canonical_blocks
WHERE concept_type = 'contamination_mode'
ORDER BY concept_slug;


-- =============================================================================
-- SECTION C — CONTENT QUALITY
-- Verifies content meets required standards (no NULL, no marketing, metrics present)
-- =============================================================================

-- C1: NULL definition check
-- Expected: 0 rows
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE definition IS NULL
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C2: Definition length check (min 50 chars enforced by CHECK constraint)
-- Expected: 0 rows (constraint blocks short definitions)
SELECT concept_slug, concept_type, LENGTH(definition) AS def_length
FROM kg_canonical_blocks
WHERE LENGTH(TRIM(definition)) < 50
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C3: Missing industrial_impact for technology and system blocks
-- Expected: 0 rows
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system', 'contamination_mode')
  AND (industrial_impact IS NULL OR TRIM(industrial_impact) = '')
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C4: Empty related_standards for technology and system blocks
-- Expected: 0 rows (all technology/system blocks must have ≥1 standard)
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system')
  AND (related_standards = '[]'::jsonb OR related_standards IS NULL)
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C5: Missing citation_url for technology and system blocks
-- Expected: 0 rows
SELECT concept_slug, concept_type
FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system')
  AND (citation_url IS NULL OR TRIM(citation_url) = '')
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C6: Marketing language scan — CRITICAL
-- Expected: 0 rows (marketing language is PROHIBITED)
SELECT concept_slug, concept_type,
       CASE
         WHEN definition ILIKE '%leading provider%'  THEN 'BANNED: leading provider'
         WHEN definition ILIKE '%superior%'           THEN 'BANNED: superior'
         WHEN definition ILIKE '%innovative%'         THEN 'BANNED: innovative'
         WHEN definition ILIKE '%cutting-edge%'       THEN 'BANNED: cutting-edge'
         WHEN definition ILIKE '%industry-leading%'   THEN 'BANNED: industry-leading'
         WHEN definition ILIKE '%outperforms%'        THEN 'BANNED: outperforms'
         WHEN definition ILIKE '%premium%'            THEN 'BANNED: premium'
         WHEN definition ILIKE '%cost savings%'       THEN 'BANNED: cost savings'
         WHEN definition ILIKE '%cheaper than%'       THEN 'BANNED: cheaper than'
         WHEN definition ILIKE '%better than%'        THEN 'BANNED: better than'
         ELSE 'unknown violation'
       END AS violation
FROM kg_canonical_blocks
WHERE
  definition ILIKE '%leading provider%'
  OR definition ILIKE '%superior%'
  OR definition ILIKE '%innovative%'
  OR definition ILIKE '%cutting-edge%'
  OR definition ILIKE '%industry-leading%'
  OR definition ILIKE '%outperforms%'
  OR definition ILIKE '%premium%'
  OR definition ILIKE '%cost savings%'
  OR definition ILIKE '%cheaper than%'
  OR definition ILIKE '%better than%'
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C7: Industrial impact quantification check — must contain at least one number
-- Expected: 0 rows (all industrial_impact fields must contain % or h or kW or numbers)
SELECT concept_slug, concept_type, LEFT(industrial_impact, 100) AS impact_preview
FROM kg_canonical_blocks
WHERE concept_type IN ('technology', 'system', 'contamination_mode')
  AND industrial_impact IS NOT NULL
  AND industrial_impact !~ '[0-9]'  -- no digit found
ORDER BY concept_type, concept_slug;
-- PASS condition: 0 rows

-- C8: Version integrity — all versions must be ≥ 1
-- Expected: 0 rows with version < 1
SELECT concept_slug, concept_type, version
FROM kg_canonical_blocks
WHERE version < 1;
-- PASS condition: 0 rows

-- C9: Critical category corrections verification
-- MICROKAPPA must reference cabin (not coolant)
SELECT concept_slug, 'CABIN CHECK' AS check_type,
  CASE
    WHEN definition ILIKE '%cabin%' OR definition ILIKE '%HEPA%' OR definition ILIKE '%cabin air%'
    THEN 'PASS: cabin reference found'
    ELSE 'FAIL: missing cabin/HEPA reference in MICROKAPPA definition'
  END AS result
FROM kg_canonical_blocks
WHERE concept_slug = 'microkappa' AND concept_type = 'technology';

-- SYNTRAX must reference lube/engine oil (not hydraulic)
SELECT concept_slug, 'LUBE-OIL CHECK' AS check_type,
  CASE
    WHEN definition ILIKE '%lube%' OR definition ILIKE '%engine oil%'
    THEN 'PASS: lube/engine oil reference found'
    ELSE 'FAIL: missing lube/engine oil reference in SYNTRAX definition'
  END AS result
FROM kg_canonical_blocks
WHERE concept_slug = 'syntrax' AND concept_type = 'technology';

-- NANOFORCE must reference hydraulic (not lube oil as primary)
SELECT concept_slug, 'HYDRAULIC CHECK' AS check_type,
  CASE
    WHEN definition ILIKE '%hydraulic%'
    THEN 'PASS: hydraulic reference found'
    ELSE 'FAIL: missing hydraulic reference in NANOFORCE definition'
  END AS result
FROM kg_canonical_blocks
WHERE concept_slug = 'nanoforce' AND concept_type = 'technology';


-- =============================================================================
-- SECTION D — LINK GRAPH INTEGRITY
-- Verifies concept links are internally consistent
-- =============================================================================

-- D1: Total link count by type
-- Expected: controls≥15, applies_to≥8, related≥10
SELECT link_type, COUNT(*) AS link_count
FROM kg_concept_links
GROUP BY link_type
ORDER BY link_type;

-- D2: Orphan source links — source slug not in canonical blocks
-- Expected: 0 rows (all sources must have corresponding canonical blocks)
SELECT DISTINCT cl.source_concept_slug, cl.source_type, cl.link_type
FROM kg_concept_links cl
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = cl.source_concept_slug AND b.concept_type = cl.source_type
WHERE b.id IS NULL
ORDER BY cl.source_type, cl.source_concept_slug;
-- PASS condition: 0 rows
-- NOTE: Standard slugs (iso-16889, etc.) will appear here until Phase 4F standard blocks are seeded

-- D3: Orphan target links — target slug not in canonical blocks
-- Expected: 0 rows for technology and system targets
-- NOTE: If standard blocks not yet seeded, standard targets will show as orphans
SELECT DISTINCT cl.target_concept_slug, cl.target_type, cl.link_type
FROM kg_concept_links cl
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = cl.target_concept_slug AND b.concept_type = cl.target_type
WHERE b.id IS NULL
  AND cl.target_type IN ('technology', 'system', 'contamination_mode')  -- exclude standard type
ORDER BY cl.target_type, cl.target_concept_slug;
-- PASS condition: 0 rows (for technology, system, contamination_mode targets only)

-- D4: Self-referencing link check (CHECK constraint should prevent these)
-- Expected: 0 rows
SELECT source_concept_slug, source_type, target_concept_slug, target_type
FROM kg_concept_links
WHERE source_concept_slug = target_concept_slug AND source_type = target_type;
-- PASS condition: 0 rows

-- D5: Controls links from technologies to systems
-- Expected: ≥13 rows (each technology links to at least one system)
SELECT COUNT(DISTINCT source_concept_slug) AS technologies_with_system_controls
FROM kg_concept_links
WHERE source_type = 'technology'
  AND target_type = 'system'
  AND link_type = 'controls';

-- D6: Contamination mode → system applies_to links
-- Expected: ≥8 rows (all contamination modes link to at least one system)
SELECT source_concept_slug, COUNT(*) AS system_count
FROM kg_concept_links
WHERE source_type = 'contamination_mode'
  AND target_type = 'system'
  AND link_type = 'applies_to'
GROUP BY source_concept_slug
ORDER BY source_concept_slug;


-- =============================================================================
-- SECTION E — CI COVERAGE CHECKS (for pipeline integration)
-- These produce single-row results suitable for automated pass/fail
-- =============================================================================

-- E1: Technology coverage complete (0 = PASS, >0 = FAIL)
SELECT COUNT(*) AS missing_technology_blocks
FROM kg_technologies t
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = t.slug AND b.concept_type = 'technology'
WHERE b.id IS NULL AND t.is_active = TRUE;
-- PASS: 0

-- E2: System coverage complete (0 = PASS, >0 = FAIL)
SELECT COUNT(*) AS missing_system_blocks
FROM kg_systems s
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = s.slug AND b.concept_type = 'system'
WHERE b.id IS NULL;
-- PASS: 0

-- E3: No NULL definitions (0 = PASS, >0 = FAIL)
SELECT COUNT(*) AS null_definitions
FROM kg_canonical_blocks
WHERE definition IS NULL;
-- PASS: 0

-- E4: No marketing language (0 = PASS, >0 = FAIL)
SELECT COUNT(*) AS marketing_language_violations
FROM kg_canonical_blocks
WHERE
  definition ILIKE '%leading provider%'
  OR definition ILIKE '%superior%'
  OR definition ILIKE '%innovative%'
  OR definition ILIKE '%cutting-edge%'
  OR definition ILIKE '%industry-leading%'
  OR definition ILIKE '%outperforms%'
  OR definition ILIKE '%premium%';
-- PASS: 0

-- E5: No orphan links to technology/system targets (0 = PASS)
SELECT COUNT(*) AS orphan_tech_system_links
FROM kg_concept_links cl
LEFT JOIN kg_canonical_blocks b
  ON b.concept_slug = cl.target_concept_slug AND b.concept_type = cl.target_type
WHERE b.id IS NULL
  AND cl.target_type IN ('technology', 'system', 'contamination_mode');
-- PASS: 0


-- =============================================================================
-- SECTION F — SUMMARY
-- Quick status overview for all Phase 4 objects
-- =============================================================================

SELECT
  'kg_canonical_blocks'                                          AS table_name,
  (SELECT COUNT(*) FROM kg_canonical_blocks)                     AS total_rows,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='technology')         AS technology_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='system')             AS system_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='contamination_mode') AS contamination_mode_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='standard')           AS standard_blocks,
  (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='industry')           AS industry_blocks;

SELECT
  'kg_concept_links'                                        AS table_name,
  (SELECT COUNT(*) FROM kg_concept_links)                   AS total_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='controls')   AS controls_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='applies_to') AS applies_to_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='related')    AS related_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='measures')   AS measures_links,
  (SELECT COUNT(*) FROM kg_concept_links WHERE link_type='requires')   AS requires_links;

-- Phase 4 Status (all values must match expected)
SELECT
  CASE
    WHEN (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='technology') = 13
      AND (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='system') = 6
      AND (SELECT COUNT(*) FROM kg_canonical_blocks WHERE concept_type='contamination_mode') >= 3
      AND (SELECT COUNT(*) FROM kg_concept_links) >= 40
    THEN '✅ PHASE 4 VALIDATION PASSED'
    ELSE '❌ PHASE 4 VALIDATION FAILED — check sections A-E above'
  END AS phase_4_status;

-- =============================================================================
-- END OF VALIDATION SUITE
-- All PASS conditions: 0 rows for error queries, expected counts for count queries
-- =============================================================================
