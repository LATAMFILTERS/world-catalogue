-- ============================================================================
-- 001_product_catalog_schema.sql
-- Product Catalog Extension — Generic Housing/Element/Alternative Architecture
-- ============================================================================
-- Additive only. No modifications to existing tables.
-- All statements are idempotent (IF NOT EXISTS / ON CONFLICT).
-- Run via: node scripts/migrate-product-catalog.js
--   or:   GET /api/migrate/product-catalog?key=elim2026admin
-- ============================================================================

BEGIN;

-- ── 1. product_family ────────────────────────────────────────────────────────
-- A named commercial product line bound to a technology and filtration system.
-- One row per named series (e.g. HYDROCORE/SERIES™, NANOFORCE/SERIES™).

CREATE TABLE IF NOT EXISTS product_family (
  id            SERIAL        NOT NULL,
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW(),

  -- Identity
  family_code   TEXT          NOT NULL,
  -- Canonical key, no trademark symbol. 'HYDROCORE/SERIES', 'NANOFORCE/SERIES'
  family_name   TEXT          NOT NULL,
  -- Display name with mark. 'HYDROCORE/SERIES™'

  -- Classification
  technology    TEXT          NOT NULL,
  -- Must correspond to a value in TECH_NAMES: 'HYDROCORE', 'NANOFORCE', etc.
  system        TEXT          NOT NULL,
  -- 'Fuel Cleanliness', 'Hydraulic', 'Lube Oil', 'Air Intake',
  -- 'Cabin Air', 'Compressed Air', 'Coolant'

  -- Documentation
  description   TEXT,
  source_doc    TEXT,
  -- Primary document validating this family's existence and taxonomy.

  CONSTRAINT pk_product_family PRIMARY KEY (id),
  CONSTRAINT uq_product_family_code UNIQUE (family_code)
);

-- ── 2. product_model ─────────────────────────────────────────────────────────
-- A specific durable product within a family.
-- model_type controls whether this record accepts consumable elements.

CREATE TABLE IF NOT EXISTS product_model (
  id                    SERIAL        NOT NULL,
  created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),

  -- Relationships
  family_id             INTEGER       NOT NULL,
  elimfilters_sku       TEXT,
  -- FK to elimfilters_catalog(sku). NULL until SKU is assigned.

  -- Identity
  model_code            TEXT          NOT NULL,
  -- '900FH', '1000FH', 'NF-RT-400', 'SX-CART-12'
  racor_equivalent      TEXT,
  -- Competitor model code stored here for cross-reference. Populated from
  -- source document. Also stored in elimfilters_catalog.brand_crossrefs
  -- for runtime search resolution.

  -- Type classification
  model_type            TEXT          NOT NULL,
  -- 'durable'    — physical housing; accepts consumable elements.
  --               Element replaced on service, housing reused.
  -- 'standalone' — complete replaceable unit. No separate element table.
  --               Example: SYNTRAX spin-on lube filter.
  -- 'assembly'   — multi-part assembly with mixed replacement patterns.
  accepts_elements      BOOLEAN       NOT NULL DEFAULT FALSE,
  -- TRUE  → model_element_compatibility rows required.
  -- FALSE → no elements; model_type must be 'standalone' or 'assembly'.

  -- Compatibility class — physical matching key between model and element.
  -- All elements compatible with this model must share this value.
  -- Technology-agnostic naming: '2020', '2040', 'HF-250', 'CART-12'
  compatibility_class   TEXT,

  -- Physical specifications (populated as applicable per product type)
  max_flow_lph          INTEGER,
  max_pressure_bar      NUMERIC(5,2),
  thread_size           TEXT,
  mounting_type         TEXT,

  -- Variant flags
  has_heater            BOOLEAN       NOT NULL DEFAULT FALSE,
  heater_voltage_v      INTEGER,
  -- Populated only when has_heater = TRUE. Values: 12 or 24.

  -- Documentation
  description           TEXT,
  notes                 TEXT,

  CONSTRAINT pk_product_model PRIMARY KEY (id),
  CONSTRAINT uq_product_model_code UNIQUE (model_code),

  CONSTRAINT fk_product_model_family
    FOREIGN KEY (family_id) REFERENCES product_family(id),
  CONSTRAINT fk_product_model_sku
    FOREIGN KEY (elimfilters_sku) REFERENCES elimfilters_catalog(sku),

  -- accepts_elements = TRUE requires durable model_type
  CONSTRAINT chk_accepts_elements_requires_durable
    CHECK (
      (accepts_elements = TRUE  AND model_type = 'durable')
      OR (accepts_elements = FALSE)
    ),

  -- compatibility_class is required when model accepts elements
  CONSTRAINT chk_compat_class_required_for_durable
    CHECK (
      (accepts_elements = FALSE)
      OR (accepts_elements = TRUE AND compatibility_class IS NOT NULL)
    ),

  -- heater voltage is only valid when has_heater is true
  CONSTRAINT chk_heater_voltage
    CHECK (
      (has_heater = FALSE AND heater_voltage_v IS NULL)
      OR (has_heater = TRUE AND heater_voltage_v IN (12, 24))
    )
);

