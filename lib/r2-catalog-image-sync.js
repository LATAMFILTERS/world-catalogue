'use strict';

// The catalogue runtime owns this reconciliation loop; R2 remains object storage.
const { createHash, createHmac } = require('node:crypto');
const hash = value => createHash('sha256').update(value).digest('hex');
const hmac = (key, value) => createHmac('sha256', key).update(value).digest();
const encode = value => encodeURIComponent(value).replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
const xml = value => value.replace(/&(amp|lt|gt|quot|apos);/g, (_, k) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" })[k]);
const tag = (text, name) => xml(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(text)?.[1] || '');

function configuration(env = process.env) {
  const config = {
    account: env.R2_ACCOUNT_ID,
    access: env.R2_IMAGE_SYNC_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID,
    secret: env.R2_IMAGE_SYNC_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY,
    bucket: 'elimfilters-renders',
    cdn: 'https://cdn.elimfilters.com',
    interval: Number(env.R2_IMAGE_SYNC_INTERVAL_MS || 60000),
  };
  if (!/^[a-f0-9]{32}$/.test(config.account || '')) throw Error('R2_SYNC_CONFIG: R2_ACCOUNT_ID missing/invalid');
  if (!config.access || !config.secret) throw Error('R2_SYNC_CONFIG: R2 image bucket read credentials missing');
  if (!Number.isFinite(config.interval) || config.interval < 10000) throw Error('R2_SYNC_CONFIG: interval must be >= 10000 ms');
  return config;
}

function signedUrl(config, key = '', query = {}, now = new Date()) {
  const url = new URL(`https://${config.account}.r2.cloudflarestorage.com`);
  url.pathname = '/' + [config.bucket, ...key.split('/').filter(Boolean)].map(encode).join('/');
  const canonicalQuery = Object.entries(query).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([k, v]) => `${encode(k)}=${encode(v)}`).join('&');
  url.search = canonicalQuery;
  const stamp = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = stamp.slice(0, 8);
  const bodyHash = hash('');
  const headers = { 'x-amz-content-sha256': bodyHash, 'x-amz-date': stamp };
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalHeaders = `host:${url.host}\nx-amz-content-sha256:${bodyHash}\nx-amz-date:${stamp}\n`;
  const canonical = ['GET', url.pathname, canonicalQuery, canonicalHeaders, signedHeaders, bodyHash].join('\n');
  const scope = `${date}/auto/s3/aws4_request`;
  const signingKey = hmac(hmac(hmac(hmac('AWS4' + config.secret, date), 'auto'), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(`AWS4-HMAC-SHA256\n${stamp}\n${scope}\n${hash(canonical)}`).digest('hex');
  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${config.access}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  return { url: url.toString(), headers };
}

async function readResponse(fetcher, url, options, maxBytes) {
  const response = await fetcher(url, { ...options, redirect: 'error', signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw Error(`R2_SYNC_HTTP_${response.status}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > maxBytes) throw Error('R2_SYNC_OBJECT_TOO_LARGE');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function storage(config, fetcher = fetch) {
  async function get(key, query, max = 30 * 1024 * 1024) {
    const request = signedUrl(config, key, query);
    return readResponse(fetcher, request.url, { headers: request.headers }, max);
  }
  return {
    get,
    async publicImage(key, sha256) {
      // Version URLs so replacing an existing R2 key also invalidates browser/CDN caches.
      const url = `${config.cdn}/${key.split('/').map(encode).join('/')}?v=${sha256}`;
      return { url, bytes: await readResponse(fetcher, url, {}, 30 * 1024 * 1024) };
    },
    async list() {
      const objects = [];
      const seen = new Set();
      let token = '';
      do {
        const query = { 'list-type': '2', 'encoding-type': 'url', 'max-keys': '1000' };
        if (token) query['continuation-token'] = token;
        const body = (await get('', query, 5 * 1024 * 1024)).toString('utf8');
        if (!body.includes('<ListBucketResult') || /<!DOCTYPE|<!ENTITY/i.test(body)) throw Error('R2_SYNC_INVALID_LIST');
        for (const item of body.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
          const key = decodeURIComponent(tag(item[1], 'Key'));
          const modified = tag(item[1], 'LastModified');
          if (!key || !Number.isFinite(Date.parse(modified))) throw Error('R2_SYNC_INVALID_OBJECT');
          objects.push({ key, modified, etag: tag(item[1], 'ETag') });
        }
        if (tag(body, 'IsTruncated') === 'false') break;
        token = tag(body, 'NextContinuationToken');
        if (!token || seen.has(token) || seen.size >= 10000) throw Error('R2_SYNC_INVALID_PAGINATION');
        seen.add(token);
      } while (true);
      return objects;
    },
  };
}

function candidates(objects, knownSkus) {
  const groups = new Map();
  for (const object of objects) {
    if (/(?:^|\/)(?:source|sources|reference|references|candidate|candidates|rejected|superseded)(?:\/|$)/i.test(object.key)) continue;
    const manifest = /^products\/([A-Z][A-Z0-9-]*\d)\/manifest\.json$/.exec(object.key);
    // Existing legacy uploads: exact SKU.png or SKU-...-approved[-opt].png.
    const legacy = /(?:^|\/)([A-Z]{2}\d{4,7})(?:-(?:[A-Za-z0-9-]+-)?approved(?:-opt)?)?\.(?:png|jpg|jpeg|webp)$/i.exec(object.key);
    const sku = (manifest?.[1] || legacy?.[1] || '').toUpperCase();
    if (!knownSkus.has(sku)) continue;
    if (!groups.has(sku)) groups.set(sku, []);
    groups.get(sku).push({ ...object, sku, manifest: Boolean(manifest) });
  }
  const selected = [], ambiguous = [];
  for (const [sku, items] of groups) {
    items.sort((a, b) => Date.parse(b.modified) - Date.parse(a.modified));
    const newest = items.filter(item => Date.parse(item.modified) === Date.parse(items[0].modified));
    const manifests = newest.filter(item => item.manifest);
    // A tied canonical manifest resolves a publisher batch; newer direct uploads still update.
    if (manifests.length === 1) selected.push(manifests[0]);
    else if (newest.length !== 1) ambiguous.push(sku);
    else selected.push(newest[0]);
  }
  return { selected, ambiguous };
}

async function resolveImage(object, r2) {
  let key = object.key, expected;
  if (object.manifest) {
    const manifest = JSON.parse((await r2.get(key, {}, 1024 * 1024)).toString('utf8'));
    expected = manifest.image?.sha256;
    key = manifest.image?.r2_key;
    if (manifest.sku !== object.sku || manifest.status !== 'APPROVED_GOLDEN_MASTER' || !/^[a-f0-9]{64}$/.test(expected || '') || key !== `products/${object.sku}/approved/${expected}.png`) throw Error('R2_SYNC_INVALID_APPROVED_MANIFEST');
  }
  const bytes = await r2.get(key, {});
  const sha256 = hash(bytes);
  if (expected && sha256 !== expected) throw Error('R2_SYNC_APPROVED_HASH_MISMATCH');
  const publicImage = await r2.publicImage(key, sha256);
  if (hash(publicImage.bytes) !== sha256) throw Error('R2_SYNC_CDN_HASH_MISMATCH');
  const png = bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex'));
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const webp = bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if ((!png && !jpeg && !webp) || (expected && !png)) throw Error('R2_SYNC_NOT_AN_IMAGE');
  return { ...object, image_key: key, image_url: publicImage.url, sha256 };
}

async function installLedger(db) {
  await db.query(`CREATE TABLE IF NOT EXISTS public.catalog_r2_image_sync (
    sku text PRIMARY KEY, source_key text NOT NULL, source_modified timestamptz NOT NULL, source_etag text,
    image_key text NOT NULL, image_url text NOT NULL, sha256 text NOT NULL,
    synced_at timestamptz NOT NULL DEFAULT now());
    CREATE TABLE IF NOT EXISTS public.catalog_r2_image_history (
    id bigserial PRIMARY KEY, sku text NOT NULL, previous_image_url text,
    image_url text NOT NULL, image_key text NOT NULL, sha256 text NOT NULL,
    source_modified timestamptz NOT NULL, changed_at timestamptz NOT NULL DEFAULT now());`);
}

async function reconcile(db, r2) {
  const lock = (await db.query("SELECT pg_try_advisory_lock(hashtext('catalog-r2-image-sync')) AS locked")).rows[0]?.locked;
  if (!lock) return { status: 'BUSY', updated: 0 };
  try {
    await installLedger(db);
    const rows = (await db.query(`SELECT c.sku, c.image_url, s.source_key, s.source_modified,
      s.source_etag, s.image_url AS synced_image_url FROM elimfilters_catalog c
      LEFT JOIN public.catalog_r2_image_sync s ON s.sku=c.sku WHERE c.catalog_active=true`)).rows;
    const current = new Map(rows.map(row => [row.sku, row]));
    const plan = candidates(await r2.list(), new Set(current.keys()));
    const report = { status: 'OK', updated: 0, unchanged: 0, ambiguous: plan.ambiguous, errors: [] };
    for (const object of plan.selected) {
      const row = current.get(object.sku);
      if (row.source_key && Date.parse(object.modified) < Date.parse(row.source_modified)) { report.unchanged++; continue; }
      if (object.etag && row.source_etag === object.etag && row.source_key === object.key && Date.parse(row.source_modified) === Date.parse(object.modified) && row.image_url === row.synced_image_url) { report.unchanged++; continue; }
      let inTransaction = false;
      try {
        const image = await resolveImage(object, r2);
        await db.query('BEGIN');
        inTransaction = true;
        const locked = (await db.query('SELECT image_url FROM elimfilters_catalog WHERE sku=$1 AND catalog_active=true FOR UPDATE', [image.sku])).rows;
        if (locked.length !== 1) throw Error('R2_SYNC_SKU_NOT_UNIQUE');
        if (locked[0].image_url !== row.image_url) throw Error('R2_SYNC_CONCURRENT_CATALOG_EDIT');
        if (row.source_key && row.image_url !== row.synced_image_url) throw Error('R2_SYNC_EXTERNAL_IMAGE_CHANGE');
        if (row.image_url !== image.image_url) {
          await db.query('UPDATE elimfilters_catalog SET image_url=$2 WHERE sku=$1', [image.sku, image.image_url]);
          const persisted = (await db.query('SELECT image_url FROM elimfilters_catalog WHERE sku=$1', [image.sku])).rows;
          if (persisted.length !== 1 || persisted[0].image_url !== image.image_url) throw Error('R2_SYNC_WRITE_NOT_PERSISTED');
          await db.query(`INSERT INTO public.catalog_r2_image_history (sku,previous_image_url,image_url,image_key,sha256,source_modified) VALUES ($1,$2,$3,$4,$5,$6)`, [image.sku, row.image_url, image.image_url, image.image_key, image.sha256, image.modified]);
        }
        await db.query(`INSERT INTO public.catalog_r2_image_sync (sku,source_key,source_modified,image_key,image_url,sha256,source_etag)
          VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(sku) DO UPDATE SET source_key=excluded.source_key,
          source_modified=excluded.source_modified,image_key=excluded.image_key,image_url=excluded.image_url,
          sha256=excluded.sha256,source_etag=excluded.source_etag,synced_at=now()`, [image.sku, image.key, image.modified, image.image_key, image.image_url, image.sha256, image.etag || null]);
        await db.query('COMMIT');
        inTransaction = false;
        report.updated++;
      } catch (error) {
        if (inTransaction) await db.query('ROLLBACK');
        report.errors.push({ sku: object.sku, error: error.message });
      }
    }
    if (report.errors.length || report.ambiguous.length) report.status = 'PARTIAL';
    return report;
  } finally { await db.query("SELECT pg_advisory_unlock(hashtext('catalog-r2-image-sync'))"); }
}

let started = false;
function startR2CatalogImageSync(pool, env = process.env, logger = console) {
  if (started) return;
  if (env.ELIM_RUNTIME_NODE !== 'LENOVO' || env.ELIM_RUNTIME_ROLE !== 'PRIMARY' || env.ELIM_DOMAIN !== 'WORLD_CATALOGUE' || env.ELIM_SCHEDULER_ENABLED !== 'true' || env.R2_IMAGE_SYNC_ENABLED === 'false') return;
  let config;
  try { config = configuration(env); } catch (error) { logger.error('[r2-catalog-sync] BLOCKED', error.message); return; }
  started = true;
  const r2 = storage(config);
  async function tick() {
    let db;
    try {
      db = await pool.connect();
      logger.log('[r2-catalog-sync]', JSON.stringify(await reconcile(db, r2)));
    } catch (error) { logger.error('[r2-catalog-sync] FAILED', error.message); }
    finally {
      if (db) db.release();
      const timer = setTimeout(tick, config.interval);
      timer.unref();
    }
  }
  void tick();
}

module.exports = { configuration, signedUrl, storage, candidates, resolveImage, reconcile, startR2CatalogImageSync };
