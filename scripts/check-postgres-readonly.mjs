#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';

const { Client } = pg;
const root = process.cwd();
const outputDir = path.join(root, 'knowledge', 'generated', 'digital-brain', 'postgresql');
const connectionString = process.env.DATABASE_URL_READONLY;

if (!connectionString) {
  console.log('[postgres-readonly] DATABASE_URL_READONLY is not configured; skipping connection');
  process.exit(0);
}

const client = new Client({
  connectionString,
  ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  application_name: 'elimfilters-digital-brain-readonly-audit',
  statement_timeout: 30000,
  query_timeout: 30000
});

try {
  await client.connect();
  await client.query('BEGIN READ ONLY');

  const readOnly = await client.query('SHOW transaction_read_only');
  const readOnlyValue = readOnly.rows?.[0]?.transaction_read_only;
  if (readOnlyValue !== 'on') {
    throw new Error(`connection is not read-only (transaction_read_only=${readOnlyValue})`);
  }

  const identity = await client.query(`
    SELECT current_database() AS database_name,
           current_user AS database_user,
           version() AS server_version
  `);

  const tables = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY table_schema, table_name
  `);

  const expectedTable = process.env.ELIMFILTERS_CATALOG_TABLE || 'elimfilters_catalog';
  const expected = tables.rows.find((row) => row.table_name === expectedTable);
  if (!expected) throw new Error(`expected catalog table '${expectedTable}' was not found`);

  const qualifiedTable = `${expected.table_schema}.${expected.table_name}`;
  const privileges = await client.query(`
    SELECT
      has_table_privilege(current_user, $1, 'SELECT') AS can_select,
      has_table_privilege(current_user, $1, 'INSERT') AS can_insert,
      has_table_privilege(current_user, $1, 'UPDATE') AS can_update,
      has_table_privilege(current_user, $1, 'DELETE') AS can_delete,
      has_table_privilege(current_user, $1, 'TRUNCATE') AS can_truncate,
      has_table_privilege(current_user, $1, 'TRIGGER') AS can_trigger,
      has_table_privilege(current_user, $1, 'REFERENCES') AS can_references
  `, [qualifiedTable]);

  const access = privileges.rows[0];
  if (!access.can_select) throw new Error(`read-only role cannot SELECT from ${qualifiedTable}`);
  const forbidden = ['can_insert', 'can_update', 'can_delete', 'can_truncate', 'can_trigger', 'can_references']
    .filter((key) => access[key]);
  if (forbidden.length) {
    throw new Error(`read-only role still has forbidden privileges on ${qualifiedTable}: ${forbidden.join(', ')}`);
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const report = {
    schema_version: '1.1.0',
    checked_at: new Date().toISOString(),
    read_only_verified: true,
    database: identity.rows[0],
    expected_catalog_table: expectedTable,
    expected_catalog_table_found: true,
    catalog_table: qualifiedTable,
    privileges: access,
    tables: tables.rows
  };
  fs.writeFileSync(path.join(outputDir, 'connection-audit.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');
  await client.query('ROLLBACK');
  console.log(`[postgres-readonly] verified read-only role on ${qualifiedTable}; ${tables.rowCount} table(s) visible`);
} catch (error) {
  try { await client.query('ROLLBACK'); } catch {}
  console.error(`[postgres-readonly] ${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
