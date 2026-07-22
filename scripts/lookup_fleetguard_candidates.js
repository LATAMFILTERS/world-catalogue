'use strict';
/**
 * READ-ONLY. Run on Render Shell (or paste as one-liner if git isn't
 * synced there - see chat).
 *
 * Checks elimfilters_catalog's oem_codes/competitor_codes for the
 * Fleetguard candidate codes found by scraper_onan_fleetguard_crossref.py
 * for the 6 Onan generator kit component codes that had at least one
 * Fleetguard cross-reference (2026-07-21). If we already stock a SKU
 * cross-referenced to one of the ambiguous candidates, that resolves
 * the ambiguity without guessing.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

// onan code -> Fleetguard candidates found on oilfilter/airfilter/fuelfilter-crossreference.com
const CANDIDATES = {
  '0122-0833': ['LF3591'],
  '0122-0836': ['LF16035', 'LF16165'],
  '0140-3071': ['AF25538', 'AF25550', 'AF25745', 'AH19082'],
  '0140-3280': ['AF1657', 'AF25332', 'AF25345', 'AF27684'],
  '0140-3295': ['AF1657', 'AF25332', 'AF25345', 'AF27684'],
  '0149-2513': ['FF236'],
};

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const [onanCode, candidates] of Object.entries(CANDIDATES)) {
    console.log(`\n${onanCode}`);
    for (const fg of candidates) {
      const normalized = fg.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      const { rows } = await client.query(
        `SELECT sku, filter_type, duty, ref->>'code' AS matched_code, 'OEM' AS source
           FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
          WHERE UPPER(REGEXP_REPLACE(ref->>'code', '[^A-Za-z0-9]', '', 'g')) = $1
          UNION ALL
         SELECT sku, filter_type, duty, ref->>'code' AS matched_code, 'COMPETITOR' AS source
           FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
          WHERE UPPER(REGEXP_REPLACE(ref->>'code', '[^A-Za-z0-9]', '', 'g')) = $1`,
        [normalized]
      );
      console.log(`  Fleetguard ${fg}  -> ${rows.length} match(es)`);
      for (const r of rows) {
        console.log(`      sku=${r.sku}  filter_type=${r.filter_type}  duty=${r.duty}  matched_code=${r.matched_code}  source=${r.source}`);
      }
    }
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
