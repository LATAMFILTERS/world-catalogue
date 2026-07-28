DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (VALUES
    ('schema_migrations'),('actors'),('architecture_versions'),('change_requests'),
    ('knowledge_records'),('knowledge_record_versions'),('sources'),('record_sources'),
    ('evidence_items'),('record_evidence'),('knowledge_relationships'),('knowledge_embeddings'),
    ('candidate_cases'),('candidate_case_evidence'),('candidate_case_events'),
    ('review_assignments'),('review_decisions'),('approval_records'),
    ('publication_records'),('notification_deliveries'),('audit_log')
  ) AS required(name)
  WHERE to_regclass('knowledge_center.' || required.name) IS NULL;

  IF missing_count > 0 THEN
    RAISE EXCEPTION 'Phase 2 validation failed: % required tables missing', missing_count;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM knowledge_center.schema_migrations WHERE version = '2.0.0'
  ) THEN
    RAISE EXCEPTION 'Phase 2 schema migration marker is missing';
  END IF;

  IF to_regclass('knowledge_center.review_queue') IS NULL THEN
    RAISE EXCEPTION 'review_queue view is missing';
  END IF;

  IF to_regclass('knowledge_center.current_knowledge') IS NULL THEN
    RAISE EXCEPTION 'current_knowledge view is missing';
  END IF;
END;
$$;

DO $$
DECLARE
  test_actor uuid;
  test_record uuid;
  test_version uuid;
  blocked boolean := false;
BEGIN
  INSERT INTO knowledge_center.actors(actor_type, display_name)
  VALUES ('SYSTEM', 'phase2-validation')
  RETURNING id INTO test_actor;

  INSERT INTO knowledge_center.knowledge_records(external_id, record_type, owner_actor_id)
  VALUES ('KC-POLICY-VALIDATION', 'POLICY', test_actor)
  RETURNING id INTO test_record;

  INSERT INTO knowledge_center.knowledge_record_versions(
    record_id, version_number, schema_version, title, content, content_hash,
    change_reason, created_by
  ) VALUES (
    test_record, 1, '1.0', 'Validation record', '{}'::jsonb,
    encode(digest('phase2-validation', 'sha256'), 'hex'),
    'Validation transaction', test_actor
  ) RETURNING id INTO test_version;

  UPDATE knowledge_center.knowledge_records
  SET current_version_id = test_version
  WHERE id = test_record;

  BEGIN
    UPDATE knowledge_center.knowledge_records
    SET production_eligible = true
    WHERE id = test_record;
    SET CONSTRAINTS ALL IMMEDIATE;
  EXCEPTION WHEN OTHERS THEN
    blocked := true;
  END;

  IF NOT blocked THEN
    RAISE EXCEPTION 'Production eligibility was not blocked without approval';
  END IF;

  RAISE NOTICE 'Phase 2 validation passed';
  RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ROLLBACK_VALIDATION_TRANSACTION';
EXCEPTION
  WHEN SQLSTATE 'P0001' THEN
    IF SQLERRM <> 'ROLLBACK_VALIDATION_TRANSACTION' THEN
      RAISE;
    END IF;
END;
$$;

SELECT
  'knowledge_center_phase2' AS validation_suite,
  'PASS' AS status,
  now() AS validated_at;
