/**
 * apply-lube-competitor-matrix.js
 *
 * Reads donaldson_lube_crossref_progress.json and updates competitor_codes
 * for EL (lube oil) filter SKUs in the DB.  Run on Render Shell.
 *
 * Source format: { "DBL3998": { "HIFI": ["SO10086"], "LUBERFINER": ["LFP2160XL"] } }
 * DB format:     [{ "manufacturer": "HIFI", "code": "SO10086" }, ...]
 *
 * Run:
 *   node scripts/apply-lube-competitor-matrix.js
 *   node scripts/apply-lube-competitor-matrix.js --dry
 */
'use strict';

const { Client } = require('pg');
const fs         = require('fs');
const path       = require('path');

const DRY_RUN     = process.argv.includes('--dry');
const MATRIX_FILE = path.join(__dirname, 'donaldson_lube_crossref_progress.json');

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

/** Convert { "BRAND": ["code1","code2"] } → [{ manufacturer, code }, ...] */
function flattenRefs(brandMap) {
  const out = [];
  for (const [brand, codes] of Object.entries(brandMap)) {
    for (const code of codes) {
      if (code) out.push({ manufacturer: brand, code });
    }
  }
  return out;
}

async function run() {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  APPLY lube competitor matrix → DB  (EL SKUs)');
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'LIVE'}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(MATRIX_FILE)) {
    console.error('donaldson_lube_crossref_progress.json not found.');
    process.exit(1);
  }

  const raw    = JSON.parse(fs.readFileSync(MATRIX_FILE, 'utf8'));
  // Build flat map: dbl_code → [{manufacturer, code}]
  const matrix = {};
  for (const [dbl, brandMap] of Object.entries(raw)) {
    if (brandMap && typeof brandMap === 'object' && !Array.isArray(brandMap)) {
      const refs = flattenRefs(brandMap);
      if (refs.length > 0) matrix[dbl] = refs;
    }
  }

  const dblCodes = Object.keys(matrix);
  console.log(`Matrix: ${Object.keys(raw).length} DBL codes, ${dblCodes.length} with refs\n`);

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('Connected to DB ✓\n');

  const placeholders = dblCodes.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(
    `SELECT sku, codigo_base
     FROM elimfilters_catalog
     WHERE codigo_base IN (${placeholders})
       AND sku LIKE 'EL%'
       AND (competitor_codes IS NULL OR jsonb_array_length(competitor_codes) = 0)
     ORDER BY sku`,
    dblCodes
  );

  console.log(`EL SKUs to update: ${rows.length}\n`);

  if (rows.length === 0) {
    console.log('Nothing to update — all matching EL SKUs already have competitor_codes.');
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
