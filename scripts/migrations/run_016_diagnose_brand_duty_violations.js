'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_016_diagnose_brand_duty_violations.js
 *
 * Business rule confirmed by ELIMFILTERS: cross-reference brand and product
 * duty class must always agree. FLEETGUARD, DONALDSON, and BALDWIN are
 * Heavy Duty-only brands in this catalog — a code from one of them must
 * never appear on a LIGHT_DUTY row (and, symmetrically, a Light Duty-only
 * brand code must never appear on a HEAVY_DUTY row).
 *
 * This scans oem_codes and competitor_codes on every row for exactly that
 * violation and prints every offending SKU + the bad entries, so the wrong
 * cross-reference entries can be identified before deciding how to fix them
 * (remove the entry vs. re-home it on the correct SKU).
 *
 * HD_ONLY_BRANDS below is deliberately limited to brands the user has
 * explicitly confirmed are Heavy Duty-only (FLEETGUARD, DONALDSON, BALDWIN).
 * MANN and WIX are NOT included — both sell genuine Heavy Duty and Light
 * Duty lines, so a MANN/WIX code on either duty class is not, by itself,
 * proof of an error. Extend the list only after confirming a brand is
 * genuinely single-duty.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const HD_ONLY_BRANDS = ['FLEETGUARD', 'DONALDSON', 'BALDWIN'];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function normalizeBrand(s) {
  return String(s || '').toUpperCase().replace(/[®™]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim();
}

(async () => {
  await client.connect();

  console.log(`\n=== Scanning for HD-only brand codes (${HD_ONLY_BRANDS.join(', ')}) on LIGHT_DUTY rows ===\n`);

  const { rows } = await client.query(`
    SELECT sku, duty, technology, filter_type, oem_codes, competitor_codes
    FROM elimfilters_catalog c
    WHERE duty = 'LIGHT_DUTY'
      AND (
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
      )
    ORDER BY sku
  `, [HD_ONLY_BRANDS]);

  console.log(`Total LIGHT_DUTY rows with an HD-only brand code: ${rows.length}\n`);

  const isOffending = (ref) => HD_ONLY_BRANDS.includes(normalizeBrand(ref.manufacturer || ref.brand));

  rows.forEach(r => {
    const badOem = (r.oem_codes || []).filter(isOffending);
    const badComp = (r.competitor_codes || []).filter(isOffending);
    console.log(`SKU: ${r.sku}  |  technology: ${r.technology}  |  filter_type: ${r.filter_type}`);
    if (badOem.length) console.log('  bad oem_codes:', JSON.stringify(badOem));
    if (badComp.length) console.log('  bad competitor_codes:', JSON.stringify(badComp));
    console.log('');
  });

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
