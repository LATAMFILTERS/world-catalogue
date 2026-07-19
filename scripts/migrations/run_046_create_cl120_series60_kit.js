'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_046_create_cl120_series60_kit.js           (dry run — no changes)
 *   node scripts/migrations/run_046_create_cl120_series60_kit.js --apply   (writes changes)
 *
 * Creates the second DURATECH pilot kit: Freightliner Columbia CL120 +
 * Detroit Diesel Series 60, 6 confirmed component SKUs cross-checked
 * against real Detroit OEM numbers where the catalog data allowed it
 * (run_044/run_045, plus manual confirmation of the remaining
 * positions by ELIMFILTERS after data-corruption false positives were
 * found and ruled out in oem_codes for several candidates):
 *   - Oil filter (x2, parallel): EL82100 (P552100)
 *   - Fuel filter - primary:     EF90463 (P550463, Detroit 23529664)
 *   - Fuel filter - secondary:   EF96916 (P556916, Detroit 23518482/23533726)
 *   - Coolant filter:            EW74685 (P554685, Detroit 23524403)
 *   - Engine air filter:         EA17682 (P527682)
 *   - Transmission filter:       EL82518 (P552518)
 *
 * Mirrors POST /api/kits' exact logic (server-original.js) directly
 * against the DB, same as run_042 (RAV4 pilot): auto-assigns a 2-digit
 * brand code for FREIGHTLINER if one doesn't exist yet, generates the
 * next sequential kit_sku for that brand+duty, and inserts the kit +
 * its components.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BRAND = 'FREIGHTLINER';
const NAME = 'Freightliner Columbia CL120 (Detroit Diesel Series 60) Maintenance Kit';
const EQUIPMENT_REF = 'FREIGHTLINER COLUMBIA CL120 + Detroit Diesel Series 60';
const FILTER_SKUS = ['EL82100', 'EF90463', 'EF96916', 'EW74685', 'EA17682', 'EL82518'];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

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
  const wrongDuty = found.filter(r => r.duty !== 'HEAVY_DUTY');
  if (wrongDuty.length) {
    console.log(`\n❌ Non-HEAVY_DUTY SKUs found: ${wrongDuty.map(r => r.sku).join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  const duty = found[0].duty;
  const prefix = duty === 'HEAVY_DUTY' ? 'EK5' : 'EK3';

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
