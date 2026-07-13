-- =============================================================================
-- EBP PHASE 4 — CORRECTION ROUND (2026-07-13, pre-freeze)
-- File: 002_correction.sql
-- Purpose: mandatory corrections identified before Phase 4 could be
--   approved/frozen — strict Engineering Decision eligibility, exception
--   revalidation, permanent ADMIN_OWNER bootstrap, and the Alert Layer.
--   See ADR-0052 through ADR-00xx in DECISIONS.md and the corresponding
--   "Correction round" entry in CHANGELOG.md.
-- Safe to run: YES — additive only (one new CHECK constraint replacement
--   on an existing column, one new column, two new tables). No Phase
--   1/2/3 table touched. No data deleted.
-- =============================================================================

-- ─── Permanent, concurrency-safe ADMIN_OWNER bootstrap record ───────────────
-- A single-row-ever table: the primary key (id = TRUE) makes concurrent
-- bootstrap attempts serialize atomically at the database level — the
-- second INSERT always fails with a unique-violation, never a race. Once
-- this row exists, it is NEVER deleted, even if every ADMIN_OWNER role
-- assignment is later revoked — the bootstrap mechanism closes permanently
-- after its first (and only) use.

CREATE TABLE IF NOT EXISTS ebp_engineering_admin_bootstrap (
  id                  BOOLEAN      PRIMARY KEY DEFAULT TRUE CHECK (id = TRUE),
  bootstrapped_actor  TEXT         NOT NULL,
  bootstrapped_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE ebp_engineering_admin_bootstrap IS 'EBP Phase 4 correction round — permanent record of the one-time ADMIN_OWNER bootstrap. The id=TRUE primary key guarantees at most one row ever exists; concurrent bootstrap attempts are serialized by the database, not application logic. This row is never deleted, so the bootstrap allowance can never reopen even if the bootstrapped ADMIN_OWNER is later revoked.';

-- ─── Engineering Decisions: effective status (Decision 08 correction) ──────
-- A decision's own row is still never edited/rewritten (append-only), but
-- its *effective* eligibility can change when a linked condition later
-- fails or goes overdue. status=NEEDS_REVIEW records that without
-- rewriting the decided_at/decision/notes history.

ALTER TABLE ebp_engineering_decisions
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'CURRENT'
    CHECK (status IN ('CURRENT', 'NEEDS_REVIEW'));

COMMENT ON COLUMN ebp_engineering_decisions.status IS 'Correction round — CURRENT unless a linked mandatory condition later becomes FAILED/OVERDUE, at which point it is recomputed to NEEDS_REVIEW (never a silent, ungoverned re-eligibility). Never itself a technical or commercial approval signal — see ebp_validation_runs.mechanical_result and the (future) Offer Approval flow.';

-- ─── Validation Runs: exception-decision-specific triggers ─────────────────
-- Decision 02/07 correction: approving or rejecting an Exception changes
-- an evaluation input and must be traceable as its own distinct trigger,
-- not folded into the generic EXCEPTION_CHANGED value.

ALTER TABLE ebp_validation_runs DROP CONSTRAINT IF EXISTS ebp_validation_runs_trigger_check;
ALTER TABLE ebp_validation_runs ADD CONSTRAINT ebp_validation_runs_trigger_check
  CHECK (trigger IN (
    'INITIAL', 'PASSPORT_REVISION_CHANGED', 'OFFER_REVISION_CHANGED',
    'MANUFACTURER_QUALIFICATION_CHANGED', 'OFFER_EXPIRED',
    'RULE_CATALOG_VERSION_CHANGED', 'EVIDENCE_CHANGED',
    'EXCEPTION_CHANGED', 'EXCEPTION_APPROVED', 'EXCEPTION_REJECTED',
    'CONDITION_CHANGED', 'MANUAL_RERUN'
  ));

-- ─── Alert Layer (ADR-0037-aligned, Phase 4's own minimal implementation) ──
-- Structured, resolvable alerts only — no Notification Center, no email.
-- Deduplication: at most one OPEN/ACKNOWLEDGED alert per
-- (alert_type, entity_type, entity_id) at a time, enforced by a partial
-- unique index, not just application discipline.

CREATE TABLE IF NOT EXISTS ebp_alerts (
  alert_id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_type          VARCHAR(60)  NOT NULL,
  severity            VARCHAR(10)  NOT NULL
                       CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO')),
  entity_type         VARCHAR(30)  NOT NULL,
  entity_id           UUID         NOT NULL,
  manufacturer_id     UUID,
  passport_id         UUID,
  offer_id            UUID,
  validation_run_id   UUID,
  status              VARCHAR(20)  NOT NULL DEFAULT 'OPEN'
                       CHECK (status IN ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED')),
  detected_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  due_at              TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  resolution_reason   TEXT,
  alert_data          JSONB        NOT NULL DEFAULT '{}'::jsonb,
  correlation_id      UUID
);

COMMENT ON TABLE ebp_alerts IS 'EBP Phase 4 — minimal Alert Layer (ADR-0037-aligned). Structured, resolvable alerts only; no notification delivery. Deduplicated via uq_ebp_alerts_open_dedup.';

CREATE UNIQUE INDEX IF NOT EXISTS uq_ebp_alerts_open_dedup
  ON ebp_alerts(alert_type, entity_type, entity_id) WHERE status IN ('OPEN', 'ACKNOWLEDGED');

CREATE INDEX IF NOT EXISTS idx_ebp_alerts_status ON ebp_alerts(status);
CREATE INDEX IF NOT EXISTS idx_ebp_alerts_offer ON ebp_alerts(offer_id) WHERE offer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ebp_alerts_type ON ebp_alerts(alert_type);
