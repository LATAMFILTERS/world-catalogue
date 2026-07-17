-- =============================================================================
-- EBP PHASE 5 — MANUFACTURER SELECTION — SCHEMA
-- File: 001_schema.sql
-- Purpose: Selection Policy (versioned data, Decision 07/ADR-0068), Offer
--   Commercial Approval (Decision 11/ADR-0072 — designed under ADR-0008
--   but never built in Phase 3), Demand Signal (Decision 02/ADR-0063),
--   Preferred Manufacturer (Decision 10/ADR-0071), Selection Runs +
--   Candidates + Factor Scores (Decisions 01/03/09, ADR-0062/0064/0070),
--   Selection Decisions + Overrides (Decisions 05/06, ADR-0066/0067), and
--   the shared Activity Events / Alerts tables reused unmodified from
--   Phase 4 (ADR-0037).
-- Safe to run: YES — additive only. No ALTER on any Phase 1/2/3/4 table.
-- Grounded in: docs/ebp/MANUFACTURER_SELECTION_ENGINE.md, ADR-0062
--   through ADR-0074 in docs/ebp/DECISIONS.md,
--   docs/ebp/phases/phase-05-manufacturer-selection.md.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── SELECTION FUNCTIONAL ROLES (Decision 05, ADR-0066) ─────────────────────
-- Distinct from Phase 4's ebp_engineering_role_assignments (frozen, its own
-- CHECK constraint) — this phase never reuses that table. Same MVP
-- convention: requireAdmin remains the real security boundary; this table
-- narrows what an already-admin-authenticated caller may do.

CREATE TABLE IF NOT EXISTS ebp_selection_role_assignments (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  declared_actor    TEXT         NOT NULL,
  role              VARCHAR(30)  NOT NULL
                     CHECK (role IN ('SELECTION_REVIEWER', 'SELECTION_APPROVER', 'COMMERCIAL_APPROVER', 'ADMIN_OWNER')),
  assigned_by       TEXT         NOT NULL,
  assigned_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  revoked_at        TIMESTAMPTZ,
  revoked_by        TEXT,
  UNIQUE (declared_actor, role)
);

COMMENT ON TABLE ebp_selection_role_assignments IS 'EBP Phase 5 — functional role assignments (Decision 05, ADR-0066). A role assignment is never deleted, only revoked (revoked_at set).';

CREATE INDEX IF NOT EXISTS idx_ebp_sel_roles_actor ON ebp_selection_role_assignments(declared_actor) WHERE revoked_at IS NULL;

-- ─── Permanent, concurrency-safe ADMIN_OWNER bootstrap (mirrors ADR-0059) ──

