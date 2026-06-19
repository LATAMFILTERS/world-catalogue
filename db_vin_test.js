const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
  // 1. What does kg_equipment_makes look like?
  console.log('\n=== kg_equipment_makes COLUMNS + SAMPLE ===');
  let r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='kg_equipment_makes' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name}`));
  r = await pool.query(`SELECT * FROM kg_equipment_makes LIMIT 10`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  // 2. What does kg_equipment_models look like?
  console.log('\n=== kg_equipment_models COLUMNS + SAMPLE ===');
  r = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name='kg_equipment_models' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name}`));
  r = await pool.query(`SELECT * FROM kg_equipment_models LIMIT 10`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  // 3. Try to find Toyota / Hilux
  console.log('\n=== SEARCH: TOYOTA in makes ===');
  r = await pool.query(`SELECT * FROM kg_equipment_makes WHERE name ILIKE '%toyota%' LIMIT 5`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  // 4. Try to find Hilux
  console.log('\n=== SEARCH: HILUX in models ===');
  r = await pool.query(`SELECT * FROM kg_equipment_models WHERE name ILIKE '%hilux%' LIMIT 5`);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  // 5. Full join: filters that fit a HILUX
  console.log('\n=== FILTERS FOR HILUX ===');
  r = await pool.query(`
    SELECT m.name as model, mk.name as make, pe.product_sku, pe.fit_type
    FROM kg_equipment_models m
    JOIN kg_equipment_makes mk ON mk.id = m.make_id
    JOIN kg_product_equipment pe ON pe.model_id = m.id
    WHERE m.name ILIKE '%hilux%'
    LIMIT 10
  `);
  r.rows.forEach(row => console.log(JSON.stringify(row)));

  // 6. equipment_vin columns
  console.log('\n=== equipment_vin COLUMNS ===');
  r = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='equipment_vin' ORDER BY ordinal_position`);
  r.rows.forEach(row => console.log(` ${row.column_name} (${row.data_type})`));

  await pool.end();
}

test().catch(e => { console.error(e.message); pool.end(); });
