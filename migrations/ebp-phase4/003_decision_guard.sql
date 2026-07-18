-- =============================================================================
-- EBP PHASE 4 — CORRECTION ROUND: DATABASE-LEVEL DECISION GUARD
-- File: 003_decision_guard.sql
-- Purpose: defense-in-depth for the strict Engineering Decision eligibility
--   rules (correction round, item 1). service.js already enforces these
--   rules before ever issuing the INSERT; this trigger makes it impossible
--   to bypass them even via a direct INSERT (a future bug, a migration
--   script, a different code path) — the database itself refuses an
--   ineligible APPROVED/CONDITIONALLY_APPROVED row.
-- Safe to run: YES — additive only (two trigger functions + two triggers).
--   Never touches existing data; only governs future INSERTs.
-- =============================================================================

CREATE OR REPLACE FUNCTION ebp_enforce_engineering_decision_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_offer_id                     UUID;
  v_offer_revision                INT;
  v_mechanical_result             VARCHAR(30);
  v_run_status                    VARCHAR(10);
  v_offer_status                  VARCHAR(20);
  v_offer_expires_at               TIMESTAMPTZ;
  v_fail_count                    INT;
  v_review_count                  INT;
  v_unresolved_exception_count     INT;
BEGIN
  -- Only APPROVED and CONDITIONALLY_APPROVED carry eligibility requirements;
  -- REJECTED may be recorded over any current state, and PENDING_REVIEW is
  -- exclusively system-generated (service.js never lets a human submit it).
  IF NEW.decision NOT IN ('APPROVED', 'CONDITIONALLY_APPROVED') THEN
    RETURN NEW;
  END IF;

  SELECT vr.offer_id, vr.offer_revision, vr.mechanical_result, vr.status
    INTO v_offer_id, v_offer_revision, v_mechanical_result, v_run_status
  FROM ebp_validation_runs vr WHERE vr.id = NEW.validation_run_id;

  IF v_run_status IS DISTINCT FROM 'CURRENT' THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: cannot record % on a non-CURRENT Validation Run (id=%, status=%)', NEW.decision, NEW.validation_run_id, v_run_status;
  END IF;

  SELECT o.status, o.expires_at INTO v_offer_status, v_offer_expires_at
  FROM ebp_manufacturer_offers o WHERE o.id = v_offer_id;

  IF v_offer_status IN ('REJECTED', 'SUPERSEDED', 'EXPIRED', 'WITHDRAWN') THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: offer % is % — cannot record %', v_offer_id, v_offer_status, NEW.decision;
  END IF;
  IF v_offer_expires_at IS NOT NULL AND v_offer_expires_at < NOW() THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: offer % has expired — cannot record %', v_offer_id, NEW.decision;
  END IF;

  SELECT COUNT(*) INTO v_fail_count
  FROM ebp_rule_results WHERE validation_run_id = NEW.validation_run_id AND state = 'FAIL';
  IF v_fail_count > 0 THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: % NON_WAIVABLE rule(s) FAILED — cannot record %', v_fail_count, NEW.decision;
  END IF;

  SELECT COUNT(*) INTO v_review_count
  FROM ebp_rule_results WHERE validation_run_id = NEW.validation_run_id AND state = 'REQUIRES_REVIEW';
  IF v_review_count > 0 THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: % rule(s) require further engineering review — cannot record %', v_review_count, NEW.decision;
  END IF;

  SELECT COUNT(*) INTO v_unresolved_exception_count
  FROM ebp_rule_results rr
  WHERE rr.validation_run_id = NEW.validation_run_id AND rr.state = 'REQUIRES_EXCEPTION'
    AND NOT EXISTS (
      SELECT 1 FROM ebp_engineering_exceptions ee
      WHERE ee.offer_id = v_offer_id AND ee.offer_revision = v_offer_revision
        AND ee.rule_id = rr.rule_id AND ee.rule_version = rr.rule_version AND ee.status = 'APPROVED'
    );
  IF v_unresolved_exception_count > 0 THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: % rule(s) require an APPROVED exception before % may be recorded', v_unresolved_exception_count, NEW.decision;
  END IF;

  IF NEW.decision = 'APPROVED' AND v_mechanical_result IS DISTINCT FROM 'MECHANICALLY_PASS' THEN
    RAISE EXCEPTION 'ebp_engineering_decisions: mechanical_result is % (not MECHANICALLY_PASS) — cannot APPROVE', v_mechanical_result;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ebp_enforce_engineering_decision_eligibility ON ebp_engineering_decisions;
CREATE TRIGGER trg_ebp_enforce_engineering_decision_eligibility
  BEFORE INSERT ON ebp_engineering_decisions
  FOR EACH ROW EXECUTE FUNCTION ebp_enforce_engineering_decision_eligibility();

COMMENT ON FUNCTION ebp_enforce_engineering_decision_eligibility() IS 'EBP Phase 4 correction round — database-level guard mirroring service.js''s recordEngineeringDecision eligibility rules. Defense-in-depth: makes an ineligible APPROVED/CONDITIONALLY_APPROVED row impossible even via a direct INSERT bypassing the application layer.';

-- ─── Conditions may only ever attach to a CONDITIONALLY_APPROVED decision ───

CREATE OR REPLACE FUNCTION ebp_enforce_condition_requires_conditional_approval()
RETURNS TRIGGER AS $$
DECLARE
  v_decision VARCHAR(30);
BEGIN
  SELECT decision INTO v_decision FROM ebp_engineering_decisions WHERE id = NEW.engineering_decision_id;
  IF v_decision IS DISTINCT FROM 'CONDITIONALLY_APPROVED' THEN
    RAISE EXCEPTION 'ebp_engineering_conditions: may only be attached to a CONDITIONALLY_APPROVED decision (found %)', v_decision;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_ebp_enforce_condition_requires_conditional_approval ON ebp_engineering_conditions;
CREATE TRIGGER trg_ebp_enforce_condition_requires_conditional_approval
  BEFORE INSERT ON ebp_engineering_conditions
  FOR EACH ROW EXECUTE FUNCTION ebp_enforce_condition_requires_conditional_approval();

COMMENT ON FUNCTION ebp_enforce_condition_requires_conditional_approval() IS 'EBP Phase 4 correction round — an APPROVED decision can never silently carry structured conditions (Decision 08 requires CONDITIONALLY_APPROVED for that); enforced at the database level, not just service.js.';
