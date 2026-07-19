'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_042_create_rav4_kit.js           (dry run — no changes)
 *   node scripts/migrations/run_042_create_rav4_kit.js --apply   (writes changes)
 *
 * Creates the first DURATECH pilot kit: Toyota RAV4 2022 (2.5L,
 * gasoline), confirmed component SKUs cross-checked against real
 * Toyota OEM part numbers (run_035, run_041):
 *   - Engine air filter: EA37063  (OEM 17801-F0020)
 *   - Cabin air filter:  EC31919  (OEM 87139-06080, merged with full
 *                         cross-reference data by run_041)
 *   - Oil filter:        EL36006  (OEM 04152-YZZA6 / 04152-37010)
 *   - Fuel filter:        EF34421  (new ELIMFILTERS product, run_037 -
 *                         no prior aftermarket equivalent existed)
 *
 * Mirrors POST /api/kits' exact logic (server-original.js) directly
 * against the DB rather than an HTTP call, since this script already
 * runs with DATABASE_URL in the same environment: auto-assigns a
 * 2-digit brand code for TOYOTA if one doesn't exist yet, generates
 * the next sequential kit_sku for that brand+duty, and inserts the
 * kit + its components.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BRAND = 'TOYOTA';
const NAME = 'Toyota RAV4 2022 (2.5L) Maintenance Kit';
const EQUIPMENT_REF = 'TOYOTA RAV4 2022 2.5L (gasoline)';
const FILTER_SKUS = ['EA37063', 'EC31919', 'EL36006', 'EF34421'];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  // Confirm all component SKUs exist
  const { rows: found } = await client.query(
    'SELECT sku, filter_type, duty FROM elimfilters_catalog WHERE sku = ANY($1)',
    [FILTER_SKUS]
  );
  console.log('\nComponent SKUs found:');
  found.forEach(r => console.log(`  ${r.sku}  (${r.filter_type}, ${r.duty})`));
  const missing = FILTER_SKUS.filter(s => !found.some(r => r.sku === s));
  if (missing.length) {
    console.log(`\n❌ Missing SKUs: ${missing.join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  const duty = found[0].duty;
  const prefix = duty === 'HEAVY_DUTY' ? 'EK5' : 'EK3';

  // Brand code: look up or auto-assign
  let brandCode;
  const existingCode = await client.query('SELECT code FROM kit_brand_codes WHERE brand = $1', [BRAND]);
  if (existingCode.rows.length) {
    brandCode = existingCode.rows[0].code;
    console.log(`\nBrand code for ${BRAND}: ${brandCode} (existing)`);
  } else {
    const maxCode = await client.query('SELECT MAX(code::int) AS max_code FROM kit_brand_codes');
    const nextCode = maxCode.rows[0].max_code === null ? 0 : maxCode.rows[0].max_code + 1;
    brandCode = String(nextCode).padStart(2, '0');
    console.log(`\nBrand code for ${BRAND}: ${brandCode} (new)`);
  }

  const last = await client.query(
    `SELECT kit_sku FROM maintenance_kits WHERE kit_sku LIKE $1 ORDER BY kit_sku DESC LIMIT 1`,
    [prefix + brandCode + '%']
  );
  const nextSeqNum = last.rows.length ? parseInt(last.rows[0].kit_sku.slice(5), 10) + 1 : 1;
  const kitSku = prefix + brandCode + String(nextSeqNum).padStart(2, '0');

  console.log(`\nKit SKU: ${kitSku}  |  duty: ${duty}  |  name: ${NAME}`);
  console.log(`Components: ${FILTER_SKUS.join(', ')}`);

  if (APPLY) {
    await client.query('BEGIN');
    if (!existingCode.rows.length) {
      await client.query('INSERT INTO kit_brand_codes (brand, code) VALUES ($1,$2)', [BRAND, brandCode]);
    }
    await client.query(
      'INSERT INTO maintenance_kits (kit_sku, name, brand, equipment_ref, duty) VALUES ($1,$2,$3,$4,$5)',
      [kitSku, NAME, BRAND, EQUIPMENT_REF, duty]
    );
    for (const sku of FILTER_SKUS) {
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [kitSku, sku]
      );
    }
    await client.query('COMMIT');
    console.log(`\n✅ Created kit ${kitSku}.`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
