'use strict';

/**
 * FS19914, FS19753 and STCX474 belong to ES91026 (Donaldson P551026, 243.6 mm). ES91026 carries FS19914/FS19753 from the
 * official Donaldson cross-reference search (20261005); STCX474 appears on the official Donaldson P559118 kit page (kit of P551026).
 * ES94925 (P954925, 158 mm) and ES95957 (P505957, 204 mm) hold the same three codes only from the internal
 * CROSS_REFERENCE_BRAND_TAXONOMY_20260927 / no source, and their lengths differ, so they cannot be the same part.
 * Removes those three references from ES94925 and ES95957 only. ES91026 is not written.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const KEEP_SKU = 'ES91026';
const TARGETS = { ES94925: 'P954925', ES95957: 'P505957' };
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const REMOVE = new Set(['FS19914', 'FS19753', 'STCX474']);
const keep = (list) => (Array.isArray(list) ? list : []).filter((x) => !REMOVE.has(norm(x.code || x.reference)));
const OTHERS_SQL = 'SELECT sku, md5(row(oem_codes, competitor_codes, codigo_base, canonical_source_code)::text) h FROM public.elimfilters_catalog WHERE sku<>ALL($1::text[]) ORDER BY sku';

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const skus = [...Object.keys(TARGETS), KEEP_SKU];
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [skus])).rows;
    if (rows.length !== 3) throw new Error('SKU_NOT_FOUND');
    const keeper = rows.find((r) => r.sku === KEEP_SKU);
    const keeperCodes = new Set([...keeper.oem_codes, ...keeper.competitor_codes].map((x) => norm(x.code)));
    if (!keeperCodes.has('FS19914') || !keeperCodes.has('FS19753')) throw new Error('KEEPER_LACKS_CODES');
    const othersHash = sha((await db.query(OTHERS_SQL, [Object.keys(TARGETS)])).rows);
    const keeperHash = sha(keeper);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: rows.filter((r) => TARGETS[r.sku]), keeper_sha256: keeperHash }, null, 2));
    for (const [sku, base] of Object.entries(TARGETS)) {
      const cur = rows.find((r) => r.sku === sku);
      if (cur.codigo_base !== base || !cur.catalog_active) throw new Error(`TARGET_CHANGED ${sku}`);
      const patch = { oem_codes: keep(cur.oem_codes), competitor_codes: keep(cur.competitor_codes) };
      const removed = [...cur.oem_codes, ...cur.competitor_codes].filter((x) => REMOVE.has(norm(x.code || x.reference))).map((x) => `${x.manufacturer || ''} ${x.code}`.trim());
      report.skus[sku] = { before: [cur.oem_codes.length, cur.competitor_codes.length], removed };
      if (!removed.length) continue;
      report.skus[sku].gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [sku, [...REMOVE]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', [sku]);
    }
    for (const [sku, base] of Object.entries(TARGETS)) {
      const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [sku])).rows[0];
      for (const x of [...s.oem_codes, ...s.competitor_codes]) if (REMOVE.has(norm(x.code || x.reference))) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + sku + ' ' + x.code);
      if (s.codigo_base !== base || s.canonical_source_code !== rows.find((r) => r.sku === sku).canonical_source_code) throw new Error('IDENTITY_CHANGED ' + sku);
      report.skus[sku].after = [s.oem_codes.length, s.competitor_codes.length];
    }
    if (sha((await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [KEEP_SKU])).rows[0]) !== keeperHash) throw new Error('KEEPER_CHANGED');
    if (sha((await db.query(OTHERS_SQL, [Object.keys(TARGETS)])).rows) !== othersHash) throw new Error('OTHER_SKUS_CHANGED');
    report.holders = (await db.query(`SELECT x.code, array_agg(DISTINCT c.sku ORDER BY c.sku) skus FROM unnest($1::text[]) x(code) JOIN public.elimfilters_catalog c ON c.catalog_active AND EXISTS (SELECT 1 FROM jsonb_array_elements(coalesce(c.oem_codes,'[]'::jsonb)||coalesce(c.competitor_codes,'[]'::jsonb)) e WHERE upper(regexp_replace(e->>'code','[^A-Za-z0-9]','','g'))=x.code) GROUP BY x.code`, [[...REMOVE]])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
