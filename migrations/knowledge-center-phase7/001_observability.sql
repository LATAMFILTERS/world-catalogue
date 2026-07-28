BEGIN;

CREATE TABLE IF NOT EXISTS knowledge_center.service_health_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_name text NOT NULL,
  environment text NOT NULL,
  status text NOT NULL CHECK (status IN ('HEALTHY','DEGRADED','UNHEALTHY','MAINTENANCE')),
  component text,
  correlation_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.runtime_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  service_name text NOT NULL,
  metric_name text NOT NULL,
  metric_value numeric NOT NULL,
  unit text,
  labels jsonb NOT NULL DEFAULT '{}'::jsonb,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_center.production_readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_key text NOT NULL,
  environment text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING','PASS','FAIL','WAIVED')),
  evidence_uri text,
  notes text,
  checked_by uuid REFERENCES knowledge_center.actors(id),
  checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(check_key, environment)
);

CREATE TABLE IF NOT EXISTS knowledge_center.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id text NOT NULL UNIQUE,
  severity text NOT NULL CHECK (severity IN ('SEV1','SEV2','SEV3','SEV4')),
  status text NOT NULL CHECK (status IN ('OPEN','MITIGATED','RESOLVED','CLOSED')),
  title text NOT NULL,
  summary text NOT NULL,
  affected_services text[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL,
  mitigated_at timestamptz,
  resolved_at timestamptz,
  owner_actor_id uuid REFERENCES knowledge_center.actors(id),
  correlation_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_health_events_lookup
  ON knowledge_center.service_health_events(service_name, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_runtime_metrics_lookup
  ON knowledge_center.runtime_metrics(service_name, metric_name, observed_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_status
  ON knowledge_center.incidents(status, severity, started_at DESC);

INSERT INTO knowledge_center.schema_migrations(version, description)
VALUES ('7.0.0', 'Knowledge Center Phase 7 observability and production readiness')
ON CONFLICT (version) DO NOTHING;

COMMIT;
