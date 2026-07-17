-- =============================================================================
-- EBP PHASE 2 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 8 Phase 2 tables + 1 view for the Manufacturer Registry
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects Phase 1 (ebp_engineering_passports etc.): NO — read-only reference
--   at the application layer only (ADR-0016), no FK, no DDL dependency.
-- Affects elimfilters_catalog / technologies / KG tables: NO
-- Depends on: uuid-ossp extension (already enabled by
--   database/schema/001_core_taxonomy.sql / migrations/ebp-phase1/001_schema.sql)
-- See: docs/ebp/phases/phase-02-manufacturer-registry.md,
--      docs/ebp/DECISIONS.md ADR-0015 through ADR-0021
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── MANUFACTURERS (master record) ───────────────────────────────────────────
-- manufacturer_code format: EFM-XXXX, 4 chars from a 32-char ambiguity-free
-- alphabet (no 0/1/I/O). The CHECK below is both the format guarantee and,
-- combined with the plain UNIQUE constraint, the case-insensitive-uniqueness
-- guarantee (ADR-0015) — the alphabet contains no lowercase letters, so no
-- lowercase variant can ever satisfy the CHECK and be stored.

CREATE TABLE IF NOT EXISTS ebp_manufacturers (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_code   VARCHAR(9)   UNIQUE NOT NULL
                      CHECK (manufacturer_code ~ '^EFM-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$'),
  legal_name          TEXT         NOT NULL,
  trade_name          TEXT,
  country_code        CHAR(2)      NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  timezone            TEXT         NOT NULL,
  website             TEXT,
  status              VARCHAR(20)  NOT NULL DEFAULT 'CANDIDATE'
                      CHECK (status IN ('CANDIDATE','UNDER_REVIEW','CONDITIONAL','QUALIFIED','SUSPENDED','RETIRED')),
  status_reason       TEXT,
  internal_notes      TEXT,
  registered_on       DATE         NOT NULL DEFAULT CURRENT_DATE,
  created_by          TEXT         NOT NULL,
  identity_mechanism  VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  retired_at          TIMESTAMPTZ
);

COMMENT ON TABLE  ebp_manufacturers IS 'EBP Phase 2 — private Manufacturer master record. manufacturer_code (EFM-XXXX) is the permanent, confidential functional key (ADR-0006); legal_name is descriptive metadata only, never a join key. No flat address column — see ebp_manufacturer_locations and ADR-0018.';
COMMENT ON COLUMN ebp_manufacturers.manufacturer_code IS 'EFM-XXXX. Cryptographically random, retry-on-collision, immutable after insert (see trigger below), never reused after retirement. ADR-0015.';
COMMENT ON COLUMN ebp_manufacturers.internal_notes IS 'ELIMFILTERS-internal only. Never returned to any Manufacturer- or Distributor-facing consumer. ADR-0021.';
COMMENT ON COLUMN ebp_manufacturers.status IS 'CANDIDATE/UNDER_REVIEW/CONDITIONAL/QUALIFIED/SUSPENDED/RETIRED. Valid transitions enforced at the application layer per ADR-0020; RETIRED is terminal.';
COMMENT ON COLUMN ebp_manufacturers.retired_at IS 'Set when status becomes RETIRED. The row is never DELETEd — this is the soft-retirement marker.';

CREATE INDEX IF NOT EXISTS idx_ebp_manufacturers_status  ON ebp_manufacturers(status);
CREATE INDEX IF NOT EXISTS idx_ebp_manufacturers_country ON ebp_manufacturers(country_code);

-- manufacturer_code immutability (ADR-0015) — a real DB-level guarantee, not
-- just application discipline.
CREATE OR REPLACE FUNCTION ebp_prevent_manufacturer_code_change() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.manufacturer_code IS DISTINCT FROM NEW.manufacturer_code THEN
    RAISE EXCEPTION 'manufacturer_code is immutable and cannot be changed (was %, attempted %)', OLD.manufacturer_code, NEW.manufacturer_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ebp_prevent_manufacturer_code_change ON ebp_manufacturers;
CREATE TRIGGER trg_ebp_prevent_manufacturer_code_change
  BEFORE UPDATE ON ebp_manufacturers
  FOR EACH ROW
  EXECUTE FUNCTION ebp_prevent_manufacturer_code_change();


