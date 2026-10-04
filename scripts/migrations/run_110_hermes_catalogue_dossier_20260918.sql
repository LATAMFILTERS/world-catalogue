CREATE TABLE IF NOT EXISTS hermes_catalogue_dossier (
  sku varchar PRIMARY KEY REFERENCES elimfilters_catalog(sku)
    ON UPDATE CASCADE ON DELETE CASCADE,
  backlog_id text REFERENCES hermes_catalogue_backlog(backlog_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  manufacturer text,
  source_code text,
  product_type text,
  product_name text,
  dossier_status text NOT NULL DEFAULT 'OPEN'
    CHECK (dossier_status IN (
      'OPEN','DOSSIER_INCOMPLETE','DOSSIER_COMPLETE',
      'REVIEW_REQUIRED','APPROVED','REJECTED'
    )),
  identity_status text,
  technical_specs_status text,
  dimensions_status text,
  oem_codes_status text,
  cross_references_status text,
  applications_status text,
  consistency_status text,
  provenance_status text,
  unresolved_axes jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicts jsonb NOT NULL DEFAULT '[]'::jsonb,
  identity jsonb NOT NULL DEFAULT '{}'::jsonb,
  technical_specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  oem_codes jsonb NOT NULL DEFAULT '{}'::jsonb,
  cross_references jsonb NOT NULL DEFAULT '{}'::jsonb,
  applications jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  consistency jsonb NOT NULL DEFAULT '{}'::jsonb,
  source_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  dossier_hash text,
  research_attempts integer NOT NULL DEFAULT 0,
  first_researched_at timestamptz,
  last_researched_at timestamptz,
  completed_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hermes_catalogue_dossier_status_idx
  ON hermes_catalogue_dossier(dossier_status);

CREATE INDEX IF NOT EXISTS hermes_catalogue_dossier_source_idx
  ON hermes_catalogue_dossier(manufacturer, source_code);

DROP VIEW IF EXISTS hermes_catalogue_dossier_progress_v;

CREATE OR REPLACE VIEW hermes_catalogue_dossier_progress_v AS
SELECT
  c.duty,
  c.technology,
  count(*)::int AS source_backlog,
  count(*) FILTER (WHERE d.dossier_status = 'DOSSIER_COMPLETE')::int AS dossier_complete,
  count(*) FILTER (WHERE d.dossier_status = 'DOSSIER_INCOMPLETE')::int AS dossier_incomplete,
  count(*) FILTER (WHERE d.dossier_status = 'REVIEW_REQUIRED')::int AS review_required,
  count(*) FILTER (WHERE d.sku IS NULL OR d.dossier_status = 'OPEN')::int AS not_started
FROM hermes_catalogue_backlog b
JOIN elimfilters_catalog c ON c.sku = b.sku
LEFT JOIN hermes_catalogue_dossier d ON d.sku = b.sku
WHERE b.gap_type = 'SOURCE' AND c.catalog_active = true
GROUP BY c.duty, c.technology;