-- ── 3. product_element ───────────────────────────────────────────────────────
-- A consumable product associated with one or more durable models.
-- family_id may differ from the parent model's family (cross-tech compatibility).

CREATE TABLE IF NOT EXISTS product_element (
  id                    SERIAL        NOT NULL,
  created_at            TIMESTAMP     NOT NULL DEFAULT NOW(),

  -- Relationships
  family_id             INTEGER       NOT NULL,
  -- Technology family this element belongs to.
  -- May differ from the installed model's family_id.
  -- Example: MACROCORE element (MACROCORE/SERIES family)
  --          installed in INTEKCORE housing (INTEKCORE/SERIES family).
  elimfilters_sku       TEXT,
  -- FK to elimfilters_catalog(sku). NULL until SKU is assigned.

  -- Identity
  element_code          TEXT          NOT NULL,
  -- '2020SM-OR', '2040PM-OR', 'NF-E-B10-400', 'MK-PM25-D'
  racor_equivalent      TEXT,

  -- Physical compatibility key — must match product_model.compatibility_class
  -- for installation to be valid.
  compatibility_class   TEXT          NOT NULL,

  -- Filtration classification
  media_grade           TEXT,
  -- Technology-specific grade vocabulary:
  -- HYDROCORE:  'SM' | 'TM' | 'PM'
  -- NANOFORCE:  'B6' | 'B10' | 'B25'
  -- MACROCORE:  'STD' | 'EXT' | 'ULT'
  -- MICROKAPPA: 'STD' | 'HEPA' | 'HEPA+AC'
  -- DRYCORE:    'DSC' | 'COL' | 'DSC+COL'
  -- THERMACORE: 'SCA-STD' | 'SCA-HVY'

  seal_type             TEXT          NOT NULL DEFAULT 'OR',
  -- 'OR' = O-ring, 'FS' = flat seal, 'TH' = threaded, 'PRF' = press-fit

  -- Filtration specifications — JSONB, schema varies per technology family.
  -- HYDROCORE:  { micron_nominal, micron_absolute, beta_ratio,
  --               water_sep_free_pct, water_sep_emulsified_pct, dirt_capacity_g }
  -- NANOFORCE:  { micron_absolute, beta_ratio, iso_4406_target,
  --               collapse_pressure_bar, initial_restriction_kpa }
  -- MACROCORE:  { dust_efficiency_pct, sae_j1539_restriction_kpa,
  --               primary_secondary, dust_hold_capacity_g }
  -- MICROKAPPA: { pm25_efficiency_pct, activated_carbon_g,
  --               airflow_m3h, pressure_drop_pa }
  protection_spec       JSONB,

  -- Documentation
  description           TEXT,
  notes                 TEXT,

  CONSTRAINT pk_product_element PRIMARY KEY (id),
  CONSTRAINT uq_product_element_code UNIQUE (element_code),

  CONSTRAINT fk_product_element_family
    FOREIGN KEY (family_id) REFERENCES product_family(id),
  CONSTRAINT fk_product_element_sku
    FOREIGN KEY (elimfilters_sku) REFERENCES elimfilters_catalog(sku)
);

-- ── 4. model_element_compatibility ───────────────────────────────────────────
-- Explicit compatibility join between durable models and their elements.
-- Physical compatibility is enforced at application layer:
--   product_model.compatibility_class = product_element.compatibility_class
-- This table records and traces that verified relationship.

