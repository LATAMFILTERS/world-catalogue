-- =============================================================================
-- EBP PHASE 3 — EXCEL STAGING PERSISTENCE (correction round, 2026-07-13)
-- File: 002_excel_staging.sql
-- Purpose: Replace the process-local in-memory Excel staging store
--   (ebp/phase3/staging.js, pre-correction) with a real, persistent table —
--   a process restart must never silently drop a staged import.
-- Safe to run: YES (uses IF NOT EXISTS / additive — idempotent)
-- Affects Phase 1/Phase 2/prior Phase 3 tables: NO — purely additive.
-- See: docs/ebp/phases/phase-03-supplier-portal.md,
--      docs/ebp/DECISIONS.md ADR-0030
-- =============================================================================

CREATE TABLE IF NOT EXISTS ebp_manufacturer_excel_staging (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manufacturer_id   UUID         NOT NULL REFERENCES ebp_manufacturers(id) ON DELETE CASCADE,
  factory_user_id   UUID         REFERENCES ebp_factory_users(id),
  batch_id          UUID         NOT NULL REFERENCES ebp_manufacturer_request_batches(id) ON DELETE CASCADE,
  workbook_hash     CHAR(64)     NOT NULL,
  preview_json      JSONB        NOT NULL,
  errors_json       JSONB,
  status            VARCHAR(20)  NOT NULL DEFAULT 'STAGED'
                    CHECK (status IN ('STAGED', 'CONSUMED', 'EXPIRED')),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ  NOT NULL,
  consumed_at       TIMESTAMPTZ
);

COMMENT ON TABLE ebp_manufacturer_excel_staging IS 'EBP Phase 3 — persistent Excel stage/confirm pipeline storage (ADR-0030). Replaces the original process-local in-memory Map, which did not survive a process restart. The staging_id (this row''s id) IS the staging token returned to the caller. Confirm is a single atomic UPDATE ... WHERE status = ''STAGED'' AND expires_at > NOW() RETURNING, guaranteeing a staged import can be consumed exactly once even under concurrent confirm requests.';
COMMENT ON COLUMN ebp_manufacturer_excel_staging.workbook_hash IS 'SHA-256 of the uploaded workbook''s bytes, recorded for audit/traceability alongside the already-verified locked-column hash inside the workbook itself.';
COMMENT ON COLUMN ebp_manufacturer_excel_staging.preview_json IS 'The fully validated, would-be Offer payload produced by Stage 2 (row-level validation) — nothing is written to any ebp_manufacturer_offers* table until confirm reads this back.';

CREATE INDEX IF NOT EXISTS idx_ebp_excel_staging_batch ON ebp_manufacturer_excel_staging(batch_id);
CREATE INDEX IF NOT EXISTS idx_ebp_excel_staging_manufacturer ON ebp_manufacturer_excel_staging(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_ebp_excel_staging_expires ON ebp_manufacturer_excel_staging(expires_at);
