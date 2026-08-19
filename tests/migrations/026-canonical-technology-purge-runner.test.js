'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  FORBIDDEN_HEX,
  FORBIDDEN,
  GateError,
  resolveRunMode,
  buildRelationCheckSql,
  verifyRelations,
} = require('../../scripts/migrations/run_026_canonical_technology_purge.js');

// Requiring the module above must not connect to any database or call
// process.exit -- if it did, this whole test file would never run. Reaching
// this point at all is itself a (weak) assertion that the module's runner
// entry point is properly guarded by `require.main === module`.

// ── resolveRunMode (the apply/verify-only gate) ────────────────────────────

test('gate: default (no flags) resolves to verify-only', () => {
  assert.deepEqual(resolveRunMode([], {}), { mode: 'verify-only' });
});

test('gate: --verify-only explicit resolves to verify-only', () => {
  assert.deepEqual(resolveRunMode(['--verify-only'], {}), { mode: 'verify-only' });
});

test('gate: --apply alone (no confirmation env var) throws GateError, never resolves to apply', () => {
  assert.throws(() => resolveRunMode(['--apply'], {}), GateError);
});

test('gate: --apply with CONFIRM_CANONICAL_TECHNOLOGY_PURGE set to anything other than exactly "yes" throws', () => {
  for (const value of ['true', '1', 'YES', 'Yes', 'y', '']) {
    assert.throws(
      () => resolveRunMode(['--apply'], { CONFIRM_CANONICAL_TECHNOLOGY_PURGE: value }),
      GateError,
      `expected GateError for CONFIRM_CANONICAL_TECHNOLOGY_PURGE=${JSON.stringify(value)}`
    );
  }
});

test('gate: --apply with CONFIRM_CANONICAL_TECHNOLOGY_PURGE=yes resolves to apply', () => {
  assert.deepEqual(resolveRunMode(['--apply'], { CONFIRM_CANONICAL_TECHNOLOGY_PURGE: 'yes' }), { mode: 'apply' });
});

test('gate: --apply and --verify-only together are mutually exclusive and throw, even with confirmation set', () => {
  assert.throws(
    () => resolveRunMode(['--apply', '--verify-only'], { CONFIRM_CANONICAL_TECHNOLOGY_PURGE: 'yes' }),
    GateError
  );
});

test('gate: unrelated environment variables do not affect the outcome', () => {
  assert.deepEqual(
    resolveRunMode(['--apply'], { CONFIRM_CANONICAL_TECHNOLOGY_PURGE: 'yes', PATH: '/usr/bin', NODE_ENV: 'production' }),
    { mode: 'apply' }
  );
});

// ── buildRelationCheckSql (consolidated single-expression query) ──────────

test('buildRelationCheckSql: uses a single ~* ANY($1::text[]) expression, not one clause per token', () => {
  const sql = buildRelationCheckSql('public', 'kg_technologies', 'slug');
  const matches = sql.match(/~\*/g) || [];
  assert.equal(matches.length, 1, 'expected exactly one ~* operator (all 10 tokens combined via ANY($1))');
  assert.match(sql, /ANY\(\$1::text\[\]\)/);
});

test('buildRelationCheckSql: quotes identifiers and escapes embedded double quotes', () => {
  const sql = buildRelationCheckSql('public', 'weird"table', 'weird"column');
  assert.match(sql, /"weird""table"/);
  assert.match(sql, /"weird""column"/);
});

test('buildRelationCheckSql: never inlines a retired-token literal -- values are only ever passed as $1', () => {
  const sql = buildRelationCheckSql('public', 'kg_technologies', 'slug');
  for (const token of FORBIDDEN) {
    assert.doesNotMatch(sql, new RegExp(token, 'i'), `token ${token} must not be inlined into the SQL text`);
  }
});

test('FORBIDDEN_HEX / FORBIDDEN: still exactly 10 entries, FORBIDDEN decodes independently to exactly what FORBIDDEN_HEX encodes', () => {
  // Decoded here independently from the module's own FORBIDDEN_HEX -> FORBIDDEN
  // mapping (not by retyping the plaintext tokens as string literals in this
  // file, per the repo's canonical-taxonomy guard -- see
  // scripts/validate-canonical-taxonomy.mjs) so this still catches any drift
  // between the two exports, just via a different, guard-compliant path.
  assert.equal(FORBIDDEN_HEX.length, 10);
  const independentlyDecoded = FORBIDDEN_HEX.map((hex) => Buffer.from(hex, 'hex').toString('utf8'));
  assert.deepEqual([...FORBIDDEN].sort(), [...independentlyDecoded].sort());
  assert.equal(new Set(independentlyDecoded).size, 10, 'all 10 decoded tokens must be distinct');
});

