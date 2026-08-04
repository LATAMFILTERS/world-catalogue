DO $$
BEGIN
  IF to_regclass('bot_governance.knowledge_gaps') IS NULL THEN
    RAISE EXCEPTION 'Validation failed: bot_governance.knowledge_gaps table missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM bot_governance.schema_migrations WHERE version = '1.0.0'
  ) THEN
    RAISE EXCEPTION 'Validation failed: bot-knowledge-gap-store schema migration marker is missing';
  END IF;
END;
$$;

DO $$
DECLARE
  duplicate_blocked boolean := false;
BEGIN
  INSERT INTO bot_governance.knowledge_gaps
    (request_id, request_type, origin, question, reason, requested_by, deduplication_key)
  VALUES
    ('VALIDATION-REQ-1', 'oem_maintenance_interval', 'bot_orchestrator', 'validation question', 'validation reason', 'validation-suite', 'validation-dedup-key');

  BEGIN
    INSERT INTO bot_governance.knowledge_gaps
      (request_id, request_type, origin, question, reason, requested_by, deduplication_key)
    VALUES
      ('VALIDATION-REQ-2', 'oem_maintenance_interval', 'bot_orchestrator', 'validation question 2', 'validation reason 2', 'validation-suite', 'validation-dedup-key');
  EXCEPTION WHEN unique_violation THEN
    duplicate_blocked := true;
  END;

  IF NOT duplicate_blocked THEN
    RAISE EXCEPTION 'Validation failed: duplicate deduplication_key was not blocked';
  END IF;

  DELETE FROM bot_governance.knowledge_gaps WHERE request_id = 'VALIDATION-REQ-1';

  RAISE NOTICE 'bot-knowledge-gap-store validation passed';
END;
$$;

SELECT
  'bot_knowledge_gap_store' AS validation_suite,
  'PASS' AS status,
  now() AS validated_at;
