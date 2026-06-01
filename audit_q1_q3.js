'use strict';
const { Client } = require('pg');
const client = new Client({
  host: 'ballast.proxy.rlwy.net',
  port: 18263,
  database: 'railway',
  user: 'postgres',
  password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('CONNECTED');

  console.log('\n=== Q1: Technology audit ===');
  let r = await client.query('SELECT technology, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY technology ORDER BY cnt DESC');
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q2: Filter type audit ===');
  r = await client.query('SELECT filter_type, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY filter_type ORDER BY cnt DESC');
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q3: Total products and basic completeness ===');
  r = await client.query(`SELECT
    COUNT(*) as total,
    COUNT(CASE WHEN technology IS NOT NULL AND technology != '' THEN 1 END) as has_technology,
    COUNT(CASE WHEN oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0 THEN 1 END) as has_oem,
    COUNT(CASE WHEN competitor_codes IS NOT NULL AND jsonb_array_length(competitor_codes) > 0 THEN 1 END) as has_competitor,
    COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) as has_equipment,
    COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as has_description,
    COUNT(CASE WHEN outer_diameter_mm IS NOT NULL THEN 1 END) as has_od,
    COUNT(CASE WHEN height_mm IS NOT NULL THEN 1 END) as has_height,
    COUNT(CASE WHEN thread_size IS NOT NULL AND thread_size != '' THEN 1 END) as has_thread,
    COUNT(CASE WHEN iso_test_method IS NOT NULL AND iso_test_method != '' THEN 1 END) as has_iso,
    COUNT(CASE WHEN burst_pressure_psi IS NOT NULL THEN 1 END) as has_burst,
    COUNT(CASE WHEN collapse_pressure_psi IS NOT NULL THEN 1 END) as has_collapse,
    COUNT(CASE WHEN alternatives IS NOT NULL AND jsonb_array_length(alternatives) > 0 THEN 1 END) as has_alternatives,
    COUNT(CASE WHEN brand_crossrefs IS NOT NULL AND brand_crossrefs != '{}'::jsonb THEN 1 END) as has_brand_crossrefs
  FROM elimfilters_catalog`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  await client.end();
}
run().catch(e => { console.error('FAILED:', e.message, e.stack); process.exit(1); });
