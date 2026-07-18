'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_035_rav4_oem_code_lookup.js
 *
 * Cross-checks the DURATECH RAV4 2022 pilot candidates against real
 * Toyota OEM part numbers for the 4 standard maintenance filters
 * (engine air, cabin air, oil, fuel), instead of relying only on
 * vehicle_applications fuzzy matching. Searches oem_codes for each OEM
 * code (hyphens stripped, matching the normalization used elsewhere in
 * this codebase) to find the exact ELIMFILTERS SKU that cross-
 * references it.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const OEM_CODES = {
  'Engine air filter':  ['17801-F0020', '17801-25020'],
  'Cabin air filter':   ['87139-06080', '87139-58010'],
  'Oil filter':         ['04152-YZZA6', '04152-37010'],
  'Fuel filter':        ['77024-42110'],
};

function normalize(code) {
  return code.toUpperCase().replace(/-/g, '');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const [label, codes] of Object.entries(OEM_CODES)) {
    console.log(`\n=== ${label} ===`);
    for (const code of codes) {
      const normCode = normalize(code);
      console.log(`  OEM ${code} (normalized: ${normCode}):`);
      const { rows } = await client.query(`
        SELECT c.sku, c.codigo_base, c.filter_type, c.technology, c.duty, ref->>'code' AS matched_oem_code
        FROM elimfilters_catalog c,
          LATERAL jsonb_array_elements(
            CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
          ) ref
        WHERE UPPER(REPLACE(ref->>'code', '-', '')) = $1
      `, [normCode]);
      if (!rows.length) {
        console.log('    No match found.');
      } else {
        rows.forEach(r => console.log(`    ${r.sku}  (${r.codigo_base})  ${r.filter_type}  ${r.technology}  duty=${r.duty}  matched="${r.matched_oem_code}"`));
      }
    }
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
