-- =============================================================================
-- EBP PHASE 3 — SCHEMA CREATION
-- File: 001_schema.sql
-- Purpose: Create the 12 Phase 3 tables + 1 effective-Offer view for the
--   Manufacturer Intake Portal (Factory Portal).
-- Safe to run: YES (uses IF NOT EXISTS — idempotent)
-- Affects Phase 1/Phase 2 tables: adds exactly ONE real foreign key
--   (ebp_manufacturer_request_batch_items.passport_id ->
--   ebp_engineering_passports.id, ON DELETE RESTRICT, ADR-0025) — a
--   read-only reference relationship. No ALTER on any Phase 1/2 table.
-- Affects elimfilters_catalog / technologies / KG tables: NO
-- Depends on: uuid-ossp extension (already enabled), ebp_engineering_
--   passports (Phase 1, frozen), ebp_manufacturers /
--   ebp_manufacturer_locations / ebp_manufacturer_qualifications
--   (Phase 2, frozen) — read-only reference, no FK to those except the
--   one named above.
-- See: docs/ebp/phases/phase-03-supplier-portal.md,
--      docs/ebp/DECISIONS.md ADR-0023 through ADR-0029
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── FACTORY USERS (Manufacturer-side authentication, ADR-0023) ─────────────

CREATE TABLE IF NOT EXISTS ebp_factory_users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id     UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  email               TEXT         NOT NULL UNIQUE CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  full_name           TEXT         NOT NULL,
  role                VARCHAR(30)  NOT NULL
                      CHECK (role IN ('MANUFACTURER_ADMIN','MANUFACTURER_ENGINEERING','MANUFACTURER_COMMERCIAL','MANUFACTURER_READ_ONLY')),
  password_hash       TEXT,
  password_algo       VARCHAR(20)  NOT NULL DEFAULT 'SCRYPT',
  status              VARCHAR(20)  NOT NULL DEFAULT 'INVITED'
                      CHECK (status IN ('INVITED','ACTIVE','LOCKED','DISABLED')),
  failed_login_count  INT          NOT NULL DEFAULT 0,
  locked_until        TIMESTAMPTZ,
  last_login_at       TIMESTAMPTZ,
  invited_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  activated_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_factory_users IS 'EBP Phase 3 — Manufacturer-side (factory) staff accounts. Resolves ADR-0002 for Manufacturers only; Distributor auth remains separately undecided. ADR-0023.';
COMMENT ON COLUMN ebp_factory_users.password_hash IS 'Format: scrypt$<salt-hex>$<hash-hex>. Never returned by any API response. NULL while status=INVITED (no password set yet).';

CREATE INDEX IF NOT EXISTS idx_ebp_factory_users_mfr ON ebp_factory_users(manufacturer_id);

-- ─── FACTORY USER INVITATIONS (invite + password-reset tokens) ──────────────

CREATE TABLE IF NOT EXISTS ebp_factory_user_invitations (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_user_id   UUID         NOT NULL REFERENCES ebp_factory_users(id) ON DELETE CASCADE,
  token_hash        CHAR(64)     NOT NULL UNIQUE,
  purpose           VARCHAR(20)  NOT NULL CHECK (purpose IN ('INVITE','PASSWORD_RESET')),
  expires_at        TIMESTAMPTZ  NOT NULL,
  used_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_factory_user_invitations IS 'EBP Phase 3 — hashed, single-use, expiring tokens for account activation and password reset. Raw token is never stored (token_hash = SHA-256 of the raw token). ADR-0023.';

CREATE INDEX IF NOT EXISTS idx_ebp_factory_invitations_user ON ebp_factory_user_invitations(factory_user_id);

-- ─── FACTORY SESSIONS (opaque hashed bearer tokens) ──────────────────────────

CREATE TABLE IF NOT EXISTS ebp_factory_sessions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  factory_user_id   UUID         NOT NULL REFERENCES ebp_factory_users(id) ON DELETE CASCADE,
  token_hash        CHAR(64)     NOT NULL UNIQUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ  NOT NULL,
  revoked_at        TIMESTAMPTZ,
  last_used_at      TIMESTAMPTZ,
  ip_address        TEXT,
  user_agent        TEXT
);

