const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
  // Get actual column names
  console.log('\n=== elimfilters_catalog COLUMNS ===');
  let r = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='elimfilters_catalog' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name} (${row.data_type})`));

  console.log('\n=== elimfilters_catalog SAMPLE ===');
  r = await pool.query(`SELECT * FROM elimfilters_catalog LIMIT 2`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== code_mapping COLUMNS ===');
  r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='code_mapping' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name}`));

  console.log('\n=== code_mapping SAMPLE (first 3) ===');
  r = await pool.query(`SELECT * FROM code_mapping LIMIT 3`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== kg_product_equipment COLUMNS ===');
  r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='kg_product_equipment' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name}`));

  console.log('\n=== kg_product_equipment SAMPLE ===');
  r = await pool.query(`SELECT * FROM kg_product_equipment LIMIT 3`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  console.log('\n=== SERVER ROUTES ===');
  const fs = require('fs');
  const server = fs.readFileSync('server.js', 'utf8');
  const routes = server.match(/app\.(get|post)\(['"` ][^'"` ]+/g) || [];
  const unique = [...new Set(routes)];
  unique.slice(0,30).forEach(r => console.log(' ', r.replace(/app\.(get|post)\(['"` ]/, '$1 ')));

  await pool.end();
}

test().catch(e => { console.error(e.message); pool.end(); });
