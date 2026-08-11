'use strict';

const { Pool } = require('pg');

let pool = null;
let poolOverride = null;

// DEFAULT applies only when a caller omits statementTimeoutMs entirely.
// MIN/MAX bound whatever the caller explicitly requests -- a caller asking
// for a *shorter* timeout (e.g. searchByApplication's 8000ms) must get that
// shorter timeout, not have it silently raised. Previously MIN doubled as an
// artificial floor that overrode every explicit request below 30000ms.
const DEFAULT_STATEMENT_TIMEOUT_MS = 30000;
const MIN_STATEMENT_TIMEOUT_MS = 250;
const MAX_STATEMENT_TIMEOUT_MS = 60000;

function resolveCatalogDatabaseConfig(env = process.env) {
  const connectionString = env.CATALOG_DATABASE_URL
    || env.ELIMFILTERS_DATABASE_URL
    || env.DATABASE_URL
    || null;

  if (connectionString) {
    return {
      connectionString,
      source: env.CATALOG_DATABASE_URL
        ? 'CATALOG_DATABASE_URL'
        : (env.ELIMFILTERS_DATABASE_URL ? 'ELIMFILTERS_DATABASE_URL' : 'DATABASE_URL')
    };
  }

  const host = env.PGHOST || env.CATALOG_PGHOST || null;
  const user = env.PGUSER || env.CATALOG_PGUSER || null;
  const password = env.PGPASSWORD || env.CATALOG_PGPASSWORD || null;
  const database = env.PGDATABASE || env.CATALOG_PGDATABASE || env.CATALOG_DATABASE_NAME || 'catalogo_elimfilters';
  const port = Number(env.PGPORT || env.CATALOG_PGPORT || 5432);

  if (host && user && password) {
    return {
      host,
      user,
      password,
      database,
      port,
      source: 'PG_COMPONENTS'
    };
  }

  throw new Error('Catalog PostgreSQL configuration is required. Set CATALOG_DATABASE_URL, ELIMFILTERS_DATABASE_URL, DATABASE_URL, or PG connection variables.');
}

function getProtocolPool() {
  if (poolOverride) return poolOverride;
  if (!pool) {
    const resolved = resolveCatalogDatabaseConfig();
    const { source, ...connection } = resolved;
    pool = new Pool({
      ...connection,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 8000,
      keepAlive: true,
      application_name: 'elimfilters-bot-protocol'
    });
    pool.on('error', error => console.error('[bot-protocol-db]', error.message));
    console.info('[bot-protocol-db]', {
      status: 'configured',
      source,
      database: connection.database || 'from_connection_string'
    });
  }
  return pool;
}

function __setProtocolPoolForTests(fakePool) {
  poolOverride = fakePool;
}

function __resetProtocolPoolForTests() {
  poolOverride = null;
  if (pool) {
    try { pool.end(); } catch {}
  }
  pool = null;
}

function resolveStatementTimeout(requestedMs) {
  const numeric = Number(requestedMs);
  const requested = Number.isFinite(numeric) && numeric > 0 ? numeric : DEFAULT_STATEMENT_TIMEOUT_MS;
  return Math.min(MAX_STATEMENT_TIMEOUT_MS, Math.max(MIN_STATEMENT_TIMEOUT_MS, requested));
}

async function withProtocolClient(callback, { statementTimeoutMs = DEFAULT_STATEMENT_TIMEOUT_MS } = {}) {
  const client = await getProtocolPool().connect();
  const effectiveTimeoutMs = resolveStatementTimeout(statementTimeoutMs);
  const startedAt = Date.now();

  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = ${effectiveTimeoutMs}`);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    console.error('[bot-protocol-db-query]', {
      code: error.code || null,
      message: error.message,
      timeout_ms: effectiveTimeoutMs,
      duration_ms: Date.now() - startedAt
    });
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  DEFAULT_STATEMENT_TIMEOUT_MS,
  MIN_STATEMENT_TIMEOUT_MS,
  MAX_STATEMENT_TIMEOUT_MS,
  resolveCatalogDatabaseConfig,
  resolveStatementTimeout,
  getProtocolPool,
  withProtocolClient,
  __setProtocolPoolForTests,
  __resetProtocolPoolForTests
};
