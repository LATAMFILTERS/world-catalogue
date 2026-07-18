'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_033_add_kit_brand_codes.js           (dry run — no changes)
 *   node scripts/migrations/run_033_add_kit_brand_codes.js --apply   (writes changes)
 *
 * Kit SKU numbering scheme confirmed by ELIMFILTERS: {EK5|EK3}{brand
 * code, 2 digits}{sequence within that brand, 2 digits} - e.g. EK50101
 * = HD, brand code 01, kit #01 for that brand. Brand codes are
 * auto-assigned the first time a brand is used (no hardcoded brand
 * list to maintain) by POST /api/kits, already updated in
 * server-original.js.
 *
 * Creates kit_brand_codes (brand -> 2-digit code) and adds the `brand`
 * column to maintenance_kits. Safe to run whether or not run_030 (which
 * creates maintenance_kits/kit_components) has been applied yet -
 * everything here is CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT
 * EXISTS.
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

ALTER TABLE maintenance_kits ADD COLUMN IF NOT EXISTS brand TEXT;

CREATE TABLE IF NOT EXISTS kit_brand_codes (
  brand      TEXT PRIMARY KEY,
  code       TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'maintenance_kits' AND column_name = 'brand'
    `);
    const { rows: tableRows } = await client.query(`
      SELECT table_name FROM information_schema.tables WHERE table_name = 'kit_brand_codes'
    `);
    console.log('\n✅ brand column present:', rows.length > 0);
    console.log('✅ kit_brand_codes table present:', tableRows.length > 0);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit these changes.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