CREATE TABLE IF NOT EXISTS ebp_selection_admin_bootstrap (
  id                  BOOLEAN      PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  bootstrapped_actor  TEXT         NOT NULL,
  bootstrapped_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_selection_admin_bootstrap IS 'EBP Phase 5 — permanent record of the one-time ADMIN_OWNER bootstrap for this phase''s own role table, mirroring Phase 4''s ebp_engineering_admin_bootstrap (ADR-0059). Never deleted.';

-- ─── SELECTION POLICY (Decision 07, ADR-0068) ───────────────────────────────
-- Versioned data, never code. An ACTIVE version is never edited — any
-- change is a new version. At most one ACTIVE policy per (scope_type,
-- scope_value) is enforced by the partial unique index below.

CREATE TABLE IF NOT EXISTS ebp_selection_policies (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_code                 VARCHAR(20)  NOT NULL,
  policy_version              INTEGER      NOT NULL,
  name                        TEXT         NOT NULL,
  description                 TEXT,
  scope_type                  VARCHAR(20)  NOT NULL DEFAULT 'PLATFORM'
                               CHECK (scope_type IN ('PLATFORM', 'CATEGORY', 'SUBTYPE', 'DUTY', 'TECHNOLOGY', 'REGION')),
  scope_value                 TEXT,
  weights                     JSONB        NOT NULL,
  criteria                    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  normalization                JSONB       NOT NULL DEFAULT '{}'::jsonb,
  gates                       JSONB        NOT NULL DEFAULT '{}'::jsonb,
  penalties                   JSONB        NOT NULL DEFAULT '{}'::jsonb,
  diversification_rules       JSONB        NOT NULL DEFAULT '{}'::jsonb,
  concentration_thresholds    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  preferred_manufacturer_bonus JSONB       NOT NULL DEFAULT '{}'::jsonb,
  effective_from              TIMESTAMPTZ,
  status                      VARCHAR(20)  NOT NULL DEFAULT 'DRAFT'
                               CHECK (status IN ('DRAFT', 'UNDER_REVIEW', 'ACTIVE', 'SUPERSEDED', 'RETIRED')),
  created_by                  TEXT         NOT NULL,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (policy_code, policy_version),
  CHECK (scope_type = 'PLATFORM' OR scope_value IS NOT NULL)
);

COMMENT ON TABLE ebp_selection_policies IS 'EBP Phase 5 — versioned Selection Policy (Decision 07, ADR-0068). No weight, normalization function, gate, penalty, or threshold is ever hardcoded in engine code — all of it lives here. An ACTIVE version is never edited in place.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_sel_policy_one_active_scope
  ON ebp_selection_policies(scope_type, COALESCE(scope_value, '')) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_ebp_sel_policy_code ON ebp_selection_policies(policy_code);

-- ─── OFFER COMMERCIAL APPROVAL (Decision 11, ADR-0072) ──────────────────────
-- Designed under ADR-0008/ADR-0011 as "Offer Approval" (engineering +
-- commercial), never implemented in Phase 3's real schema. Built here,
-- scoped strictly to the Commercial dimension — never merged with Phase
-- 4's ebp_engineering_decisions. One row per decision event (append-only
-- history); the most recent row per (offer_id, offer_revision) is current.

CREATE TABLE IF NOT EXISTS ebp_offer_commercial_approvals (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  offer_id                    UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id) ON DELETE CASCADE,
  offer_revision              INTEGER      NOT NULL,
  status                      VARCHAR(20)  NOT NULL
                               CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  elimfilters_approved_quantity INTEGER,
  final_approved_packaging    JSONB,
  deviation_decision          JSONB,
  decided_by                  TEXT         NOT NULL,
  decided_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reason                      TEXT,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_offer_commercial_approvals IS 'EBP Phase 5 — Offer Commercial Approval (Decision 11, ADR-0072). COMMERCIAL_APPROVER decisions only; never records or duplicates an Engineering Decision (Phase 4, ebp_engineering_decisions). Append-only: a new decision supersedes, never overwrites, a prior one for the same offer_id/offer_revision — current status is the most recent row.';

CREATE INDEX IF NOT EXISTS idx_ebp_commercial_approvals_offer ON ebp_offer_commercial_approvals(offer_id, offer_revision, decided_at DESC);

-- ─── DEMAND SIGNAL (Decision 02, ADR-0063) ──────────────────────────────────
-- Optional, declared, never inferred. Phase 5 v1.0 does not require real
-- Phase 9 orders.

