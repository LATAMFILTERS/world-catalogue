const { Pool } = require('pg');

let pool = null;

function getProtocolPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 3000,
      application_name: 'elimfilters-bot-protocol'
    });
    pool.on('error', error => console.error('[bot-protocol-db]', error.message));
  }
  return pool;
}

async function withProtocolClient(callback, { statementTimeoutMs = 1800 } = {}) {
  const client = await getProtocolPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL statement_timeout = ${Math.max(250, Number(statementTimeoutMs) || 1800)}`);
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch {}
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { getProtocolPool, withProtocolClient };
