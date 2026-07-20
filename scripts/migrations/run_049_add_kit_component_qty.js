'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_049_add_kit_component_qty.js           (dry run — no changes)
 *   node scripts/migrations/run_049_add_kit_component_qty.js --apply   (writes changes)
 *
 * Adds a qty column to kit_components. Needed starting with run_050:
 * several Fleetguard-sourced kits use more than one of a given filter
 * (e.g. 4x oil filter in parallel), and until now kit_components had no
 * way to record that - every component was implicitly qty=1.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const DDL = `
ALTER TABLE kit_components ADD COLUMN IF NOT EXISTS qty INTEGER NOT NULL DEFAULT 1;
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
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'kit_components' AND column_name = 'qty'
    `);
    console.log('\n✅ Column present:', rows[0]);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
