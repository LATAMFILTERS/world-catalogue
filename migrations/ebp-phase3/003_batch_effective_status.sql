-- =============================================================================
-- EBP PHASE 3 — BATCH EFFECTIVE STATUS (correction round, 2026-07-13)
-- File: 003_batch_effective_status.sql
-- Purpose: Add a single, centralized computed effective_status for
--   Manufacturer Request Batches, so OVERDUE is never calculated
--   differently by different screens/APIs (ADR-0031). Mirrors the exact
--   pattern already used for Offers (ebp_manufacturer_offers_effective,
--   ADR-0019-style) and Phase 2 certifications (ADR-0019).
-- Safe to run: YES (CREATE OR REPLACE VIEW — idempotent)
-- Affects Phase 1/Phase 2/prior Phase 3 tables: NO — purely additive.
-- No cron/scheduled job required: the stored `status` column can remain
--   SENT or PARTIALLY_RESPONDED indefinitely; every READ must go through
--   this view (or an equivalent DTO field sourced from it), never the raw
--   `status` column, to determine current OVERDUE-ness.
-- See: docs/ebp/phases/phase-03-supplier-portal.md,
--      docs/ebp/DECISIONS.md ADR-0031
-- =============================================================================

CREATE OR REPLACE VIEW ebp_manufacturer_request_batches_effective AS
  SELECT b.*,
         CASE
           WHEN b.status NOT IN ('RESPONDED', 'CLOSED', 'CANCELLED')
                AND b.response_due_at IS NOT NULL
                AND b.response_due_at < NOW()
             THEN 'OVERDUE'
           ELSE b.status
         END AS effective_status
  FROM ebp_manufacturer_request_batches b;

COMMENT ON VIEW ebp_manufacturer_request_batches_effective IS 'EBP Phase 3 — computed Batch OVERDUE status (ADR-0031), same pattern as ebp_manufacturer_offers_effective (ADR-0019). effective_status is OVERDUE whenever response_due_at has passed and the batch has not reached RESPONDED/CLOSED/CANCELLED, even if nobody has run a job to flip the stored status column. Every "is this batch overdue" read must use this view (or a DTO field sourced from it) — reading the raw status column directly for that purpose is a defect. The stored status column may legitimately remain SENT or PARTIALLY_RESPONDED indefinitely; that is expected, not a bug.';