COMMENT ON TABLE ebp_factory_sessions IS 'EBP Phase 3 — opaque session tokens. Only the SHA-256 hash is stored; the raw token is returned to the client exactly once, at login. Revocation sets revoked_at; rows are never deleted (audit trail). ADR-0023.';

CREATE INDEX IF NOT EXISTS idx_ebp_factory_sessions_user ON ebp_factory_sessions(factory_user_id);

-- ─── FACTORY USER AUDIT LOG (append-only auth events) ────────────────────────

CREATE TABLE IF NOT EXISTS ebp_factory_user_audit_log (
  id                SERIAL PRIMARY KEY,
  factory_user_id   UUID         NOT NULL REFERENCES ebp_factory_users(id) ON DELETE CASCADE,
  event_type        VARCHAR(30)  NOT NULL
                    CHECK (event_type IN (
                      'LOGIN_SUCCESS','LOGIN_FAILURE','LOCKOUT','PASSWORD_RESET_REQUESTED',
                      'PASSWORD_RESET_COMPLETED','INVITED','ACTIVATED','DISABLED','SESSION_REVOKED'
                    )),
  ip_address        TEXT,
  occurred_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  metadata          JSONB
);

COMMENT ON TABLE ebp_factory_user_audit_log IS 'EBP Phase 3 — append-only authentication/account event log. Never mutated after insert. ADR-0023.';

CREATE INDEX IF NOT EXISTS idx_ebp_factory_audit_user ON ebp_factory_user_audit_log(factory_user_id);


