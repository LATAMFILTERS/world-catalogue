'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_025_fix_turbine_technology.js           (dry run — no changes)
 *   node scripts/migrations/run_025_fix_turbine_technology.js --apply   (writes changes)
 *
 * Confirmed by run_024: 16 ET9 (Turbine/FH) rows carry HYDROCORE™ or
 * HYDROCORE/SERIES™ instead of TURBOCORE™. ELIMFILTERS confirmed ET9
 * (Racor Turbine Series FH housings/cartridges) should be TURBOCORE™.
 * ES9 (generic Fuel/Water Separator) is untouched by this — it correctly
 * keeps HYDROCORE™.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  const { rows } = await client.query(`
    SELECT sku, codigo_base, technology
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%' AND technology IN ('HYDROCORE™', 'HYDROCORE/SERIES™')
    ORDER BY sku
  `);

  console.log(`Rows to fix: ${rows.length}`);
  rows.forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.technology}  ->  TURBOCORE™`));

  if (APPLY) {
    const res = await client.query(`
      UPDATE elimfilters_catalog
      SET technology = 'TURBOCORE™'
      WHERE sku LIKE 'ET9%' AND technology IN ('HYDROCORE™', 'HYDROCORE/SERIES™')
    `);
    console.log(`\n✅ Changes committed. Rows updated: ${res.rowCount}`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
