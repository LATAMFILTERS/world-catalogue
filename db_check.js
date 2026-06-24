const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function check() {
  try {
    // List all tables
    const tables = await pool.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('\n=== TABLES ===');
    tables.rows.forEach(r => console.log(' -', r.table_name));

    // Count rows in key tables
    const keyTables = ['catalog', 'filters', 'filter_catalog', 'products', 'competitor_codes', 'oem_codes', 'equipment_applications', 'vehicle_applications', 'crossref'];
    console.log('\n=== ROW COUNTS ===');
    for (const t of tables.rows.map(r => r.table_name)) {
      try {
        const res = await pool.query(`SELECT COUNT(*) as n FROM "${t}"`);
        console.log(` ${t}: ${res.rows[0].n}`);
      } catch(e) {
        console.log(` ${t}: ERROR - ${e.message}`);
      }
    }

    // Test a sample search
    console.log('\n=== SAMPLE SEARCH (LF3000) ===');
    try {
      const q = `
        SELECT table_name, column_name 
        FROM information_schema.columns 
        WHERE table_schema='public' 
        AND column_name ILIKE '%sku%' OR column_name ILIKE '%part%' OR column_name ILIKE '%code%'
        ORDER BY table_name, column_name
        LIMIT 30
      `;
      const cols = await pool.query(q);
      cols.rows.forEach(r => console.log(` ${r.table_name}.${r.column_name}`));
    } catch(e) {
      console.log(' Error:', e.message);
    }

  } catch(e) {
    console.error('FATAL:', e.message);
  } finally {
    await pool.end();
  }
}

check();
