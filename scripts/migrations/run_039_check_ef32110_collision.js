'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_039_check_ef32110_collision.js
 *
 * run_037 found EF32110 already exists (codigo_base=2110). Before
 * picking a different SKU for the new Toyota RAV4 2022 fuel filter
 * (OEM 77024-42110), check what EF32110 actually is - a coincidental
 * collision with an unrelated vehicle's MANN part number also ending
 * in 2110, or already the same product.
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

  const { rows } = await client.query(`
    SELECT * FROM elimfilters_catalog WHERE sku = 'EF32110'
  `);
  if (!rows.length) {
    console.log('EF32110 not found (unexpected).');
  } else {
    console.log(JSON.stringify(rows[0], null, 2));
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
