-- =============================================================================
-- KG PHASE 1 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 4 core Phase 1 tables
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects elimfilters_catalog: NO
-- =============================================================================

-- ─── SYSTEMS ────────────────────────────────────────────────────────────────
-- The 6 filtration system domains (air-intake, fuel, hydraulic, lube-oil, cabin, compressed-air)
-- These are the top-level classification nodes in the KG.

CREATE TABLE IF NOT EXISTS kg_systems (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(50)  NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  sort_order    SMALLINT     NOT NULL DEFAULT 99,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  kg_systems             IS 'Filtration system domains — the 6 KG root classification nodes';
COMMENT ON COLUMN kg_systems.slug        IS 'URL-safe identifier: air-intake, compressed-air, lube-oil, hydraulic, fuel, cabin';
COMMENT ON COLUMN kg_systems.sort_order  IS 'Display order in UI listings';

CREATE INDEX IF NOT EXISTS idx_kg_systems_slug ON kg_systems(slug);


-- ─── TECHNOLOGIES ───────────────────────────────────────────────────────────
-- The 11 ELIMFILTERS proprietary filtration technologies in the KG.
-- Each technology has a primary system assignment, logo reference, and lifecycle status.
--
-- CRITICAL DATA RULES (from SEMANTIC_MODEL_REPORT.md):
--   MICROKAPPA  → primary_system = cabin        (NOT lube/coolant — TS was wrong)
--   SYNTRAX     → primary_system = lube-oil     (NOT hydraulic — TS was wrong)
--   NANOFORCE   → primary_system = hydraulic    (NOT lube-oil)
--   SINTRAX     → alias for SYNTRAX (same slug: syntrax)
--   SYNTAPORE   → deprecated name for SYNTEPORE
--
-- TECHNOLOGY STATUS VALUES:
--   ACTIVE     — Has products in elimfilters_catalog. Full KG participation.
--   PRE_LAUNCH — Technology defined and pages built. No catalog products yet.
--                Participates in KG, canonical blocks, and embeddings.
--                Products will populate on launch.
--
-- EXCLUDED FROM KG (not seeded here):
--   BLUECLEAN  — No products, no canonical block, no technical content,
--                no semantic value. Retained only in server.js TECH_LOGO_MAP.
--   GASULTRA   — Same as BLUECLEAN. Placeholder-only status.
--                Activate via future seed when product catalog is populated.

CREATE TABLE IF NOT EXISTS kg_technologies (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(50)  NOT NULL UNIQUE,
  display_name      VARCHAR(100) NOT NULL,         -- e.g. "SYNTRAX™"
  primary_system_id INTEGER      REFERENCES kg_systems(id) ON DELETE SET NULL,
  category          VARCHAR(100),                  -- human-readable category label
  description       TEXT,
  logo_file         VARCHAR(100),                  -- filename from /public/logos/
  status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'PRE_LAUNCH', 'DEPRECATED', 'PLACEHOLDER')),
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  kg_technologies                  IS '11 ELIMFILTERS proprietary technologies — authoritative source of truth for tech metadata. BLUECLEAN and GASULTRA excluded (placeholder-only, no products, no semantic value).';
COMMENT ON COLUMN kg_technologies.slug             IS 'Lowercase, no trademark: syntrax, macrocore, nanoforce, etc.';
COMMENT ON COLUMN kg_technologies.display_name     IS 'Always [SLUG_UPPERCASE]™ format: SYNTRAX™';
COMMENT ON COLUMN kg_technologies.primary_system_id IS 'Main system this tech belongs to. Multi-system techs handled in kg_technology_systems (Phase 2)';
COMMENT ON COLUMN kg_technologies.logo_file        IS 'Filename only. Base path: /public/logos/ or /img/';
COMMENT ON COLUMN kg_technologies.status           IS 'ACTIVE=has catalog products; PRE_LAUNCH=defined+pages but no products yet; DEPRECATED=replaced; PLACEHOLDER=reserved name only';

CREATE INDEX IF NOT EXISTS idx_kg_tech_slug            ON kg_technologies(slug);
CREATE INDEX IF NOT EXISTS idx_kg_tech_primary_system  ON kg_technologies(primary_system_id);


-- ─── PRODUCT → SYSTEMS (join table) ─────────────────────────────────────────
-- Maps each product SKU to its filtration system(s).
-- Derived from elimfilters_catalog.filter_type.
-- A product can belong to multiple systems (rare, but possible for combo products).

CREATE TABLE IF NOT EXISTS kg_product_systems (
  id          SERIAL      PRIMARY KEY,
  product_sku VARCHAR(50) NOT NULL,
  system_id   INTEGER     NOT NULL REFERENCES kg_systems(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_system UNIQUE (product_sku, system_id)
);

COMMENT ON TABLE  kg_product_systems             IS 'Maps product SKUs to filtration systems — derived from filter_type column';
COMMENT ON COLUMN kg_product_systems.product_sku IS 'References elimfilters_catalog.sku — no FK to allow catalog updates without cascade';

CREATE INDEX IF NOT EXISTS idx_kgps_sku       ON kg_product_systems(product_sku);
CREATE INDEX IF NOT EXISTS idx_kgps_system    ON kg_product_systems(system_id);


-- ─── PRODUCT → TECHNOLOGIES (join table) ────────────────────────────────────
-- Maps each product SKU to its filtration technology.
-- Derived from elimfilters_catalog.technology.
-- Most products have exactly one technology; join table allows future multi-tech products.

CREATE TABLE IF NOT EXISTS kg_product_technologies (
  id            SERIAL      PRIMARY KEY,
  product_sku   VARCHAR(50) NOT NULL,
  technology_id INTEGER     NOT NULL REFERENCES kg_technologies(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_technology UNIQUE (product_sku, technology_id)
);

COMMENT ON TABLE  kg_product_technologies             IS 'Maps product SKUs to filtration technologies — derived from technology column';
COMMENT ON COLUMN kg_product_technologies.product_sku IS 'References elimfilters_catalog.sku — no FK to allow catalog updates without cascade';

CREATE INDEX IF NOT EXISTS idx_kgpt_sku        ON kg_product_technologies(product_sku);
CREATE INDEX IF NOT EXISTS idx_kgpt_technology ON kg_product_technologies(technology_id);


-- ─── TRIGGERS — updated_at auto-maintenance ─────────────────────────────────

CREATE OR REPLACE FUNCTION kg_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_systems_updated_at') THEN
    CREATE TRIGGER trg_kg_systems_updated_at
      BEFORE UPDATE ON kg_systems
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_technologies_updated_at') THEN
    CREATE TRIGGER trg_kg_technologies_updated_at
      BEFORE UPDATE ON kg_technologies
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;
END;
$$;
