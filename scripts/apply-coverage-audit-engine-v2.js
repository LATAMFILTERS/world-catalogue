const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
let changed = false;

const oldParams = `  const limit = Math.min(Math.max(Number(req.query.limit) || 5000, 100), 10000);
  const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);`;
const newParams = `  const limit = Math.min(Math.max(Number(req.query.limit) || 1500, 100), 2500);
  const gapLimit = Math.min(Math.max(Number(req.query.gap_limit) || 100, 10), 500);
  const afterSku = String(req.query.after_sku || '').trim().toUpperCase();
  if (afterSku && !/^[A-Z0-9_-]{2,100}$/.test(afterSku)) {
    return res.status(400).json({ success: false, error: 'Invalid after_sku cursor.' });
  }`;
if (source.includes(oldParams)) {
  source = source.replace(oldParams, newParams);
  changed = true;
}

source = source.replace(
  `    await client.query("SET LOCAL statement_timeout = '20000'");`,
  `    await client.query("SET LOCAL statement_timeout = '12000'");`
);

const oldQuery = `       FROM elimfilters_catalog c
       CROSS JOIN LATERAL jsonb_array_elements(c.vehicle_applications) app(application)
       WHERE c.vehicle_applications IS NOT NULL
         AND jsonb_typeof(c.vehicle_applications) = 'array'
         AND ($1::text = '' OR UPPER(COALESCE(app.application->>'make','')) = $1::text)
         AND ($2::text = 'ALL' OR c.duty = $2::text)
       ORDER BY c.sku
       LIMIT $3::int\`,
      [make, duty, limit]`;
const newQuery = `       FROM elimfilters_catalog c
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
if (source.includes(oldQuery)) {
  source = source.replace(oldQuery, newQuery);
  changed = true;
}

const oldScope = `      engine_version: '20260714-coverage-audit-v1',
      read_only: true,
      scope: { make: make || 'ALL', duty, row_limit: limit, gap_limit: gapLimit },`;
const newScope = `      engine_version: '20260714-coverage-audit-v2-paginated',
      read_only: true,
      scope: { make: make || 'ALL', duty, row_limit: limit, gap_limit: gapLimit, after_sku: afterSku || null },
      pagination: {
        returned_rows: rowsResult.rows.length,
        has_more: rowsResult.rows.length === limit,
        next_after_sku: rowsResult.rows.length === limit ? rowsResult.rows[rowsResult.rows.length - 1].sku : null
      },`;
if (source.includes(oldScope)) {
  source = source.replace(oldScope, newScope);
  changed = true;
}

if (!source.includes("engine_version: '20260714-coverage-audit-v2-paginated'")) {
  throw new Error('Coverage audit v2 response marker was not applied');
}
if (!source.includes('next_after_sku')) {
  throw new Error('Coverage audit pagination was not applied');
}

if (changed) fs.writeFileSync(target, source, 'utf8');
console.log('[coverage-audit-engine] v2 paginated query enabled');