-- ─── MANUFACTURER REQUEST BATCHES ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_request_batches (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_code          VARCHAR(12)  UNIQUE NOT NULL
                      CHECK (batch_code ~ '^MRB-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$'),
  manufacturer_id     UUID         NOT NULL REFERENCES ebp_manufacturers(id),
  purpose             VARCHAR(30)  NOT NULL
                      CHECK (purpose IN ('CAPABILITY_ASSESSMENT','COMMERCIAL_QUOTATION','PRODUCTION_CANDIDATE')),
  channel             VARCHAR(10)  NOT NULL CHECK (channel IN ('PORTAL','EXCEL','HYBRID')),
  status              VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT','SENT','PARTIALLY_RESPONDED','RESPONDED','OVERDUE','CLOSED','CANCELLED')),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  sent_at             TIMESTAMPTZ,
  response_due_at     TIMESTAMPTZ,
  timezone            TEXT         NOT NULL,
  delivery_language   VARCHAR(10),
  requested_currency  CHAR(3),
  template_version    TEXT,
  created_by          TEXT         NOT NULL,
  identity_mechanism  VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  internal_notes      TEXT,
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ebp_manufacturer_request_batches IS 'EBP Phase 3 — a set of Passports ELIMFILTERS assigns to ONE Manufacturer for a capability/offer response. purpose gates eligibility (ADR-0024): only PRODUCTION_CANDIDATE requires QUALIFIED/CONDITIONAL status.';
COMMENT ON COLUMN ebp_manufacturer_request_batches.batch_code IS 'MRB-XXXXXX, cryptographically random, non-sequential, readable operational code. Same generation discipline as Phase 2 manufacturer_code (ADR-0015).';
COMMENT ON COLUMN ebp_manufacturer_request_batches.internal_notes IS 'ELIMFILTERS-internal only. Never returned to any factory-facing DTO.';

CREATE INDEX IF NOT EXISTS idx_ebp_mrb_manufacturer ON ebp_manufacturer_request_batches(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_mrb_status ON ebp_manufacturer_request_batches(status);


-- ─── BATCH STATUS HISTORY (append-only) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_request_batch_status_history (
  id                  SERIAL PRIMARY KEY,
  batch_id            UUID         NOT NULL REFERENCES ebp_manufacturer_request_batches(id) ON DELETE CASCADE,
  from_status         VARCHAR(20),
  to_status           VARCHAR(20)  NOT NULL,
  reason              TEXT,
  declared_actor      TEXT         NOT NULL,
  identity_mechanism  VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  changed_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_manufacturer_request_batch_status_history IS 'EBP Phase 3 — append-only log of every Batch status transition.';

CREATE INDEX IF NOT EXISTS idx_ebp_mrb_status_history_batch ON ebp_manufacturer_request_batch_status_history(batch_id);


-- ─── BATCH ITEMS (immutable Passport snapshot, ADR-0025) ─────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_request_batch_items (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id                    UUID         NOT NULL REFERENCES ebp_manufacturer_request_batches(id) ON DELETE CASCADE,
  passport_id                 UUID         NOT NULL REFERENCES ebp_engineering_passports(id) ON DELETE RESTRICT,
  engineering_revision        INT          NOT NULL,
  elimfilters_code            TEXT         NOT NULL,
  manufacturer_visible_snapshot JSONB      NOT NULL,
  status                      VARCHAR(20)  NOT NULL DEFAULT 'PENDING'
                              CHECK (status IN ('PENDING','RESPONDED','WITHDRAWN')),
  responded_at                TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (batch_id, passport_id),
  UNIQUE (id, batch_id)
);

COMMENT ON TABLE  ebp_manufacturer_request_batch_items IS 'EBP Phase 3 — one assigned Passport per row, pinned at add-time to its exact engineering_revision and an immutable snapshot of the Manufacturer-visible DTO (ADR-0025). A later Phase 1 revision never silently changes an already-sent batch. The only real cross-phase FK Phase 3 adds (passport_id -> Phase 1, ON DELETE RESTRICT).';
COMMENT ON COLUMN ebp_manufacturer_request_batch_items.manufacturer_visible_snapshot IS 'Verbatim output of Phase 1''s toManufacturerPassportDTO(row) at snapshot time. This, not a live Passport lookup, is what the Factory Portal renders.';

CREATE INDEX IF NOT EXISTS idx_ebp_mrb_items_batch ON ebp_manufacturer_request_batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_ebp_mrb_items_passport ON ebp_manufacturer_request_batch_items(passport_id);


-- ─── MANUFACTURER PRODUCT OFFERS (versioned, ADR-0026) ───────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_offers (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_code            VARCHAR(12)  UNIQUE NOT NULL
                        CHECK (offer_code ~ '^OFR-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$'),
  offer_revision        INT          NOT NULL,
  batch_item_id         UUID         NOT NULL REFERENCES ebp_manufacturer_request_batch_items(id) ON DELETE RESTRICT,
  manufacturer_id       UUID         NOT NULL REFERENCES ebp_manufacturers(id),
  passport_id           UUID         NOT NULL,
  engineering_revision  INT          NOT NULL,
  status                VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT','SUBMITTED','UNDER_REVIEW','VALIDATED','REJECTED','APPROVED','SUPERSEDED','EXPIRED','WITHDRAWN')),
  submitted_at          TIMESTAMPTZ,
  late_submission       BOOLEAN      NOT NULL DEFAULT FALSE,
  effective_from        TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ,
  supersedes_offer_id   UUID         REFERENCES ebp_manufacturer_offers(id),
  factory_user_id       UUID         REFERENCES ebp_factory_users(id),
  created_by            TEXT         NOT NULL,
  identity_mechanism    VARCHAR(30)  NOT NULL,
  fob_price             NUMERIC(12,4) NOT NULL CHECK (fob_price > 0),
  currency              CHAR(3)      NOT NULL,
  incoterm              VARCHAR(10),
  fob_point             TEXT,
  moq                   INT,
  lead_time_days        INT,
  monthly_capacity      INT,
  tooling_cost          NUMERIC(12,2),
  sample_cost           NUMERIC(12,2),
  offer_validity_until  DATE,
  commercial_notes      TEXT,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ebp_manufacturer_offers IS 'EBP Phase 3 — a Manufacturer''s versioned response to a Batch Item. Many revisions per (passport_id, engineering_revision, manufacturer_id); exactly one active at a time (partial unique index below). Immutable once SUBMITTED — a correction is always a new revision (ADR-0026). Money fields are NUMERIC, never float.';
COMMENT ON COLUMN ebp_manufacturer_offers.fob_price IS 'Exact decimal (NUMERIC), never float/real/double precision. Returned by the pg driver as a string and preserved as such end-to-end (ADR-0026).';
COMMENT ON COLUMN ebp_manufacturer_offers.status IS 'Nine-state machine, BUSINESS_RULES.md §5. Phase 3 only ever writes DRAFT/SUBMITTED/WITHDRAWN/SUPERSEDED — UNDER_REVIEW/VALIDATED/REJECTED belong to Phase 4, APPROVED to a future Offer Approval phase; EXPIRED is computed at read time via the effective view, never stored directly.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_offers_one_active_lineage
  ON ebp_manufacturer_offers(passport_id, engineering_revision, manufacturer_id)
  WHERE status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED');

CREATE INDEX IF NOT EXISTS idx_ebp_offers_batch_item ON ebp_manufacturer_offers(batch_item_id);
CREATE INDEX IF NOT EXISTS idx_ebp_offers_manufacturer ON ebp_manufacturer_offers(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_offers_lineage ON ebp_manufacturer_offers(passport_id, engineering_revision, manufacturer_id);

CREATE OR REPLACE VIEW ebp_manufacturer_offers_effective AS
  SELECT o.*,
         CASE
           WHEN o.status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED','APPROVED')
                AND o.expires_at IS NOT NULL AND o.expires_at < NOW()
             THEN 'EXPIRED'
           ELSE o.status
         END AS effective_status
  FROM ebp_manufacturer_offers o;

COMMENT ON VIEW ebp_manufacturer_offers_effective IS 'EBP Phase 3 — computed Offer expiry (same pattern as Phase 2''s ADR-0019). effective_status is EXPIRED whenever an active-ish row''s expires_at has passed, even if nobody has run a job to flip the stored status.';


-- ─── OFFER STATUS HISTORY (append-only) ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_offer_status_history (
  id                  SERIAL PRIMARY KEY,
  offer_id            UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  from_status         VARCHAR(20),
  to_status           VARCHAR(20)  NOT NULL,
  reason              TEXT,
  declared_actor      TEXT,
  factory_user_id     UUID         REFERENCES ebp_factory_users(id),
  identity_mechanism  VARCHAR(30)  NOT NULL,
  changed_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_manufacturer_offer_status_history IS 'EBP Phase 3 — append-only log of every Offer status transition, from either surface (declared_actor+ADMIN_KEY_SHARED for internal, factory_user_id+FACTORY_SESSION for factory-originated).';

CREATE INDEX IF NOT EXISTS idx_ebp_offer_status_history_offer ON ebp_manufacturer_offer_status_history(offer_id);


-- ─── OFFER TECHNICAL FIELDS ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_offer_technical_fields (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id              UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  field_name            TEXT         NOT NULL,
  offered_value         JSONB,
  unit                  TEXT,
  tolerance             TEXT,
  manufacturer_note     TEXT,
  evidence_document_id  UUID,
  completeness_status   VARCHAR(20)  NOT NULL DEFAULT 'ANSWERED'
                        CHECK (completeness_status IN ('ANSWERED','CANNOT_MEET','NOT_APPLICABLE')),
  compliance_status     VARCHAR(20)
                        CHECK (compliance_status IN ('PENDING','COMPLIANT','NON_COMPLIANT')),
  UNIQUE (offer_id, field_name)
);

COMMENT ON TABLE  ebp_manufacturer_offer_technical_fields IS 'EBP Phase 3 — one row per applicable Passport required_* field per Offer revision. completeness_status distinguishes ANSWERED/CANNOT_MEET/NOT_APPLICABLE so "unanswered" is never ambiguous. compliance_status stays NULL until Phase 4 writes it — Phase 3 never sets this column.';

CREATE INDEX IF NOT EXISTS idx_ebp_offer_fields_offer ON ebp_manufacturer_offer_technical_fields(offer_id);


-- ─── OFFER PACKAGING (Manufacturer's own proposal only) ──────────────────────

CREATE TABLE IF NOT EXISTS ebp_manufacturer_offer_packaging (
  offer_id                      UUID PRIMARY KEY REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  recommended_quantity_per_box  INT,
  box_length_mm                 NUMERIC(8,2),
  box_width_mm                  NUMERIC(8,2),
  box_height_mm                 NUMERIC(8,2),
  net_weight_kg                 NUMERIC(8,3),
  gross_weight_kg               NUMERIC(8,3),
  protection_method              TEXT,
  separators_used                BOOLEAN,
  palletization                  TEXT,
  units_per_pallet                INT,
  observations                    TEXT,
  deviation_from_target           TEXT
);

COMMENT ON TABLE ebp_manufacturer_offer_packaging IS 'EBP Phase 3 — the Manufacturer''s OWN packaging proposal (BUSINESS_RULES.md §3.1.B). No elimfilters_approved_quantity column — reserved for a future Offer Approval phase.';


-- ─── DOCUMENTS (metadata only; binaries live on the storage adapter, ADR-0027) ─

CREATE TABLE IF NOT EXISTS ebp_manufacturer_documents (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id             UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE RESTRICT,
  batch_id                    UUID         REFERENCES ebp_manufacturer_request_batches(id) ON DELETE RESTRICT,
  offer_id                    UUID         REFERENCES ebp_manufacturer_offers(id) ON DELETE RESTRICT,
  technical_field_id          UUID         REFERENCES ebp_manufacturer_offer_technical_fields(id) ON DELETE RESTRICT,
  category                    VARCHAR(30)  NOT NULL
                              CHECK (category IN ('CERTIFICATION_EVIDENCE','TECHNICAL_EVIDENCE','COMMERCIAL_DOCUMENT','EXCEL_IMPORT','EXCEL_EXPORT','OTHER')),
  original_filename           TEXT         NOT NULL,
  mime_type                   TEXT         NOT NULL,
  size_bytes                  BIGINT       NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 26214400),
  sha256_hash                 CHAR(64)     NOT NULL,
  storage_key                 TEXT         NOT NULL UNIQUE,
  uploaded_by_factory_user_id UUID         REFERENCES ebp_factory_users(id),
  uploaded_by_declared_actor  TEXT,
  identity_mechanism          VARCHAR(30)  NOT NULL,
  review_status                VARCHAR(20)  NOT NULL DEFAULT 'UNREVIEWED'
                              CHECK (review_status IN ('UNREVIEWED','ACCEPTED','REJECTED')),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  ebp_manufacturer_documents IS 'EBP Phase 3 — document/evidence METADATA only. Binaries live on the storage adapter (LocalFilesystemStorageAdapter for MVP), never a Postgres bytea column (ADR-0027). storage_key is never returned in any API response.';
COMMENT ON COLUMN ebp_manufacturer_documents.storage_key IS 'Server-generated (crypto.randomUUID()-based), never derived from original_filename or any client input.';

CREATE INDEX IF NOT EXISTS idx_ebp_documents_manufacturer ON ebp_manufacturer_documents(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_documents_offer ON ebp_manufacturer_documents(offer_id);

-- Now that ebp_manufacturer_documents exists, wire the deferred FK from
-- ebp_manufacturer_offer_technical_fields.evidence_document_id.
ALTER TABLE ebp_manufacturer_offer_technical_fields
  DROP CONSTRAINT IF EXISTS fk_offer_tech_fields_evidence_document;
ALTER TABLE ebp_manufacturer_offer_technical_fields
  ADD CONSTRAINT fk_offer_tech_fields_evidence_document
  FOREIGN KEY (evidence_document_id) REFERENCES ebp_manufacturer_documents(id) ON DELETE SET NULL;