-- ─── STATUS HISTORY (append-only audit log) ──────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturers_status_history (
  id                  SERIAL PRIMARY KEY,
  manufacturer_id     UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  from_status         VARCHAR(20),
  to_status           VARCHAR(20)  NOT NULL,
  reason              TEXT,
  evidence_reference  TEXT,
  declared_actor      TEXT         NOT NULL,
  identity_mechanism  VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  changed_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_manufacturers_status_history IS 'EBP Phase 2 — append-only log of every Manufacturer status transition. Never mutated after insert. ADR-0020.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_status_history_mfr ON ebp_manufacturers_status_history(manufacturer_id);


-- ─── CONTACTS ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_contacts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id     UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  full_name           TEXT         NOT NULL,
  title               TEXT,
  email               TEXT         NOT NULL CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone               TEXT,
  preferred_language  VARCHAR(10),
  is_primary          BOOLEAN      NOT NULL DEFAULT FALSE,
  is_technical        BOOLEAN      NOT NULL DEFAULT FALSE,
  is_commercial       BOOLEAN      NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_manufacturer_contacts IS 'EBP Phase 2 — Manufacturer contacts. At most one active primary contact per manufacturer, enforced by the partial unique index below.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_contacts_mfr ON ebp_manufacturer_contacts(manufacturer_id);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_mfr_contacts_one_active_primary
  ON ebp_manufacturer_contacts(manufacturer_id)
  WHERE is_primary = TRUE AND is_active = TRUE;


-- ─── LOCATIONS ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_locations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id   UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  location_code     TEXT,
  location_type     VARCHAR(20)  NOT NULL
                    CHECK (location_type IN ('HEADQUARTERS','FACTORY','WAREHOUSE','LAB','OTHER')),
  country_code      CHAR(2)      NOT NULL CHECK (country_code ~ '^[A-Z]{2}$'),
  region            TEXT,
  city              TEXT,
  address_line      TEXT,
  postal_code       TEXT,
  timezone          TEXT         NOT NULL,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (id, manufacturer_id)
);

COMMENT ON TABLE ebp_manufacturer_locations IS 'EBP Phase 2 — Manufacturer physical facilities. Sole address model (ADR-0018) — ebp_manufacturers has no flat address column. UNIQUE(id, manufacturer_id) enables the composite FK from qualifications/certifications/capabilities.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_locations_mfr ON ebp_manufacturer_locations(manufacturer_id);


-- ─── CERTIFICATIONS ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_certifications (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id       UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  location_id           UUID,
  certification_code    TEXT         NOT NULL,
  certificate_number    TEXT,
  issuing_body          TEXT         NOT NULL,
  issued_on             DATE         NOT NULL,
  expires_on            DATE,
  status                VARCHAR(30)  NOT NULL DEFAULT 'PENDING_VERIFICATION'
                        CHECK (status IN ('PENDING_VERIFICATION','VERIFIED','EXPIRED','REVOKED','REJECTED')),
  evidence_reference    TEXT,
  scope                 TEXT,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  FOREIGN KEY (location_id, manufacturer_id) REFERENCES ebp_manufacturer_locations(id, manufacturer_id)
);

COMMENT ON TABLE  ebp_manufacturer_certifications IS 'EBP Phase 2 — Manufacturer certifications. status is the last human-set audit value; use ebp_manufacturer_certifications_effective for current validity (ADR-0019). Optional location_id (composite FK, ADR-0018) — a certification may cover the whole corporate entity or one specific site.';
COMMENT ON COLUMN ebp_manufacturer_certifications.status IS 'Human-set audit value. Never rewritten by a read. A VERIFIED row past expires_on is NOT currently valid — check effective_status via the view, not this column, for validity.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_certs_mfr ON ebp_manufacturer_certifications(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_mfr_certs_expires ON ebp_manufacturer_certifications(expires_on);

CREATE OR REPLACE VIEW ebp_manufacturer_certifications_effective AS
  SELECT c.*,
         CASE
           WHEN c.status = 'VERIFIED' AND c.expires_on IS NOT NULL AND c.expires_on < CURRENT_DATE
             THEN 'EXPIRED'
           ELSE c.status
         END AS effective_status
  FROM ebp_manufacturer_certifications c;

