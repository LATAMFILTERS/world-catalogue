-- =============================================================================
-- EBP PHASE 4 — ENGINEERING COMPLIANCE VALIDATION — SCHEMA
-- File: 001_schema.sql
-- Purpose: Rule Catalog (versioned data, Decision 10/ADR-0048), Validation
--   Runs + Rule Results (Decision 12/ADR-0050), Engineering Decisions/
--   Exceptions/Conditions (Decisions 01/02/07/08/09, ADR-0039/0040/0045/
--   0046/0047), the Global Result Model's three distinct concepts
--   (ADR-0051), and the shared Activity Events ledger (ADR-0037),
--   implemented here for the first time.
-- Safe to run: YES — additive only. No ALTER on any Phase 1/2/3 table.
-- Grounded in: docs/ebp/ENGINEERING_RULE_ENGINE.md, ADR-0038 through
--   ADR-0051 in docs/ebp/DECISIONS.md.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── ENGINEERING FUNCTIONAL ROLES (Decision 01, ADR-0039) ───────────────────
-- MVP auth remains the existing shared requireAdmin mechanism; this table
-- is the explicit functional-authorization layer on top of it. A
-- declared_actor (the same label convention as ebp/phase1/actor.js and
-- Phase 3's factory-session actors) is assigned zero or more roles. No
-- role here ever bypasses requireAdmin — it narrows what an already-
-- admin-authenticated caller may do, per Decision 01. ADMIN_OWNER can
-- never itself become ENGINEERING_APPROVER implicitly — every role is
-- assigned explicitly, one row per (actor, role).

CREATE TABLE IF NOT EXISTS ebp_engineering_role_assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declared_actor    TEXT         NOT NULL,
  role              VARCHAR(30)  NOT NULL
                     CHECK (role IN ('ENGINEERING_REVIEWER', 'ENGINEERING_APPROVER', 'ADMIN_OWNER')),
  assigned_by       TEXT         NOT NULL,
  assigned_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  revoked_at        TIMESTAMPTZ,
  revoked_by        TEXT,
  UNIQUE (declared_actor, role)
);

COMMENT ON TABLE ebp_engineering_role_assignments IS 'EBP Phase 4 — functional role assignments on top of the existing requireAdmin mechanism (Decision 01, ADR-0039). A role assignment is never deleted, only revoked (revoked_at set) — the full history of who held which role, when, is always reconstructable.';

CREATE INDEX IF NOT EXISTS idx_ebp_eng_roles_actor ON ebp_engineering_role_assignments(declared_actor) WHERE revoked_at IS NULL;

-- ─── RULE CATALOG (Decision 10, ADR-0048) ───────────────────────────────────
-- Versioned data, never code. rule_id is the stable, permanent business
-- key; rule_version increments per functional change. A published
-- (ACTIVE or later) version is never edited — see the application-layer
-- immutability guarantee enforced by service.js, mirrored here only by
-- convention (Postgres has no native "cannot UPDATE a row past DRAFT"
-- constraint; the service layer is the enforcement point, same as every
-- other append-only history table in this platform).

CREATE TABLE IF NOT EXISTS ebp_rule_versions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id               VARCHAR(40)  NOT NULL,
  rule_version          INT          NOT NULL,
  rule_name             TEXT         NOT NULL,
  description           TEXT         NOT NULL,
  comparison_type       VARCHAR(20)  NOT NULL
                        CHECK (comparison_type IN (
                          'EXACT_MATCH', 'NUMERIC_TOLERANCE', 'RANGE', 'MAXIMUM', 'MINIMUM',
                          'ENUMERATION', 'PATTERN', 'BOOLEAN', 'REQUIRED_EVIDENCE',
                          'COMPOSITE', 'CONDITIONAL'
                        )),
  severity              VARCHAR(10)  NOT NULL
                        CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  exception_policy      VARCHAR(40)  NOT NULL DEFAULT 'NON_WAIVABLE'
                        CHECK (exception_policy IN ('NON_WAIVABLE', 'WAIVABLE_WITH_ENGINEERING_APPROVAL', 'WAIVABLE_WITH_CONDITIONS')),
  category              VARCHAR(30)  NOT NULL
                        CHECK (category IN (
                          'DIMENSIONS', 'THREAD', 'MEDIA', 'EFFICIENCY', 'BETA_RATIO',
                          'BURST_PRESSURE', 'COLLAPSE_PRESSURE', 'TEMPERATURE', 'SEAL',
                          'BYPASS_VALVE', 'ANTI_DRAINBACK', 'PACKAGING', 'DOCUMENTATION', 'CERTIFICATION'
                        )),
  applies_to            JSONB        NOT NULL,
  rule_applicability     JSONB        NOT NULL DEFAULT '{}'::jsonb,
  default_behavior      JSONB        NOT NULL,
  operands              JSONB,
  observation_overrides JSONB,
  status                VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                        CHECK (status IN ('DRAFT', 'ACTIVE', 'SUPERSEDED', 'RETIRED')),
  effective_from        TIMESTAMPTZ,
  effective_until       TIMESTAMPTZ,
  created_by            TEXT         NOT NULL,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (rule_id, rule_version)
);

