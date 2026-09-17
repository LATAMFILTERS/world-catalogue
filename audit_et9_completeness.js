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

const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

async function main() {
  const r = await pool.query(`
    SELECT
      sku,
      COALESCE(name, '') AS name,
      duty,
      technology,
      jsonb_array_length(COALESCE(oem_codes, '[]'::jsonb)) AS oem_cnt,
      jsonb_array_length(COALESCE(competitor_codes, '[]'::jsonb)) AS comp_cnt,
      jsonb_array_length(COALESCE(equipment_applications, '[]'::jsonb)) AS equip_cnt,
      jsonb_array_length(COALESCE(vehicle_applications, '[]'::jsonb)) AS vehicle_cnt,
      (technical_specifications IS NOT NULL
        AND technical_specifications <> '{}'::jsonb) AS has_specs
    FROM elimfilters_catalog
    WHERE sku LIKE 'ET9%'
    ORDER BY sku
  `);

  const total = r.rows.length;
  const missingSpecs = r.rows.filter(row => !row.has_specs);
  const missingOem = r.rows.filter(row => row.oem_cnt === 0);
  const missingComp = r.rows.filter(row => row.comp_cnt === 0);
  const missingApps = r.rows.filter(row => row.equip_cnt === 0 && row.vehicle_cnt === 0);
  const fullyComplete = r.rows.filter(row =>
    row.has_specs && row.oem_cnt > 0 && row.comp_cnt > 0 && (row.equip_cnt > 0 || row.vehicle_cnt > 0)
  );

  console.log(`ET9 total: ${total}`);
  console.log(`Fully complete (specs + OEM + cross-ref + applications): ${fullyComplete.length}/${total}`);
  console.log(`Missing technical_specifications: ${missingSpecs.length}`);
  console.log(`Missing oem_codes: ${missingOem.length}`);
  console.log(`Missing competitor_codes: ${missingComp.length}`);
  console.log(`Missing equipment_applications AND vehicle_applications: ${missingApps.length}`);

  console.log('\n--- per-SKU gap detail (incomplete only) ---');
  for (const row of r.rows) {
    const gaps = [];
    if (!row.has_specs) gaps.push('specs');
    if (row.oem_cnt === 0) gaps.push('oem');
    if (row.comp_cnt === 0) gaps.push('crossref');
    if (row.equip_cnt === 0 && row.vehicle_cnt === 0) gaps.push('applications');
    if (gaps.length) {
      console.log(`  ${row.sku} | ${row.duty || '-'} | ${row.technology || '-'} | missing: ${gaps.join(', ')} | ${row.name.substring(0, 50)}`);
    }
  }

  await pool.end();
}

main().catch(e => { console.error(e.message); pool.end(); process.exit(1); });