CREATE TABLE IF NOT EXISTS model_element_compatibility (
  product_model_id          INTEGER     NOT NULL,
  product_element_id        INTEGER     NOT NULL,

  -- Default element for this model
  is_primary                BOOLEAN     NOT NULL DEFAULT FALSE,
  -- TRUE = this element ships with the housing as default.
  -- One primary per model recommended; enforced at application layer.

  -- Compatibility traceability (all three fields required for CONFIRMED)
  compatibility_source      TEXT,
  -- 'Parker Racor 900/1000 FH Series Datasheet, Table 2, p.6'
  -- 'ELIMFILTERS Engineering Validation ER-2026-011'
  -- 'OEM fitment data — Fleetguard service catalog'

  compatibility_verified_at TIMESTAMP,

  compatibility_method      TEXT,
  -- 'datasheet'        — from published manufacturer specification
  -- 'oem_document'     — from OEM parts catalog or service manual
  -- 'physical_test'    — confirmed by physical installation test
  -- 'cross_reference'  — inferred from known competitor cross-reference
  -- 'engineering_calc' — derived from dimensional analysis

  compatibility_confidence  TEXT        NOT NULL DEFAULT 'CONFIRMED',
  -- 'CONFIRMED' — verified from primary source document
  -- 'INFERRED'  — derived from cross-reference or dimensional match
  -- 'PENDING'   — not yet verified; flagged for review.
  --               Recommendation Engine caps confidence at LOW for PENDING.

  CONSTRAINT pk_model_element_compatibility
    PRIMARY KEY (product_model_id, product_element_id),

  CONSTRAINT fk_mec_model
    FOREIGN KEY (product_model_id) REFERENCES product_model(id),
  CONSTRAINT fk_mec_element
    FOREIGN KEY (product_element_id) REFERENCES product_element(id),

  CONSTRAINT chk_compatibility_method
    CHECK (compatibility_method IN (
      'datasheet', 'oem_document', 'physical_test',
      'cross_reference', 'engineering_calc'
    )),

  CONSTRAINT chk_compatibility_confidence
    CHECK (compatibility_confidence IN ('CONFIRMED', 'INFERRED', 'PENDING'))
);

-- ── 5. alternative_group ─────────────────────────────────────────────────────
-- A named set of interchangeable elements.
-- All members share compatibility_class (same physical installation).
-- Members differ along differentiation_axis (different filtration strategy).

CREATE TABLE IF NOT EXISTS alternative_group (
  id                          SERIAL      NOT NULL,
  created_at                  TIMESTAMP   NOT NULL DEFAULT NOW(),

  -- Identity
  group_code                  TEXT        NOT NULL,
  -- 'HYDROCORE-2020', 'HYDROCORE-2040', 'NANOFORCE-HF250', 'SYNTRAX-CART-12'
  group_name                  TEXT        NOT NULL,

  -- Classification
  technology                  TEXT        NOT NULL,
  system                      TEXT        NOT NULL,
  compatibility_class         TEXT        NOT NULL,
  -- All members must share this compatibility_class value.

  -- What dimension differentiates members within this group
  differentiation_axis        TEXT        NOT NULL,
  -- 'micron_rating + water_separation_efficiency'  (HYDROCORE)
  -- 'beta_ratio + collapse_pressure'               (NANOFORCE)
  -- 'dust_efficiency + restriction_class'          (MACROCORE)
  -- 'sca_release_rate'                             (THERMACORE)

  -- Compatibility traceability — why do these products belong together?
  compatibility_basis         TEXT        NOT NULL,
  -- 'compatibility_class_match' — same physical class, confirmed fitment
  -- 'oem_upgrade_path'          — OEM documents one as upgrade of another
  -- 'dimensional_equivalence'   — same thread/OD/height within tolerance
  -- 'manufacturer_grouping'     — source manufacturer groups them explicitly

  compatibility_source        TEXT,
  -- Primary document validating group membership.
  -- 'Parker Racor 900/1000 FH Series Datasheet — element interchange table'

  compatibility_verified_at   TIMESTAMP,

  compatibility_verified_by   TEXT,
  -- 'admin_import'        — established during data import process
  -- 'engineering_review'  — validated by ELIMFILTERS engineering team
  -- 'field_verification'  — confirmed in field application

  -- Documentation
  description                 TEXT,
  notes                       TEXT,

  CONSTRAINT pk_alternative_group PRIMARY KEY (id),
  CONSTRAINT uq_alternative_group_code UNIQUE (group_code),

  CONSTRAINT chk_ag_compatibility_basis
    CHECK (compatibility_basis IN (
      'compatibility_class_match', 'oem_upgrade_path',
      'dimensional_equivalence', 'manufacturer_grouping'
    )),

  CONSTRAINT chk_ag_verified_by
    CHECK (compatibility_verified_by IN (
      'admin_import', 'engineering_review', 'field_verification'
    ))
);

