'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_044_cl120_series60_oem_lookup.js
 *
 * Cross-checks the DURATECH Freightliner CL120 + Detroit Diesel
 * Series 60 pilot against real cross-reference codes for its 5
 * standard maintenance filters (oil x2 in parallel, fuel primary
 * water separator, fuel secondary fine filter, coolant, engine air).
 * Detroit OEM numbers are searched in oem_codes; Fleetguard/Donaldson/
 * Baldwin/Luber-Finer codes are searched in competitor_codes, since
 * those are aftermarket cross-reference brands in this catalog, not
 * OEM manufacturer codes.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

const OEM_LOOKUPS = {
  'Oil filter (x2, parallel)': { manufacturer: 'DETROIT', codes: ['23530573'] },
  'Fuel filter - primary (water separator)': { manufacturer: 'DETROIT', codes: ['23530706'] },
  'Fuel filter - secondary (fine, 3-5 micron)': { manufacturer: 'DETROIT', codes: ['23530707'] },
  'Coolant filter': { manufacturer: 'DETROIT', codes: ['23524403', '23507545'] },
};

const COMPETITOR_LOOKUPS = {
  'Oil filter (x2, parallel)': ['LF3620', 'LF9001', 'P552100', 'B495'],
  'Fuel filter - primary (water separator)': ['FS19765', 'P551011'],
  'Fuel filter - secondary (fine, 3-5 micron)': ['FF5369', 'P550467', 'BF5813'],
  'Coolant filter': ['BW5137', 'WF2071', 'WF2123', 'P554685'],
  'Engine air filter': ['AF25139M', 'P527682', 'RS3518', 'LAF1849'],
};

function normalize(code) {
  return code.toUpperCase().replace(/[\s-]/g, '');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const label of new Set([...Object.keys(OEM_LOOKUPS), ...Object.keys(COMPETITOR_LOOKUPS)])) {
    console.log(`\n=== ${label} ===`);

    const oem = OEM_LOOKUPS[label];
    if (oem) {
      for (const code of oem.codes) {
        const normCode = normalize(code);
        const { rows } = await client.query(`
          SELECT c.sku, c.codigo_base, c.filter_type, c.technology, c.duty, ref->>'code' AS matched_code
          FROM elimfilters_catalog c,
            LATERAL jsonb_array_elements(
              CASE WHEN jsonb_typeof(c.oem_codes) = 'array' THEN c.oem_codes ELSE '[]'::jsonb END
            ) ref
          WHERE UPPER(REPLACE(ref->>'code', '-', '')) = $1
        `, [normCode]);
        console.log(`  [OEM Detroit] ${code}:`);
        if (!rows.length) console.log('    No match.');
        rows.forEach(r => console.log(`    ${r.sku}  (${r.codigo_base})  ${r.filter_type}  ${r.technology}  duty=${r.duty}`));
      }
    }

    const comp = COMPETITOR_LOOKUPS[label];
    if (comp) {
      for (const code of comp) {
        const normCode = normalize(code);
        const { rows } = await client.query(`
          SELECT c.sku, c.codigo_base, c.filter_type, c.technology, c.duty, ref->>'code' AS matched_code, ref->>'brand' AS matched_brand
          FROM elimfilters_catalog c,
            LATERAL jsonb_array_elements(
              CASE WHEN jsonb_typeof(c.competitor_codes) = 'array' THEN c.competitor_codes ELSE '[]'::jsonb END
            ) ref
          WHERE UPPER(REPLACE(ref->>'code', '-', '')) = $1
        `, [normCode]);
        console.log(`  [Competitor] ${code}:`);
        if (!rows.length) console.log('    No match.');
        rows.forEach(r => console.log(`    ${r.sku}  (${r.codigo_base})  ${r.filter_type}  ${r.technology}  duty=${r.duty}  brand=${r.matched_brand}`));
      }
    }
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
