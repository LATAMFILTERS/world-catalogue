-- =============================================================================
-- EBP PHASE 5 — OVERRIDE GUARD
-- File: 002_override_guard.sql
-- Purpose: database-level enforcement (mirroring Phase 4's decision-guard
--   pattern, ADR-0052) that a Manual Override's two actions are never
--   performed by the same declared actor, and that an approved override
--   can only ever name an Offer that was Eligible in the same Selection
--   Run — never a technically/commercially ineligible candidate.
-- Safe to run: YES — additive only (two trigger functions + one trigger
--   on ebp_selection_overrides, a Phase 5 table). No Phase 1/2/3/4 table
--   touched.
-- =============================================================================

CREATE OR REPLACE FUNCTION ebp_enforce_selection_override_guard()
RETURNS TRIGGER AS $$
DECLARE
  v_eligible BOOLEAN;
BEGIN
  -- Decision 05/ADR-0066: the same declared actor can never both request
  -- and decide the same override.
  IF NEW.decided_by IS NOT NULL AND NEW.decided_by = NEW.requested_by THEN
    RAISE EXCEPTION 'selection override %: requested_by and decided_by must be different declared actors', NEW.id;
  END IF;

  -- Decision 08/Principle 2 (Manual Override, MANUFACTURER_SELECTION_ENGINE.md
  -- §8): an override can only ever select among Eligible candidates in the
  -- same run — it can never promote an excluded/ineligible Offer.
  IF NEW.status = 'APPROVED' THEN
    SELECT eligible INTO v_eligible
    FROM ebp_selection_candidates
    WHERE selection_run_id = NEW.selection_run_id AND offer_id = NEW.requested_offer_id;

    IF v_eligible IS NULL OR v_eligible = FALSE THEN
      RAISE EXCEPTION 'selection override %: requested_offer_id % is not an Eligible candidate in selection_run %', NEW.id, NEW.requested_offer_id, NEW.selection_run_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_ebp_enforce_selection_override_guard
  BEFORE INSERT OR UPDATE ON ebp_selection_overrides
  FOR EACH ROW EXECUTE FUNCTION ebp_enforce_selection_override_guard();

COMMENT ON FUNCTION ebp_enforce_selection_override_guard() IS 'EBP Phase 5 — re-derives the two-actor and Eligible-candidate-only override constraints directly from ebp_selection_overrides/ebp_selection_candidates, independent of service.js, so a future bug or ad hoc migration can never insert an invalid override (mirrors Phase 4''s ebp_enforce_engineering_decision_eligibility pattern, ADR-0052).';
