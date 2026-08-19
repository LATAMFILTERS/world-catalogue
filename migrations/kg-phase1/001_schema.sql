-- =============================================================================
-- KG PHASE 1 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 4 core Phase 1 tables
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects elimfilters_catalog: NO
-- =============================================================================

-- ─── SYSTEMS ────────────────────────────────────────────────────────────────
-- Filtration system domains used by the KG classification layer.

CREATE TABLE IF NOT EXISTS kg_systems (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(50)  NOT NULL UNIQUE,
  name          VARCHAR(100) NOT NULL,
  description   TEXT,
  sort_order    SMALLINT     NOT NULL DEFAULT 99,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  kg_systems             IS 'Filtration system domains used by the KG classification layer';
COMMENT ON COLUMN kg_systems.slug        IS 'URL-safe system identifier';
COMMENT ON COLUMN kg_systems.sort_order  IS 'Display order in UI listings';

CREATE INDEX IF NOT EXISTS idx_kg_systems_slug ON kg_systems(slug);

-- ─── TECHNOLOGIES ───────────────────────────────────────────────────────────
-- ELIMFILTERS canonical filtration technologies in the KG.
-- Each technology has a primary system assignment, logo reference, and lifecycle status.
--
-- CRITICAL DATA RULES:
--   MICROKAPPA  → cabin air filtration
--   SYNTRAX     → lubrication protection
--   NANOFORCE   → hydraulic protection
--   SYNTAPORE   → fuel filtration
--   TURBOCORE   → turbine/FH/FG fuel applications
--   THERMACORE  → cooling protection
--
-- TECHNOLOGY STATUS VALUES:
--   ACTIVE     — Has products in elimfilters_catalog. Full KG participation.
--   PRE_LAUNCH — Technology defined and pages built. No catalog products yet.
--
-- PLACEHOLDER NAMES:
--   Reserved names without validated product mappings remain outside canonical public taxonomy.

CREATE TABLE IF NOT EXISTS kg_technologies (
  id                SERIAL PRIMARY KEY,
  slug              VARCHAR(50)  NOT NULL UNIQUE,
  display_name      VARCHAR(100) NOT NULL,
  primary_system_id INTEGER      REFERENCES kg_systems(id) ON DELETE SET NULL,
  category          VARCHAR(100),
  description       TEXT,
  logo_file         VARCHAR(100),
  status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                    CHECK (status IN ('ACTIVE', 'PRE_LAUNCH', 'DEPRECATED', 'PLACEHOLDER')),
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  kg_technologies                   IS 'Canonical ELIMFILTERS technology metadata source for the Knowledge Graph';
COMMENT ON COLUMN kg_technologies.slug              IS 'Lowercase canonical technology identifier';
COMMENT ON COLUMN kg_technologies.display_name      IS 'Canonical display name with trademark where applicable';
COMMENT ON COLUMN kg_technologies.primary_system_id IS 'Main system this technology belongs to';
COMMENT ON COLUMN kg_technologies.logo_file         IS 'Filename only. Base path: /public/logos/ or /img/';
COMMENT ON COLUMN kg_technologies.status            IS 'ACTIVE, PRE_LAUNCH, DEPRECATED, or PLACEHOLDER lifecycle state';

CREATE INDEX IF NOT EXISTS idx_kg_tech_slug           ON kg_technologies(slug);
CREATE INDEX IF NOT EXISTS idx_kg_tech_primary_system ON kg_technologies(primary_system_id);

-- ─── PRODUCT → SYSTEMS (join table) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kg_product_systems (
  id          SERIAL      PRIMARY KEY,
  product_sku VARCHAR(50) NOT NULL,
  system_id   INTEGER     NOT NULL REFERENCES kg_systems(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_system UNIQUE (product_sku, system_id)
);

COMMENT ON TABLE  kg_product_systems             IS 'Maps product SKUs to filtration systems';
COMMENT ON COLUMN kg_product_systems.product_sku IS 'References elimfilters_catalog.sku without a physical FK';

CREATE INDEX IF NOT EXISTS idx_kgps_sku    ON kg_product_systems(product_sku);
CREATE INDEX IF NOT EXISTS idx_kgps_system ON kg_product_systems(system_id);

-- ─── PRODUCT → TECHNOLOGIES (join table) ────────────────────────────────────
CREATE TABLE IF NOT EXISTS kg_product_technologies (
  id            SERIAL      PRIMARY KEY,
  product_sku   VARCHAR(50) NOT NULL,
  technology_id INTEGER     NOT NULL REFERENCES kg_technologies(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_technology UNIQUE (product_sku, technology_id)
);

COMMENT ON TABLE  kg_product_technologies             IS 'Maps product SKUs to canonical filtration technologies';
COMMENT ON COLUMN kg_product_technologies.product_sku IS 'References elimfilters_catalog.sku without a physical FK';

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
