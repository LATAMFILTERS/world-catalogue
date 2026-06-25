'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_013_drop_codigo_base_unique.js
 *
 * Drops the UNIQUE(codigo_base) index that blocks LD products from importing
 * when different filter types share the same last-4-digit suffix.
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

  console.log('Dropping ux_catalog_codigo_base unique index...');
  await client.query('DROP INDEX IF EXISTS ux_catalog_codigo_base');
  console.log('✅ Dropped ux_catalog_codigo_base');

  console.log('Creating non-unique idx_catalog_codigo_base for fast lookups...');
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_catalog_codigo_base
    ON elimfilters_catalog(codigo_base)
  `);
  console.log('✅ Created idx_catalog_codigo_base');

  // Verify
  const check = await client.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'elimfilters_catalog'
      AND indexname LIKE '%codigo_base%'
  `);
  console.log('\nCurrent codigo_base indexes:');
  check.rows.forEach(r => console.log(' ', r.indexname, '|', r.indexdef));

  await client.end();
  console.log('\nDone. Re-run the Mann LD import to load the remaining products.');
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
