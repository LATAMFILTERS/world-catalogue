'use strict';

async function fetchApplicationPage(client, { afterSku, limit, make }) {
  const result = await client.query(`
    WITH page_skus AS (
      SELECT
        c.sku,
        c.filter_type,
        c.sub_type,
        c.duty,
        c.technology,
        c.oem_codes,
        c.competitor_codes,
        c.vehicle_applications,
        c.equipment_applications
      FROM elimfilters_catalog c
      WHERE ($2::text = '' OR c.sku > $2::text)
        AND (
          $1::text = ''
          OR (
            c.vehicle_applications IS NOT NULL
            AND jsonb_typeof(c.vehicle_applications) = 'array'
            AND c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make', $1::text))
          )
          OR (
            c.equipment_applications IS NOT NULL
            AND jsonb_typeof(c.equipment_applications) = 'array'
            AND c.equipment_applications @> jsonb_build_array(jsonb_build_object('make', $1::text))
          )
        )
      ORDER BY c.sku
      LIMIT $3::int
    ), application_rows AS (
      SELECT
        c.sku,
        c.filter_type,
        c.sub_type,
        c.duty,
        c.technology,
        c.oem_codes,
        c.competitor_codes,
        'vehicle'::text AS application_source,
        app.application
      FROM page_skus c
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN c.vehicle_applications
          ELSE '[]'::jsonb
        END
      ) app(application)

      UNION ALL

      SELECT
        c.sku,
        c.filter_type,
        c.sub_type,
        c.duty,
        c.technology,
        c.oem_codes,
        c.competitor_codes,
        'equipment'::text AS application_source,
        app.application
      FROM page_skus c
      CROSS JOIN LATERAL jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN c.equipment_applications
          ELSE '[]'::jsonb
        END
      ) app(application)

      UNION ALL

      SELECT
        c.sku,
        c.filter_type,
        c.sub_type,
        c.duty,
        c.technology,
        c.oem_codes,
        c.competitor_codes,
        'none'::text AS application_source,
        '{}'::jsonb AS application
      FROM page_skus c
      WHERE COALESCE(
              CASE WHEN jsonb_typeof(c.vehicle_applications) = 'array' THEN jsonb_array_length(c.vehicle_applications) ELSE 0 END,
              0
            ) = 0
        AND COALESCE(
              CASE WHEN jsonb_typeof(c.equipment_applications) = 'array' THEN jsonb_array_length(c.equipment_applications) ELSE 0 END,
              0
            ) = 0
    )
    SELECT application_rows.*,
           (SELECT COUNT(*)::int FROM page_skus) AS page_sku_count
    FROM application_rows
    WHERE (
      $1::text = ''
      OR UPPER(COALESCE(application->>'make', '')) = $1::text
    )
    ORDER BY sku, application_source
  `, [make, afterSku, limit]);

  return result.rows;
}

async function ensureReportTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS coverage_audit_reports (
      id bigserial PRIMARY KEY,
      engine_version text NOT NULL,
      status text NOT NULL,
      started_at timestamptz NOT NULL,
      completed_at timestamptz,
      report jsonb,
      error text
    )
  `);
}

async function saveCoverageReport(client, record) {
  await ensureReportTable(client);
  const result = await client.query(`
    INSERT INTO coverage_audit_reports (engine_version, status, started_at, completed_at, report, error)
    VALUES ($1, $2, $3, $4, $5::jsonb, $6)
    RETURNING id
  `, [record.engineVersion, record.status, record.startedAt, record.completedAt || null, record.report ? JSON.stringify(record.report) : null, record.error || null]);
  return Number(result.rows[0].id);
}

async function loadLatestCoverageReport(client) {
  await ensureReportTable(client);
  const result = await client.query(`
    SELECT id, engine_version, status, started_at, completed_at, report, error
    FROM coverage_audit_reports
    WHERE status = 'completed'
    ORDER BY completed_at DESC NULLS LAST, id DESC
    LIMIT 1
  `);
  return result.rows[0] || null;
}

module.exports = {
  fetchApplicationPage,
  ensureReportTable,
  saveCoverageReport,
  loadLatestCoverageReport,
};