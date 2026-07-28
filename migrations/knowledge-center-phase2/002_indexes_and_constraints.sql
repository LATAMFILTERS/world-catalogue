BEGIN;

CREATE INDEX IF NOT EXISTS idx_kc_records_type_status
  ON knowledge_center.knowledge_records(record_type, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_kc_records_production
  ON knowledge_center.knowledge_records(production_eligible)
  WHERE production_eligible = true;
CREATE INDEX IF NOT EXISTS idx_kc_versions_record_created
  ON knowledge_center.knowledge_record_versions(record_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_kc_versions_content_gin
  ON knowledge_center.knowledge_record_versions USING gin(content);
CREATE INDEX IF NOT EXISTS idx_kc_sources_authority
  ON knowledge_center.sources(authority_level, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_kc_evidence_status
  ON knowledge_center.evidence_items(verification_status, evidence_type);
CREATE INDEX IF NOT EXISTS idx_kc_relationship_subject
  ON knowledge_center.knowledge_relationships(subject_record_id, predicate, status);
CREATE INDEX IF NOT EXISTS idx_kc_relationship_object
  ON knowledge_center.knowledge_relationships(object_record_id, predicate, status);
CREATE INDEX IF NOT EXISTS idx_kc_candidate_queue
  ON knowledge_center.candidate_cases(status, priority, due_at, created_at);
CREATE INDEX IF NOT EXISTS idx_kc_candidate_novelty
  ON knowledge_center.candidate_cases(novelty_classification, novelty_score DESC);
CREATE INDEX IF NOT EXISTS idx_kc_case_events
  ON knowledge_center.candidate_case_events(candidate_case_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_kc_review_open
  ON knowledge_center.review_assignments(queue_name, assignment_status, due_at)
  WHERE assignment_status IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS');
CREATE INDEX IF NOT EXISTS idx_kc_notifications_pending
  ON knowledge_center.notification_deliveries(delivery_status, created_at)
  WHERE delivery_status IN ('QUEUED','FAILED');
CREATE INDEX IF NOT EXISTS idx_kc_audit_entity
  ON knowledge_center.audit_log(entity_type, entity_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_kc_audit_correlation
  ON knowledge_center.audit_log(correlation_id)
  WHERE correlation_id IS NOT NULL;

CREATE OR REPLACE FUNCTION knowledge_center.prevent_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Knowledge record versions are append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_version_update ON knowledge_center.knowledge_record_versions;
CREATE TRIGGER trg_prevent_version_update
BEFORE UPDATE OR DELETE ON knowledge_center.knowledge_record_versions
FOR EACH ROW EXECUTE FUNCTION knowledge_center.prevent_version_mutation();

CREATE OR REPLACE FUNCTION knowledge_center.prevent_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log is append-only';
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_audit_update ON knowledge_center.audit_log;
CREATE TRIGGER trg_prevent_audit_update
BEFORE UPDATE OR DELETE ON knowledge_center.audit_log
FOR EACH ROW EXECUTE FUNCTION knowledge_center.prevent_audit_mutation();

CREATE OR REPLACE FUNCTION knowledge_center.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_actor_updated_at ON knowledge_center.actors;
CREATE TRIGGER trg_actor_updated_at
BEFORE UPDATE ON knowledge_center.actors
FOR EACH ROW EXECUTE FUNCTION knowledge_center.set_updated_at();

DROP TRIGGER IF EXISTS trg_record_updated_at ON knowledge_center.knowledge_records;
CREATE TRIGGER trg_record_updated_at
BEFORE UPDATE ON knowledge_center.knowledge_records
FOR EACH ROW EXECUTE FUNCTION knowledge_center.set_updated_at();

DROP TRIGGER IF EXISTS trg_candidate_updated_at ON knowledge_center.candidate_cases;
CREATE TRIGGER trg_candidate_updated_at
BEFORE UPDATE ON knowledge_center.candidate_cases
FOR EACH ROW EXECUTE FUNCTION knowledge_center.set_updated_at();

CREATE OR REPLACE FUNCTION knowledge_center.enforce_current_version_owner()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  owning_record uuid;
BEGIN
  IF NEW.current_version_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT record_id INTO owning_record
  FROM knowledge_center.knowledge_record_versions
  WHERE id = NEW.current_version_id;

  IF owning_record IS DISTINCT FROM NEW.id THEN
    RAISE EXCEPTION 'current_version_id must belong to the same knowledge record';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_current_version_owner ON knowledge_center.knowledge_records;
CREATE CONSTRAINT TRIGGER trg_current_version_owner
AFTER INSERT OR UPDATE OF current_version_id ON knowledge_center.knowledge_records
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION knowledge_center.enforce_current_version_owner();

CREATE OR REPLACE FUNCTION knowledge_center.enforce_production_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.production_eligible = true THEN
    IF NEW.current_version_id IS NULL THEN
      RAISE EXCEPTION 'Production-eligible records require a current version';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM knowledge_center.approval_records ar
      WHERE ar.record_version_id = NEW.current_version_id
        AND ar.decision = 'APPROVED'
        AND ar.approval_scope IN ('TECHNICAL','PRODUCTION')
        AND ar.revoked_at IS NULL
    ) THEN
      RAISE EXCEPTION 'Production eligibility requires an active approval record';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_production_approval ON knowledge_center.knowledge_records;
CREATE CONSTRAINT TRIGGER trg_production_approval
AFTER INSERT OR UPDATE OF production_eligible, current_version_id ON knowledge_center.knowledge_records
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION knowledge_center.enforce_production_approval();

CREATE OR REPLACE FUNCTION knowledge_center.enforce_publication_approval()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  approved_version uuid;
  approval_decision text;
  approval_revoked timestamptz;
BEGIN
  SELECT record_version_id, decision, revoked_at
  INTO approved_version, approval_decision, approval_revoked
  FROM knowledge_center.approval_records
  WHERE id = NEW.approval_record_id;

  IF approved_version IS DISTINCT FROM NEW.record_version_id
     OR approval_decision <> 'APPROVED'
     OR approval_revoked IS NOT NULL THEN
    RAISE EXCEPTION 'Publication requires an active approval for the same record version';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_publication_approval ON knowledge_center.publication_records;
CREATE TRIGGER trg_publication_approval
BEFORE INSERT OR UPDATE ON knowledge_center.publication_records
FOR EACH ROW EXECUTE FUNCTION knowledge_center.enforce_publication_approval();

CREATE OR REPLACE FUNCTION knowledge_center.log_candidate_state_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO knowledge_center.candidate_case_events(
      candidate_case_id,
      event_type,
      previous_status,
      new_status,
      reason,
      payload
    ) VALUES (
      NEW.id,
      'STATUS_CHANGED',
      OLD.status,
      NEW.status,
      'Database state transition',
      jsonb_build_object('priority', NEW.priority)
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_candidate_state_event ON knowledge_center.candidate_cases;
CREATE TRIGGER trg_candidate_state_event
AFTER UPDATE OF status ON knowledge_center.candidate_cases
FOR EACH ROW EXECUTE FUNCTION knowledge_center.log_candidate_state_change();

CREATE OR REPLACE VIEW knowledge_center.review_queue AS
SELECT
  c.id,
  c.external_id,
  c.status,
  c.priority,
  c.protection_system,
  c.technical_family,
  c.symptom_summary,
  c.novelty_classification,
  c.novelty_score,
  c.created_at,
  COALESCE(ra.due_at, c.due_at) AS due_at,
  ra.queue_name,
  ra.assignment_status,
  ra.assigned_to
FROM knowledge_center.candidate_cases c
LEFT JOIN LATERAL (
  SELECT r.*
  FROM knowledge_center.review_assignments r
  WHERE r.candidate_case_id = c.id
    AND r.assignment_status IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS')
  ORDER BY r.assigned_at DESC
  LIMIT 1
) ra ON true
WHERE c.status NOT IN ('APPROVED','REJECTED','PUBLISHED');

CREATE OR REPLACE VIEW knowledge_center.current_knowledge AS
SELECT
  r.id,
  r.external_id,
  r.record_type,
  r.lifecycle_status,
  r.production_eligible,
  v.id AS version_id,
  v.version_number,
  v.schema_version,
  v.title,
  v.summary,
  v.content,
  v.content_hash,
  v.created_at AS version_created_at
FROM knowledge_center.knowledge_records r
JOIN knowledge_center.knowledge_record_versions v
  ON v.id = r.current_version_id;

COMMIT;
