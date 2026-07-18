'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_027_diagnose_es9_and_kits.js
 *
 * Two checks:
 * 1. ES9 (generic Fuel/Water Separator) has no local scraped source file
 *    in this repo (unlike EL8/EF9/ET9/etc.). This checks whether any ES9
 *    rows actually exist live, and dumps their current data so a source
 *    file can be reverse-engineered from real data instead of invented.
 * 2. Existing maintenance_kits / kit_components tables (used by
 *    POST /api/kits) - checks whether any kits already exist and whether
 *    any have the wrong EK5/EK3 prefix for their duty (bug fixed in
 *    server-original.js's kit creation endpoint - this only reports,
 *    does not correct existing rows).
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

  console.log('\n=== ES9 (generic Fuel/Water Separator) rows ===');
  const { rows: es9 } = await client.query(`
    SELECT sku, codigo_base, filter_type, sub_type, technology, description,
           outer_diameter_mm, height_mm, thread_size
    FROM elimfilters_catalog
    WHERE sku LIKE 'ES9%'
    ORDER BY sku
  `);
  console.log(`Count: ${es9.length}`);
  es9.forEach(r => {
    console.log(`  ${r.sku}  (${r.codigo_base})  filter_type=${r.filter_type}  technology=${r.technology}`);
  });
  if (es9.length) {
    console.log('\nFull row sample (first 3):');
    es9.slice(0, 3).forEach(r => console.log(JSON.stringify(r, null, 2)));
  }

  console.log('\n=== maintenance_kits table ===');
  try {
    const { rows: kitCount } = await client.query(`SELECT COUNT(*) FROM maintenance_kits`);
    console.log(`Total kits: ${kitCount[0].count}`);

    const { rows: kits } = await client.query(`
      SELECT mk.kit_sku, mk.name, mk.equipment_ref, mk.duty, COUNT(kc.filter_sku) AS n_components
      FROM maintenance_kits mk
      LEFT JOIN kit_components kc ON kc.kit_sku = mk.kit_sku
      GROUP BY mk.kit_sku, mk.name, mk.equipment_ref, mk.duty
      ORDER BY mk.kit_sku
      LIMIT 30
    `);
    kits.forEach(r => console.log(`  ${r.kit_sku}  duty=${r.duty}  components=${r.n_components}  name=${r.name}  equipment_ref=${r.equipment_ref}`));

    console.log('\n=== Mismatched prefix vs duty (bug check) ===');
    const { rows: mismatched } = await client.query(`
      SELECT kit_sku, duty FROM maintenance_kits
      WHERE (duty = 'HEAVY_DUTY' AND kit_sku NOT LIKE 'EK5%')
         OR (duty = 'LIGHT_DUTY' AND kit_sku NOT LIKE 'EK3%')
    `);
    console.log(`Mismatched: ${mismatched.length}`);
    mismatched.forEach(r => console.log(`  ${r.kit_sku}  duty=${r.duty}`));
  } catch (e) {
    console.log(`maintenance_kits table check failed: ${e.message}`);
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
