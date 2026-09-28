'use strict';
// Temporary read-only export of LD fuel BLOCKED_EVIDENCE_REQUIRED rows for LD-E batches.
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const OUT = process.argv[2];
const terminal = require('../../candidates/fuel_global_ld_terminal_20260927.json').terminals
  .filter((r) => r.terminal_state === 'BLOCKED_EVIDENCE_REQUIRED');
(async () => {
  const pool = new Pool({ connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL, max: 1 });
  const r = await pool.query('SELECT * FROM elimfilters_catalog WHERE sku = ANY($1)', [terminal.map((t) => t.sku)]);
  fs.writeFileSync(OUT, JSON.stringify(r.rows));
  console.log(JSON.stringify({ requested: terminal.length, rows: r.rowCount, out: path.resolve(OUT) }));
  await pool.end();
})().catch((e) => { console.error(e.message); process.exit(1); });
