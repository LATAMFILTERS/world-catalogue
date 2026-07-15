const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '..', 'server-original.js');
let source = fs.readFileSync(target, 'utf8');
let changed = false;

const routeMarker = "app.get('/api/audit/coverage-engine'";
const routeStart = source.indexOf(routeMarker);
if (routeStart === -1) throw new Error('Coverage audit route not found');

const routeEnd = source.indexOf('\n});', routeStart);
if (routeEnd === -1) throw new Error('Coverage audit route end not found');

let route = source.slice(routeStart, routeEnd + 4);

// V3 paginates catalogue SKUs before expanding vehicle_applications.
route = route.replace(
  /const limit = Math\.min\(Math\.max\(Number\(req\.query\.limit\) \|\| \d+, \d+\), \d+\);/,
  "const limit = Math.min(Math.max(Number(req.query.limit) || 250, 25), 750);"
);

const queryStartMarker = '    const rowsResult = await client.query(';
const queryStart = route.indexOf(queryStartMarker);
if (queryStart === -1) throw new Error('Coverage audit query start not found');

const queryEndMarker = '\n    );';
const queryEnd = route.indexOf(queryEndMarker, queryStart);
if (queryEnd === -1) throw new Error('Coverage audit query end not found');

const replacementQuery = `    const rowsResult = await client.query(
      \`WITH page_skus AS (
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
      [make, duty, afterSku, limit]
    );`;

route = route.slice(0, queryStart) + replacementQuery + route.slice(queryEnd + queryEndMarker.length);
changed = true;

const responseStart = route.indexOf('    return res.json({');
if (responseStart === -1) throw new Error('Coverage audit response start not found');

const versionPos = route.indexOf("engine_version:", responseStart);
const limitationPos = route.indexOf("      limitation:", versionPos);
if (versionPos === -1 || limitationPos === -1) throw new Error('Coverage audit response metadata block not found');

const metadataReplacement = `engine_version: '20260714-coverage-audit-v3-sku-pages',
      read_only: true,
      scope: { make: make || 'ALL', duty, sku_limit: limit, gap_limit: gapLimit, after_sku: afterSku || null },
      pagination: {
        returned_application_rows: rowsResult.rows.length,
        returned_skus: rowsResult.rows.length ? Number(rowsResult.rows[0].page_sku_count || 0) : 0,
        has_more: rowsResult.rows.length ? Number(rowsResult.rows[0].page_sku_count || 0) === limit : false,
        next_after_sku: rowsResult.rows.length ? rowsResult.rows[rowsResult.rows.length - 1].sku : null
      },
`;

route = route.slice(0, versionPos) + metadataReplacement + route.slice(limitationPos);

if (!route.includes('WITH page_skus AS')) throw new Error('Coverage audit SKU-first query was not applied');
if (!route.includes("engine_version: '20260714-coverage-audit-v3-sku-pages'")) throw new Error('Coverage audit v3 marker was not applied');
if (!route.includes('returned_skus:')) throw new Error('Coverage audit SKU pagination metadata missing');

source = source.slice(0, routeStart) + route + source.slice(routeEnd + 4);
if (changed) fs.writeFileSync(target, source, 'utf8');
console.log('[coverage-audit-engine] v3 SKU-first pagination enabled');
