'use strict';
/**
 * Run on Render Shell (AFTER run_049 has been applied):
 *   node scripts/migrations/run_050_create_fleetguard_crossref_kits_batch2.js           (dry run)
 *   node scripts/migrations/run_050_create_fleetguard_crossref_kits_batch2.js --apply   (writes changes)
 *
 * Creates 7 more DURATECH kits from the same Fleetguard reverse-lookup
 * discovery batch as run_048. These 7 had at least one component that
 * cross-referenced to more than one candidate Donaldson-equivalent SKU
 * in scripts/donaldson_crossref_flat.csv; the ambiguity was resolved
 * with human review (2026-07-19) using each candidate's own
 * DONALDSON/ALTERNATIVE linkage in the CSV as a signal, confirmed by
 * the user:
 *   - LF670  -> EL81670 (has its own ALTERNATIVE link; EL80671 doesn't)
 *   - FF5319 -> EF91311 (EF91311/EF91319 reference each other as
 *                        ALTERNATIVE - genuinely no way to prefer one
 *                        from data alone)
 *   - LF691A -> EL81808 (interlinked with EL84005/EL84105; EL80788 and
 *                        EL84206 have no ALTERNATIVE links)
 *   - LF3400 -> EL80939 (EH60274 was eliminated outright - it's a
 *                        HYDRAULIC filter, not lube, category
 *                        mismatch; EL80939 is the only remaining
 *                        candidate with any ALTERNATIVE link, though
 *                        this one is lower-confidence than the others)
 *
 * Same kit_sku scheme as run_048: EK5 + last 4 digits of the source
 * Fleetguard MK code. brand='FLEETGUARD' for the same reason (generic
 * Cummins engine service kits, no single OEM vehicle brand applies).
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
    sourceCode: 'MK11778',
    kitSku: 'EK51778',
    name: 'Fleetguard MK11778 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK11778 catalog cross-reference)',
    components: [
      { fleetguard: 'FF202', sku: 'EF90202', qty: 2 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 2 },
      { fleetguard: 'LF670', sku: 'EL81670', qty: 4 },
    ],
  },
  {
    sourceCode: 'MK11779',
    kitSku: 'EK51779',
    name: 'Fleetguard MK11779 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK11779 catalog cross-reference)',
    components: [
      { fleetguard: 'LF670', sku: 'EL81670', qty: 4 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 2 },
    ],
  },
  {
    sourceCode: 'MK12036',
    kitSku: 'EK52036',
    name: 'Fleetguard MK12036 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK12036 catalog cross-reference)',
    components: [
      { fleetguard: 'FF202', sku: 'EF90202', qty: 1 },
      { fleetguard: 'LF670', sku: 'EL81670', qty: 3 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 2 },
    ],
  },
  {
    sourceCode: 'MK12693',
    kitSku: 'EK52693',
    name: 'Fleetguard MK12693 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK12693 catalog cross-reference)',
    components: [
      { fleetguard: 'FF105', sku: 'EF90105', qty: 1 },
      { fleetguard: 'FF5319', sku: 'EF91311', qty: 1 },
      { fleetguard: 'LF691A', sku: 'EL81808', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13008',
    kitSku: 'EK53008',
    name: 'Fleetguard MK13008 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13008 catalog cross-reference)',
    components: [
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'FF5319', sku: 'EF91311', qty: 1 },
      { fleetguard: 'FF202', sku: 'EF90202', qty: 1 },
      { fleetguard: 'LF3566', sku: 'EL81808', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13302',
    kitSku: 'EK53302',
    name: 'Fleetguard MK13302 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13302 catalog cross-reference)',
    components: [
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'LF691A', sku: 'EL81808', qty: 1 },
      { fleetguard: 'FS19765', sku: 'EF90851', qty: 1 },
      { fleetguard: 'FF5319', sku: 'EF91311', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13303',
    kitSku: 'EK53303',
    name: 'Fleetguard MK13303 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13303 catalog cross-reference)',
    components: [
      { fleetguard: 'FF5319', sku: 'EF91311', qty: 1 },
      { fleetguard: 'FF202', sku: 'EF90202', qty: 1 },
      { fleetguard: 'LF691A', sku: 'EL81808', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
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
  console.log('\nComponent SKUs found in catalog:');
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
