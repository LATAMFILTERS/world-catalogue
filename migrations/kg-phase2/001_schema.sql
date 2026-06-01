-- =============================================================================
-- KG PHASE 2 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 3 Phase 2 equipment normalization tables
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects elimfilters_catalog: NO
-- Depends on: Phase 1 (kg_set_updated_at() function must exist)
-- =============================================================================

-- ─── EQUIPMENT MAKES ─────────────────────────────────────────────────────────
-- Normalized equipment manufacturer reference data.
-- ~50–80 rows expected from initial extraction.
-- Makes are reference data: deactivate (is_active=FALSE), do NOT delete.

CREATE TABLE IF NOT EXISTS kg_equipment_makes (
  id                SERIAL       PRIMARY KEY,
  slug              VARCHAR(80)  NOT NULL UNIQUE,   -- 'cummins', 'john-deere', 'new-holland'
  display_name      VARCHAR(120) NOT NULL,           -- 'Cummins Inc.', 'John Deere'
  country_of_origin VARCHAR(60),                    -- 'United States', null if unknown
  industry_type     VARCHAR(120),                   -- comma-separated: 'construction,mining,marine'
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  kg_equipment_makes                  IS 'Normalized equipment manufacturer names — extracted from equipment_applications JSONB';
COMMENT ON COLUMN kg_equipment_makes.slug             IS 'URL-safe, lowercase, hyphen-separated: cummins, john-deere, mercedes-benz';
COMMENT ON COLUMN kg_equipment_makes.display_name     IS 'Public-facing name: Cummins Inc., John Deere, New Holland Agriculture';
COMMENT ON COLUMN kg_equipment_makes.country_of_origin IS 'ISO 3166-1 country name. NULL if unknown.';
COMMENT ON COLUMN kg_equipment_makes.industry_type    IS 'Comma-separated industry slugs derived from make domain knowledge: construction,mining,marine';
COMMENT ON COLUMN kg_equipment_makes.is_active        IS 'FALSE for obsolete/retired makes. Do not DELETE makes — deactivate.';

CREATE INDEX IF NOT EXISTS idx_kg_makes_slug       ON kg_equipment_makes(slug);
CREATE INDEX IF NOT EXISTS idx_kg_makes_is_active  ON kg_equipment_makes(is_active);


-- ─── EQUIPMENT MODELS ────────────────────────────────────────────────────────
-- Normalized model identifiers, scoped to a make.
-- UNIQUE constraint is on (make_id, slug): same model slug allowed across makes.
-- ~500–1,500 rows expected from initial extraction.

CREATE TABLE IF NOT EXISTS kg_equipment_models (
  id               SERIAL       PRIMARY KEY,
  make_id          INTEGER      NOT NULL REFERENCES kg_equipment_makes(id) ON DELETE RESTRICT,
  slug             VARCHAR(120) NOT NULL,            -- 'isx-15-0l', '6r-4024', 'c7-acert'
  display_name     VARCHAR(200) NOT NULL,            -- 'ISX 15.0L', '6R 4024', 'C7 ACERT'
  year_from        SMALLINT,                        -- 2010 (NULL if unknown)
  year_to          SMALLINT,                        -- 2020 (NULL = current production)
  engine_type      VARCHAR(100),                    -- 'On-Highway', 'Tractor', 'Marine Genset'
  displacement_cc  INTEGER,                         -- engine displacement in cc (NULL if N/A)
  notes            TEXT,                            -- data quality flags, known aliases
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_make_model_slug UNIQUE (make_id, slug),
  -- Year range validation: if both present, from must be <= to
  CONSTRAINT chk_year_range CHECK (
    year_from IS NULL OR year_to IS NULL OR year_from <= year_to
  ),
  -- Year values in plausible range
  CONSTRAINT chk_year_from_range CHECK (year_from IS NULL OR (year_from >= 1950 AND year_from <= 2030)),
  CONSTRAINT chk_year_to_range   CHECK (year_to   IS NULL OR (year_to   >= 1950 AND year_to   <= 2030))
);

COMMENT ON TABLE  kg_equipment_models                IS 'Normalized equipment model identifiers per make — extracted from equipment_applications JSONB';
COMMENT ON COLUMN kg_equipment_models.make_id        IS 'FK to kg_equipment_makes.id. ON DELETE RESTRICT — deactivate makes, do not delete.';
COMMENT ON COLUMN kg_equipment_models.slug           IS 'Scoped to make_id. Generated: LOWER, non-alphanum→hyphen, strip edges.';
COMMENT ON COLUMN kg_equipment_models.display_name   IS 'Human-readable model name after make prefix stripped from JSONB equipment field.';
COMMENT ON COLUMN kg_equipment_models.year_from      IS 'Start of production year range from JSONB year field. NULL if unknown.';
COMMENT ON COLUMN kg_equipment_models.year_to        IS 'End of production year range. NULL = current production (open-ended).';
COMMENT ON COLUMN kg_equipment_models.engine_type    IS 'Application type or machine category from JSONB type or machine field.';
COMMENT ON COLUMN kg_equipment_models.displacement_cc IS 'Engine displacement in cubic centimetres. NULL if not in JSONB.';
COMMENT ON COLUMN kg_equipment_models.notes          IS 'Extraction flags: plain string source, unmatched make, numeric-only model name.';

CREATE INDEX IF NOT EXISTS idx_kg_models_make_id      ON kg_equipment_models(make_id);
-- (make_id, slug) covered by UNIQUE constraint idx
CREATE INDEX IF NOT EXISTS idx_kg_models_display_name ON kg_equipment_models(display_name);
CREATE INDEX IF NOT EXISTS idx_kg_models_year_range   ON kg_equipment_models(year_from, year_to);


-- ─── PRODUCT → EQUIPMENT (join table) ────────────────────────────────────────
-- Maps product SKUs to equipment models.
-- UNIQUE constraint on (product_sku, model_id) prevents duplicates from repeated JSONB entries.
-- ~2,000–5,000 rows expected from initial extraction.

CREATE TABLE IF NOT EXISTS kg_product_equipment (
  id           SERIAL      PRIMARY KEY,
  product_sku  VARCHAR(50) NOT NULL,
  model_id     INTEGER     NOT NULL REFERENCES kg_equipment_models(id) ON DELETE CASCADE,
  fit_type     VARCHAR(50),                         -- NULL for now; future: 'direct', 'aftermarket'
  notes        TEXT,                               -- source format notes, ambiguity flags
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_product_model UNIQUE (product_sku, model_id)
);

COMMENT ON TABLE  kg_product_equipment             IS 'Maps product SKUs to equipment models — derived from equipment_applications JSONB array elements';
COMMENT ON COLUMN kg_product_equipment.product_sku IS 'References elimfilters_catalog.sku — no FK defined to allow catalog updates without cascade';
COMMENT ON COLUMN kg_product_equipment.model_id    IS 'FK to kg_equipment_models.id. ON DELETE CASCADE cleans up links if model is removed.';
COMMENT ON COLUMN kg_product_equipment.fit_type    IS 'Reserved: direct, aftermarket, oem-spec. NULL until scraper provides this data.';
COMMENT ON COLUMN kg_product_equipment.notes       IS 'Source notes: extraction format used, confidence level.';

CREATE INDEX IF NOT EXISTS idx_kg_pe_sku      ON kg_product_equipment(product_sku);
CREATE INDEX IF NOT EXISTS idx_kg_pe_model_id ON kg_product_equipment(model_id);
-- UNIQUE (product_sku, model_id) creates composite index automatically


-- ─── TRIGGERS — updated_at auto-maintenance ──────────────────────────────────
-- Reuses kg_set_updated_at() function created in Phase 1 (001_schema.sql).
-- If Phase 1 has not been run, this block will fail — run Phase 1 first.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_equipment_makes_updated_at') THEN
    CREATE TRIGGER trg_kg_equipment_makes_updated_at
      BEFORE UPDATE ON kg_equipment_makes
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_kg_equipment_models_updated_at') THEN
    CREATE TRIGGER trg_kg_equipment_models_updated_at
      BEFORE UPDATE ON kg_equipment_models
      FOR EACH ROW EXECUTE FUNCTION kg_set_updated_at();
  END IF;
END;
$$;

-- ─── VERIFICATION ─────────────────────────────────────────────────────────────
-- Quick sanity check that schema creation succeeded

DO $$
DECLARE
  tbl_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO tbl_count
  FROM pg_tables
  WHERE schemaname = 'public'
    AND tablename IN ('kg_equipment_makes', 'kg_equipment_models', 'kg_product_equipment');

  IF tbl_count != 3 THEN
    RAISE EXCEPTION 'Phase 2 schema creation failed: expected 3 tables, found %', tbl_count;
  END IF;

  RAISE NOTICE '001_schema.sql complete — 3 Phase 2 tables created (or already existed)';
END;
$$;
