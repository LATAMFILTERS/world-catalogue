CREATE TABLE IF NOT EXISTS hermes_catalogue_evidence (
  evidence_id text PRIMARY KEY,
  sku varchar REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE SET NULL,
  field_group text NOT NULL CHECK (field_group IN ('SOURCE_IDENTITY','APPLICATIONS','CROSS_REFERENCES','DIMENSIONS','TECHNICAL_SPECS','IMAGE','PACKAGING')),
  field_name text,
  authority text,
  source_type text NOT NULL,
  source_url text,
  source_hash text,
  verification_status text NOT NULL CHECK (verification_status IN ('VERIFIED','REVIEW_REQUIRED','CONFLICTING','REJECTED')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hermes_catalogue_evidence_sku_idx ON hermes_catalogue_evidence(sku);
CREATE INDEX IF NOT EXISTS hermes_catalogue_evidence_group_idx ON hermes_catalogue_evidence(field_group, verification_status);

CREATE TABLE IF NOT EXISTS hermes_catalogue_readiness (
  sku varchar PRIMARY KEY REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE CASCADE,
  duty text,
  technology text,
  filter_type text,
  source_present boolean NOT NULL,
  source_verified boolean NOT NULL,
  source_primary_evidence boolean NOT NULL,
  applications_present boolean NOT NULL,
  applications_verified boolean NOT NULL,
  crossrefs_present boolean NOT NULL,
  crossrefs_verified boolean NOT NULL,
  dimensions_present boolean NOT NULL,
  dimensions_verified boolean NOT NULL,
  image_present boolean NOT NULL,
  image_verified boolean NOT NULL,
  packaging_present boolean NOT NULL,
  packaging_verified boolean NOT NULL,
  technical_ready boolean NOT NULL,
  fully_verified boolean NOT NULL,
  readiness_state text NOT NULL,
  gaps jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  assessed_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS hermes_catalogue_readiness_state_idx ON hermes_catalogue_readiness(readiness_state);
CREATE INDEX IF NOT EXISTS hermes_catalogue_readiness_duty_idx ON hermes_catalogue_readiness(duty, technology);

CREATE TABLE IF NOT EXISTS hermes_catalogue_backlog (
  backlog_id text PRIMARY KEY,
  sku varchar NOT NULL REFERENCES elimfilters_catalog(sku) ON UPDATE CASCADE ON DELETE CASCADE,
  gap_type text NOT NULL CHECK (gap_type IN ('SOURCE','APPLICATIONS','CROSS_REFERENCES','DIMENSIONS','IMAGE','PACKAGING')),
  priority integer NOT NULL CHECK (priority BETWEEN 0 AND 5),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','EVIDENCE_FOUND','REVIEW_REQUIRED','APPROVED','RESOLVED','BLOCKED')),
  manufacturer_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
  organization_candidates jsonb NOT NULL DEFAULT '[]'::jsonb,
  discovery_hints jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_action text NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE (sku, gap_type)
);
CREATE INDEX IF NOT EXISTS hermes_catalogue_backlog_open_idx ON hermes_catalogue_backlog(status, priority, gap_type);
CREATE INDEX IF NOT EXISTS hermes_catalogue_backlog_sku_idx ON hermes_catalogue_backlog(sku);

CREATE OR REPLACE VIEW hermes_catalogue_quality_summary_v AS
SELECT duty, technology,
  count(*)::int AS active_skus,
  count(*) FILTER (WHERE source_verified)::int AS source_verified,
  count(*) FILTER (WHERE applications_verified)::int AS applications_verified,
  count(*) FILTER (WHERE crossrefs_verified)::int AS crossrefs_verified,
  count(*) FILTER (WHERE dimensions_verified)::int AS dimensions_verified,
  count(*) FILTER (WHERE image_verified)::int AS image_verified,
  count(*) FILTER (WHERE packaging_verified)::int AS packaging_verified,
  count(*) FILTER (WHERE technical_ready)::int AS technical_ready,
  count(*) FILTER (WHERE fully_verified)::int AS fully_verified
FROM hermes_catalogue_readiness
GROUP BY duty, technology;