// ── verifyRelations (one query per relation, progress, inconclusive) ──────

function makeMockClient(responder) {
  const calls = [];
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params });
      return responder(sql, params, calls.length);
    },
  };
}

test('verifyRelations: issues exactly one query per relation, never one per token', async () => {
  const relations = [
    { table_schema: 'public', table_name: 'a', column_name: 'x' },
    { table_schema: 'public', table_name: 'b', column_name: 'y' },
    { table_schema: 'public', table_name: 'c', column_name: 'z' },
  ];
  const client = makeMockClient(() => ({ rows: [{ count: 0 }] }));
  const { violations, inconclusive } = await verifyRelations(client, relations, FORBIDDEN);
  assert.equal(client.calls.length, 3, 'expected exactly one query per relation (3 relations -> 3 queries)');
  assert.deepEqual(violations, []);
  assert.deepEqual(inconclusive, []);
});

test('verifyRelations: passes the full forbidden token array as a single $1 parameter', async () => {
  const relations = [{ table_schema: 'public', table_name: 'a', column_name: 'x' }];
  const client = makeMockClient(() => ({ rows: [{ count: 0 }] }));
  await verifyRelations(client, relations, FORBIDDEN);
  assert.equal(client.calls[0].params.length, 1);
  assert.deepEqual(client.calls[0].params[0], FORBIDDEN);
});

test('verifyRelations: a relation with count > 0 is recorded as a violation', async () => {
  const relations = [
    { table_schema: 'public', table_name: 'clean', column_name: 'x' },
    { table_schema: 'public', table_name: 'dirty', column_name: 'y' },
  ];
  const client = makeMockClient((sql) => ({ rows: [{ count: sql.includes('"dirty"') ? 1 : 0 }] }));
  const { violations, inconclusive } = await verifyRelations(client, relations, FORBIDDEN);
  assert.deepEqual(violations, ['public.dirty.y']);
  assert.deepEqual(inconclusive, []);
});

test('verifyRelations: a relation whose query throws is recorded as inconclusive, never silently treated as clean', async () => {
  const relations = [
    { table_schema: 'public', table_name: 'ok', column_name: 'x' },
    { table_schema: 'public', table_name: 'broken', column_name: 'y' },
  ];
  const client = makeMockClient((sql) => {
    if (sql.includes('"broken"')) throw new Error('permission denied for relation broken');
    return { rows: [{ count: 0 }] };
  });
  const { violations, inconclusive } = await verifyRelations(client, relations, FORBIDDEN);
  assert.deepEqual(violations, []);
  assert.equal(inconclusive.length, 1);
  assert.equal(inconclusive[0].relation, 'public.broken.y');
  assert.match(inconclusive[0].reason, /permission denied/);
});

test('verifyRelations: onProgress is called once per relation with correct (done, total, label)', async () => {
  const relations = [
    { table_schema: 'public', table_name: 'a', column_name: 'x' },
    { table_schema: 'public', table_name: 'b', column_name: 'y' },
  ];
  const client = makeMockClient(() => ({ rows: [{ count: 0 }] }));
  const progressCalls = [];
  await verifyRelations(client, relations, FORBIDDEN, {
    onProgress: (done, total, label) => progressCalls.push({ done, total, label }),
  });
  assert.deepEqual(progressCalls, [
    { done: 1, total: 2, label: 'public.a.x' },
    { done: 2, total: 2, label: 'public.b.y' },
  ]);
});

test('verifyRelations: zero relations produces zero queries, zero progress calls, empty results', async () => {
  const client = makeMockClient(() => ({ rows: [{ count: 0 }] }));
  let progressCalled = false;
  const { violations, inconclusive } = await verifyRelations(client, [], FORBIDDEN, { onProgress: () => { progressCalled = true; } });
  assert.equal(client.calls.length, 0);
  assert.equal(progressCalled, false);
  assert.deepEqual(violations, []);
  assert.deepEqual(inconclusive, []);
});

test('verifyRelations: works without an onProgress callback (optional)', async () => {
  const relations = [{ table_schema: 'public', table_name: 'a', column_name: 'x' }];
  const client = makeMockClient(() => ({ rows: [{ count: 0 }] }));
  const { violations, inconclusive } = await verifyRelations(client, relations, FORBIDDEN);
  assert.deepEqual(violations, []);
  assert.deepEqual(inconclusive, []);
});
