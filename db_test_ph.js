const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function test() {
  const r = await pool.query(`SELECT * FROM oem_codes_normalized WHERE code ILIKE '%3387%' LIMIT 5`);
  console.log('Results:', r.rows);
  await pool.end();
}

test().catch(e => console.error(e));
