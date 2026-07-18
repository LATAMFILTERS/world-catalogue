'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_024_diagnose_turbine_technology.js
 *
 * ET9 SKUs are the Racor "Turbine Series" FH fuel/water separator
 * housings and cartridges (scripts/parker_turbine_results.json), which
 * ELIMFILTERS confirmed should carry TURBOCORE™ - not HYDROCORE™ or
 * HYDROCORE/SERIES™, which is what import_donaldson.py's TECH_MAP
 * assigned before this fix (ES9, the generic Fuel/Water Separator
 * prefix, correctly keeps HYDROCORE™).
 *
 * This only counts/samples ET9 rows by their current technology value -
 * no writes.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log('\n=== ET9 (Turbine/FH) rows by current technology value ===');
  const { rows } = await client.query(`
    SELECT technology, COUNT(*) AS n
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    GROUP BY technology
    ORDER BY n DESC
  `);
  rows.forEach(r => console.log(`  ${r.technology}  |  ${r.n}`));

  console.log('\n=== Sample ET9 rows needing correction (technology NOT TURBOCORE™) ===');
  const { rows: wrong } = await client.query(`
    SELECT sku, codigo_base, filter_type, technology
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%' AND (technology IS DISTINCT FROM 'TURBOCORE™')
    ORDER BY sku
  `);
  console.log(`Count: ${wrong.length}`);
  wrong.forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}  technology=${r.technology}`));

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
