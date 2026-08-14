'use strict';

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const CONNECTION_TIMEOUT_MS = 10000;
const STATEMENT_TIMEOUT_MS = 30000;

const FORBIDDEN_HEX = [
  '485944524f434f5245',
  '53594e5445504f5245',
  '53594e5445464f52',
  '434f4f4c54454348',
  '445552414354454348',
  '4e414e4f434f5245',
  '49534f4755415244',
  '50554c5345434f5245',
  '454c494d434f5245',
  '44494553454c434f5245',
];
const FORBIDDEN = FORBIDDEN_HEX.map((hex) => Buffer.from(hex, 'hex').toString('utf8'));

class GateError extends Error {}

/**
 * Decides verify-only vs apply. Pure -- no I/O, no process.exit -- so it is
 * unit-testable directly. Default (no flags) and --verify-only are both
 * read-only. --apply only resolves to 'apply' when
 * CONFIRM_CANONICAL_TECHNOLOGY_PURGE=yes is ALSO present; every other
 * combination throws GateError, which the caller treats as fail-closed
 * (exit 1, nothing touched). This is what prevents an accidental second
 * application: --apply alone is never sufficient.
 */
function resolveRunMode(argv, env) {
  const hasApply = argv.includes('--apply');
  const hasVerifyOnly = argv.includes('--verify-only');

  if (hasApply && hasVerifyOnly) {
    throw new GateError('--apply and --verify-only are mutually exclusive. Refusing to run.');
  }

  if (!hasApply) {
    return { mode: 'verify-only' };
  }

  if (env.CONFIRM_CANONICAL_TECHNOLOGY_PURGE !== 'yes') {
    throw new GateError(
      '--apply requires CONFIRM_CANONICAL_TECHNOLOGY_PURGE=yes to also be set explicitly. ' +
      'This double gate exists specifically to prevent an accidental second application. Refusing to apply.'
    );
  }

  return { mode: 'apply' };
}

/**
 * One consolidated query per relation: all 10 forbidden tokens are checked
 * in a single WHERE clause via ~* ANY($1::text[]) instead of 10 separate
 * queries per relation. Pure -- builds SQL text only, no I/O -- so the
 * quoting/consolidation logic is unit-testable without a database.
 */
function buildRelationCheckSql(tableSchema, tableName, columnName) {
  const qTable = `"${tableSchema.replaceAll('"', '""')}"."${tableName.replaceAll('"', '""')}"`;
  const qColumn = `"${columnName.replaceAll('"', '""')}"`;
  return `SELECT count(*)::int AS count FROM ${qTable} WHERE ${qColumn}::text ~* ANY($1::text[])`;
}

/**
 * Verifies every relation exactly once. A relation whose check query itself
 * errors (permissions, unexpected type coercion, etc.) is recorded as
 * inconclusive rather than silently counted as clean -- fail-closed applies
 * to the verification pass itself, not only to the apply gate.
 */
async function verifyRelations(client, relations, forbidden, { onProgress } = {}) {
  const violations = [];
  const inconclusive = [];

  for (let i = 0; i < relations.length; i += 1) {
    const rel = relations[i];
    const label = `${rel.table_schema}.${rel.table_name}.${rel.column_name}`;
    try {
      const sql = buildRelationCheckSql(rel.table_schema, rel.table_name, rel.column_name);
      const result = await client.query(sql, [forbidden]);
      if (result.rows[0].count > 0) violations.push(label);
    } catch (error) {
      inconclusive.push({ relation: label, reason: error.message });
    }
    if (onProgress) onProgress(i + 1, relations.length, label);
  }

  return { violations, inconclusive };
}

function defaultProgress(done, total, label) {
  console.log(`[verify] ${done}/${total} ${label}`);
}

async function main() {
  const argv = process.argv.slice(2);
  // Gate check happens before any DATABASE_URL check or connection attempt,
  // by design: an unconfirmed --apply must never get as far as touching
  // the network.
  const runMode = resolveRunMode(argv, process.env);

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL not set.');
  }

  const migrationPath = path.join(__dirname, '026_canonical_technology_purge.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    statement_timeout: STATEMENT_TIMEOUT_MS,
  });

  await client.connect();
  try {
    if (runMode.mode === 'apply') {
      console.log('Running canonical technology purge (--apply, confirmed via CONFIRM_CANONICAL_TECHNOLOGY_PURGE=yes)...');
      await client.query(migrationSql);
    } else {
      console.log('Verify-only mode (default). No changes will be made. Pass --apply and set CONFIRM_CANONICAL_TECHNOLOGY_PURGE=yes to apply.');
    }

    const columns = await client.query(`
      SELECT table_schema, table_name, column_name
      FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND EXISTS (
          SELECT 1 FROM information_schema.tables t
          WHERE t.table_schema = c.table_schema
            AND t.table_name = c.table_name
            AND t.table_type = 'BASE TABLE'
        )
        AND data_type IN ('text', 'character varying', 'character', 'json', 'jsonb')
      ORDER BY table_name, ordinal_position
    `);

    console.log(`Verifying ${columns.rows.length} relation(s), one query per relation...`);
    const { violations, inconclusive } = await verifyRelations(client, columns.rows, FORBIDDEN, { onProgress: defaultProgress });

    if (inconclusive.length) {
      throw new Error(
        `Verification inconclusive for ${inconclusive.length} relation(s) (treated as failure): ` +
        inconclusive.map((x) => x.relation).join(', ')
      );
    }
    if (violations.length) {
      throw new Error(`Verification failed: retired identifiers remain in ${[...new Set(violations)].join(', ')}`);
    }

    console.log(
      `Canonical technology purge verified: zero retired identifiers across ${columns.rows.length} relation(s), zero inconclusive.`
    );
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('ERROR:', error.message);
    process.exit(1);
  });
}

module.exports = {
  CONNECTION_TIMEOUT_MS,
  STATEMENT_TIMEOUT_MS,
  FORBIDDEN_HEX,
  FORBIDDEN,
  GateError,
  resolveRunMode,
  buildRelationCheckSql,
  verifyRelations,
};
