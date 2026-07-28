BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS knowledge_center;

CREATE TABLE IF NOT EXISTS knowledge_center.schema_migrations (
  version text PRIMARY KEY,
  description text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  applied_by text NOT NULL DEFAULT current_user
);

CREATE TABLE IF NOT EXISTS knowledge_center.actors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type text NOT NULL CHECK (actor_type IN ('HUMAN','SERVICE','MODEL','SYSTEM')),
  display_name text NOT NULL,
  email text,
  external_subject text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.architecture_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('DRAFT','FROZEN','SUPERSEDED','RETIRED')),
  approved_by uuid REFERENCES knowledge_center.actors(id),
  approved_at timestamptz,
  manifest_path text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  change_class text NOT NULL CHECK (change_class IN ('PATCH','MINOR','MAJOR','EMERGENCY')),
  title text NOT NULL,
  rationale text NOT NULL,
  status text NOT NULL CHECK (status IN ('PROPOSED','UNDER_REVIEW','APPROVED','REJECTED','IMPLEMENTED','CLOSED')),
  requested_by uuid REFERENCES knowledge_center.actors(id),
  approved_by uuid REFERENCES knowledge_center.actors(id),
  target_version text,
  impact jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  implemented_at timestamptz
);

CREATE TABLE IF NOT EXISTS knowledge_center.knowledge_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  record_type text NOT NULL CHECK (record_type IN ('DIAGNOSTIC','ASSET','PRODUCT','SOURCE','STANDARD','TECHNOLOGY','SYSTEM','INDUSTRY','COMPONENT','PROCEDURE','POLICY')),
  lifecycle_status text NOT NULL DEFAULT 'DRAFT' CHECK (lifecycle_status IN ('DRAFT','TECHNICAL_REVIEW','APPROVED','CURRENT','LIMITED_USE','SUPERSEDED','RETIRED','REJECTED')),
  production_eligible boolean NOT NULL DEFAULT false,
  current_version_id uuid,
  owner_actor_id uuid REFERENCES knowledge_center.actors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  retired_at timestamptz
);

CREATE TABLE IF NOT EXISTS knowledge_center.knowledge_record_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id uuid NOT NULL REFERENCES knowledge_center.knowledge_records(id),
  version_number integer NOT NULL CHECK (version_number > 0),
  schema_version text NOT NULL,
  title text NOT NULL,
  summary text,
  content jsonb NOT NULL,
  content_hash text NOT NULL,
  change_reason text NOT NULL,
  created_by uuid REFERENCES knowledge_center.actors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  immutable boolean NOT NULL DEFAULT true,
  UNIQUE(record_id, version_number),
  UNIQUE(record_id, content_hash)
);

ALTER TABLE knowledge_center.knowledge_records
  ADD CONSTRAINT knowledge_records_current_version_fk
  FOREIGN KEY (current_version_id)
  REFERENCES knowledge_center.knowledge_record_versions(id)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE IF NOT EXISTS knowledge_center.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  source_type text NOT NULL,
  title text NOT NULL,
  publisher text,
  locator text,
  published_at date,
  accessed_at timestamptz,
  authority_level text NOT NULL CHECK (authority_level IN ('PRIMARY','AUTHORITATIVE','SECONDARY','FIELD_OBSERVATION','UNVERIFIED')),
  checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.record_sources (
  record_version_id uuid NOT NULL REFERENCES knowledge_center.knowledge_record_versions(id),
  source_id uuid NOT NULL REFERENCES knowledge_center.sources(id),
  support_type text NOT NULL CHECK (support_type IN ('SUPPORTS','CONTRADICTS','CONTEXT','SUPERSEDES')),
  claim_locator text,
  notes text,
  PRIMARY KEY(record_version_id, source_id, support_type)
);

