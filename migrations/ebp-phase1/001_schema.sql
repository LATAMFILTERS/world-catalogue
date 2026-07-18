-- =============================================================================
-- EBP PHASE 1 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 5 Phase 1 tables for the Product Engineering Passport
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects elimfilters_catalog: NO (read-only reference via application-layer
--   check; no FK, so no DDL dependency on elimfilters_catalog's existence)
-- Depends on: uuid-ossp extension (already enabled by
--   database/schema/001_core_taxonomy.sql) and the existing `technologies`
--   table (same file) for the technology_code FK.
-- See: docs/ebp/phases/phase-01-product-engineering-passport.md
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENGINEERING PASSPORTS (locked identification, one row per revision) ────
-- Versioned like Manufacturer Offers (ADR-0007): a new engineering_revision
-- is a new row, never an overwrite. At most one ACTIVE row per
-- elimfilters_code is enforced by the partial unique index below.

CREATE TABLE IF NOT EXISTS ebp_engineering_passports (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  elimfilters_code        VARCHAR(100) NOT NULL,
  is_pre_sku_draft        BOOLEAN      NOT NULL DEFAULT FALSE,
  base_code               VARCHAR(100),
  base_brand              VARCHAR(100),
  product_category        VARCHAR(100) NOT NULL,
  product_subtype         VARCHAR(100) NOT NULL,
  duty                    VARCHAR(20)  NOT NULL
                          CHECK (duty IN ('HEAVY_DUTY', 'LIGHT_DUTY')),
  technology_code         TEXT REFERENCES technologies(code),
  engineering_revision    INTEGER      NOT NULL,
  status                  VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                          CHECK (status IN ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'RETIRED')),
  supersedes_passport_id  UUID REFERENCES ebp_engineering_passports(id),
  created_by              TEXT         NOT NULL,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  activated_at            TIMESTAMPTZ,
  superseded_at           TIMESTAMPTZ,
  UNIQUE (elimfilters_code, engineering_revision)
);

COMMENT ON TABLE  ebp_engineering_passports IS 'EBP Phase 1 — Product Engineering Passport locked identification, one row per revision (versioned per ADR-0007 pattern). Never a Manufacturer-editable field on this table.';
COMMENT ON COLUMN ebp_engineering_passports.elimfilters_code IS 'The SKU. Not a hard FK to elimfilters_catalog.sku (pre-SKU drafts must be representable) — enforced at the application layer when is_pre_sku_draft = FALSE. See ADR-0003.';
COMMENT ON COLUMN ebp_engineering_passports.technology_code IS 'References technologies(code) — never duplicated.';
COMMENT ON COLUMN ebp_engineering_passports.status IS 'DRAFT=not yet active; ACTIVE=current in-force revision; SUPERSEDED=replaced by a later revision; RETIRED=discontinued.';

CREATE INDEX IF NOT EXISTS idx_ebp_passports_sku    ON ebp_engineering_passports(elimfilters_code);
CREATE INDEX IF NOT EXISTS idx_ebp_passports_status ON ebp_engineering_passports(status);

-- At most one ACTIVE revision per elimfilters_code (hard DB-level guarantee,
-- mirrors the "single active Offer" discipline required for Manufacturer
-- Offers per BUSINESS_RULES.md §5).
CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_passports_one_active
  ON ebp_engineering_passports(elimfilters_code)
  WHERE status = 'ACTIVE';


-- ─── REQUIRED ENGINEERING (one row per passport revision) ───────────────────

