'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_051_create_fleetguard_crossref_kits_batch3_medium_confidence.js           (dry run)
 *   node scripts/migrations/run_051_create_fleetguard_crossref_kits_batch3_medium_confidence.js --apply   (writes changes)
 *
 * MEDIUM CONFIDENCE — read before running.
 *
 * Creates 10 more DURATECH kits from the same Fleetguard discovery
 * batch as run_048/run_050. Unlike those, several of these kits use
 * components (LF14001NN, FF5971NN, FF5825NN, WF2071, WF2072, WF2126)
 * that are NOT in scripts/donaldson_crossref_flat.csv at all (Donaldson's
 * own published cross-reference doesn't cover them - likely because
 * they're newer Fleetguard NanoNet-media parts). Their Donaldson
 * equivalents below came from a third-party AI-generated search summary
 * (2026-07-19), independently cross-checked by confirming the cited
 * Donaldson code is a REAL code in our own CSV with a matching filter
 * category (fuel->fuel, coolant->coolant, etc) - but NOT confirmed
 * against Fleetguard's or Donaldson's own published cross-reference,
 * because neither is reachable from this environment (fleetguard.com
 * blocks scraping; shop.donaldson.com/shop.cummins.com are blocked by
 * Akamai and need a VPN the scraper doesn't have). This same AI source
 * was independently wrong about one code in the same answer (claimed
 * FF63010 = Donaldson P550949, which is actually a LUBE oil filter code
 * - a fuel/oil category mismatch caught during verification and
 * confirmed wrong by the user against a real cross-reference; FF63010
 * is excluded from this batch entirely as a result).
 *
 * Fleetguard -> Donaldson mapping used here (medium confidence):
 *   LF14001NN -> DBL7900 -> EL87900 (also cross-refs from EL89000 as an
 *                ALTERNATIVE in the CSV - picked EL87900 since DBL7900
 *                is its own primary code, not a secondary alternative)
 *   FF5971NN  -> DBF5811 -> EF95811
 *   FF5825NN  -> DBF6776 -> EF96776
 *   WF2071    -> P552071 -> EW72071
 *   WF2072    -> P552072 -> EW72072
 *   FS20083, FS19591, LF9070, FS1000, HF6056, FF104, FF105 and all
 *   other components below are NOT from the AI source - they're normal
 *   single-match lookups from donaldson_crossref_flat.csv, same
 *   confidence level as run_048/run_050.
 *
 * kit_sku scheme, brand, etc: same as run_048/run_050.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BRAND = 'FLEETGUARD';

const KITS = [
  {
    sourceCode: 'MK14623',
    kitSku: 'EK54623',
    name: 'Fleetguard MK14623 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK14623 catalog cross-reference)',
    components: [
      { fleetguard: 'FF5971NN', sku: 'EF95811', qty: 1 },
      { fleetguard: 'FS19764', sku: 'EF90849', qty: 1 },
      { fleetguard: 'LF14001NN', sku: 'EL87900', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK14627',
    kitSku: 'EK54627',
    name: 'Fleetguard MK14627 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK14627 catalog cross-reference)',
    components: [
      // scraped as "LF1400101NN" - treated as the real code LF14001NN
      // (duplicated-digit artifact from page text extraction)
      { fleetguard: 'LF14001NN', sku: 'EL87900', qty: 1 },
      { fleetguard: 'FS19764', sku: 'EF90849', qty: 1 },
      { fleetguard: 'FF5971NN', sku: 'EF95811', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK14649',
    kitSku: 'EK54649',
    name: 'Fleetguard MK14649 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK14649 catalog cross-reference)',
    components: [
      { fleetguard: 'FS19765', sku: 'EF90851', qty: 1 },
      { fleetguard: 'LF14001NN', sku: 'EL87900', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK14763',
    kitSku: 'EK54763',
    name: 'Fleetguard MK14763 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK14763 catalog cross-reference)',
    components: [
      { fleetguard: 'FS19765', sku: 'EF90851', qty: 1 },
      { fleetguard: 'FF5825NN', sku: 'EF96776', qty: 1 },
      { fleetguard: 'LF14001NN', sku: 'EL87900', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK11044',
    kitSku: 'EK51044',
    name: 'Fleetguard MK11044 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK11044 catalog cross-reference)',
    components: [
      { fleetguard: 'HF6056', sku: 'EH61551', qty: 1 },
      { fleetguard: 'FF104', sku: 'EF90104', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'LF670', sku: 'EL81670', qty: 1 },
      { fleetguard: 'WF2072', sku: 'EW72072', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK11446',
    kitSku: 'EK51446',
    name: 'Fleetguard MK11446 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK11446 catalog cross-reference)',
    components: [
      { fleetguard: 'WF2071', sku: 'EW72071', qty: 1 },
      { fleetguard: 'FF105', sku: 'EF90105', qty: 2 },
      { fleetguard: 'LF670', sku: 'EL81670', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK12404',
    kitSku: 'EK52404',
    name: 'Fleetguard MK12404 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK12404 catalog cross-reference)',
    components: [
      { fleetguard: 'LF9070', sku: 'EL89000', qty: 1 },
      { fleetguard: 'WF2071', sku: 'EW72071', qty: 1 },
      { fleetguard: 'FS1000', sku: 'EF91000', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK12991',
    kitSku: 'EK52991',
    name: 'Fleetguard MK12991 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK12991 catalog cross-reference)',
    components: [
      { fleetguard: 'FF5319', sku: 'EF91311', qty: 1 },
      { fleetguard: 'FS19591', sku: 'EF91076', qty: 1 },
      { fleetguard: 'WF2071', sku: 'EW72071', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'LF691A', sku: 'EL81808', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK14626',
    kitSku: 'EK54626',
    name: 'Fleetguard MK14626 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK14626 catalog cross-reference)',
    components: [
      { fleetguard: 'FF5971NN', sku: 'EF95811', qty: 1 },
      { fleetguard: 'FS20083', sku: 'EF980710', qty: 1 },
      { fleetguard: 'LF14001NN', sku: 'EL87900', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK1465',
    kitSku: 'EK51465',
    name: 'Fleetguard MK1465 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK1465 catalog cross-reference)',
    components: [
      { fleetguard: 'FF105', sku: 'EF90105', qty: 1 },
      { fleetguard: 'WF2071', sku: 'EW72071', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'LF670', sku: 'EL81670', qty: 1 },
    ],
  },
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();
  console.log(`\n${APPLY ? 'APPLYING' : 'DRY RUN (pass --apply to write changes)'}`);
  console.log('⚠️  MEDIUM CONFIDENCE BATCH — some components resolved via unverified third-party source, see file header.\n');

  const hasQty = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'kit_components' AND column_name = 'qty'
  `);
  if (!hasQty.rows.length) {
    console.log('\n❌ kit_components.qty does not exist yet. Run run_049 first (--apply). Aborting.');
    await client.end();
    return;
  }

  const allSkus = [...new Set(KITS.flatMap(k => k.components.map(c => c.sku)))];
  const { rows: found } = await client.query(
    'SELECT sku, filter_type, duty FROM elimfilters_catalog WHERE sku = ANY($1)',
    [allSkus]
  );
  console.log('Component SKUs found in catalog:');
  found.forEach(r => console.log(`  ${r.sku}  (${r.filter_type}, ${r.duty})`));
  const missing = allSkus.filter(s => !found.some(r => r.sku === s));
  if (missing.length) {
    console.log(`\n❌ Missing SKUs: ${missing.join(', ')}. Aborting entirely (fix data first).`);
    await client.end();
    return;
  }
  const wrongDuty = found.filter(r => r.duty !== 'HEAVY_DUTY');
  if (wrongDuty.length) {
    console.log(`\n❌ Non-HEAVY_DUTY SKUs found: ${wrongDuty.map(r => r.sku).join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  const existingKits = await client.query(
    'SELECT kit_sku FROM maintenance_kits WHERE kit_sku = ANY($1)',
    [KITS.map(k => k.kitSku)]
  );
  if (existingKits.rows.length) {
    console.log(`\n❌ Kit SKUs already exist: ${existingKits.rows.map(r => r.kit_sku).join(', ')}. Aborting.`);
    await client.end();
    return;
  }

  console.log('\nKits to create:');
  for (const kit of KITS) {
    console.log(`\n  ${kit.kitSku}  (from ${kit.sourceCode})  |  ${kit.name}`);
    kit.components.forEach(c => console.log(`    ${c.fleetguard} -> ${c.sku}  x${c.qty}`));
  }

  if (APPLY) {
    await client.query('BEGIN');
    const existingBrand = await client.query('SELECT code FROM kit_brand_codes WHERE brand = $1', [BRAND]);
    if (!existingBrand.rows.length) {
      const maxCode = await client.query('SELECT MAX(code::int) AS max_code FROM kit_brand_codes');
      const nextCode = maxCode.rows[0].max_code === null ? 0 : maxCode.rows[0].max_code + 1;
      const brandCode = String(nextCode).padStart(2, '0');
      await client.query('INSERT INTO kit_brand_codes (brand, code) VALUES ($1,$2)', [BRAND, brandCode]);
    }
    for (const kit of KITS) {
      await client.query(
        'INSERT INTO maintenance_kits (kit_sku, name, brand, equipment_ref, duty) VALUES ($1,$2,$3,$4,$5)',
        [kit.kitSku, kit.name, BRAND, kit.equipmentRef, 'HEAVY_DUTY']
      );
      for (const c of kit.components) {
        await client.query(
          'INSERT INTO kit_components (kit_sku, filter_sku, qty) VALUES ($1,$2,$3) ON CONFLICT (kit_sku, filter_sku) DO UPDATE SET qty = EXCLUDED.qty',
          [kit.kitSku, c.sku, c.qty]
        );
      }
    }
    await client.query('COMMIT');
    console.log(`\n✅ Created ${KITS.length} kits: ${KITS.map(k => k.kitSku).join(', ')}`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
