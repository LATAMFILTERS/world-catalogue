'use strict';

/**
 * Portable ELIMSERVER runner for the canonical run_286 SQL migration.
 * Default mode proves the transaction and rolls it back. The explicit
 * execution mode performs that dry run first, commits, and verifies live state.
 */

require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');
const { resolveCatalogDatabaseConfig } = require('../../lib/bot-protocol-db');
const { register: registerAlternative } = require('./run_285_register_dba5231_alternative');

const SQL_PATH = path.resolve(__dirname, 'run_286_authorized_hd_application_inheritance.sql');
const PSQL_CONTROL = /\\if :\{\?execute\}[\s\S]*?\\endif/;

function buildExecutableSql(sql, execute) {
  if (!PSQL_CONTROL.test(sql)) throw new Error('PSQL_EXECUTION_CONTROL_NOT_FOUND');
  return sql.replace(PSQL_CONTROL, execute ? 'COMMIT;\n' : 'ROLLBACK;\n');
}

function connectionOptions(env = process.env) {
  const { source, ...resolved } = resolveCatalogDatabaseConfig(env);
  let local = false;
  if (resolved.connectionString) {
    const parsed = new URL(resolved.connectionString);
    local = ['127.0.0.1', 'localhost', '::1'].includes(parsed.hostname);
  } else {
    local = ['127.0.0.1', 'localhost', '::1'].includes(String(resolved.host));
  }
  return {
    source,
    options: {
      ...resolved,
      ssl: local ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
      application_name: 'elimfilters-hd-161-completion'
    }
  };
}

async function inspectState(db) {
  const { rows } = await db.query(`
    SELECT
      src.sku AS source_sku,
      dst.sku AS target_sku,
      jsonb_array_length(src.equipment_applications) AS source_count,
      jsonb_array_length(dst.equipment_applications) AS target_count,
      dst.equipment_applications = src.equipment_applications AS payloads_identical,
      dst.enrichment_data->'application_inheritance'->>'status' AS inheritance_status,
      dst.enrichment_data->'application_inheritance'->>'individual_fitment_verified'
        AS individual_fitment_verified,
      EXISTS (
        SELECT 1
        FROM public.catalog_authorized_application_inheritance a
        WHERE a.source_sku='EA11767' AND a.target_sku='EA15231'
          AND a.source_payload_hash=md5(src.equipment_applications::text)
          AND a.authorized_by='ELIMFILTERS_CEO'
          AND a.inherited_count=161
          AND a.individual_fitment_verified IS FALSE
      ) AS authorization_recorded,
      position(
        'APPLICATION_INHERITANCE_NOT_AUTHORIZED' in
        pg_get_functiondef('public.enforce_elimfilters_application_evidence_policy()'::regprocedure)
      ) > 0 AS trigger_extension_installed
    FROM public.elimfilters_catalog src
    JOIN public.elimfilters_catalog dst ON dst.sku='EA15231'
    WHERE src.sku='EA11767'
  `);
  if (rows.length !== 1) throw new Error('HD_PAIR_NOT_FOUND');
  return rows[0];
}

function stateIsComplete(state) {
  return Number(state.source_count) === 161
    && Number(state.target_count) === 161
    && state.payloads_identical === true
    && state.inheritance_status === 'INHERITED_AUTHORIZED'
    && state.individual_fitment_verified === 'false'
    && state.authorization_recorded === true
    && state.trigger_extension_installed === true;
}

async function runCanonicalSql(db, execute) {
  const sql = fs.readFileSync(SQL_PATH, 'utf8');
  try {
    await db.query(buildExecutableSql(sql, execute));
  } catch (error) {
    await db.query('ROLLBACK').catch(() => {});
    throw error;
  }
}

async function completeHd161(db, { executeAfterDryRun = false } = {}) {
  let before;
  try {
    before = await inspectState(db);
    if (stateIsComplete(before)) {
      return { status: 'ALREADY_COMPLETE', changed: false, before, after: before };
    }
  } catch (error) {
    if (error.code !== '42P01') throw error;
    before = { authorization_table_present: false };
  }

  let relation = null;
  if (executeAfterDryRun) relation = await registerAlternative(db, true);
  await runCanonicalSql(db, false);

  if (!executeAfterDryRun) {
    return { status: 'DRY_RUN_PASSED', changed: false, before, relation };
  }

  await runCanonicalSql(db, true);
  const after = await inspectState(db);
  if (!stateIsComplete(after)) throw new Error('HD_161_POSTCHECK_FAILED');
  return { status: 'EXECUTED_AND_VERIFIED', changed: true, before, relation, after };
}

async function main() {
  const executeAfterDryRun = process.argv.includes('--execute-after-dry-run');
  const { source, options } = connectionOptions();
  const db = new Client(options);
  await db.connect();
  try {
    const result = await completeHd161(db, { executeAfterDryRun });
    console.log(JSON.stringify({ migration: 'HD_161_EA11767_TO_EA15231', connection_source: source, ...result }, null, 2));
  } finally {
    await db.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(JSON.stringify({ migration: 'HD_161_EA11767_TO_EA15231', status: 'FAILED', code: error.code || null, error: error.message }));
    process.exitCode = 1;
  });
}

module.exports = {
  PSQL_CONTROL,
  buildExecutableSql,
  connectionOptions,
  inspectState,
  stateIsComplete,
  runCanonicalSql,
  completeHd161
};
