'use strict';
/**
 * Run on Render Shell (AFTER run_049 has been applied):
 *   node scripts/migrations/run_052_create_donaldson_kits.js           (dry run)
 *   node scripts/migrations/run_052_create_donaldson_kits.js --apply   (writes changes)
 *
 * Creates 45 DURATECH kits sourced directly from Donaldson's own
 * "Filter Kits" category (shop.donaldson.com, 57 kits total under
 * N=320898843 — confirmed by the user). Unlike the Fleetguard-sourced
 * kits (run_048/050/051), these list Donaldson's OWN component part
 * numbers directly on the kit page (e.g. "LUBE FILTER, SPIN-ON FULL
 * FLOW ( 2) - P553000"), so no third-party cross-reference is
 * involved — just a direct lookup against
 * scripts/donaldson_crossref_flat.csv's own don_pn column (each row's
 * own primary Donaldson number) to find the matching ELIMFILTERS SKU.
 * All 45 here resolved to exactly one SKU per component (the CSV's
 * "code" column under brand=DONALDSON, which lists supersession/
 * alternate numbers under OTHER skus, was checked and excluded from
 * the primary match to avoid the ambiguity that caused for the
 * Fleetguard-sourced batches — see run_050's header for that history).
 * The remaining 12 of 57 kits (6 with an ambiguous component, 6 whose
 * page text didn't parse cleanly) are not included here.
 *
 * shop.donaldson.com was only reachable with headless=false in
 * Playwright (Akamai blocks headless mode specifically — confirmed by
 * testing headless=true vs false directly, VPN made no difference).
 *
 * kit_sku scheme: EK5 + last 4 digits of the source Donaldson part
 * number (e.g. P559009 -> EK59009), matching the same pattern used for
 * the Fleetguard-sourced batches (EK5 + last 4 of the MK code) since
 * these are also generic multi-application kits with no single OEM
 * vehicle brand. brand='DONALDSON' since that's the actual source
 * catalog this time.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const APPLY = process.argv.includes('--apply');
const BRAND = 'DONALDSON';

// [donaldsonKitPN, [ [donaldsonComponentPN, elimfiltersSku, qty], ... ] ]
const RAW_KITS = [
  ['P550065', [['P550066', 'EL80066', 1]]],
  ['P559009', [['P552603', 'EF92603', 1], ['P555616', 'EL85616', 2], ['P555627', 'EF95627', 1]]],
  ['P559037', [['P550105', 'EF90105', 1], ['P553000', 'EL83000', 1], ['P554071', 'EW74071', 1]]],
  ['P559051', [['P550219', 'EF90219', 1], ['P550286', 'EL80286', 1], ['P550431', 'EF90431', 1], ['P553191', 'EL83191', 2], ['P554860', 'EW74860', 1]]],
  ['P559088', [['P554005', 'EL84005', 1], ['P554071', 'EW74071', 1], ['P555823', 'EF95823', 1], ['P556915', 'EF96915', 1]]],
  ['P559152', [['P554005', 'EL84005', 1], ['P551311', 'EF91311', 1], ['P550467', 'EF90467', 1]]],
  ['P559154', [['P553000', 'EL83000', 1], ['P550879', 'EF90879', 1], ['P550849', 'EF90849', 1]]],
  ['P559155', [['P550425', 'EL80425', 1], ['P550519', 'EL80519', 2], ['P550529', 'EF90529', 1], ['P550851', 'EF90851', 1]]],
  ['P559250', [['P552100', 'EL82100', 2], ['P556916', 'EF96916', 1], ['P558000', 'EF98000', 1]]],
  ['P559251', [['P552100', 'EL82100', 2], ['P556915', 'EF96915', 1], ['P556916', 'EF96916', 1]]],
  ['P559468', [['P551000', 'EF91000', 1], ['P553000', 'EL83000', 1]]],
  ['P559474', [['P550463', 'EF90463', 1], ['P552100', 'EL82100', 2]]],
  ['P559547', [['P550286', 'EL80286', 1], ['P553191', 'EL83191', 2], ['P554470', 'EF94470', 1], ['P554471', 'EF94471', 1], ['P554860', 'EW74860', 1]]],
  ['P559567', [['P550287', 'EL80287', 1], ['P553191', 'EL83191', 2], ['P554470', 'EF94470', 1], ['P554471', 'EF94471', 1]]],
  ['P559576', [['P550425', 'EL80425', 1], ['P550529', 'EF90529', 1], ['P553191', 'EL83191', 2]]],
  ['P559586', [['P551000', 'EF91000', 1], ['P551311', 'EF91311', 1], ['P554005', 'EL84005', 1]]],
  ['P559589', [['P550467', 'EF90467', 1], ['P552071', 'EW72071', 1], ['P559000', 'EL89000', 1]]],
  ['P559613', [['P551807', 'EL81807', 2], ['P554470', 'EF94470', 1], ['P552231', 'EL82231', 1], ['P551029', 'EF91029', 1]]],
  ['P559614', [['P551807', 'EL81807', 2], ['P554470', 'EF94470', 1], ['P552231', 'EL82231', 1], ['P554476', 'EF94476', 1]]],
  ['P559615', [['P550050', 'EL80050', 1], ['P554407', 'EL84407', 1], ['P559125', 'EF99125', 1]]],
  ['P559616', [['P551807', 'EL81807', 2], ['P550425', 'EL80425', 1], ['P550463', 'EF90463', 1], ['P550529', 'EF90529', 1]]],
  ['P559630', [['P551807', 'EL81807', 2], ['P554470', 'EF94470', 1], ['P554471', 'EF94471', 1], ['P554860', 'EW74860', 1], ['P552231', 'EL82231', 1]]],
  ['P559647', [['P551807', 'EL81807', 2], ['P550425', 'EL80425', 1], ['P550529', 'EF90529', 1]]],
  ['P559655', [['P551052', 'EF91052', 1], ['P555686', 'EF95686', 1], ['P550949', 'EL80949', 1]]],
  ['P559660', [['P551807', 'EL81807', 2], ['P550425', 'EL80425', 1], ['P550529', 'EF90529', 1], ['P550851', 'EF90851', 1]]],
  ['P559664', [['P550425', 'EL80425', 1], ['P550519', 'EL80519', 2], ['P550529', 'EF90529', 1]]],
  ['P559666', [['P551838', 'EF91838', 1], ['P551807', 'EL81807', 2], ['P550425', 'EL80425', 1], ['P550529', 'EF90529', 1], ['P552096', 'EW72096', 1]]],
  ['P559671', [['P550849', 'EF90849', 1], ['P553000', 'EL83000', 1]]],
  ['P559673', [['P574863', 'EL84863', 1], ['P550820', 'EL80820', 1], ['P550821', 'EF90821', 1], ['P550849', 'EF90849', 1]]],
  ['P559674', [['P559000', 'EL89000', 1], ['P551052', 'EF91052', 1]]],
  ['P559675', [['P551019', 'EL81019', 1], ['P550880', 'EF90880', 1]]],
  ['P578840', [['P559000', 'EL89000', 1], ['P551011', 'EF91011', 1]]],
  ['P581142', [['P559000', 'EL89000', 1], ['P551052', 'EF91052', 1]]],
  ['P582015', [['P550425', 'EL80425', 1], ['P550529', 'EF90529', 1], ['P551807', 'EL81807', 2], ['P554019', 'EW74019', 1]]],
  ['P582283', [['P559000', 'EL89000', 1], ['P557004', 'EF97004', 1], ['P555686', 'EF95686', 1], ['P550867', 'EW70867', 1]]],
  ['P582284', [['P551808', 'EL81808', 1], ['P551319', 'EF91319', 1], ['P551000', 'EF91000', 1], ['P552071', 'EW72071', 1]]],
  ['P582285', [['P550949', 'EL80949', 1], ['P557004', 'EF97004', 1], ['P555776', 'EF95776', 1]]],
  ['P582286', [['P551808', 'EL81808', 1], ['P551311', 'EF91311', 1], ['P551000', 'EF91000', 1]]],
  ['P582287', [['P559000', 'EL89000', 1], ['P552200', 'EF92200', 1], ['P552203', 'EF92203', 1], ['P550867', 'EW70867', 1]]],
  ['P582288', [['P550425', 'EL80425', 1], ['P551838', 'EF91838', 1], ['P551807', 'EL81807', 2]]],
  ['P582289', [['P550425', 'EL80425', 1], ['P553191', 'EL83191', 2]]],
  ['P584353', [['P550821', 'EF90821', 1], ['P551088', 'EL81088', 1], ['P551859', 'EF91859', 1]]],
  ['P584354', [['P582021', 'EL82021', 2]]],
  ['P584356', [['P550425', 'EL80425', 1], ['P554004', 'EL84004', 2]]],
  ['P584357', [['P550425', 'EL80425', 1], ['P551807', 'EL81807', 2]]],
];

const KITS = RAW_KITS.map(([sourceCode, comps]) => ({
  sourceCode,
  kitSku: 'EK5' + sourceCode.slice(-4),
  name: `Donaldson ${sourceCode} Maintenance Kit`,
  equipmentRef: `Donaldson liquid filter kit catalog cross-reference (${sourceCode})`,
  components: comps.map(([donaldsonPn, sku, qty]) => ({ donaldsonPn, sku, qty })),
}));

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
  console.log(`\nComponent SKUs found in catalog: ${found.length}/${allSkus.length}`);
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

  console.log(`\n${KITS.length} kits to create:`);
  for (const kit of KITS) {
    console.log(`\n  ${kit.kitSku}  (from ${kit.sourceCode})`);
    kit.components.forEach(c => console.log(`    ${c.donaldsonPn} -> ${c.sku}  x${c.qty}`));
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
    console.log(`\n✅ Created ${KITS.length} kits.`);
  } else {
    console.log('\nNo changes written. Re-run with --apply to commit.');
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
