'use strict';
/**
 * READ-ONLY. Run on Render Shell:
 *   node scripts/lookup_onan_generator_kit_codes.js
 *
 * The 9 Cummins Onan RV generator maintenance kits scraped directly from
 * shop.cummins.com's own product API (2026-07-21, see
 * scripts/scraper_cummins_api.py and
 * scripts/Generic Kits Scraper/cummins_onan_kits_api.json) use an Onan
 * part-numbering scheme (0140-xxxx / 0149-xxxx / 0167-xxxx / 0122-xxxx /
 * 0147-xxxx) that barely overlaps the "ONAN" manufacturer rows already in
 * scripts/donaldson_crossref_flat.csv (those are legacy 122-xxxx/185-xxxx
 * codes without the leading 0). Only 3/18 codes matched that CSV, and
 * ambiguously (no manufacturer/donaldson_pn attribution on the matching
 * rows). This queries the live oem_codes/competitor_codes jsonb columns
 * on elimfilters_catalog directly (same lookup elimfilters.com's own
 * /api/autocomplete uses), which has broader coverage than the static
 * CSV snapshot.
 *
 * Also checks codigo_base against the last 4 digits of each Onan code
 * (same "last 4 digits = codigo_base" convention documented in
 * CLAUDE.md for MANN LD SKU generation, per user instruction
 * 2026-07-21: "USA LA NUMERACION ONAN (ULTIMOS 4 NUMEROS)").
 *
 * Pure SELECT - no --apply flag, nothing is written.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

// One entry per unique component code found across the 9 kits.
const CODES = [
  '0122-0833', '0122-0836', '0122-0893', '0140-2897', '0140-3071',
  '0140-3116', '0140-3280', '0140-3295', '0147-0860', '0149-2341-01',
  '0149-2457', '0149-2513', '0149-2661', '0167-0275', '0167-0305',
  '0167-1638', '0167-1652', 'A030Y328',
];

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  for (const code of CODES) {
    const digitsOnly = code.replace(/\D/g, '');
    const last4 = digitsOnly.slice(-4);
    const normalized = code.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    const { rows } = await client.query(
      `SELECT sku, filter_type, duty, ref->>'code' AS matched_code, 'OEM' AS source
         FROM elimfilters_catalog, jsonb_array_elements(oem_codes) AS ref
        WHERE UPPER(REGEXP_REPLACE(ref->>'code', '[^A-Za-z0-9]', '', 'g')) = $1
        UNION ALL
       SELECT sku, filter_type, duty, ref->>'code' AS matched_code, 'COMPETITOR' AS source
         FROM elimfilters_catalog, jsonb_array_elements(competitor_codes) AS ref
        WHERE UPPER(REGEXP_REPLACE(ref->>'code', '[^A-Za-z0-9]', '', 'g')) = $1
        UNION ALL
       SELECT sku, filter_type, duty, codigo_base AS matched_code, 'CODIGO_BASE' AS source
         FROM elimfilters_catalog
        WHERE codigo_base = $2`,
      [normalized, last4]
    );
    console.log(`\n${code}  (normalized=${normalized}, last4=${last4})  -> ${rows.length} match(es)`);
    for (const r of rows) {
      console.log(`    sku=${r.sku}  filter_type=${r.filter_type}  duty=${r.duty}  matched_code=${r.matched_code}  source=${r.source}`);
    }
  }

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