CREATE TABLE IF NOT EXISTS ebp_demand_signals (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passport_id         UUID         NOT NULL REFERENCES ebp_engineering_passports(id) ON DELETE CASCADE,
  signal_type         VARCHAR(20)  NOT NULL
                       CHECK (signal_type IN ('FORECAST', 'TARGET_VOLUME', 'SCENARIO', 'UNKNOWN')),
  estimated_quantity  NUMERIC(14,2),
  period              TEXT,
  unit                TEXT,
  source              TEXT,
  confidence          VARCHAR(20),
  declared_by         TEXT         NOT NULL,
  declared_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_demand_signals IS 'EBP Phase 5 — optional, declared Demand Signal (Decision 02, ADR-0063). Absent a reliable signal, a Selection Run still computes, marked demand_not_provided = true on ebp_selection_runs.';

CREATE INDEX IF NOT EXISTS idx_ebp_demand_signals_passport ON ebp_demand_signals(passport_id);

-- ─── PREFERRED MANUFACTURER (Decision 10, ADR-0071) ─────────────────────────
-- A declared commercial/strategic preference, never an automatic
-- consequence of overrides, never a gate.

CREATE TABLE IF NOT EXISTS ebp_preferred_manufacturers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id   UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  scope_type        VARCHAR(20)  NOT NULL
                     CHECK (scope_type IN ('SKU', 'FAMILY', 'CATEGORY', 'TECHNOLOGY', 'REGION')),
  scope_value       TEXT         NOT NULL,
  reason            TEXT         NOT NULL,
  valid_from        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  valid_until       TIMESTAMPTZ,
  created_by        TEXT         NOT NULL,
  approved_by       TEXT         NOT NULL,
  status            VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                     CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_preferred_manufacturers IS 'EBP Phase 5 — Preferred Manufacturer (Decision 10, ADR-0071). Grants only a bounded, Selection-Policy-defined bonus applied after the composite score; never makes an ineligible Offer eligible.';

CREATE INDEX IF NOT EXISTS idx_ebp_preferred_mfr_scope ON ebp_preferred_manufacturers(scope_type, scope_value) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_ebp_preferred_mfr_manufacturer ON ebp_preferred_manufacturers(manufacturer_id);

-- ─── SELECTION RUNS (Decisions 01/03/12, ADR-0062/0064/0074) ────────────────
-- One immutable row per Selection Run. run_result is set at creation and
-- is only ever transitioned to STALE (+ superseded_by set) by a later
-- run for the same Passport — the one allowed lifecycle mutation,
-- exactly mirroring Phase 4's ebp_validation_runs.status (CURRENT/STALE).

CREATE TABLE IF NOT EXISTS ebp_selection_runs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  passport_id           UUID         NOT NULL REFERENCES ebp_engineering_passports(id),
  engineering_revision  INTEGER      NOT NULL,
  selection_version     INTEGER      NOT NULL,
  selection_policy_id   UUID         NOT NULL REFERENCES ebp_selection_policies(id),
  demand_signal_id      UUID         REFERENCES ebp_demand_signals(id),
  demand_not_provided   BOOLEAN      NOT NULL DEFAULT TRUE,
  run_result            VARCHAR(30)  NOT NULL
                         CHECK (run_result IN ('RECOMMENDATION_READY', 'NO_ELIGIBLE_CANDIDATE', 'TIE_REQUIRES_HUMAN_REVIEW', 'INSUFFICIENT_DATA', 'POLICY_CONFLICT', 'STALE')),
  superseded_by         UUID         REFERENCES ebp_selection_runs(id),
  trigger               VARCHAR(40)  NOT NULL
                         CHECK (trigger IN (
                           'INITIAL', 'NEW_OFFER', 'NEW_VALIDATION', 'DECISION_CHANGE',
                           'EXCEPTION_CHANGE', 'COMMERCIAL_APPROVAL_CHANGE',
                           'MANUFACTURER_STATUS_CHANGE', 'CERTIFICATION_CHANGE',
                           'EXPIRATION', 'POLICY_CHANGE', 'PREFERRED_MANUFACTURER_CHANGE',
                           'DEMAND_CHANGE', 'CONCENTRATION_THRESHOLD_CROSSED', 'MANUAL_TRIGGER'
                         )),
  triggered_by          TEXT         NOT NULL,
  input_versions        JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (passport_id, selection_version)
);

COMMENT ON TABLE ebp_selection_runs IS 'EBP Phase 5 — one immutable row per Selection Run (the "Selection Run Result" concept, ADR-0074). Never mutated except the run_result -> STALE + superseded_by transition when a later run for the same Passport is created.';

CREATE INDEX IF NOT EXISTS idx_ebp_selection_runs_passport ON ebp_selection_runs(passport_id, selection_version DESC);
CREATE INDEX IF NOT EXISTS idx_ebp_selection_runs_current ON ebp_selection_runs(passport_id) WHERE run_result <> 'STALE';

-- ─── SELECTION CANDIDATES (the Manufacturer Recommendation's full basis) ───
-- One row per Offer considered (eligible or excluded) in one run. This
-- table IS the Manufacturer Recommendation — no separate table duplicates it.

CREATE TABLE IF NOT EXISTS ebp_selection_candidates (
  id                              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_run_id                UUID         NOT NULL REFERENCES ebp_selection_runs(id) ON DELETE CASCADE,
  offer_id                        UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id),
  offer_revision                  INTEGER      NOT NULL,
  manufacturer_id                 UUID         NOT NULL REFERENCES ebp_manufacturers(id),
  eligible                        BOOLEAN      NOT NULL,
  exclusion_reason                TEXT,
  composite_score_pre_bonus       NUMERIC(6,2),
  preferred_bonus_applied         NUMERIC(6,2) NOT NULL DEFAULT 0,
  composite_score_final           NUMERIC(6,2),
  rank_position                   INTEGER,
  tier                            VARCHAR(10)  NOT NULL DEFAULT 'NONE'
                                   CHECK (tier IN ('PRIMARY', 'SECONDARY', 'BACKUP', 'NONE')),
  backup_diversification_limited  BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at                      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CHECK (eligible OR tier = 'NONE'),
  CHECK (eligible OR exclusion_reason IS NOT NULL)
);

