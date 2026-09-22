-- =============================================================================
-- EBP PHASE 1 — INDUSTRIAL & PROCESS DUTY EXTENSION
-- Purpose: Allow governed Industrial & Process pre-SKU Product Engineering
--          Passports without misclassifying them as Heavy Duty.
-- Safe to run: YES (replaces only the duty CHECK constraint).
-- =============================================================================

ALTER TABLE ebp_engineering_passports
  DROP CONSTRAINT IF EXISTS ebp_engineering_passports_duty_check;

ALTER TABLE ebp_engineering_passports
  ADD CONSTRAINT ebp_engineering_passports_duty_check
  CHECK (duty IN ('HEAVY_DUTY', 'LIGHT_DUTY', 'INDUSTRIAL_PROCESS'));

COMMENT ON COLUMN ebp_engineering_passports.duty IS
  'Product duty domain. INDUSTRIAL_PROCESS is reserved for governed Industrial & Process products and pre-SKU drafts; it must not be collapsed into HEAVY_DUTY.';