COMMENT ON TABLE ebp_rule_versions IS 'EBP Phase 4 — the Rule Catalog (Decision 10, ADR-0048). Versioned data in Postgres, never code. A version that was ever referenced by a real Validation Run is never deleted regardless of status.';
COMMENT ON COLUMN ebp_rule_versions.exception_policy IS 'Decision 02, ADR-0040. CRITICAL severity defaults to NON_WAIVABLE at the application layer; a CRITICAL+waivable version must set this explicitly and visibly.';
COMMENT ON COLUMN ebp_rule_versions.default_behavior IS 'Must never be weaker than the fixed Severity floor (Decision 03, ADR-0041) — enforced at the service layer when a version is published to ACTIVE.';
COMMENT ON COLUMN ebp_rule_versions.rule_applicability IS 'Decision 11, ADR-0049 — Phase 4''s own applicability concept, layered on top of (never replacing) Phase 1''s field_applicability matrix.';

CREATE INDEX IF NOT EXISTS idx_ebp_rule_versions_rule_id ON ebp_rule_versions(rule_id);
CREATE INDEX IF NOT EXISTS idx_ebp_rule_versions_status  ON ebp_rule_versions(status);

-- At most one ACTIVE version per rule_id at a time — the same partial
-- unique index pattern already used for one-active-Offer-per-lineage
-- (ADR-0026, uq_ebp_offers_one_active_lineage).
CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_rule_versions_one_active
  ON ebp_rule_versions(rule_id) WHERE status = 'ACTIVE';


-- ─── VALIDATION RUNS (Decision 12, ADR-0050; Global Result Model, ADR-0051) ──
-- One immutable row per evaluation attempt. Never mutated after creation
-- — a re-validation always inserts a new row and marks the prior one
-- STALE via superseded_by.