COMMENT ON TABLE ebp_selection_candidates IS 'EBP Phase 5 — every Offer considered within one Selection Run, eligible or excluded. This table is the Manufacturer Recommendation''s full basis (ADR-0074) — every eligible candidate appears, not only named tiers.';

CREATE INDEX IF NOT EXISTS idx_ebp_sel_candidates_run ON ebp_selection_candidates(selection_run_id, rank_position);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_sel_candidates_run_offer ON ebp_selection_candidates(selection_run_id, offer_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_sel_candidates_run_tier ON ebp_selection_candidates(selection_run_id, tier) WHERE tier <> 'NONE';

-- ─── SELECTION FACTOR SCORES (Decision 09, ADR-0070) ────────────────────────
-- One row per factor per candidate. Never optional for an eligible
-- candidate — mirrors Phase 4's Observation Catalog discipline (Decision
-- 06/ADR-0044) applied to Selection's own scoring.

CREATE TABLE IF NOT EXISTS ebp_selection_factor_scores (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_candidate_id  UUID         NOT NULL REFERENCES ebp_selection_candidates(id) ON DELETE CASCADE,
  factor_code             VARCHAR(60)  NOT NULL,
  factor_category         VARCHAR(20)  NOT NULL
                          CHECK (factor_category IN ('ENGINEERING', 'COMMERCIAL', 'OPERATIONAL', 'STRATEGIC')),
  original_value          JSONB,
  unit                    TEXT,
  source                  TEXT,
  source_version          TEXT,
  normalized_value        NUMERIC(6,2),
  weight                  NUMERIC(5,4),
  weighted_contribution   NUMERIC(6,2),
  penalty                 NUMERIC(6,2)  NOT NULL DEFAULT 0,
  gate_applied            TEXT,
  status                  VARCHAR(20),
  reason_code             VARCHAR(60)  NOT NULL,
  explanation_params      JSONB        NOT NULL DEFAULT '{}'::jsonb,
  evidence_reference      TEXT,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_selection_factor_scores IS 'EBP Phase 5 — structured, factor-tagged explainability record (Decision 09, ADR-0070). reason_code + template generates human-readable text; never stored as free text alone.';

CREATE INDEX IF NOT EXISTS idx_ebp_sel_factor_scores_candidate ON ebp_selection_factor_scores(selection_candidate_id);
CREATE INDEX IF NOT EXISTS idx_ebp_sel_factor_scores_code ON ebp_selection_factor_scores(factor_code);

-- ─── SELECTION DECISIONS (the human act; Result Model, ADR-0074) ───────────
-- One row per Selection Run that reached RECOMMENDATION_READY or
-- TIE_REQUIRES_HUMAN_REVIEW. status is a mutable workflow field (the one
-- allowed exception to append-only, exactly as Phase 4 mutates
-- ebp_engineering_decisions.status CURRENT/NEEDS_REVIEW) — the run itself
-- and its candidates/factor scores are never mutated.

CREATE TABLE IF NOT EXISTS ebp_selection_decisions (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_run_id            UUID         NOT NULL UNIQUE REFERENCES ebp_selection_runs(id) ON DELETE CASCADE,
  status                      VARCHAR(20)  NOT NULL DEFAULT 'PENDING_REVIEW'
                               CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'OVERRIDDEN', 'REJECTED', 'SUPERSEDED')),
  decided_by                  TEXT,
  decided_at                  TIMESTAMPTZ,
  notes                       TEXT,
  approved_primary_offer_id   UUID REFERENCES ebp_manufacturer_offers(id),
  approved_secondary_offer_id UUID REFERENCES ebp_manufacturer_offers(id),
  approved_backup_offer_id    UUID REFERENCES ebp_manufacturer_offers(id),
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_selection_decisions IS 'EBP Phase 5 — the human Selection Decision (Result Model, ADR-0074). The engine recommends; it never auto-approves. Created PENDING_REVIEW when a run completes; set to SUPERSEDED the moment a new run for the same Passport is created.';

