'use strict';
// Temporary read-only SQL runner for LD-E audits: node fuel-ld-e-query.js <sql-file> <out-json>
const fs = require('fs');
const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL, max: 1 });
  const db = await pool.connect();
  try {
    await db.query('BEGIN READ ONLY');
    const r = await db.query(fs.readFileSync(process.argv[2], 'utf8'));
    fs.writeFileSync(process.argv[3], JSON.stringify(r.rows));
    console.log(JSON.stringify({ rows: r.rowCount }));
  } finally { await db.query('ROLLBACK'); db.release(); await pool.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
