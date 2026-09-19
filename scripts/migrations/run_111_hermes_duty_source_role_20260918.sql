ALTER TABLE hermes_catalogue_dossier
  ADD COLUMN IF NOT EXISTS market_segment text,
  ADD COLUMN IF NOT EXISTS canonical_role text,
  ADD COLUMN IF NOT EXISTS canonical_role_reason text;

ALTER TABLE hermes_catalogue_dossier
  DROP CONSTRAINT IF EXISTS hermes_catalogue_dossier_canonical_role_check;

ALTER TABLE hermes_catalogue_dossier
  ADD CONSTRAINT hermes_catalogue_dossier_canonical_role_check
  CHECK (
    canonical_role IS NULL OR canonical_role IN (
      'CANONICAL_BASE','COMPETITOR_CODE','REVIEW_REQUIRED'
    )
  );

CREATE INDEX IF NOT EXISTS hermes_catalogue_dossier_role_idx
  ON hermes_catalogue_dossier(canonical_role, dossier_status);
DROP VIEW IF EXISTS hermes_catalogue_dossier_progress_v;

CREATE VIEW hermes_catalogue_dossier_progress_v AS
SELECT
  c.duty,
  c.technology,
  count(*)::int AS source_backlog,
  count(*) FILTER (
    WHERE d.dossier_status = 'DOSSIER_COMPLETE'
      AND d.canonical_role = 'CANONICAL_BASE'
  )::int AS source_close_ready,
  count(*) FILTER (
    WHERE d.dossier_status = 'DOSSIER_COMPLETE'
      AND d.canonical_role = 'COMPETITOR_CODE'
  )::int AS competitor_dossier_complete,
  count(*) FILTER (
    WHERE d.dossier_status = 'DOSSIER_INCOMPLETE'
       OR d.canonical_role = 'REVIEW_REQUIRED'
  )::int AS dossier_incomplete_or_review,
  count(*) FILTER (
    WHERE d.sku IS NULL OR d.dossier_status = 'OPEN'
  )::int AS not_started
FROM hermes_catalogue_backlog b
JOIN elimfilters_catalog c ON c.sku = b.sku
LEFT JOIN hermes_catalogue_dossier d ON d.sku = b.sku
WHERE b.gap_type = 'SOURCE' AND c.catalog_active = true
GROUP BY c.duty, c.technology;
