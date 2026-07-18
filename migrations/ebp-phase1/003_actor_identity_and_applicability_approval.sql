-- =============================================================================
-- EBP PHASE 1 — ACTOR IDENTITY SEMANTICS + APPLICABILITY MATRIX APPROVAL GATE
-- File: 003_actor_identity_and_applicability_approval.sql
-- Purpose: (1) make explicit that created_by/changed_by are declared-actor
--          labels, not verified identities, while auth is a single shared
--          ADMIN_KEY; (2) let a field's applicability-matrix source be
--          tracked and its approval state gate Passport activation (ADR-0014).
-- Safe to run: YES (uses ADD COLUMN IF NOT EXISTS — idempotent)
-- Depends on: migrations/ebp-phase1/001_schema.sql, 002_seed_applicability_matrix.sql
-- See: docs/ebp/phases/phase-01-product-engineering-passport.md,
--      docs/ebp/DECISIONS.md ADR-0014
-- =============================================================================

-- ─── Declared-actor identity mechanism ───────────────────────────────────────
-- created_by / changed_by have always held whatever label a caller declared
-- (x-ebp-actor header, or a default) — never a verified identity. This column
-- makes the strength of that claim explicit and auditable alongside it.

ALTER TABLE ebp_engineering_passports
  ADD COLUMN IF NOT EXISTS identity_mechanism VARCHAR(30) NOT NULL DEFAULT 'ADMIN_KEY_SHARED';

ALTER TABLE ebp_passport_status_history
  ADD COLUMN IF NOT EXISTS identity_mechanism VARCHAR(30) NOT NULL DEFAULT 'ADMIN_KEY_SHARED';

COMMENT ON COLUMN ebp_engineering_passports.created_by IS 'A declared_actor label supplied by the caller (x-ebp-actor header) or the admin-key-session default. NOT a verified/authenticated identity while identity_mechanism = ADMIN_KEY_SHARED (a single shared ADMIN_KEY, no per-user auth). See ebp/phase1/actor.js.';
COMMENT ON COLUMN ebp_engineering_passports.identity_mechanism IS 'How created_by was established. Currently always ADMIN_KEY_SHARED — a real per-user identity provider is a future-phase dependency (ADR-0002), not yet built.';
COMMENT ON COLUMN ebp_passport_status_history.changed_by IS 'Same declared_actor semantics as ebp_engineering_passports.created_by — not an authenticated identity under ADMIN_KEY_SHARED.';
COMMENT ON COLUMN ebp_passport_status_history.identity_mechanism IS 'Same semantics as ebp_engineering_passports.identity_mechanism.';


-- ─── Applicability-matrix approval gate (ADR-0014) ───────────────────────────
-- Every matrix row starts PROVISIONAL — a starting point grounded in general
-- filtration practice, not an ELIMFILTERS-engineering-reviewed authority.
-- Existing rows (seeded by 002_seed_applicability_matrix.sql) backfill to the
-- PROVISIONAL default automatically via this ADD COLUMN.

ALTER TABLE ebp_field_applicability_matrix
  ADD COLUMN IF NOT EXISTS approval_status VARCHAR(60) NOT NULL
    DEFAULT 'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL'
    CHECK (approval_status IN ('PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL', 'ENGINEERING_APPROVED'));

COMMENT ON COLUMN ebp_field_applicability_matrix.approval_status IS 'PROVISIONAL_REQUIRES_ELIMFILTERS_ENGINEERING_APPROVAL (default/seed state) or ENGINEERING_APPROVED. A Passport revision cannot activate while it depends on a PROVISIONAL row it did not explicitly override — see ADR-0014 and service.js assertApplicabilityApprovedForActivation().';

-- Tracks, per resolved engineering field, whether its value came from the
-- applicability matrix (subject to the approval gate above) or from an
-- explicit per-Passport override (an engineering decision already made,
-- exempt from the gate). Re-checked at activation time against the matrix's
-- *current* approval_status, not whatever it was when the DRAFT was created.

ALTER TABLE ebp_passport_engineering
  ADD COLUMN IF NOT EXISTS field_applicability_source JSONB NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN ebp_passport_engineering.field_applicability_source IS 'Per-field provenance for field_applicability: "MATRIX" or "OVERRIDE". Only MATRIX-sourced fields are subject to the ADR-0014 activation gate.';
