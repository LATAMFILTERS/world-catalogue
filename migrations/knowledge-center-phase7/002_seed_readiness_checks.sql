BEGIN;

INSERT INTO knowledge_center.production_readiness_checks(check_key, environment, status, notes)
SELECT check_key, 'STAGING', 'PENDING', 'Phase 7 required release control'
FROM (VALUES
  ('migrations.validated'),
  ('backup.restore_verified'),
  ('database.least_privilege_verified'),
  ('secrets.externalized'),
  ('identity_gateway.validated'),
  ('actor_mapping.validated'),
  ('meta_signatures.validated'),
  ('internal_secrets.validated'),
  ('channel_idempotency.validated'),
  ('governance_boundaries.validated'),
  ('runtime_retrieval_scope.validated'),
  ('runtime_contradiction_verify.validated'),
  ('runtime_missing_evidence_escalate.validated'),
  ('runtime_bypass_stop.validated'),
  ('reasoning_trace.validated'),
  ('log_redaction.validated'),
  ('health_readiness.validated'),
  ('alerts_and_ownership.configured'),
  ('rollback.rehearsed'),
  ('accessibility.validated')
) AS checks(check_key)
ON CONFLICT (check_key, environment) DO NOTHING;

COMMIT;
