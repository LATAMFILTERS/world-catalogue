'use strict';
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.LEGACY_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('CONNECTED');

  console.log('\n=== Q11: pgvector check ===');
  let r = await client.query("SELECT extname, extversion FROM pg_extension WHERE extname = 'vector'");
  console.log('vector extension:', JSON.stringify(r.rows));
  r = await client.query('SELECT extname, extversion FROM pg_extension ORDER BY extname');
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q12: Duty distribution ===');
  r = await client.query('SELECT duty, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY duty ORDER BY cnt DESC');
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q13: Filter type + technology cross ===');
  r = await client.query('SELECT filter_type, technology, COUNT(*) as cnt FROM elimfilters_catalog GROUP BY filter_type, technology ORDER BY filter_type, cnt DESC');
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q14: Alternatives format sample ===');
  r = await client.query(`SELECT sku, alternatives
  FROM elimfilters_catalog
  WHERE alternatives IS NOT NULL
    AND jsonb_array_length(alternatives) > 0
  LIMIT 20`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q15: Sub_type distribution ===');
  r = await client.query(`SELECT sub_type, COUNT(*) as cnt
  FROM elimfilters_catalog
  GROUP BY sub_type
  ORDER BY cnt DESC
  LIMIT 30`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q16: Description format sample ===');
  r = await client.query(`SELECT sku, LEFT(description::text, 200) as desc_preview
  FROM elimfilters_catalog
  WHERE description IS NOT NULL AND description != ''
  LIMIT 10`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q17: Null/empty analysis by filter_type ===');
  r = await client.query(`SELECT
    filter_type,
    COUNT(*) as total,
    COUNT(CASE WHEN oem_codes IS NOT NULL AND jsonb_array_length(oem_codes) > 0 THEN 1 END) as has_oem,
    COUNT(CASE WHEN equipment_applications IS NOT NULL AND jsonb_array_length(equipment_applications) > 0 THEN 1 END) as has_equip,
    COUNT(CASE WHEN technology IS NOT NULL AND technology != '' THEN 1 END) as has_tech
  FROM elimfilters_catalog
  GROUP BY filter_type
  ORDER BY total DESC`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q18: Existing tables in DB ===');
  r = await client.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q19: Column list of elimfilters_catalog ===');
  r = await client.query(`SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns
  WHERE table_name = 'elimfilters_catalog'
  ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== Q20: Kit tables content sample ===');
  try {
    r = await client.query('SELECT * FROM maintenance_kits LIMIT 5');
    console.log('maintenance_kits sample:');
    r.rows.forEach(row => console.log(JSON.stringify(row)));
  } catch(e) { console.log('maintenance_kits error:', e.message); }

  try {
    r = await client.query('SELECT * FROM kit_components LIMIT 10');
    console.log('kit_components sample:');
    r.rows.forEach(row => console.log(JSON.stringify(row)));
  } catch(e) { console.log('kit_components error:', e.message); }

  try {
    r = await client.query('SELECT COUNT(*) FROM maintenance_kits');
    console.log('maintenance_kits count:', JSON.stringify(r.rows[0]));
  } catch(e) { console.log('maintenance_kits count error:', e.message); }

  try {
    r = await client.query('SELECT COUNT(*) FROM kit_components');
    console.log('kit_components count:', JSON.stringify(r.rows[0]));
  } catch(e) { console.log('kit_components count error:', e.message); }

  await client.end();
}
run().catch(e => { console.error('FAILED:', e.message, e.stack); process.exit(1); });
