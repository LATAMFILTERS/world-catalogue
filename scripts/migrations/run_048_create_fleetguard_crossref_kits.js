'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_048_create_fleetguard_crossref_kits.js           (dry run — no changes)
 *   node scripts/migrations/run_048_create_fleetguard_crossref_kits.js --apply   (writes changes)
 *
 * Creates 4 DURATECH kits cross-referenced from real, active (non-obsolete)
 * Fleetguard maintenance kits, discovered via scraper_fleetguard.py's
 * reverse-lookup (Maintenance Kits tab on each component filter's own
 * product page — fleetguard.com has no browsable kit category). Of 249
 * seed filters checked, 30 real active kits were found; these 4 are the
 * ones where every Fleetguard component code resolved to exactly ONE
 * Donaldson-equivalent SKU in scripts/donaldson_crossref_flat.csv (no
 * ambiguity, no missing data — the other 26 either have components that
 * cross-reference to multiple candidate SKUs, or components with no
 * Donaldson equivalent found in any available source).
 *
 * kit_sku uses a new naming scheme specific to Fleetguard-sourced kits:
 * EK5 (heavy duty) + the last 4 digits of the source Fleetguard MK code
 * (e.g. MK12764 -> EK52764), instead of the usual brand-code+sequence
 * scheme (which doesn't fit here since there's no single OEM vehicle
 * brand — these are generic Cummins engine service kits, sold under
 * Fleetguard's own catalog, applicable across many equipment brands).
 * brand is recorded as 'FLEETGUARD' since that's the actual source
 * catalog, not an OEM vehicle manufacturer.
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
    sourceCode: 'MK12764',
    kitSku: 'EK52764',
    name: 'Fleetguard MK12764 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK12764 catalog cross-reference)',
    components: [
      { fleetguard: 'LF3566', sku: 'EL81808', qty: 1 },
      { fleetguard: 'FS1029W', sku: 'EF90463', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13006',
    kitSku: 'EK53006',
    name: 'Fleetguard MK13006 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13006 catalog cross-reference)',
    components: [
      { fleetguard: 'FF211', sku: 'EF95823', qty: 1 },
      { fleetguard: 'LF777', sku: 'EL80777', qty: 1 },
      { fleetguard: 'LF3566', sku: 'EL81808', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13067',
    kitSku: 'EK53067',
    name: 'Fleetguard MK13067 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13067 catalog cross-reference)',
    components: [
      { fleetguard: 'FS19624', sku: 'EF90467', qty: 1 },
      { fleetguard: 'CS41008', sku: 'EL80952', qty: 1 },
      { fleetguard: 'FF5380', sku: 'EF90632', qty: 1 },
      { fleetguard: 'LF3914', sku: 'EL80761', qty: 1 },
    ],
  },
  {
    sourceCode: 'MK13118',
    kitSku: 'EK53118',
    name: 'Fleetguard MK13118 Cross-Reference Maintenance Kit',
    equipmentRef: 'Cummins engine service kit (Fleetguard MK13118 catalog cross-reference)',
    components: [
      { fleetguard: 'LF3914', sku: 'EL80761', qty: 1 },
      { fleetguard: 'FF5380', sku: 'EF90632', qty: 1 },
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
          'INSERT INTO kit_components (kit_sku, filter_sku) VALUES ($1,$2) ON CONFLICT DO NOTHING',
          [kit.kitSku, c.sku]
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
