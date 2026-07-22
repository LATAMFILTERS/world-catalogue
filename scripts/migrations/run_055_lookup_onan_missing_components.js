'use strict';
/**
 * READ-ONLY. Run on Render Shell:
 *   node run_055_lookup_onan_missing_components.js
 *
 * Checks the Wix/Napa Gold/Stens/Fram/Baldwin/Fleetguard/Donaldson
 * cross-reference codes gathered from external research (2026-07-21,
 * see chat) for the 8 Onan component codes still missing a catalog
 * match after run_054 (0149-2457, 0140-3116, 0147-0860, 0122-0893,
 * 0149-2341-01, A030Y328, 0149-2661 - 0140-2897 has no external lead
 * yet). Pure SELECT, nothing written.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

// onan code -> candidate cross-reference codes (any brand)
const CANDIDATES = {
  '0149-2457': ['WF10418', '3418', '120-109', 'G10147'],
  '0140-3116': ['9087', 'P614367', 'AF26659'],
  '0147-0860': ['33310', 'FF5190', 'G7393'],
  '0122-0893': ['LF16011', '51064', '51356', '1356', 'B1402'],
  '0149-2341-01': ['WF10437', '3437'],
  'A030Y328': ['WA10986', '9986', '100-111', '15993'],
  '0149-2661': ['WF10419', '3419', '120-101'],
};

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const [onanCode, candidates] of Object.entries(CANDIDATES)) {
    console.log(`\n${onanCode}`);
    for (const code of candidates) {
      const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const { rows } = await client.query(
        `SELECT sku, filter_type, duty, ref->>'manufacturer' mfr, ref->>'code' matched_code
           FROM elimfilters_catalog, jsonb_array_elements(oem_codes||competitor_codes) ref
          WHERE UPPER(REGEXP_REPLACE(ref->>'code', '[^A-Za-z0-9]', '', 'g')) = $1
          UNION ALL
         SELECT sku, filter_type, duty, 'CODIGO_BASE' mfr, codigo_base matched_code
           FROM elimfilters_catalog WHERE codigo_base = $2`,
        [normalized, code]
      );
      console.log(`  ${code}  -> ${rows.length} match(es)`);
      for (const r of rows) {
        console.log(`      sku=${r.sku}  type=${r.filter_type}  duty=${r.duty}  mfr=${r.mfr}  code=${r.matched_code}`);
      }
    }
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
