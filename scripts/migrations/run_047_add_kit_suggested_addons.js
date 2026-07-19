'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_047_add_kit_suggested_addons.js           (dry run — no changes)
 *   node scripts/migrations/run_047_add_kit_suggested_addons.js --apply   (writes changes)
 *
 * Creates kit_suggested_addons, mirroring kit_components' shape but for
 * filters recommended alongside a kit rather than bundled inside it (e.g.
 * an air filter offered as an optional add-on instead of forced into
 * every kit box — different service interval, separate purchase decision).
 * POST /api/kits/:kit_sku/suggested-addons and the suggested_addons field
 * on GET /api/kits/:kit_sku (server-original.js) read/write this table.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const DDL = `
CREATE TABLE IF NOT EXISTS kit_suggested_addons (
  kit_sku    TEXT NOT NULL REFERENCES maintenance_kits(kit_sku) ON DELETE CASCADE,
  filter_sku TEXT NOT NULL REFERENCES elimfilters_catalog(sku) ON DELETE CASCADE,
  note       TEXT,
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
      WHERE table_name = 'kit_suggested_addons'
    `);
    console.log('\n✅ Table present:', rows.map(r => r.table_name).join(', '));
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
