'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { configuration, signedUrl, storage, candidates, resolveImage, reconcile, startR2CatalogImageSync } = require('../lib/r2-catalog-image-sync');
const bytes = Buffer.from('89504e470d0a1a0a00000000', 'hex');
const digest = createHash('sha256').update(bytes).digest('hex');
const object = { key: 'EL81807.png', sku: 'EL81807', modified: '2026-11-03T15:00:00Z', etag: 'v1' };
const canonical = { ...object, key: 'products/EL81807/manifest.json', manifest: true };
const imageKey = `products/EL81807/approved/${digest}.png`;
const manifest = { sku: object.sku, status: 'APPROVED_GOLDEN_MASTER', image: { sha256: digest, r2_key: imageKey } };
function r2(items = [object]) {
  return {
    list: async () => items,
    get: async key => key.endsWith('manifest.json') ? Buffer.from(JSON.stringify(manifest)) : bytes,
    publicImage: async (key, sha256) => ({ url: `https://cdn.elimfilters.com/${key}?v=${sha256}`, bytes }),
  };
}
// Transaction-aware stand-in: exercise reconciliation, never claim live PostgreSQL validation.
function database(initial = {}) {
  const state = { row: { sku: 'EL81807', image_url: 'old.png', technology: 'SYNTRAX', ...initial }, ledger: {}, history: [], updates: 0, locked: true };
  let backup;
  return { state, async query(sql, args = []) {
    if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: state.locked }] };
    if (sql.includes('pg_advisory_unlock') || sql.startsWith('CREATE')) return { rows: [] };
    if (sql.includes('LEFT JOIN')) return { rows: [{ ...state.row, ...state.ledger }] };
    if (sql === 'BEGIN') { backup = structuredClone(state); return { rows: [] }; }
    if (sql === 'ROLLBACK') { if (backup) Object.assign(state, backup); backup = null; return { rows: [] }; }
    if (sql === 'COMMIT') { backup = null; return { rows: [] }; }
    if (sql.includes('FOR UPDATE')) return { rows: [{ image_url: state.concurrent ? 'external.png' : state.row.image_url }] };
    if (sql === 'SELECT image_url FROM elimfilters_catalog WHERE sku=$1') return { rows: [{ image_url: state.row.image_url }] };
    if (sql.startsWith('UPDATE elimfilters_catalog')) { if (!state.preventWrites) state.row.image_url = args[1]; state.updates++; return { rows: [] }; }
    if (sql.includes('INSERT INTO public.catalog_r2_image_history')) { state.history.push(args); return { rows: [] }; }
    if (sql.includes('INSERT INTO public.catalog_r2_image_sync')) { state.ledger = { source_key: args[1], source_modified: args[2], synced_image_url: args[4], source_etag: args[6] }; return { rows: [] }; }
    throw Error('Unexpected SQL: ' + sql);
  } };
}

