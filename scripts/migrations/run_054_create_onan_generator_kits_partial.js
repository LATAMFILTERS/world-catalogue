'use strict';
/**
 * Run on Render Shell:
 *   node scripts/migrations/run_054_create_onan_generator_kits_partial.js           (dry run)
 *   node scripts/migrations/run_054_create_onan_generator_kits_partial.js --apply   (writes changes)
 *
 * PARTIAL KITS - IMPORTANT CAVEAT:
 * Sourced from shop.cummins.com's own Onan RV Generator Maintenance Kits
 * category (scripts/scraper_cummins_api.py, 2026-07-21). Each real Onan
 * kit has 2-4 components (air/oil/fuel filters, spark plugs - oil
 * lubricant and spark plugs are out of scope per user rule "sin
 * aceites"/no spark plugs sold). Of the 18 unique Onan component codes
 * across these kits, only 5 could be confidently cross-referenced to a
 * SKU we actually stock (via Fleetguard equivalents, verified directly
 * against elimfilters_catalog.oem_codes/competitor_codes on
 * 2026-07-21). The other Onan codes either have no Fleetguard
 * cross-reference at all, or only cross to brands we don't carry
 * (Wix/Napa Gold/Baldwin/Fram) - those component slots are OMITTED
 * here, not fabricated. Every kit below is missing 1-3 of its real
 * components; see the per-kit comment for exactly what's missing.
 * A060Z347 (HGJBB) is excluded entirely - none of its 3 components had
 * any usable match.
 *
 * Fleetguard resolution notes (ties broken via elimfilters_catalog's own
 * `alternatives` linkage where multiple SKUs matched, same approach as
 * run_050/051 for Fleetguard MK kits):
 *   - 0122-0833 -> LF3591 -> EL82049 (EL82057 equally attested via the
 *     Donaldson->Onan crossref CSV, no data to prefer one; EL82049 picked)
 *   - 0122-0836 -> LF16035 -> EL81018 (mutual `alternatives` family with
 *     EL87349/EL88615; EL81018 picked, no further signal to prefer one)
 *   - 0140-3071 -> AF25538/AF25550/AF25745/AH19082 -> EA12686 (mutual
 *     `alternatives` pair with EA131520, which has a malformed 8-char
 *     SKU - see run_053 area findings 2026-07-21 - so the well-formed
 *     EA12686 was picked)
 *   - 0140-3280 / 0140-3295 -> AF27684 -> EA16743 (single clean match,
 *     no ambiguity)
 *   - 0149-2513 -> FF236 -> EF92387 (clean empty `alternatives`; the
 *     other candidate EF90254 has an odd self-referencing alternatives
 *     entry)
 *
 * brand='ONAN' (new brand, not yet in kit_brand_codes - this script
 * registers it, same mechanism as run_050 for FLEETGUARD).
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BRAND = 'ONAN';

const KITS = [
  {
    sourceCode: 'A060Z345',
    kitSku: 'EK50345',
    name: 'Cummins Onan KY-B Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan KY-B RV Generator (shop.cummins.com A060Z345) - '
      + 'MISSING: 0149-2457 fuel filter (no catalog match), spark plug (not carried)',
    components: [
      { onan: '0140-3295', sku: 'EA16743', qty: 1 },
    ],
  },
  {
    sourceCode: 'A060Z343',
    kitSku: 'EK50343',
    name: 'Cummins Onan HGJAD Gas Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan HGJAD Gas RV Generator (shop.cummins.com A060Z343) - '
      + 'MISSING: 0140-3116 air filter (no catalog match), 0147-0860 fuel filter (no catalog match)',
    components: [
      { onan: '0122-0836', sku: 'EL81018', qty: 1 },
    ],
  },
  {
    sourceCode: 'A060Z229',
    kitSku: 'EK50229',
    name: 'Cummins Onan HDKCA/CB Diesel Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan HDKCA/CB Diesel RV Generator (shop.cummins.com A060Z229) - '
      + 'MISSING: 0122-0893 oil filter (no catalog match)',
    components: [
      { onan: '0140-3071', sku: 'EA12686', qty: 1 },
      { onan: '0149-2513', sku: 'EF92387', qty: 1 },
    ],
  },
  {
    sourceCode: 'A060Z227',
    kitSku: 'EK50227',
    name: 'Onan HDKAH/AK Diesel Generator Kit (partial)',
    equipmentRef: 'Onan HDKAH/AK Diesel RV Generator (shop.cummins.com A060Z227) - '
      + 'MISSING: 0140-2897 air filter (no catalog match), 0147-0860 fuel filter (no catalog match)',
    components: [
      { onan: '0122-0833', sku: 'EL82049', qty: 1 },
    ],
  },
  {
    sourceCode: 'A050E993',
    kitSku: 'EK50993',
    name: 'Cummins Onan KY-LP Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan KY-LP RV Generator (shop.cummins.com A050E993) - '
      + 'MISSING: spark plug (not carried)',
    components: [
      { onan: '0140-3280', sku: 'EA16743', qty: 1 },
    ],
  },
  {
    sourceCode: 'A050E991',
    kitSku: 'EK50991',
    name: 'Cummins Onan KY-Gas Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan KY-Gas RV Generator (shop.cummins.com A050E991) - '
      + 'MISSING: 0149-2457 fuel filter (no catalog match), spark plug (not carried)',
    components: [
      { onan: '0140-3280', sku: 'EA16743', qty: 1 },
    ],
  },
  {
    sourceCode: 'A049E506',
    kitSku: 'EK59506',
    name: 'Cummins Onan HGJAB-LP RV Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan HGJAB-LP RV Generator (shop.cummins.com A049E506) - '
      + 'MISSING: 0140-3116 air filter (no catalog match), spark plug (not carried)',
    components: [
      { onan: '0122-0836', sku: 'EL81018', qty: 1 },
    ],
  },
  {
    sourceCode: 'A049E501',
    kitSku: 'EK59501',
    name: 'Cummins Onan HGJAB Gas Generator Maintenance Kit (partial)',
    equipmentRef: 'Cummins Onan HGJAB Gas RV Generator (shop.cummins.com A049E501) - '
      + 'MISSING: 0140-3116 air filter (no catalog match), 0149-2341-01 fuel filter (no catalog match), spark plug (not carried)',
    components: [
      { onan: '0122-0836', sku: 'EL81018', qty: 1 },
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
  console.log('\nWARNING: every kit below is PARTIAL (missing 1-3 of its real components). See equipmentRef per kit.\n');

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
    console.log(`    ${kit.equipmentRef}`);
    kit.components.forEach(c => console.log(`    ${c.onan} -> ${c.sku}  x${c.qty}`));
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
    console.log(`\n✅ Created ${KITS.length} PARTIAL kits: ${KITS.map(k => k.kitSku).join(', ')}`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
