'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_030_create_kit_tables.js           (dry run — no changes)
 *   node scripts/migrations/run_030_create_kit_tables.js --apply   (writes changes)
 *
 * POST /api/kits, GET /api/kits/:kit_sku, and GET /api/filters/kits in
 * server-original.js reference maintenance_kits and kit_components
 * tables that were never created in production (confirmed by run_027:
 * "relation \"maintenance_kits\" does not exist"). Creates them with
 * CREATE TABLE IF NOT EXISTS, matching exactly the columns those
 * endpoints already read/write.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const DDL = `
CREATE TABLE IF NOT EXISTS maintenance_kits (
  kit_sku       TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  equipment_ref TEXT,
  duty          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kit_components (
  kit_sku    TEXT NOT NULL REFERENCES maintenance_kits(kit_sku) ON DELETE CASCADE,
  filter_sku TEXT NOT NULL REFERENCES elimfilters_catalog(sku) ON DELETE CASCADE,
  PRIMARY KEY (kit_sku, filter_sku)
);
`;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log('\nDDL to run:');
  console.log(DDL);

  if (APPLY) {
    await client.query(DDL);
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_name IN ('maintenance_kits', 'kit_components')
    `);
    console.log('\n✅ Tables present:', rows.map(r => r.table_name).join(', '));
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
