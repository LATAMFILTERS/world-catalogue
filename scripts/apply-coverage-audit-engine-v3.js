const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
let changed = false;

// V2 limited expanded application rows. A few SKUs with thousands of applications
// consumed the whole page, so category coverage was biased toward the first air SKUs.
// V3 selects a page of catalogue SKUs first and only then expands their applications.
const oldParams = `  const limit = Math.min(Math.max(Number(req.query.limit) || 1500, 100), 2500);
  const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
  const afterSku = String(req.query.after_sku || '').trim().toUpperCase();`;
const newParams = `  const limit = Math.min(Math.max(Number(req.query.limit) || 250, 25), 750);
  const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
  const afterSku = String(req.query.after_sku || '').trim().toUpperCase();`;
if (source.includes(oldParams)) {
  source = source.replace(oldParams, newParams);
  changed = true;
}

const oldQuery = `      \`SELECT
         c.sku,
         c.filter_type,
         c.sub_type,
         c.duty,
         c.technology,
         app.application
       FROM elimfilters_catalog c
        CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
        WHERE c.vehicle_applications IS NOT NULL
          AND jsonb_typeof(c.vehicle_applications) = 'array'
          AND ($1::text = '' OR c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make', $1::text)))
          AND ($2::text = 'ALL' OR c.duty = $2::text)
          AND ($3::text = '' OR c.sku > $3::text)
          AND ($1::text = '' OR UPPER(COALESCE(app.application->>'make','')) = $1::text)
        ORDER BY c.sku
        LIMIT $4::int\`,
       [make, duty, afterSku, limit]`;

const newQuery = `      \`WITH page_skus AS (
         SELECT c.sku, c.filter_type, c.sub_type, c.duty, c.technology, c.vehicle_applications
         FROM elimfilters_catalog c
         WHERE c.vehicle_applications IS NOT NULL
           AND jsonb_typeof(c.vehicle_applications) = 'array'
           AND ($1::text = '' OR c.vehicle_applications @> jsonb_build_array(jsonb_build_object('make', $1::text)))
           AND ($2::text = 'ALL' OR c.duty = $2::text)
           AND ($3::text = '' OR c.sku > $3::text)
         ORDER BY c.sku
         LIMIT $4::int
       )
       SELECT
         c.sku,
         c.filter_type,
         c.sub_type,
         c.duty,
         c.technology,
         app.application,
         (SELECT COUNT(*)::int FROM page_skus) AS page_sku_count
       FROM page_skus c
       CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
       WHERE ($1::text = '' OR UPPER(COALESCE(app.application->>'make','')) = $1::text)
       ORDER BY c.sku\`,
       [make, duty, afterSku, limit]`;

if (source.includes(oldQuery)) {
  source = source.replace(oldQuery, newQuery);
  changed = true;
} else if (!source.includes('WITH page_skus AS')) {
  throw new Error('Coverage audit v2 query was not found for v3 replacement');
}

const oldScope = `      engine_version: '20260714-coverage-audit-v2-paginated',
       read_only: true,
       scope: { make: make || 'ALL', duty, row_limit: limit, gap_limit: gapLimit, after_sku: afterSku || null },
       pagination: {
         returned_rows: rowsResult.rows.length,
         has_more: rowsResult.rows.length === limit,
         next_after_sku: rowsResult.rows.length === limit ? rowsResult.rows[rowsResult.rows.length - 1].sku : null
       },`;

const newScope = `      engine_version: '20260714-coverage-audit-v3-sku-pages',
       read_only: true,
       scope: { make: make || 'ALL', duty, sku_limit: limit, gap_limit: gapLimit, after_sku: afterSku || null },
       pagination: {
         returned_application_rows: rowsResult.rows.length,
         returned_skus: rowsResult.rows.length ? Number(rowsResult.rows[0].page_sku_count || 0) : 0,
         has_more: rowsResult.rows.length ? Number(rowsResult.rows[0].page_sku_count || 0) === limit : false,
         next_after_sku: rowsResult.rows.length ? rowsResult.rows[rowsResult.rows.length - 1].sku : null
       },`;

if (source.includes(oldScope)) {
  source = source.replace(oldScope, newScope);
  changed = true;
} else if (!source.includes("engine_version: '20260714-coverage-audit-v3-sku-pages'")) {
  throw new Error('Coverage audit v2 response block was not found');
}

if (!source.includes('WITH page_skus AS')) {
  throw new Error('Coverage audit SKU-first pagination was not applied');
}
if (!source.includes("engine_version: '20260714-coverage-audit-v3-sku-pages'")) {
  throw new Error('Coverage audit v3 response marker was not applied');
}

if (changed) fs.writeFileSync(target, source, 'utf8');
console.log('[coverage-audit-engine] v3 SKU-first pagination enabled');
