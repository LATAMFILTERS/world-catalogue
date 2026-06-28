-- =============================================================================
-- KG PHASE 4 — CANONICAL BLOCKS SCHEMA
-- File: 001_schema.sql
-- Purpose: Create kg_canonical_blocks and kg_concept_links tables
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Depends on: Phase 1 (kg_technologies, kg_systems must exist)
-- Affects elimfilters_catalog: NO
-- =============================================================================

-- ─── CANONICAL BLOCKS ────────────────────────────────────────────────────────
-- Machine-readable concept definitions for all KG entities.
-- Enables AI citation, JSON-LD generation, and cross-page consistency.
-- One row per (concept_slug, concept_type) pair — the unique concept identity.
--
-- concept_type values:
--   'technology'        — 13 ELIMFILTERS proprietary technologies
--   'system'            — 6 filtration system domains
--   'contamination_mode'— particle-wear, diesel-water, etc.
--   'standard'          — ISO 16889, ASTM D6304, etc.
--   'industry'          — agriculture, mining, etc.

CREATE TABLE IF NOT EXISTS kg_canonical_blocks (
  id                    SERIAL        PRIMARY KEY,
  concept_slug          VARCHAR(100)  NOT NULL,
  concept_type          VARCHAR(30)   NOT NULL,
  display_name          VARCHAR(150)  NOT NULL,

  -- AI Citation Layer — 6 required fields (SEMANTIC_RULES_REPORT.md §3)
  definition            TEXT          NOT NULL,   -- neutral technical sentence(s), min 50 chars
  system_context        TEXT,                     -- where/when this concept applies
  failure_mechanism     TEXT,                     -- root cause → effect → consequence chain
  industrial_impact     TEXT,                     -- quantified operational impacts (must include numbers)
  related_standards     JSONB         NOT NULL DEFAULT '[]'::jsonb,   -- [{code, scope}]
  related_technologies  JSONB         NOT NULL DEFAULT '[]'::jsonb,   -- [{slug, mechanism}]
  industrial_role       TEXT,                     -- one sentence on TCO/reliability importance

  -- Version tracking (SEMANTIC_RULES_REPORT.md §6)
  version               SMALLINT      NOT NULL DEFAULT 1,
  last_updated          DATE          NOT NULL DEFAULT CURRENT_DATE,
  citation_url          VARCHAR(200),             -- /knowledge-system/[section]/[slug]

  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT uq_canonical_slug_type UNIQUE (concept_slug, concept_type),

  CONSTRAINT chk_concept_type CHECK (
    concept_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  ),

  CONSTRAINT chk_definition_length CHECK (
    LENGTH(TRIM(definition)) >= 50
  ),

  CONSTRAINT chk_version_positive CHECK (version >= 1)
);

COMMENT ON TABLE  kg_canonical_blocks                    IS 'Machine-readable canonical definitions for all KG concepts — AI citation layer source of truth';
COMMENT ON COLUMN kg_canonical_blocks.concept_slug       IS 'Lowercase hyphenated identifier. Matches kg_technologies.slug or kg_systems.slug for those types';
COMMENT ON COLUMN kg_canonical_blocks.concept_type       IS 'Constrained: technology | system | contamination_mode | standard | industry';
COMMENT ON COLUMN kg_canonical_blocks.definition         IS 'One neutral technical sentence. No marketing language. Min 50 chars. Present tense. References primary mechanism';
COMMENT ON COLUMN kg_canonical_blocks.system_context     IS 'Equipment types, operating conditions, industrial scenarios where this concept applies';
COMMENT ON COLUMN kg_canonical_blocks.failure_mechanism  IS 'Root cause → intermediate effect → final consequence chain. Example: particles → wear → bearing clearance → seizure';
COMMENT ON COLUMN kg_canonical_blocks.industrial_impact  IS 'Quantified operational consequences. Must contain actual numbers: %, h, kW, frequency';
COMMENT ON COLUMN kg_canonical_blocks.related_standards  IS 'JSONB array: [{code: "ISO 16889", scope: "Beta ratio filter testing"}]';
COMMENT ON COLUMN kg_canonical_blocks.related_technologies IS 'JSONB array: [{slug: "nanoforce", mechanism: "Sub-micron particulate capture"}]';
COMMENT ON COLUMN kg_canonical_blocks.industrial_role    IS 'One sentence explaining why this concept matters for equipment reliability and TCO';
COMMENT ON COLUMN kg_canonical_blocks.version            IS 'Incremented on every content update. Enables versioned LLM citation';
COMMENT ON COLUMN kg_canonical_blocks.last_updated       IS 'Date of last content change. Combined with version for citation: "v2, 2026-08-15"';
COMMENT ON COLUMN kg_canonical_blocks.citation_url       IS 'Canonical page path for this concept: /knowledge-system/technologies/nanoforce';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kg_cb_slug       ON kg_canonical_blocks(concept_slug);
CREATE INDEX IF NOT EXISTS idx_kg_cb_type       ON kg_canonical_blocks(concept_type);
CREATE INDEX IF NOT EXISTS idx_kg_cb_slug_type  ON kg_canonical_blocks(concept_slug, concept_type);
CREATE INDEX IF NOT EXISTS idx_kg_cb_updated    ON kg_canonical_blocks(last_updated);


