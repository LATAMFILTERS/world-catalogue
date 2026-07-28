BEGIN;

CREATE TABLE IF NOT EXISTS knowledge_center.reasoning_traces (
  id uuid PRIMARY KEY,
  correlation_id uuid,
  candidate_case_id uuid REFERENCES knowledge_center.candidate_cases(id),
  audience text NOT NULL CHECK (audience IN ('TECHNICAL_SUPPORT','DISTRIBUTOR','CUSTOMER','INTERNAL_ENGINEERING')),
  channel text NOT NULL,
  query_text text NOT NULL,
  action text NOT NULL CHECK (action IN ('ANSWER','VERIFY','ESCALATE','STOP')),
  confidence numeric(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  retrieved_version_ids uuid[] NOT NULL DEFAULT '{}',
  response_payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reasoning_traces_candidate_case_idx ON knowledge_center.reasoning_traces(candidate_case_id, created_at DESC);
CREATE INDEX IF NOT EXISTS reasoning_traces_action_idx ON knowledge_center.reasoning_traces(action, created_at DESC);
CREATE INDEX IF NOT EXISTS reasoning_traces_correlation_idx ON knowledge_center.reasoning_traces(correlation_id) WHERE correlation_id IS NOT NULL;

CREATE OR REPLACE FUNCTION knowledge_center.block_reasoning_trace_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'reasoning traces are append-only';
END;
$$;

DROP TRIGGER IF EXISTS reasoning_traces_immutable ON knowledge_center.reasoning_traces;
CREATE TRIGGER reasoning_traces_immutable BEFORE UPDATE OR DELETE ON knowledge_center.reasoning_traces
FOR EACH ROW EXECUTE FUNCTION knowledge_center.block_reasoning_trace_mutation();

INSERT INTO knowledge_center.schema_migrations(version, description)
VALUES ('6.0.0', 'Knowledge Engine Runtime reasoning traces')
ON CONFLICT (version) DO NOTHING;

COMMIT;