test('requires credentials and rejects a polling storm', () => {
  assert.throws(() => configuration({}), /ACCOUNT/);
  assert.throws(() => configuration({ R2_ACCOUNT_ID: 'a'.repeat(32) }), /credentials/);
  assert.throws(() => configuration({ R2_ACCOUNT_ID: 'a'.repeat(32), R2_ACCESS_KEY_ID: 'x', R2_SECRET_ACCESS_KEY: 'x', R2_IMAGE_SYNC_INTERVAL_MS: '0' }), /interval/);
});
test('SigV4 escapes spaces and plus signs without exposing secrets in URL', () => {
  const signed = signedUrl({ account: 'a'.repeat(32), bucket: 'elimfilters-renders', access: 'access', secret: 'secret' }, 'folder/a +.png', { 'continuation-token': 'a+/=' }, new Date('2026-11-03T00:00:00Z'));
  assert.match(signed.url, /folder\/a%20%2B.png/);
  assert.match(signed.url, /continuation-token=a%2B%2F%3D/);
  assert.equal(signed.headers['x-amz-date'], '20261103T000000Z');
  assert.match(signed.headers.Authorization, /Credential=access\/20261103\/auto\/s3\/aws4_request/);
  assert.ok(!signed.url.includes('secret'));
});
test('lists every R2 page and decodes object keys', async () => {
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    const last = calls.length === 2;
    return new Response(`<ListBucketResult><Contents><Key>${last ? 'EL81807.png' : 'folder%2FEL80425.png'}</Key><LastModified>${object.modified}</LastModified><ETag>&quot;v1&quot;</ETag></Contents><IsTruncated>${last ? 'false' : 'true'}</IsTruncated>${last ? '' : '<NextContinuationToken>a+/=</NextContinuationToken>'}</ListBucketResult>`);
  };
  const objects = await storage({ account: 'a'.repeat(32), bucket: 'elimfilters-renders', access: 'x', secret: 'x' }, fetcher).list();
  assert.deepEqual(objects.map(x => x.key), ['folder/EL80425.png', 'EL81807.png']);
  assert.match(calls[1], /continuation-token=a%2B%2F%3D/);
});
test('fails closed on incomplete pagination and HTTP errors', async () => {
  const config = { account: 'a'.repeat(32), bucket: 'elimfilters-renders', access: 'x', secret: 'x' };
  await assert.rejects(storage(config, async () => new Response('<ListBucketResult><IsTruncated>true</IsTruncated></ListBucketResult>')).list(), /PAGINATION/);
  await assert.rejects(storage(config, async () => new Response('', { status: 403 })).list(), /HTTP_403/);
});
test('matches exact existing SKUs, excludes references, prefers approved manifest', () => {
  const result = candidates([object, canonical, { ...object, key: 'reference/EL81807.png' }, { ...object, key: 'EL818070.png' }, { ...object, key: 'EL81807-candidate.png' }], new Set(['EL81807']));
  assert.equal(result.selected.length, 1);
  assert.equal(result.selected[0].key, canonical.key);
});
test('holds conflicting legacy images with equal timestamps', () => {
  const result = candidates([object, { ...object, key: 'folder/EL81807.png' }], new Set(['EL81807']));
  assert.deepEqual(result.ambiguous, ['EL81807']);
  assert.equal(result.selected.length, 0);
});
test('a new direct approved upload supersedes an older manifest for the same SKU', () => {
  const newer = { ...object, key: 'EL81807-approved.png', modified: '2026-11-03T16:00:00Z' };
  assert.equal(candidates([canonical, newer], new Set(['EL81807'])).selected[0].key, newer.key);
});
test('verifies approved manifest bytes and public CDN bytes', async () => {
  assert.equal((await resolveImage(canonical, r2())).sha256, digest);
  await assert.rejects(resolveImage(canonical, { ...r2(), get: async key => key.endsWith('.json') ? Buffer.from(JSON.stringify({ ...manifest, sku: 'EL80425' })) : bytes }), /INVALID_APPROVED/);
  await assert.rejects(resolveImage(canonical, { ...r2(), get: async key => key.endsWith('.json') ? Buffer.from(JSON.stringify(manifest)) : Buffer.from('wrong') }), /APPROVED_HASH/);
  await assert.rejects(resolveImage(object, { ...r2(), publicImage: async () => ({ url: 'url', bytes: Buffer.from('stale') }) }), /CDN_HASH/);
});
test('imports a new upload, changes only image URL and records previous value atomically', async () => {
  const db = database();
  assert.equal((await reconcile(db, r2())).updated, 1);
  assert.equal(db.state.row.image_url, `https://cdn.elimfilters.com/EL81807.png?v=${digest}`);
  assert.equal(db.state.row.technology, 'SYNTRAX');
  assert.equal(db.state.history[0][1], 'old.png');
  assert.equal((await reconcile(db, r2())).unchanged, 1);
  assert.equal(db.state.updates, 1);
});
test('detects replacement of same key, including within same timestamp via ETag', async () => {
  const db = database();
  await reconcile(db, r2());
  const report = await reconcile(db, r2([{ ...object, etag: 'v2' }]));
  assert.equal(report.updated, 1);
  assert.equal(db.state.ledger.source_etag, 'v2');
  assert.equal(db.state.updates, 1);
});
test('does not roll back to older objects or override an external catalogue edit', async () => {
  const db = database();
  await reconcile(db, r2());
  assert.equal((await reconcile(db, r2([{ ...object, modified: '2026-11-01T00:00:00Z' }]))).unchanged, 1);
  db.state.row.image_url = 'external.png';
  assert.match((await reconcile(db, r2([{ ...object, etag: 'v2' }]))).errors[0].error, /EXTERNAL_IMAGE_CHANGE/);
  assert.equal(db.state.row.image_url, 'external.png');
});
test('concurrent edit is held; failed CDN remains retryable', async () => {
  const db = database();
  db.state.concurrent = true;
  assert.equal((await reconcile(db, r2())).status, 'PARTIAL');
  assert.equal(db.state.updates, 0);
  db.state.concurrent = false;
  assert.equal((await reconcile(db, { ...r2(), publicImage: async () => { throw Error('CDN unavailable'); } })).status, 'PARTIAL');
  assert.equal(db.state.updates, 0);
  assert.equal((await reconcile(db, r2())).updated, 1);
});
test('second process cannot run concurrently; cloud/CI cannot schedule writes', async () => {
  const db = database(); db.state.locked = false;
  assert.equal((await reconcile(db, r2())).status, 'BUSY');
  startR2CatalogImageSync({ connect() { throw Error('must not connect'); } }, { ELIM_RUNTIME_NODE: 'GITHUB', ELIM_RUNTIME_ROLE: 'CI', ELIM_SCHEDULER_ENABLED: 'true' });
});
test('a database trigger that skips the write cannot produce a successful ledger entry', async () => {
  const db = database(); db.state.preventWrites = true;
  const report = await reconcile(db, r2());
  assert.equal(report.updated, 0);
  assert.match(report.errors[0].error, /WRITE_NOT_PERSISTED/);
  assert.equal(db.state.row.image_url, 'old.png');
  assert.equal(db.state.history.length, 0);
  assert.deepEqual(db.state.ledger, {});
});
test('public CDN fetch uses hash version to bypass a stale same-key image', async () => {
  const calls = [];
  const config = { account: 'a'.repeat(32), bucket: 'elimfilters-renders', access: 'x', secret: 'x', cdn: 'https://cdn.elimfilters.com' };
  const result = await storage(config, async url => { calls.push(url); return new Response(bytes); }).publicImage('EL81807.png', digest);
  assert.equal(result.url, `https://cdn.elimfilters.com/EL81807.png?v=${digest}`);
  assert.equal(calls[0], result.url);
});