-- ─── CONCEPT LINKS ────────────────────────────────────────────────────────────
-- Directed graph edges between canonical concepts.
-- Enables: technology CONTROLS contamination_mode
--          standard MEASURES system
--          contamination_mode APPLIES_TO system
--
-- link_type values:
--   'controls'   — technology controls a contamination mode in a system
--   'measures'   — standard provides measurement framework for a system/contamination mode
--   'applies_to' — contamination mode applies to a filtration system
--   'related'    — bidirectional non-directional conceptual relationship
--   'requires'   — system compliance requires a standard

CREATE TABLE IF NOT EXISTS kg_concept_links (
  id                    SERIAL        PRIMARY KEY,
  source_concept_slug   VARCHAR(100)  NOT NULL,
  source_type           VARCHAR(30)   NOT NULL,
  target_concept_slug   VARCHAR(100)  NOT NULL,
  target_type           VARCHAR(30)   NOT NULL,
  link_type             VARCHAR(30)   NOT NULL,
  weight                SMALLINT      NOT NULL DEFAULT 1,  -- 1=weak, 2=moderate, 3=strong
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_concept_link UNIQUE (
    source_concept_slug, source_type, target_concept_slug, target_type, link_type
  ),

  CONSTRAINT chk_cl_link_type CHECK (
    link_type IN ('related', 'controls', 'measures', 'applies_to', 'requires')
  ),

  CONSTRAINT chk_cl_source_type CHECK (
    source_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  ),

  CONSTRAINT chk_cl_target_type CHECK (
    target_type IN ('technology', 'system', 'contamination_mode', 'standard', 'industry')
  ),

  CONSTRAINT chk_no_self_link CHECK (
    NOT (source_concept_slug = target_concept_slug AND source_type = target_type)
  )
);

COMMENT ON TABLE  kg_concept_links                       IS 'Directed graph edges between canonical concepts — enables KG traversal and JSON-LD relatedLink generation';
COMMENT ON COLUMN kg_concept_links.source_concept_slug   IS 'Slug of the source concept (from kg_canonical_blocks)';
COMMENT ON COLUMN kg_concept_links.link_type             IS 'Semantic relationship: controls | measures | applies_to | related | requires';
COMMENT ON COLUMN kg_concept_links.weight                IS '1=weak association, 2=moderate, 3=strong/primary';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_kg_cl_source  ON kg_concept_links(source_concept_slug, source_type);
CREATE INDEX IF NOT EXISTS idx_kg_cl_target  ON kg_concept_links(target_concept_slug, target_type);
CREATE INDEX IF NOT EXISTS idx_kg_cl_type    ON kg_concept_links(link_type);


-- ─── TRIGGER — updated_at auto-maintenance ───────────────────────────────────
-- Reuses kg_set_updated_at() function from Phase 1 (001_schema.sql).
-- If Phase 1 was not run, create the function here.

CREATE OR REPLACE FUNCTION kg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_canonical_blocks_updated_at'
  ) THEN
    CREATE TRIGGER trg_kg_canonical_blocks_updated_at
      BEFORE UPDATE ON kg_canonical_blocks
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;
END;
$$;

-- =============================================================================
-- Expected output after successful run:
--   CREATE TABLE (kg_canonical_blocks)
--   CREATE TABLE (kg_concept_links)
--   CREATE INDEX (×4 for canonical_blocks)
--   CREATE INDEX (×3 for concept_links)
--   DO (trigger creation)
--
-- Verify with:
--   \d kg_canonical_blocks
--   \d kg_concept_links
--   SELECT COUNT(*) FROM pg_constraint WHERE conrelid = 'kg_canonical_blocks'::regclass;
-- =============================================================================