CREATE TABLE IF NOT EXISTS knowledge_center.evidence_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  evidence_type text NOT NULL CHECK (evidence_type IN ('TEXT','IMAGE','VIDEO','AUDIO','DOCUMENT','MEASUREMENT','LOG','INSPECTION','FIELD_RESULT')),
  storage_uri text,
  checksum text,
  captured_at timestamptz,
  captured_by uuid REFERENCES knowledge_center.actors(id),
  verification_status text NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED','VERIFIED','REJECTED','EXPIRED')),
  sensitivity text NOT NULL DEFAULT 'INTERNAL' CHECK (sensitivity IN ('PUBLIC','INTERNAL','CONFIDENTIAL','RESTRICTED')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.record_evidence (
  record_version_id uuid NOT NULL REFERENCES knowledge_center.knowledge_record_versions(id),
  evidence_id uuid NOT NULL REFERENCES knowledge_center.evidence_items(id),
  evidence_role text NOT NULL CHECK (evidence_role IN ('SUPPORTS','CONTRADICTS','EXAMPLE','OUTCOME','REQUIRED_VERIFICATION')),
  weight numeric(5,4) CHECK (weight IS NULL OR (weight >= 0 AND weight <= 1)),
  PRIMARY KEY(record_version_id, evidence_id, evidence_role)
);

CREATE TABLE IF NOT EXISTS knowledge_center.knowledge_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_record_id uuid NOT NULL REFERENCES knowledge_center.knowledge_records(id),
  predicate text NOT NULL,
  object_record_id uuid NOT NULL REFERENCES knowledge_center.knowledge_records(id),
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','APPROVED','CURRENT','SUPERSEDED','REJECTED')),
  confidence numeric(5,4) CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1)),
  source_version_id uuid REFERENCES knowledge_center.knowledge_record_versions(id),
  created_by uuid REFERENCES knowledge_center.actors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  superseded_at timestamptz,
  CHECK (subject_record_id <> object_record_id),
  UNIQUE(subject_record_id, predicate, object_record_id, status)
);

CREATE TABLE IF NOT EXISTS knowledge_center.knowledge_embeddings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_version_id uuid NOT NULL REFERENCES knowledge_center.knowledge_record_versions(id),
  chunk_key text NOT NULL,
  chunk_text text NOT NULL,
  embedding_model text NOT NULL,
  embedding_dimensions integer NOT NULL CHECK (embedding_dimensions > 0),
  embedding_payload jsonb,
  content_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(record_version_id, chunk_key, embedding_model)
);

CREATE TABLE IF NOT EXISTS knowledge_center.candidate_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('CAPTURED','INCOMPLETE','UNDER_ANALYSIS','DUPLICATE','CLUSTERED','DRAFTED','TECHNICAL_REVIEW','APPROVED','REJECTED','PUBLISHED')),
  outcome_status text NOT NULL DEFAULT 'UNKNOWN' CHECK (outcome_status IN ('RESOLVED','PARTIALLY_RESOLVED','NOT_RESOLVED','MISDIAGNOSED','AWAITING_VERIFICATION','UNKNOWN')),
  priority text NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW','NORMAL','HIGH','CRITICAL')),
  source_channel text NOT NULL,
  protection_system text,
  technical_family text,
  asset_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  symptom_summary text NOT NULL,
  structured_intake jsonb NOT NULL DEFAULT '{}'::jsonb,
  novelty_classification text CHECK (novelty_classification IN ('KNOWN_CASE','VARIANT','ADDITIONAL_EVIDENCE','CONTRADICTION','POSSIBLE_NEW_CASE','INSUFFICIENT_INFORMATION','NON_TECHNICAL')),
  novelty_score numeric(5,4) CHECK (novelty_score IS NULL OR (novelty_score >= 0 AND novelty_score <= 1)),
  provisional_diagnosis jsonb NOT NULL DEFAULT '{}'::jsonb,
  related_record_id uuid REFERENCES knowledge_center.knowledge_records(id),
  duplicate_of_case_id uuid REFERENCES knowledge_center.candidate_cases(id),
  created_by uuid REFERENCES knowledge_center.actors(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  due_at timestamptz,
  closed_at timestamptz
);

