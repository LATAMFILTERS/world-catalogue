'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_014_rename_deprecated_technologies.js
 *
 * HYDROCORE™ respectively. The frontend, search-result link maps, and
 * knowledge-graph taxonomy have already been updated to the new names, but
 * elimfilters_catalog.technology (the column /api/search and /api/autocomplete
 * read directly) was never rewritten — see migrations/kg-phase1/005_populate_
 * renders a technology badge in Part Search results with no working link,
 * since the retired names were intentionally removed from the route map.
 *
 * This updates the raw catalog rows so search results link correctly again.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const RENAMES = [
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const { from, to } of RENAMES) {
    const result = await client.query(
      'UPDATE elimfilters_catalog SET technology = $2 WHERE technology = $1',
      [from, to]
    );
    console.log(`✅ ${from} → ${to}: ${result.rowCount} rows updated`);
  }

  const remaining = await client.query(
    `SELECT sku, technology FROM elimfilters_catalog
  );
  if (remaining.rows.length > 0) {
    console.log('\n⚠ Rows still referencing a retired technology name (manual review needed):');
    remaining.rows.forEach(r => console.log(' ', r.sku, '|', r.technology));
  } else {
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