CREATE TABLE IF NOT EXISTS ebp_validation_runs (
  id                                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passport_id                        UUID         NOT NULL REFERENCES ebp_engineering_passports(id),
  engineering_revision               INT          NOT NULL,
  manufacturer_id                    UUID         NOT NULL REFERENCES ebp_manufacturers(id),
  offer_id                           UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  offer_revision                     INT          NOT NULL,
  mechanical_result                  VARCHAR(30)  NOT NULL DEFAULT 'REQUIRES_ENGINEERING_REVIEW'
                                     CHECK (mechanical_result IN ('MECHANICALLY_PASS', 'MECHANICALLY_FAIL', 'REQUIRES_ENGINEERING_REVIEW')),
  mechanically_eligible_for_approval BOOLEAN      NOT NULL DEFAULT FALSE,
  trigger                            VARCHAR(40)  NOT NULL
                                     CHECK (trigger IN (
                                       'INITIAL', 'PASSPORT_REVISION_CHANGED', 'OFFER_REVISION_CHANGED',
                                       'MANUFACTURER_QUALIFICATION_CHANGED', 'OFFER_EXPIRED',
                                       'RULE_CATALOG_VERSION_CHANGED', 'EVIDENCE_CHANGED',
                                       'EXCEPTION_CHANGED', 'CONDITION_CHANGED', 'MANUAL_RERUN'
                                     )),
  input_versions                     JSONB        NOT NULL,
  status                             VARCHAR(10)  NOT NULL DEFAULT 'CURRENT'
                                     CHECK (status IN ('CURRENT', 'STALE')),
  superseded_by                      UUID         REFERENCES ebp_validation_runs(id),
  created_by                         TEXT         NOT NULL,
  identity_mechanism                 VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  created_at                         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_validation_runs IS 'EBP Phase 4 — one immutable row per evaluation (Decision 12, ADR-0050). mechanical_result is the Mechanical Compliance Result (Global Result Model, ADR-0051) — never a human decision. Full coarse invalidation: any relevant input change creates a new run and marks the previous one STALE, never mutating it.';
COMMENT ON COLUMN ebp_validation_runs.mechanically_eligible_for_approval IS 'Informational only (ADR-0051) — never itself a decision, never auto-converted to an Engineering Decision (Decision 09, ADR-0047).';
COMMENT ON COLUMN ebp_validation_runs.input_versions IS 'JSONB snapshot: exact Passport revision, Offer revision, and every rule_id/rule_version evaluated — the audit record for "what exactly was checked."';

CREATE INDEX IF NOT EXISTS idx_ebp_validation_runs_offer ON ebp_validation_runs(offer_id, offer_revision);
CREATE INDEX IF NOT EXISTS idx_ebp_validation_runs_status ON ebp_validation_runs(status);

-- At most one CURRENT (non-STALE) run per Offer revision.
CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_validation_runs_one_current
  ON ebp_validation_runs(offer_id, offer_revision) WHERE status = 'CURRENT';


-- ─── RULE RESULTS ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ebp_rule_results (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validation_run_id     UUID         NOT NULL REFERENCES ebp_validation_runs(id) ON DELETE CASCADE,
  rule_id               VARCHAR(40)  NOT NULL,
  rule_version          INT          NOT NULL,
  state                 VARCHAR(20)  NOT NULL
                        CHECK (state IN ('PASS', 'FAIL', 'WARNING', 'NOT_APPLICABLE', 'REQUIRES_REVIEW', 'REQUIRES_EXCEPTION')),
  severity              VARCHAR(10)  NOT NULL
                        CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  observation_code      VARCHAR(60)  NOT NULL,
  observation_params    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  FOREIGN KEY (rule_id, rule_version) REFERENCES ebp_rule_versions(rule_id, rule_version)
);

COMMENT ON TABLE ebp_rule_results IS 'EBP Phase 4 — one row per rule evaluated within one Validation Run. severity is denormalized from the rule version at evaluation time (Decision 10) so a later rule-version change never silently alters a historical result''s displayed severity.';
COMMENT ON COLUMN ebp_rule_results.observation_code IS 'Decision 06, ADR-0044 — a stable code (e.g. OBS_NUMERIC_BELOW_MINIMUM), never free text as authority. observation_params carries the structured rendering parameters.';

CREATE INDEX IF NOT EXISTS idx_ebp_rule_results_run ON ebp_rule_results(validation_run_id);
CREATE INDEX IF NOT EXISTS idx_ebp_rule_results_rule ON ebp_rule_results(rule_id);


-- ─── ENGINEERING DECISIONS (Decisions 08/09, ADR-0046/ADR-0047) ─────────────

CREATE TABLE IF NOT EXISTS ebp_engineering_decisions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  validation_run_id     UUID         NOT NULL REFERENCES ebp_validation_runs(id),
  decision              VARCHAR(30)  NOT NULL DEFAULT 'PENDING_REVIEW'
                        CHECK (decision IN ('PENDING_REVIEW', 'APPROVED', 'CONDITIONALLY_APPROVED', 'REJECTED')),
  decided_by            TEXT         NOT NULL,
  identity_mechanism    VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  notes                 TEXT,
  decided_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_engineering_decisions IS 'EBP Phase 4 — always a human decision (Decision 09, ADR-0047), recorded by an ENGINEERING_APPROVER (Decision 01). Always references, never recalculates, the Mechanical Compliance Result on ebp_validation_runs. A later decision on a later run is a new row, never an edit.';

CREATE INDEX IF NOT EXISTS idx_ebp_eng_decisions_run ON ebp_engineering_decisions(validation_run_id);


-- ─── ENGINEERING EXCEPTIONS (Decision 07, ADR-0045) ─────────────────────────

CREATE TABLE IF NOT EXISTS ebp_engineering_exceptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id              UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  offer_revision        INT          NOT NULL,
  rule_id               VARCHAR(40)  NOT NULL,
  rule_version          INT          NOT NULL,
  status                VARCHAR(20)  NOT NULL DEFAULT 'REQUESTED'
                        CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED')),
  requested_by          TEXT         NOT NULL,
  requested_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  approved_by           TEXT,
  approved_at           TIMESTAMPTZ,
  justification         TEXT         NOT NULL,
  FOREIGN KEY (rule_id, rule_version) REFERENCES ebp_rule_versions(rule_id, rule_version),
  UNIQUE (offer_id, offer_revision, rule_id, rule_version)
);

COMMENT ON TABLE ebp_engineering_exceptions IS 'EBP Phase 4 — Exceptions scoped to exactly Offer ID x Offer Revision x Rule ID x Rule Version (Decision 07, ADR-0045), enforced structurally via the UNIQUE constraint, not just by convention. Never inherited by a later Offer revision. justification is required, never optional.';

CREATE INDEX IF NOT EXISTS idx_ebp_eng_exceptions_offer ON ebp_engineering_exceptions(offer_id, offer_revision);


-- ─── ENGINEERING CONDITIONS (Decision 08, ADR-0046) ─────────────────────────

