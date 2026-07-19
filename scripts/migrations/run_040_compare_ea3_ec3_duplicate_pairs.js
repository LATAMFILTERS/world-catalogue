'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_040_compare_ea3_ec3_duplicate_pairs.js
 *
 * run_038's dry-run found 16 of the 17 mislabeled EA3 "cabin filter"
 * SKUs already have a matching EC3 SKU with the same 4 digits (only
 * EA31912/EC31912 had no existing counterpart). This means these 16
 * are most likely duplicate imports of the same physical product under
 * the wrong prefix, not missing classifications.
 *
 * For each pair, compares oem_codes/competitor_codes/description to
 * determine: are they exact duplicates (EA3 copy is pure dead weight,
 * safe to remove), or does the EA3 version carry unique cross-
 * reference codes the EC3 version is missing (needs a merge before
 * removal)? No writes - this only reports.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const PAIRS = [
  ['EA30007', 'EC30007'], ['EA30013', 'EC30013'], ['EA30032', 'EC30032'],
  ['EA30342', 'EC30342'], ['EA31828', 'EC31828'], ['EA31919', 'EC31919'],
  ['EA32023', 'EC32023'], ['EA32032', 'EC32032'], ['EA32035', 'EC32035'],
  ['EA32131', 'EC32131'], ['EA32226', 'EC32226'], ['EA32246', 'EC32246'],
  ['EA32345', 'EC32345'], ['EA33847', 'EC33847'], ['EA34017', 'EC34017'],
  ['EA35038', 'EC35038'],
];

function codeSet(arr) {
  if (!Array.isArray(arr)) return new Set();
  return new Set(arr.map(r => `${(r.manufacturer || r.brand || '').toUpperCase()}|${(r.code || '').toUpperCase().replace(/-/g, '')}`));
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const [ea3Sku, ec3Sku] of PAIRS) {
    const { rows } = await client.query(
      `SELECT sku, codigo_base, oem_codes, competitor_codes, description FROM elimfilters_catalog WHERE sku = ANY($1)`,
      [[ea3Sku, ec3Sku]]
    );
    const ea3 = rows.find(r => r.sku === ea3Sku);
    const ec3 = rows.find(r => r.sku === ec3Sku);

    console.log(`\n=== ${ea3Sku} vs ${ec3Sku} ===`);
    if (!ea3 || !ec3) {
      console.log(`  One or both rows missing (ea3=${!!ea3}, ec3=${!!ec3})`);
      continue;
    }

    const ea3Oem = codeSet(ea3.oem_codes);
    const ec3Oem = codeSet(ec3.oem_codes);
    const ea3Comp = codeSet(ea3.competitor_codes);
    const ec3Comp = codeSet(ec3.competitor_codes);

    const oemOnlyInEa3 = [...ea3Oem].filter(c => !ec3Oem.has(c));
    const compOnlyInEa3 = [...ea3Comp].filter(c => !ec3Comp.has(c));

    console.log(`  ea3 codigo_base=${ea3.codigo_base}  |  ec3 codigo_base=${ec3.codigo_base}`);
    console.log(`  oem_codes: ea3=${ea3Oem.size}  ec3=${ec3Oem.size}  unique-to-ea3=${oemOnlyInEa3.length}`);
    console.log(`  competitor_codes: ea3=${ea3Comp.size}  ec3=${ec3Comp.size}  unique-to-ea3=${compOnlyInEa3.length}`);
    if (oemOnlyInEa3.length) console.log(`    unique oem codes in ea3: ${oemOnlyInEa3.slice(0, 10).join(', ')}`);
    if (compOnlyInEa3.length) console.log(`    unique competitor codes in ea3: ${compOnlyInEa3.slice(0, 10).join(', ')}`);
    console.log(`  descriptions equal: ${ea3.description === ec3.description}`);
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
