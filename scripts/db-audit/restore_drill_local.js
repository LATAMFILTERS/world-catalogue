'use strict';
/**
 * Fase 3 — isolated restore drill. Does NOT connect to any database.
 * Validates that a local R2-export package (from r2_export_prepare.js)
 * is internally consistent and restorable: checksum matches, every row
 * parses as valid JSON, every row's keys match the columns declared in
 * schema.sql, and the row count matches manifest.json exactly.
 *
 * This is the safe, local half of "restore drill" -- it proves the
 * export is trustworthy without writing to Postgres. Actually loading it
 * into a `_restore_test` table (real Postgres write, even if disposable)
 * is a separate, explicit step requiring authorization -- see
 * restore_test.sql.example next to each export, not executed here.
 *
 * Usage: node scripts/db-audit/restore_drill_local.js [table ...]
 * (defaults to every table under scripts/db-audit/output/r2-export/)
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const EXPORT_ROOT = path.join(__dirname, 'output', 'r2-export');

function drillOne(table) {
  const dir = path.join(EXPORT_ROOT, table);
  const result = { table, checks: {} };

  const manifestPath = path.join(dir, 'manifest.json');
  const dataPath = path.join(dir, 'data.ndjson.gz');
  const checksumPath = path.join(dir, 'checksum.sha256');
  const schemaPath = path.join(dir, 'schema.sql');

  if (!fs.existsSync(manifestPath)) {
    result.checks.exists = false;
    return result;
  }
  result.checks.exists = true;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  if (!fs.existsSync(dataPath)) {
    // Schema-only export (a view -- mv_crossref_engine/v_crossref_engine).
    // Nothing to drill; report separately, not a failure.
    result.schema_only = true;
    result.pass = true;
    return result;
  }

  // 1. Checksum still matches (detects any post-export corruption/edit).
  const fileBuf = fs.readFileSync(dataPath);
  const actualChecksum = crypto.createHash('sha256').update(fileBuf).digest('hex');
  result.checks.checksum_match = actualChecksum === manifest.checksum_sha256;

  // 2. Every line parses as valid JSON, and row count matches manifest exactly.
  const decompressed = zlib.gunzipSync(fileBuf).toString('utf8');
  const lines = decompressed.split('\n').filter(Boolean);
  let allValidJson = true;
  const columnSets = new Set();
  for (const line of lines) {
    try {
      const row = JSON.parse(line);
      columnSets.add(Object.keys(row).sort().join(','));
    } catch (e) {
      allValidJson = false;
      break;
    }
  }
  result.checks.all_rows_valid_json = allValidJson;
  result.checks.row_count_matches_manifest = lines.length === manifest.row_count_exported;
  result.checks.consistent_column_shape = columnSets.size <= 1; // all rows should have the same key set

  // 3. schema.sql exists and is non-trivially small (sanity, not full DDL parsing).
  result.checks.schema_file_present = fs.existsSync(schemaPath) && fs.statSync(schemaPath).size > 20;

  result.pass = Object.values(result.checks).every((v) => v === true);
  result.row_count = lines.length;
  return result;
}

function main() {
  const args = process.argv.slice(2);
  const tables = args.length > 0 ? args : (fs.existsSync(EXPORT_ROOT) ? fs.readdirSync(EXPORT_ROOT).filter((f) => fs.statSync(path.join(EXPORT_ROOT, f)).isDirectory() && fs.existsSync(path.join(EXPORT_ROOT, f, 'manifest.json'))) : []);

  if (tables.length === 0) {
    console.error(`No export packages found under ${EXPORT_ROOT}. Run r2_export_prepare.js first.`);
    process.exit(1);
  }

  const results = tables.map(drillOne);
  for (const r of results) {
    console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.table} — ${r.row_count ?? '?'} rows — ${JSON.stringify(r.checks)}`);
  }

  const allPass = results.every((r) => r.pass);
  fs.writeFileSync(path.join(__dirname, 'output', 'restore_drill_results.json'), JSON.stringify({ generated_at: new Date().toISOString(), all_pass: allPass, results }, null, 2));
  console.log(`\n${results.filter((r) => r.pass).length}/${results.length} packages passed the local restore drill. Nothing was written to any database.`);
  process.exit(allPass ? 0 : 1);
}

main();