CREATE TABLE IF NOT EXISTS ebp_engineering_conditions (
  id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engineering_decision_id   UUID         NOT NULL REFERENCES ebp_engineering_decisions(id) ON DELETE CASCADE,
  condition_type            TEXT         NOT NULL,
  description                TEXT         NOT NULL,
  requirement               TEXT         NOT NULL,
  responsible_party         TEXT,
  due_date                  DATE,
  required_evidence         TEXT,
  status                    VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                            CHECK (status IN ('OPEN', 'SATISFIED', 'OVERDUE', 'WAIVED', 'FAILED', 'CANCELLED')),
  satisfied_at              TIMESTAMPTZ,
  consequence               TEXT,
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_engineering_conditions IS 'EBP Phase 4 — structured follow-up conditions linked to a CONDITIONALLY_APPROVED Engineering Decision (Decision 08, ADR-0046). A CONDITIONALLY_APPROVED Offer is not eligible for Manufacturer Selection-style final treatment while any mandatory condition is OPEN/OVERDUE/FAILED.';

CREATE INDEX IF NOT EXISTS idx_ebp_eng_conditions_decision ON ebp_engineering_conditions(engineering_decision_id);
CREATE INDEX IF NOT EXISTS idx_ebp_eng_conditions_status   ON ebp_engineering_conditions(status);


-- ─── ACTIVITY EVENTS (ADR-0037 — first real implementation) ─────────────────
-- The single, canonical event ledger for the whole platform (PLATFORM_
-- ARCHITECTURE.md §8.1). Phase 4 is the first phase to populate it; any
-- future phase reuses this exact table, never a parallel one.

CREATE TABLE IF NOT EXISTS ebp_activity_events (
  event_id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type          VARCHAR(60)  NOT NULL,
  entity_type         VARCHAR(30)  NOT NULL,
  entity_id           UUID         NOT NULL,
  entity_version      TEXT,
  passport_id         UUID,
  manufacturer_id     UUID,
  batch_id            UUID,
  offer_id            UUID,
  user_id             UUID,
  declared_actor      TEXT,
  identity_mechanism  VARCHAR(30)  NOT NULL DEFAULT 'ADMIN_KEY_SHARED',
  correlation_id      UUID,
  event_timestamp     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  event_data          JSONB        NOT NULL DEFAULT '{}'::jsonb
);

COMMENT ON TABLE ebp_activity_events IS 'EBP platform-wide — the single canonical event ledger (ADR-0037, PLATFORM_ARCHITECTURE.md §8.1), implemented for the first time by Phase 4. No phase may create an independent event system. event_data never contains password_hash/token_hash/storage_key or anything a phase''s own DTO already excludes.';

CREATE INDEX IF NOT EXISTS idx_ebp_activity_events_entity  ON ebp_activity_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_ebp_activity_events_offer   ON ebp_activity_events(offer_id) WHERE offer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ebp_activity_events_manufacturer ON ebp_activity_events(manufacturer_id) WHERE manufacturer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ebp_activity_events_type    ON ebp_activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ebp_activity_events_ts      ON ebp_activity_events(event_timestamp);


-- ─── ANALYTICS VIEW (ADR-0037 §8.3 naming convention) ───────────────────────
-- The only surface a future Dashboard/BI/AI layer may query for
-- validation state — never a transactional table directly.

CREATE OR REPLACE VIEW ebp_analytics_validation_summary AS
  SELECT
    vr.offer_id,
    vr.offer_revision,
    vr.manufacturer_id,
    vr.passport_id,
    vr.mechanical_result,
    vr.mechanically_eligible_for_approval,
    vr.status AS validation_run_status,
    vr.created_at AS validated_at,
    ed.decision AS engineering_decision,
    ed.decided_at,
    (SELECT COUNT(*) FROM ebp_engineering_exceptions ee
       WHERE ee.offer_id = vr.offer_id AND ee.offer_revision = vr.offer_revision AND ee.status = 'REQUESTED') AS open_exceptions,
    (SELECT COUNT(*) FROM ebp_engineering_conditions ec
       WHERE ec.engineering_decision_id = ed.id AND ec.status IN ('OPEN', 'OVERDUE')) AS open_conditions
  FROM ebp_validation_runs vr
  LEFT JOIN LATERAL (
    SELECT d.* FROM ebp_engineering_decisions d
    WHERE d.validation_run_id = vr.id
    ORDER BY d.decided_at DESC LIMIT 1
  ) ed ON TRUE
  WHERE vr.status = 'CURRENT';

COMMENT ON VIEW ebp_analytics_validation_summary IS 'EBP Phase 4 — the only view a future Dashboard/BI/AI layer reads for validation state (ADR-0037 §8.3). Never a transactional table directly.';