CREATE INDEX IF NOT EXISTS idx_ebp_sel_decisions_status ON ebp_selection_decisions(status);

-- ─── SELECTION OVERRIDES (Decisions 05/06, ADR-0066/ADR-0067) ──────────────
-- Two-action workflow: SELECTION_APPROVER requests, ADMIN_OWNER approves
-- or rejects. The trigger below (003_override_guard.sql) enforces that
-- the same declared actor can never perform both actions, and that an
-- approved override's requested_offer_id was Eligible in the same run.

CREATE TABLE IF NOT EXISTS ebp_selection_overrides (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_run_id            UUID         NOT NULL REFERENCES ebp_selection_runs(id) ON DELETE CASCADE,
  selection_decision_id        UUID         NOT NULL REFERENCES ebp_selection_decisions(id) ON DELETE CASCADE,
  tier                        VARCHAR(10)  NOT NULL
                               CHECK (tier IN ('PRIMARY', 'SECONDARY', 'BACKUP')),
  engine_recommended_offer_id UUID REFERENCES ebp_manufacturer_offers(id),
  engine_recommended_score    NUMERIC(6,2),
  requested_offer_id          UUID         NOT NULL REFERENCES ebp_manufacturer_offers(id),
  requested_by                TEXT         NOT NULL,
  requested_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  reason                      TEXT         NOT NULL,
  status                      VARCHAR(20)  NOT NULL DEFAULT 'REQUESTED'
                               CHECK (status IN ('REQUESTED', 'APPROVED', 'REJECTED')),
  decided_by                  TEXT,
  decided_at                  TIMESTAMPTZ,
  decision_notes              TEXT,
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_selection_overrides IS 'EBP Phase 5 — Manual Override (Decisions 05/06, ADR-0066/ADR-0067). Always two separate actions (request, approve/reject); the same declared_actor can never perform both for the same override — enforced in service.js and by trg_ebp_enforce_selection_override_guard.';

CREATE INDEX IF NOT EXISTS idx_ebp_sel_overrides_run ON ebp_selection_overrides(selection_run_id);
CREATE INDEX IF NOT EXISTS idx_ebp_sel_overrides_status ON ebp_selection_overrides(status);

-- ─── ANALYTICS VIEW (ADR-0037 §8.3 naming convention) ───────────────────────

CREATE OR REPLACE VIEW ebp_analytics_selection_summary AS
  SELECT
    sr.id AS selection_run_id,
    sr.passport_id,
    sr.selection_version,
    sr.run_result,
    sr.demand_not_provided,
    sd.status AS selection_decision_status,
    sd.decided_at,
    (SELECT COUNT(*) FROM ebp_selection_candidates c WHERE c.selection_run_id = sr.id AND c.eligible) AS eligible_candidate_count,
    (SELECT COUNT(*) FROM ebp_selection_candidates c WHERE c.selection_run_id = sr.id AND NOT c.eligible) AS excluded_candidate_count,
    bool_or(c.tier = 'PRIMARY') AS has_primary,
    bool_or(c.tier = 'SECONDARY') AS has_secondary,
    bool_or(c.tier = 'BACKUP') AS has_backup,
    bool_or(c.tier = 'BACKUP' AND c.backup_diversification_limited) AS backup_diversification_limited,
    sr.created_at AS run_at
  FROM ebp_selection_runs sr
  LEFT JOIN ebp_selection_decisions sd ON sd.selection_run_id = sr.id
  LEFT JOIN ebp_selection_candidates c ON c.selection_run_id = sr.id
  WHERE sr.run_result <> 'STALE'
  GROUP BY sr.id, sd.status, sd.decided_at;

COMMENT ON VIEW ebp_analytics_selection_summary IS 'EBP Phase 5 — the only view a future Dashboard/BI/AI layer reads for Selection state (ADR-0037 §8.3). Never a transactional table directly.';
