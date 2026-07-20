/**
 * resolve-alternatives.js — One-time migration
 *
 * alternatives[] is stored as codigo_base values (Donaldson P-codes like "P552100").
 * This script replaces every P-code with its ELIMFILTERS SKU (e.g. "EL82100").
 * Unresolvable codes (no matching codigo_base in the catalog) are dropped.
 *
 * Run from Render Shell:
 *   node scripts/resolve-alternatives.js
 *   node scripts/resolve-alternatives.js --dry   (preview only, no writes)
 */
'use strict';

const { Client } = require('pg');

const DB_CONFIG = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      connectionString: process.env.LEGACY_DB_URL,
      ssl: { rejectUnauthorized: false },
    };

const DRY = process.argv.includes('--dry');

async function run() {
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log(DRY ? '[DRY RUN — no writes]\n' : '[LIVE RUN]\n');

  // 1. Load all products that have a non-empty alternatives array
  const { rows: products } = await client.query(`
    SELECT sku, alternatives
    FROM elimfilters_catalog
    WHERE alternatives IS NOT NULL
      AND jsonb_typeof(alternatives) = 'array'
      AND jsonb_array_length(alternatives) > 0
  `);
  console.log(`Products with alternatives: ${products.length}`);

  // 2. Collect all unique P-codes across all alternatives arrays
  const allCodes = new Set();
  for (const p of products) {
    for (const a of p.alternatives) {
      const code = typeof a === 'object' ? (a.sku || a.code || '') : String(a);
      if (code) allCodes.add(code.toUpperCase());
    }
  }
  console.log(`Unique alternative codes to resolve: ${allCodes.size}`);

  // 3. Batch-resolve: codigo_base → sku
  const { rows: resolved } = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE UPPER(codigo_base) = ANY($1)`,
    [[...allCodes]]
  );

  const codeToSku = {};
  for (const r of resolved) {
    if (r.codigo_base) codeToSku[r.codigo_base.toUpperCase()] = r.sku;
  }
  console.log(`Resolved ${Object.keys(codeToSku).length} of ${allCodes.size} codes\n`);

  // 4. Update each product
  let updated = 0, skipped = 0, unchanged = 0;

  for (const p of products) {
    const resolvedSkus = [];
    for (const a of p.alternatives) {
      const code = (typeof a === 'object' ? (a.sku || a.code || '') : String(a)).toUpperCase();
      const elSku = codeToSku[code];
      if (elSku) {
        resolvedSkus.push(elSku);
      } else {
        console.log(`  [SKIP] ${p.sku} — cannot resolve alternative "${code}"`);
      }
    }

    if (resolvedSkus.length === 0) {
      // No resolvable alternatives — clear the array to avoid showing P-codes
      if (!DRY) {
        await client.query(
          `UPDATE elimfilters_catalog SET alternatives = '[]'::jsonb WHERE sku = $1`,
          [p.sku]
        );
      }
      console.log(`  [CLEAR] ${p.sku} — no resolvable alternatives, cleared`);
      skipped++;
      continue;
    }

    // Check if already resolved (all entries are EL-SKUs)
    const alreadyResolved = p.alternatives.every(a => {
      const v = typeof a === 'object' ? (a.sku || a.code || '') : String(a);
      return v.toUpperCase().startsWith('EL') || v.toUpperCase().startsWith('EA') || v.toUpperCase().startsWith('EH') || v.toUpperCase().startsWith('EF');
    });
    if (alreadyResolved) {
      unchanged++;
      continue;
    }

    console.log(`  [UPDATE] ${p.sku} → [${resolvedSkus.join(', ')}]`);

    if (!DRY) {
      await client.query(
        `UPDATE elimfilters_catalog
         SET alternatives = $1::jsonb
         WHERE sku = $2`,
        [JSON.stringify(resolvedSkus), p.sku]
      );
    }
    updated++;
  }

  console.log(`\n── Summary ──`);
  console.log(`  Updated:   ${updated}`);
  console.log(`  Cleared:   ${skipped} (no resolvable alternatives)`);
  console.log(`  Unchanged: ${unchanged} (already resolved)`);
  if (DRY) console.log('\n[DRY RUN — run without --dry to apply changes]');

  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
