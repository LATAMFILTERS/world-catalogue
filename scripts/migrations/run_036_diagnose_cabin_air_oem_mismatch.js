'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_036_diagnose_cabin_air_oem_mismatch.js
 *
 * run_035 found Toyota cabin air filter OEM codes (87139-xxxxx, the
 * real Toyota cabin/AC filter series) cross-referenced onto EA3 SKUs
 * (Air Filter LD prefix) instead of EC3 (Cabin Filter LD prefix) -
 * confirmed wrong by ELIMFILTERS. This checks how widespread the
 * mismatch is:
 *   1. Does a correct EC3 SKU already exist carrying the same OEM
 *      code(s) (meaning the EA3 entries are erroneous duplicates), or
 *      is EA3 the only place this code appears (meaning the SKU/
 *      filter_type itself may be misclassified)?
 *   2. More generally: how many EA3 (LD Air) rows have oem_codes
 *      entries matching Toyota's 87139-xxxxx cabin filter code family,
 *      and vice versa - how many EC3 (LD Cabin) rows have codes
 *      matching Toyota's 17801-xxxxx engine air filter family?
 * No writes.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log('\n=== 1. Does an EC3 SKU already carry 87139-06080 or 87139-58010? ===');
  const { rows: ec3Match } = await client.query(`
    SELECT c.sku, c.codigo_base, c.filter_type, ref->>'code' AS matched_oem_code
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
      ) ref
    WHERE c.sku LIKE 'EC3%'
      AND UPPER(REPLACE(ref->>'code', '-', '')) IN ('8713906080', '8713958010')
  `);
  console.log(`Matches: ${ec3Match.length}`);
  ec3Match.forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}  matched="${r.matched_oem_code}"`));

  console.log('\n=== 2a. EA3 (LD Air) rows with oem_codes matching Toyota cabin filter family (87139-*) ===');
  const { rows: ea3WithCabin } = await client.query(`
    SELECT DISTINCT c.sku, c.codigo_base, c.filter_type
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
      ) ref
    WHERE c.sku LIKE 'EA3%'
      AND UPPER(REPLACE(ref->>'code', '-', '')) LIKE '87139%'
    ORDER BY c.sku
  `);
  console.log(`Count: ${ea3WithCabin.length}`);
  ea3WithCabin.slice(0, 20).forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}`));
  if (ea3WithCabin.length > 20) console.log(`  ... and ${ea3WithCabin.length - 20} more`);

  console.log('\n=== 2b. EC3 (LD Cabin) rows with oem_codes matching Toyota engine air filter family (17801-*) ===');
  const { rows: ec3WithAir } = await client.query(`
    SELECT DISTINCT c.sku, c.codigo_base, c.filter_type
    FROM elimfilters_catalog c,
      LATERAL jsonb_array_elements(
        CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
      ) ref
    WHERE c.sku LIKE 'EC3%'
      AND UPPER(REPLACE(ref->>'code', '-', '')) LIKE '17801%'
    ORDER BY c.sku
  `);
  console.log(`Count: ${ec3WithAir.length}`);
  ec3WithAir.slice(0, 20).forEach(r => console.log(`  ${r.sku}  (${r.codigo_base})  ${r.filter_type}`));
  if (ec3WithAir.length > 20) console.log(`  ... and ${ec3WithAir.length - 20} more`);

  console.log('\n=== 3. Full oem_codes for EA31919 and EA32032 (see all cross-refs on these specific rows) ===');
  const { rows: fullRows } = await client.query(`
    SELECT sku, codigo_base, filter_type, oem_codes
    FROM elimfilters_catalog
    WHERE sku IN ('EA31919', 'EA32032')
  `);
  fullRows.forEach(r => {
    console.log(`\n  ${r.sku} (${r.codigo_base}) filter_type=${r.filter_type}`);
    console.log('  ', JSON.stringify(r.oem_codes).slice(0, 500));
  });

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