-- ── 6. alternative_group_member ──────────────────────────────────────────────
-- Maps product elements to their alternative group.
-- Provides the metadata the Recommendation Engine uses to classify
-- TYPE_A (protection upgrade) vs TYPE_B (operational alternative).

CREATE TABLE IF NOT EXISTS alternative_group_member (
  group_id              INTEGER     NOT NULL,
  element_id            INTEGER     NOT NULL,

  -- Baseline: the direct equivalent within this group
  is_baseline           BOOLEAN     NOT NULL DEFAULT FALSE,
  -- TRUE = this member is the OEM-equivalent baseline.
  -- Exactly one per group (enforced by partial unique index below).
  -- Recommendation Engine: candidate.protection_level > baseline → TYPE_A

  -- Protection level: ordinal rank within this group only.
  -- Has NO meaning across groups or technologies.
  -- HYDROCORE-2020 level 5 ≠ NANOFORCE-HF250 level 5.
  protection_level      INTEGER     NOT NULL,

  -- Operational objective of this member
  operational_objective TEXT        NOT NULL,
  -- 'oem_equivalent'        — matches OEM spec; direct replacement
  -- 'enhanced_protection'   — higher filtration, same application
  -- 'maximum_protection'    — highest available in this group
  -- 'cost_optimization'     — lower acquisition cost, same application
  -- 'extended_interval'     — longer service interval, same protection
  -- 'availability_fallback' — substitute when primary is unavailable

  -- Element-level compatibility traceability
  compatibility_note    TEXT,
  -- Why specifically this element belongs in this group.
  -- 'O-ring seat match confirmed; same bowl class 2020. 30µm standard media.'
  -- 'Same O-ring seat. Turbine-grade 10µm media. TYPE A upgrade path.'

  -- Display order within group output
  rank_in_group         INTEGER     NOT NULL DEFAULT 1,

  CONSTRAINT pk_alternative_group_member
    PRIMARY KEY (group_id, element_id),

  CONSTRAINT fk_agm_group
    FOREIGN KEY (group_id) REFERENCES alternative_group(id),
  CONSTRAINT fk_agm_element
    FOREIGN KEY (element_id) REFERENCES product_element(id),

  CONSTRAINT chk_agm_protection_level
    CHECK (protection_level BETWEEN 1 AND 5),

  CONSTRAINT chk_agm_operational_objective
    CHECK (operational_objective IN (
      'oem_equivalent', 'enhanced_protection', 'maximum_protection',
      'cost_optimization', 'extended_interval', 'availability_fallback'
    ))
);

-- ── Partial unique index: one baseline per group ──────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_agm_one_baseline_per_group
  ON alternative_group_member (group_id)
  WHERE is_baseline = TRUE;

-- ── Performance indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_model_family_id
  ON product_model (family_id);
CREATE INDEX IF NOT EXISTS idx_product_model_sku
  ON product_model (elimfilters_sku);
CREATE INDEX IF NOT EXISTS idx_product_model_code
  ON product_model (model_code);
CREATE INDEX IF NOT EXISTS idx_product_model_compat
  ON product_model (compatibility_class);

CREATE INDEX IF NOT EXISTS idx_product_element_family_id
  ON product_element (family_id);
CREATE INDEX IF NOT EXISTS idx_product_element_sku
  ON product_element (elimfilters_sku);
CREATE INDEX IF NOT EXISTS idx_product_element_code
  ON product_element (element_code);
CREATE INDEX IF NOT EXISTS idx_product_element_compat
  ON product_element (compatibility_class);
CREATE INDEX IF NOT EXISTS idx_product_element_grade
  ON product_element (media_grade);

CREATE INDEX IF NOT EXISTS idx_mec_model_id
  ON model_element_compatibility (product_model_id);
CREATE INDEX IF NOT EXISTS idx_mec_element_id
  ON model_element_compatibility (product_element_id);
CREATE INDEX IF NOT EXISTS idx_mec_confidence
  ON model_element_compatibility (compatibility_confidence);

CREATE INDEX IF NOT EXISTS idx_ag_compat_class
  ON alternative_group (compatibility_class);
CREATE INDEX IF NOT EXISTS idx_ag_technology
  ON alternative_group (technology);

CREATE INDEX IF NOT EXISTS idx_agm_group_id
  ON alternative_group_member (group_id);
CREATE INDEX IF NOT EXISTS idx_agm_element_id
  ON alternative_group_member (element_id);
CREATE INDEX IF NOT EXISTS idx_agm_baseline
  ON alternative_group_member (is_baseline);

COMMIT;
