'use strict';
/**
 * Run on Render Shell (read-only, makes no changes):
 *   node scripts/migrations/run_018_diagnose_ld_brands_on_hd_rows.js
 *
 * Symmetric check to run_016 (which found HD-only brands on LD rows): scans
 * every HEAVY_DUTY row's oem_codes/competitor_codes for brand names that are
 * normally automotive/passenger-market (Light Duty) brands, and prints a
 * per-brand count plus a sample of affected SKUs.
 *
 * MANN and WIX are deliberately EXCLUDED from this list — ELIMFILTERS
 * confirmed both brands sell genuine Heavy Duty lines too, so a MANN/WIX
 * code on an HD row is not, by itself, proof of an error. The brands below
 * are candidates based on the known LD-scraper brand allowlist
 * (scrape_ld_crossrefs.js) minus MANN/WIX — review the per-brand counts and
 * confirm which (if any) should be added to a cleanup pass, the same way
 * FLEETGUARD/DONALDSON/BALDWIN were confirmed for the LD side.
 */
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set.');
  process.exit(1);
}

// From scrape_ld_crossrefs.js's brand allowlist, minus MANN and WIX
// (confirmed dual-market: both have genuine Heavy Duty lines).
const CANDIDATE_LD_ONLY_BRANDS = [
  'MAHLE', 'HENGST', 'BOSCH', 'FRAM', 'FILTRON', 'PURFLUX', 'UFI', 'SOFIMA',
  'NAPA', 'PUROLATOR', 'ACDELCO', 'AC DELCO', 'CHAMPION', 'SCT', 'KNECHT',
  'FEBI', 'MECAFILTER', 'CLEAN FILTERS', 'COOPERS', 'CROSLAND', 'TECNOCAR',
];

function normalizeBrand(s) {
  return String(s || '').toUpperCase().replace(/[®™]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim();
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  await client.connect();

  console.log(`\n=== Scanning HEAVY_DUTY rows for candidate LD-only brand codes ===`);
  console.log(`Candidate brands: ${CANDIDATE_LD_ONLY_BRANDS.join(', ')}\n`);

  const { rows } = await client.query(`
    SELECT sku, filter_type, oem_codes, competitor_codes
    FROM elimfilters_catalog
    WHERE duty = 'HEAVY_DUTY'
      AND (
        EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(oem_codes) = 'array' THEN oem_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
        OR EXISTS (
          SELECT 1 FROM jsonb_array_elements(
            CASE WHEN jsonb_typeof(competitor_codes) = 'array' THEN competitor_codes ELSE '[]'::jsonb END
          ) AS ref
          WHERE UPPER(COALESCE(ref->>'manufacturer', ref->>'brand', '')) = ANY($1)
        )
      )
  `, [CANDIDATE_LD_ONLY_BRANDS]);

  console.log(`Total HEAVY_DUTY rows affected: ${rows.length}\n`);

  const brandCounts = {};
  const brandSkus = {};
  const isOffending = (ref) => CANDIDATE_LD_ONLY_BRANDS.includes(normalizeBrand(ref?.manufacturer || ref?.brand || ''));

  rows.forEach(r => {
    const all = [...(r.oem_codes || []), ...(r.competitor_codes || [])].filter(isOffending);
    all.forEach(ref => {
      const b = normalizeBrand(ref.manufacturer || ref.brand);
      brandCounts[b] = (brandCounts[b] || 0) + 1;
      if (!brandSkus[b]) brandSkus[b] = new Set();
      brandSkus[b].add(r.sku);
    });
  });

  console.log('Per-brand breakdown (entry count | affected SKU count | sample SKUs):\n');
  Object.entries(brandCounts).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
    const skus = [...brandSkus[brand]];
    console.log(`${brand}: ${count} entries | ${skus.length} SKUs | sample: ${skus.slice(0, 5).join(', ')}`);
  });

  await client.end();
})().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
