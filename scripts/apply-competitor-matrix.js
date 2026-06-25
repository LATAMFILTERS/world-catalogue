/**
 * apply-competitor-matrix.js
 *
 * Phase 2: Read competitor_matrix.json and bulk-update the DB.
 * Runs on Render Shell where DB is accessible.
 *
 * Run:
 *   node scripts/apply-competitor-matrix.js
 *   node scripts/apply-competitor-matrix.js --dry   (no DB writes)
 *
 * Requires scripts/competitor_matrix.json built by build-competitor-matrix.js
 */
'use strict';

const { Client } = require('pg');
const fs         = require('fs');
const path       = require('path');

const DRY_RUN     = process.argv.includes('--dry');
const MATRIX_FILE = path.join(__dirname, 'competitor_matrix.json');

// ─── DB config ────────────────────────────────────────────────────────────────
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
    host: 'ballast.proxy.rlwy.net', port: 18263,
    database: 'railway', user: 'postgres',
    password: 'qUiKsOlOyDSyHZogyqhhxTTPlAuuLEkm',
    ssl: { rejectUnauthorized: false },
  };
})();

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY competitor matrix → DB');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MATRIX_FILE)) {
    console.error('competitor_matrix.json not found.');
    console.error('Run: node scripts/build-competitor-matrix.js first.');
    process.exit(1);
  }

  const matrix = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
  const pnums  = Object.keys(matrix).filter(p => matrix[p].length > 0);
  console.log(`Matrix loaded: ${Object.keys(matrix).length} total P-numbers, ${pnums.length} with refs\n`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  // Fetch all SKUs that need updating (empty competitor_codes, codigo_base in matrix)
  const placeholders = pnums.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE codigo_base IN (${placeholders})
       AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
     ORDER BY sku`,
    pnums
  );

  console.log(`SKUs to update: ${rows.length}\n`);

  if (rows.length === 0) {
    console.log('Nothing to update — all matching SKUs already have competitor_codes.');
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
  console.log(`  Skipped : ${skipped} (no refs in matrix)`);
  console.log('═══════════════════════════════════════════════════════════\n');

  await client.end();
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
