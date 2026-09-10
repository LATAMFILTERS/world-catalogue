'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const pg = require('pg');

require('../lib/part-search-runtime-hardening');

const DESCRIPTION_SQL = `SELECT * FROM elimfilters_catalog
  WHERE to_tsvector('english', COALESCE(description::text, ''))
    @@ plainto_tsquery('english', $1)
  LIMIT 10`;

test('Part Search pool configures statement timeout without legacy connect query', async () => {
  const pool = new pg.Pool({
    connectionString: 'postgresql://user:pass@127.0.0.1:5432/unused',
    max: 1,
  });

  try {
    assert.equal(pool.options.statement_timeout, 8000);

    const before = pool.listenerCount('connect');
    const legacyConnectListener = client => {
      client.query("SET statement_timeout = '8000'").catch(() => {});
    };

    pool.on('connect', legacyConnectListener);
    assert.equal(
      pool.listenerCount('connect'),
      before,
      'legacy SET statement_timeout connect listener must be suppressed to prevent overlapping client.query calls'
    );
  } finally {
    await pool.end();
  }
});

test('compact part-number no-match skips description full-text query', async () => {
  const client = Object.create(pg.Client.prototype);
  const result = await client.query(DESCRIPTION_SQL, ['LF17560FG']);

  assert.equal(result.command, 'SELECT');
  assert.equal(result.rowCount, 0);
  assert.deepEqual(result.rows, []);
});

test('long compact part-number no-match also skips description full-text query', async () => {
  const client = Object.create(pg.Client.prototype);
  const result = await client.query(DESCRIPTION_SQL, ['HC8314FRS39Z']);

  assert.equal(result.command, 'SELECT');
  assert.equal(result.rowCount, 0);
  assert.deepEqual(result.rows, []);
});
