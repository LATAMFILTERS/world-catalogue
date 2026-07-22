'use strict';
/**
 * Run on Render Shell:
 *   node run_056_complete_onan_kits_batch2.js           (dry run)
 *   node run_056_complete_onan_kits_batch2.js --apply   (writes changes)
 *
 * Adds 2 newly-confirmed components to 3 existing Onan kits from
 * run_054 (2026-07-21), resolved via external cross-reference research
 * verified against elimfilters_catalog (run_055):
 *   - 0147-0860 (FILTER-EFI FUEL) -> EF95190 (codigo_base=FF5190,
 *     clean match, fuel/HD)
 *   - 0122-0893 (FILTER-OIL) -> EL82016 (Fleetguard LF16011 family;
 *     picked over EL80335/EL87780 because both of those have a
 *     corrupted `alternatives` entry pointing to EH60222, a HYDRAULIC
 *     filter - clearly wrong for an oil filter. EL82016 has clean
 *     empty alternatives.)
 *
 * EK50229 (A060Z229) becomes fully complete with this - all 3 of its
 * real components now have a SKU. EK50343/EK50227 still miss their air
 * filter (0140-3116/0140-2897 - no catalog match found for either).
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');

const ADDITIONS = [
  { kitSku: 'EK50343', onan: '0147-0860', sku: 'EF95190', qty: 1 },
  { kitSku: 'EK50227', onan: '0147-0860', sku: 'EF95190', qty: 1 },
  { kitSku: 'EK50229', onan: '0122-0893', sku: 'EL82016', qty: 1 },
];

const EQUIPMENT_REF_UPDATES = [
  { kitSku: 'EK50343', newRef: 'Cummins Onan HGJAD Gas RV Generator (shop.cummins.com A060Z343) - MISSING: 0140-3116 air filter (no catalog match)' },
  { kitSku: 'EK50227', newRef: 'Onan HDKAH/AK Diesel RV Generator (shop.cummins.com A060Z227) - MISSING: 0140-2897 air filter (no catalog match)' },
  { kitSku: 'EK50229', newRef: 'Cummins Onan HDKCA/CB Diesel RV Generator (shop.cummins.com A060Z229) - complete, all 3 components matched' },
];
const NAME_UPDATES = [
  { kitSku: 'EK50229', newName: 'Cummins Onan HDKCA/CB Diesel Generator Maintenance Kit' },
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);

  const skus = [...new Set(ADDITIONS.map(a => a.sku))];
  const { rows: found } = await client.query(
    'SELECT sku, filter_type, duty FROM elimfilters_catalog WHERE sku = ANY($1)', [skus]
  );
  found.forEach(r => console.log(`  ${r.sku}  (${r.filter_type}, ${r.duty})`));
  const missing = skus.filter(s => !found.some(r => r.sku === s));
  if (missing.length) {
    console.log(`\n❌ Missing SKUs: ${missing.join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  const kitSkus = [...new Set(ADDITIONS.map(a => a.kitSku))];
  const { rows: kits } = await client.query(
    'SELECT kit_sku FROM maintenance_kits WHERE kit_sku = ANY($1)', [kitSkus]
  );
  if (kits.length !== kitSkus.length) {
    const foundSkus = kits.map(k => k.kit_sku);
    console.log(`\n❌ Kits not found: ${kitSkus.filter(k => !foundSkus.includes(k)).join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  console.log('\nComponents to add:');
  ADDITIONS.forEach(a => console.log(`  ${a.kitSku}: ${a.onan} -> ${a.sku} x${a.qty}`));

  if (APPLY) {
    await client.query('BEGIN');
    for (const a of ADDITIONS) {
      await client.query(
        'INSERT INTO kit_components (kit_sku, filter_sku, qty) VALUES ($1,$2,$3) ON CONFLICT (kit_sku, filter_sku) DO UPDATE SET qty = EXCLUDED.qty',
        [a.kitSku, a.sku, a.qty]
      );
    }
    for (const u of EQUIPMENT_REF_UPDATES) {
      await client.query('UPDATE maintenance_kits SET equipment_ref = $1 WHERE kit_sku = $2', [u.newRef, u.kitSku]);
    }
    for (const n of NAME_UPDATES) {
      await client.query('UPDATE maintenance_kits SET name = $1 WHERE kit_sku = $2', [n.newName, n.kitSku]);
    }
    await client.query('COMMIT');
    console.log('\n✅ Applied.');
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
