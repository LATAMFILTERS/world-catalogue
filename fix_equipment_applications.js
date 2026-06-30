const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const lines = fs.readFileSync('/opt/render/project/src/scripts/donaldson_import_ready.jsonl', 'utf8').trim().split('\n');
  const all = lines.map(l => JSON.parse(l));

  // Check if equipment_applications column exists
  const colCheck = await pool.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name='elimfilters_catalog' AND column_name='equipment_applications'
  `);

  if (colCheck.rows.length === 0) {
    console.log('Adding equipment_applications column...');
    await pool.query('ALTER TABLE elimfilters_catalog ADD COLUMN equipment_applications jsonb DEFAULT NULL');
    console.log('Column added.');
  } else {
    console.log('Column equipment_applications already exists.');
  }

  let updated = 0;
  let skipped = 0;

  for (const p of all) {
    const equip = p.equipment_applications;
    if (!equip || equip.length === 0) { skipped++; continue; }

    await pool.query(
      'UPDATE elimfilters_catalog SET equipment_applications=$1::jsonb WHERE sku=$2',
      [JSON.stringify(equip), p.sku]
    );
    updated++;
    if (updated % 50 === 0) process.stdout.write('.');
  }

  console.log('\nUpdated:', updated, '| Skipped (no equipment data):', skipped);
  await pool.end();
}
main().catch(e => { console.error(e.message); pool.end(); });