COMMENT ON VIEW ebp_manufacturer_certifications_effective IS 'EBP Phase 2 — computed certification validity (ADR-0019). effective_status is EXPIRED whenever a VERIFIED row''s expires_on has passed, even if nobody has run a job to flip the stored status. Every "is this certification currently valid" read must use this view, never the raw status column.';


-- ─── PRODUCT FAMILY QUALIFICATIONS ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_qualifications (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id   UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  location_id       UUID         NOT NULL,
  product_category  VARCHAR(100) NOT NULL,
  product_subtype   VARCHAR(100) NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'CANDIDATE'
                    CHECK (status IN ('CANDIDATE','CONDITIONAL','QUALIFIED','SUSPENDED','REVOKED')),
  effective_from    DATE,
  review_due_on     DATE,
  approved_by       TEXT,
  evidence_reference TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  FOREIGN KEY (location_id, manufacturer_id) REFERENCES ebp_manufacturer_locations(id, manufacturer_id)
);

COMMENT ON TABLE ebp_manufacturer_qualifications IS 'EBP Phase 2 — per (manufacturer, physical location, product family) qualification. location_id is NOT NULL: a qualification always names a specific facility, never only the corporate manufacturer (ADR-0018). product_category/product_subtype reuse Phase 1''s vocabulary directly — no parallel taxonomy (ADR-0016).';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_quals_mfr ON ebp_manufacturer_qualifications(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_mfr_quals_family ON ebp_manufacturer_qualifications(product_category, product_subtype);


-- ─── QUALIFICATION CONDITIONS (structured, ADR-0017) ─────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_qualification_conditions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  qualification_id  UUID         NOT NULL REFERENCES ebp_manufacturer_qualifications(id) ON DELETE CASCADE,
  condition_type    VARCHAR(50)  NOT NULL
                    CHECK (condition_type IN (
                      'MAX_OUTER_DIAMETER_MM','MAX_HEIGHT_MM','CONSTRUCTION_TYPE',
                      'ALLOWED_MATERIAL','APPROVED_TECHNOLOGY','LOCATION_RESTRICTED',
                      'INITIAL_SAMPLE_REQUIRED','MIN_MONTHLY_CAPACITY'
                    )),
  parameters        JSONB        NOT NULL,
  is_satisfied      BOOLEAN      NOT NULL DEFAULT FALSE,
  satisfied_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_manufacturer_qualification_conditions IS 'EBP Phase 2 — structured, independently verifiable CONDITIONAL-qualification conditions. Never free text alone (ADR-0017). parameters shape per condition_type documented in phases/phase-02-manufacturer-registry.md.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_qual_conditions_qual ON ebp_manufacturer_qualification_conditions(qualification_id);


-- ─── CAPABILITIES ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_capabilities (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id   UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  location_id       UUID,
  capability_type   VARCHAR(50)  NOT NULL
                    CHECK (capability_type IN (
                      'PRODUCT_FAMILY','CONSTRUCTION_TYPE','DIMENSIONAL_RANGE','PROCESS',
                      'MONTHLY_CAPACITY','LAB','INTERNAL_TEST','PACKAGING',
                      'PRINTING_LITHOGRAPHY','MARKET_SERVED','LANGUAGE','CURRENCY_ACCEPTED'
                    )),
  capability_value  JSONB        NOT NULL,
  review_status     VARCHAR(20)  NOT NULL DEFAULT 'DECLARED'
                    CHECK (review_status IN ('DECLARED','VERIFIED','REJECTED','EXPIRED')),
  declared_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  verified_at       TIMESTAMPTZ,
  verified_by       TEXT,
  expires_on        DATE,
  notes             TEXT,
  FOREIGN KEY (location_id, manufacturer_id) REFERENCES ebp_manufacturer_locations(id, manufacturer_id)
);

COMMENT ON TABLE ebp_manufacturer_capabilities IS 'EBP Phase 2 — declared/verified Manufacturer capabilities. One generic capability_type + capability_value JSONB pair covers the full requested list (families, construction types, dimensional ranges, processes, capacity, labs, internal tests, packaging, printing, markets, languages, currencies) — same JSONB-for-open-ended-data pattern as elimfilters_catalog and Phase 1''s dimensions_tolerances.';

CREATE INDEX IF NOT EXISTS idx_ebp_mfr_capabilities_mfr ON ebp_manufacturer_capabilities(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_mfr_capabilities_type ON ebp_manufacturer_capabilities(capability_type);
