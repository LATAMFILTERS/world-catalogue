'use strict';

/**
 * Real gap audit for Fleetguard ET9 (TURBOCORE™) SKUs.
 *
 * Does NOT write anything. Reports, per SKU, whether the record actually
 * has technical specs / OEM codes / competitor cross-references /
 * equipment or vehicle applications populated — the fields the "187/187
 * scraped" close claim did not actually verify.
 *
 * Requires DATABASE_URL (or CATALOG_DATABASE_URL) pointed at the live
 * catalog. Not runnable in this sandbox (no DB credentials here).
 */

require('dotenv').config();
const { Pool } = require('pg');

const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('CATALOG_DATABASE_URL or DATABASE_URL is required');
  process.exit(1);
}

const isLocalHost = /@(localhost|127\.0\.0\.1)(:|\/)/.test(connectionString);
const pool = new Pool({
  connectionString,
  ssl: isLocalHost ? false : { rejectUnauthorized: false },
});

async function main() {
  const r = await pool.query(`
    SELECT
      sku,
      COALESCE(name, '') AS name,
      duty,
      technology,
      CASE WHEN jsonb_typeof(oem_codes) = 'array' THEN jsonb_array_length(oem_codes) ELSE 0 END AS oem_cnt,
      CASE WHEN jsonb_typeof(competitor_codes) = 'array' THEN jsonb_array_length(competitor_codes) ELSE 0 END AS comp_cnt,
      CASE WHEN jsonb_typeof(brand_crossrefs) = 'array' THEN jsonb_array_length(brand_crossrefs) ELSE 0 END AS brand_crossref_cnt,
      CASE WHEN jsonb_typeof(equipment_applications) = 'array' THEN jsonb_array_length(equipment_applications) ELSE 0 END AS equip_cnt,
      CASE WHEN jsonb_typeof(vehicle_applications) = 'array' THEN jsonb_array_length(vehicle_applications) ELSE 0 END AS vehicle_cnt,
      (
        (specs IS NOT NULL AND specs <> '{}'::jsonb)
        OR micron_rating IS NOT NULL
        OR filter_media IS NOT NULL
        OR nominal_efficiency IS NOT NULL
        OR height_mm IS NOT NULL
        OR outer_diameter_mm IS NOT NULL
      ) AS has_specs
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    ORDER BY sku
  `);

  const total = r.rows.length;
  const hasCrossref = row => row.comp_cnt > 0 || row.brand_crossref_cnt > 0;
  const missingSpecs = r.rows.filter(row => !row.has_specs);
  const missingOem = r.rows.filter(row => row.oem_cnt === 0);
  const missingComp = r.rows.filter(row => !hasCrossref(row));
  const missingApps = r.rows.filter(row => row.equip_cnt === 0 && row.vehicle_cnt === 0);
  const fullyComplete = r.rows.filter(row =>
    row.has_specs && row.oem_cnt > 0 && hasCrossref(row) && (row.equip_cnt > 0 || row.vehicle_cnt > 0)
  );

  console.log(`ET9 total: ${total}`);
  console.log(`Fully complete (specs + OEM + cross-ref + applications): ${fullyComplete.length}/${total}`);
  console.log(`Missing specs (specs jsonb + core spec columns all empty): ${missingSpecs.length}`);
  console.log(`Missing oem_codes: ${missingOem.length}`);
  console.log(`Missing competitor_codes AND brand_crossrefs: ${missingComp.length}`);
  console.log(`Missing equipment_applications AND vehicle_applications: ${missingApps.length}`);

  console.log('\n--- per-SKU gap detail (incomplete only) ---');
  for (const row of r.rows) {
    const gaps = [];
    if (!row.has_specs) gaps.push('specs');
    if (row.oem_cnt === 0) gaps.push('oem');
    if (!hasCrossref(row)) gaps.push('crossref');
    if (row.equip_cnt === 0 && row.vehicle_cnt === 0) gaps.push('applications');
    if (gaps.length) {
      console.log(`  ${row.sku} | ${row.duty || '-'} | ${row.technology || '-'} | missing: ${gaps.join(', ')} | ${row.name.substring(0, 50)}`);
    }
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