CREATE TABLE IF NOT EXISTS knowledge_center.candidate_case_evidence (
  candidate_case_id uuid NOT NULL REFERENCES knowledge_center.candidate_cases(id),
  evidence_id uuid NOT NULL REFERENCES knowledge_center.evidence_items(id),
  evidence_role text NOT NULL CHECK (evidence_role IN ('INPUT','SUPPORTS','CONTRADICTS','OUTCOME','REQUESTED')),
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(candidate_case_id, evidence_id, evidence_role)
);

CREATE TABLE IF NOT EXISTS knowledge_center.candidate_case_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_case_id uuid NOT NULL REFERENCES knowledge_center.candidate_cases(id),
  event_type text NOT NULL,
  previous_status text,
  new_status text,
  reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  actor_id uuid REFERENCES knowledge_center.actors(id),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_case_id uuid NOT NULL REFERENCES knowledge_center.candidate_cases(id),
  assigned_to uuid REFERENCES knowledge_center.actors(id),
  queue_name text NOT NULL DEFAULT 'support@elimfilters.com',
  assignment_status text NOT NULL DEFAULT 'OPEN' CHECK (assignment_status IN ('OPEN','ACKNOWLEDGED','IN_PROGRESS','COMPLETED','CANCELLED')),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  completed_at timestamptz,
  due_at timestamptz
);

CREATE TABLE IF NOT EXISTS knowledge_center.review_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_case_id uuid NOT NULL REFERENCES knowledge_center.candidate_cases(id),
  decision text NOT NULL CHECK (decision IN ('REQUEST_MORE_EVIDENCE','MERGE_EXISTING','CREATE_DIAGNOSTIC','RETURN_TO_DRAFT','APPROVE','REJECT')),
  rationale text NOT NULL,
  target_record_id uuid REFERENCES knowledge_center.knowledge_records(id),
  decided_by uuid NOT NULL REFERENCES knowledge_center.actors(id),
  decided_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS knowledge_center.approval_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  record_version_id uuid NOT NULL REFERENCES knowledge_center.knowledge_record_versions(id),
  candidate_case_id uuid REFERENCES knowledge_center.candidate_cases(id),
  approval_scope text NOT NULL CHECK (approval_scope IN ('TECHNICAL','PRODUCTION','LIMITED_USE','RETIREMENT')),
  decision text NOT NULL CHECK (decision IN ('APPROVED','REJECTED','CONDITIONAL')),
  conditions text,
  approved_by uuid NOT NULL REFERENCES knowledge_center.actors(id),
  approved_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  revocation_reason text
);

CREATE TABLE IF NOT EXISTS knowledge_center.publication_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_version_id uuid NOT NULL REFERENCES knowledge_center.knowledge_record_versions(id),
  approval_record_id uuid NOT NULL REFERENCES knowledge_center.approval_records(id),
  publication_status text NOT NULL CHECK (publication_status IN ('QUEUED','PUBLISHED','FAILED','SUPERSEDED','RETIRED')),
  target_environment text NOT NULL CHECK (target_environment IN ('STAGING','PRODUCTION')),
  published_by uuid REFERENCES knowledge_center.actors(id),
  published_at timestamptz,
  failure_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE(record_version_id, target_environment, publication_status)
);

CREATE TABLE IF NOT EXISTS knowledge_center.notification_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_case_id uuid NOT NULL REFERENCES knowledge_center.candidate_cases(id),
  event_type text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  sender text NOT NULL DEFAULT 'support@elimfilters.com',
  recipient text NOT NULL DEFAULT 'support@elimfilters.com',
  provider text NOT NULL DEFAULT 'MICROSOFT_GRAPH',
  provider_message_id text,
  delivery_status text NOT NULL CHECK (delivery_status IN ('QUEUED','SENT','DELIVERED','BOUNCED','FAILED','ACKNOWLEDGED')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  attempted_at timestamptz,
  delivered_at timestamptz,
  acknowledged_at timestamptz,
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_id uuid REFERENCES knowledge_center.actors(id),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  correlation_id uuid,
  source_ip inet,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO knowledge_center.schema_migrations(version, description)
VALUES ('2.0.0', 'Knowledge Center Phase 2 core schema')
ON CONFLICT (version) DO NOTHING;

COMMIT;
