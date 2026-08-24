'use strict';
/**
 * Fase 5 — lightweight, read-only index-usage snapshot collector for the
 * 7/14-day observation window. Separate from run_storage_inventory.js
 * (which captures the whole 27-section audit) so this can run cheaply and
 * often without re-running everything.
 *
 * Usage: node scripts/db-audit/index_snapshot.js [label]
 *   label defaults to today's date. Output is compact, sanitized JSON/CSV
 *   -- no business data, no secrets, just index metadata + counters.
 *
 * Recommended cadence: day 0 (baseline, already captured in
 * storage_audit_latest.json's index_usage_stats section), day 7, day 14.
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
const { Client } = require('pg');

const OUTPUT_DIR = path.join(__dirname, 'output', 'index-snapshots');

async function main() {
  const label = process.argv[2] || new Date().toISOString().slice(0, 10);
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
  await client.connect();
  await client.query('SET default_transaction_read_only = on');
  await client.query("SET statement_timeout = '15s'");

  const indexes = await client.query(`
      SELECT schemaname AS schema, relname AS "table", indexrelname AS index,
             idx_scan, idx_tup_read, idx_tup_fetch, pg_relation_size(indexrelid) AS size_bytes
      FROM pg_stat_user_indexes ORDER BY schema, "table", index`);
  const tables = await client.query(`
      SELECT schemaname AS schema, relname AS "table", seq_scan, idx_scan,
             n_tup_ins, n_tup_upd, n_tup_del, n_live_tup, n_dead_tup
      FROM pg_stat_user_tables ORDER BY schema, "table"`);
  const resetTime = await client.query(`SELECT stats_reset FROM pg_stat_database WHERE datname = current_database()`);
  const invalid = await client.query(`
      SELECT n.nspname AS schema, t.relname AS "table", i.relname AS index
      FROM pg_index ix JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_class t ON t.oid = ix.indrelid JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE NOT ix.indisvalid`);

  await client.end();

  const snapshot = {
    label,
    captured_at: new Date().toISOString(),
    stats_reset: resetTime.rows[0].stats_reset,
    indexes: indexes.rows,
    tables: tables.rows,
    invalid_indexes: invalid.rows,
  };

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const outPath = path.join(OUTPUT_DIR, `snapshot_${label}.json`);
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2));
  console.log(`Written ${outPath} — ${indexes.rows.length} indexes, ${tables.rows.length} tables, stats_reset=${resetTime.rows[0].stats_reset}`);
}

main();
