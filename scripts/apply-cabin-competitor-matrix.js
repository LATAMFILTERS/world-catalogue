/**
 * apply-cabin-competitor-matrix.js
 *
 * Reads cabin_competitor_matrix.json and updates competitor_codes
 * for EC (cabin air) filter SKUs in the DB.  Run on Render Shell.
 *
 * Run:
 *   node scripts/apply-cabin-competitor-matrix.js
 *   node scripts/apply-cabin-competitor-matrix.js --dry
 */
'use strict';

const { Client } = require('pg');
const fs         = require('fs');
const path       = require('path');

const DRY_RUN     = process.argv.includes('--dry');
const MATRIX_FILE = path.join(__dirname, 'cabin_competitor_matrix.json');

const DB_CONFIG = (() => {
  const raw = process.env.DATABASE_URL || '';
  if (raw) {
    const u = new URL(raw.replace(/\?.*$/, ''));
    return {
      host:     u.hostname,
      port:     parseInt(u.port) || 5432,
      database: u.pathname.slice(1),
      user:     decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      ssl:      { rejectUnauthorized: false },
    };
  }
  return {
    connectionString: process.env.LEGACY_DB_URL,
    ssl: { rejectUnauthorized: false },
  };
})();

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY cabin competitor matrix → DB  (EC SKUs)');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MATRIX_FILE)) {
    console.error('cabin_competitor_matrix.json not found.');
    process.exit(1);
  }

  const matrix = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
  const pnums  = Object.keys(matrix).filter(p => Array.isArray(matrix[p]) && matrix[p].length > 0);
  console.log(`Matrix: ${Object.keys(matrix).length} P-numbers, ${pnums.length} with refs\n`);

  if (pnums.length === 0) {
    console.log('No entries with refs in matrix.');
    return;
  }

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  const placeholders = pnums.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE codigo_base IN (${placeholders})
       AND sku LIKE 'EC%'
       AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
     ORDER BY sku`,
    pnums
  );

  console.log(`EC SKUs to update: ${rows.length}\n`);

  if (rows.length === 0) {
    console.log('Nothing to update — all matching EC SKUs already have competitor_codes.');
    await client.end();
    return;
  }

  let updated = 0, skipped = 0;
  for (const { sku, codigo_base } of rows) {
    const refs = matrix[codigo_base];
    if (!refs || refs.length === 0) { skipped++; continue; }

    if (!DRY_RUN) {
      await client.query(
        `UPDATE elimfilters_catalog SET competitor_codes = $1::jsonb WHERE sku = $2`,
        [JSON.stringify(refs), sku]
      );
    }
    console.log(`${DRY_RUN ? '[dry]' : '✅'} ${sku} (${codigo_base}) → ${refs.length} refs`);
    updated++;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY COMPLETE');
  console.log(`  Updated : ${updated}`);
  console.log(`  Skipped : ${skipped}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