CREATE TABLE IF NOT EXISTS ebp_passport_engineering (
  passport_id                        UUID PRIMARY KEY REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE,
  dimensions_tolerances               JSONB        NOT NULL DEFAULT '{}'::jsonb,
  thread_spec                         VARCHAR(100),
  required_media                      VARCHAR(200),
  required_media_composition          TEXT,
  minimum_efficiency                  NUMERIC(6,3),
  efficiency_particle_size_basis      VARCHAR(100),
  beta_ratio                          VARCHAR(100),
  micron_rating                       NUMERIC(6,2),
  required_adhesive                   VARCHAR(200),
  operating_temp_min_c                NUMERIC(6,2),
  operating_temp_max_c                NUMERIC(6,2),
  collapse_pressure_kpa               NUMERIC(8,2),
  burst_pressure_kpa                  NUMERIC(8,2),
  gasket_material                     VARCHAR(200),
  center_tube_spec                    VARCHAR(200),
  end_caps_spec                       VARCHAR(200),
  bypass_valve_applicability          VARCHAR(20)  NOT NULL DEFAULT 'NOT_APPLICABLE'
                                      CHECK (bypass_valve_applicability IN ('REQUIRED', 'NOT_APPLICABLE')),
  bypass_opening_pressure_kpa         NUMERIC(8,2),
  bypass_pressure_tolerance_pct       NUMERIC(5,2),
  bypass_valve_type                   VARCHAR(100),
  bypass_valve_material                VARCHAR(200),
  antidrainback_valve_applicability   VARCHAR(20)  NOT NULL DEFAULT 'NOT_APPLICABLE'
                                      CHECK (antidrainback_valve_applicability IN ('REQUIRED', 'NOT_APPLICABLE')),
  antidrainback_valve_material        VARCHAR(200),
  required_test_standards             JSONB        NOT NULL DEFAULT '[]'::jsonb,
  field_applicability                 JSONB        NOT NULL DEFAULT '{}'::jsonb,
  manufacturer_instruction_notes      TEXT,
  internal_engineering_notes          TEXT,
  created_at                          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ebp_passport_engineering IS 'EBP Phase 1 — required_* engineering fields, locked/ELIMFILTERS-owned. A Manufacturer never writes here; it answers via offered_*/actual_* on its own Offer (Phase 3).';
COMMENT ON COLUMN ebp_passport_engineering.field_applicability IS 'Per-scalar-field REQUIRED/NOT_APPLICABLE marker, seeded from ebp_field_applicability_matrix at creation. Implements the "explicit NOT_APPLICABLE, never a silent null" rule.';
COMMENT ON COLUMN ebp_passport_engineering.manufacturer_instruction_notes IS 'Visible only to a Manufacturer actually sent this Passport (Phase 3) and authorized ELIMFILTERS staff. Never Distributor-visible. See ADR-0009.';
COMMENT ON COLUMN ebp_passport_engineering.internal_engineering_notes IS 'ELIMFILTERS-internal only. Never visible to any Manufacturer or Distributor. See ADR-0009.';


-- ─── REQUIRED PACKAGING (one row per passport revision) ─────────────────────
-- Holds ONLY ELIMFILTERS' requirements. manufacturer_recommended_quantity and
-- elimfilters_approved_quantity are never columns here — see ADR-0008.

CREATE TABLE IF NOT EXISTS ebp_passport_packaging (
  passport_id                  UUID PRIMARY KEY REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE,
  packaging_class              VARCHAR(20)  NOT NULL
                               CHECK (packaging_class IN ('AUTOMOTIVE', 'INDUSTRIAL')),
  individual_box_required      BOOLEAN      NOT NULL,
  protective_bag_required      BOOLEAN      NOT NULL DEFAULT FALSE,
  separator_required           BOOLEAN      NOT NULL DEFAULT FALSE,
  master_carton_required       BOOLEAN      NOT NULL DEFAULT TRUE,
  elimfilters_target_quantity  INTEGER      NOT NULL CHECK (elimfilters_target_quantity > 0),
  target_dimensions            JSONB,
  packaging_instructions       TEXT,
  created_at                   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_passport_packaging IS 'EBP Phase 1 — required packaging, ELIMFILTERS-owned requirements only (BUSINESS_RULES.md §3.1.A). Manufacturer proposal lives on the Offer (Phase 3); final approved quantity lives on Offer Approval (Phase 3). See ADR-0008.';


-- ─── FIELD APPLICABILITY MATRIX (global lookup, not versioned per-passport) ─

CREATE TABLE IF NOT EXISTS ebp_field_applicability_matrix (
  id                SERIAL PRIMARY KEY,
  product_category  VARCHAR(100) NOT NULL,
  product_subtype   VARCHAR(100) NOT NULL,
  field_name        VARCHAR(100) NOT NULL,
  applicability     VARCHAR(20)  NOT NULL
                    CHECK (applicability IN ('REQUIRED', 'NOT_APPLICABLE')),
  notes             TEXT,
  UNIQUE (product_category, product_subtype, field_name)
);

COMMENT ON TABLE ebp_field_applicability_matrix IS 'EBP Phase 1 — which required engineering fields apply to which (product_category, product_subtype). Seed data flagged for ELIMFILTERS engineering review — see phase-01 doc Risks.';

CREATE INDEX IF NOT EXISTS idx_ebp_applicability_lookup
  ON ebp_field_applicability_matrix(product_category, product_subtype);


-- ─── STATUS HISTORY (append-only audit log) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_passport_status_history (
  id           SERIAL PRIMARY KEY,
  passport_id  UUID         NOT NULL REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE,
  from_status  VARCHAR(20),
  to_status    VARCHAR(20)  NOT NULL,
  changed_by   TEXT         NOT NULL,
  changed_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reason       TEXT
);

COMMENT ON TABLE ebp_passport_status_history IS 'EBP Phase 1 — append-only log of every Passport status transition. Never mutated after insert.';

CREATE INDEX IF NOT EXISTS idx_ebp_passport_history_passport ON ebp_passport_status_history(passport_id);
