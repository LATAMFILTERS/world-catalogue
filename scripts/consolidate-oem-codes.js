/**
 * consolidate-oem-codes.js — One-time migration
 *
 * Moves ALL competitor_codes entries into oem_codes for every product.
 * Donaldson scraper wrongly split codes by brand type; ALL codes from
 * Donaldson's website are OEM codes regardless of brand name.
 *
 * After this script:
 *   - oem_codes  = all previous oem_codes + all previous competitor_codes
 *   - competitor_codes = [] (empty, ready for oilfilter-crossreference.com data)
 *
 * Run from Render Shell:
 *   node scripts/consolidate-oem-codes.js
 *   node scripts/consolidate-oem-codes.js --dry   (preview only, no writes)
 */
'use strict';

const { Client } = require('pg');

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: 'ballast.proxy.rlwy.net', port: 18263,
      database: 'railway', user: 'postgres',
      password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
      ssl: { rejectUnauthorized: false },
    };

const DRY = process.argv.includes('--dry');

async function run() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected ✓\n');

  // Count affected products
  const { rows: [{ cnt }] } = await client.query(`
    SELECT COUNT(*) AS cnt
    FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
  `);
  console.log(`Products with non-empty competitor_codes: ${cnt}`);

  if (parseInt(cnt) === 0) {
    console.log('Nothing to consolidate. competitor_codes already empty for all products.');
    await client.end();
    return;
  }

  // Show sample before
  const { rows: samples } = await client.query(`
    SELECT sku,
      jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb))        AS oem_before,
      jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb))  AS comp_before
    FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
    ORDER BY sku LIMIT 8
  `);
  console.log('\nSample BEFORE:');
  samples.forEach(r => console.log(`  ${r.sku.padEnd(10)} oem:${r.oem_before} comp:${r.comp_before}`));

  if (DRY) {
    console.log('\n[DRY RUN] No changes made. Remove --dry to execute.');
    await client.end();
    return;
  }

  // Execute migration
  const { rowCount } = await client.query(`
    UPDATE elimfilters_catalog
    SET
      oem_codes        = COALESCE(oem_codes, '[]'::jsonb) || COALESCE(competitor_codes, '[]'::jsonb),
      competitor_codes = '[]'::jsonb
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
  `);

  console.log(`\n✅ Updated ${rowCount} products`);

  // Verify
  const { rows: check } = await client.query(`
    SELECT sku,
      jsonb_array_length(COALESCE(oem_codes,'[]'::jsonb))        AS oem_after,
      jsonb_array_length(COALESCE(competitor_codes,'[]'::jsonb))  AS comp_after
    FROM elimfilters_catalog
    WHERE sku IN (${samples.map(r => `'${r.sku}'`).join(',')})
    ORDER BY sku
  `);
  console.log('\nSample AFTER:');
  check.forEach(r => console.log(`  ${r.sku.padEnd(10)} oem:${r.oem_after} comp:${r.comp_after}`));

  const { rows: [{ remaining }] } = await client.query(`
    SELECT COUNT(*) AS remaining FROM elimfilters_catalog
    WHERE competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0
  `);
  console.log(`\nProducts still with competitor_codes: ${remaining}`);
  console.log('\nNext step: node scripts/recover-competitor-codes.js');

  await client.end();
}

run().catch(e => { console.error('FAILED:', e.message); process.exit(1); });
