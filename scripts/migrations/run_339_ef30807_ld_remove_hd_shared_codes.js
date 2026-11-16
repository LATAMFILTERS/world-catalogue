'use strict';

/**
 * EF30807 (Light Duty, MANN WK10807X, 215.9 mm) shares 10 reference numbers with ES91026 (Heavy Duty, Donaldson P551026,
 * 243.6 mm). Light Duty and Heavy Duty are not mixed: the Heavy Duty Donaldson row keeps the shared codes and the
 * Light Duty row drops them (same rule as the 2026-11-12 cleanup). Only EF30807 is written; ES91026 is not touched.
 * The shared set is computed against ES91026 at run time and must match EXPECTED exactly.
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
const SKU = 'EF30807';
const BASE = 'WK10807X';
const HD = 'ES91026';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const EXPECTED = ['10101998', '42554067', '504166113', '51125030051', '51125036000', 'A0004700469', '1000167423', '11110683', '2113151', '65125015021'].sort();
const OTHERS_SQL = 'SELECT sku, md5(row(oem_codes, competitor_codes, codigo_base, canonical_source_code)::text) h FROM public.elimfilters_catalog WHERE sku<>$1 ORDER BY sku';

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[SKU, HD]])).rows;
    const cur = rows.find((r) => r.sku === SKU);
    const hd = rows.find((r) => r.sku === HD);
    if (!cur || !hd) throw new Error('SKU_NOT_FOUND');
    if (cur.duty !== 'LIGHT_DUTY' || hd.duty !== 'HEAVY_DUTY' || cur.codigo_base !== BASE || hd.codigo_base !== 'P551026') throw new Error('IDENTITY_CHANGED');
    const hdCodes = new Set([...hd.oem_codes, ...hd.competitor_codes].map((x) => norm(x.code)));
    const shared = new Set([...cur.oem_codes, ...cur.competitor_codes].map((x) => norm(x.code)).filter((c) => hdCodes.has(c)));
    if (JSON.stringify([...shared].sort()) !== JSON.stringify(EXPECTED)) throw new Error('SHARED_SET_CHANGED ' + [...shared].sort().join(','));
    const keep = (list) => list.filter((x) => !shared.has(norm(x.code || x.reference)));
    const patch = { oem_codes: keep(cur.oem_codes), competitor_codes: keep(cur.competitor_codes) };
    report.before = [cur.oem_codes.length, cur.competitor_codes.length];
    report.removed = [...cur.oem_codes, ...cur.competitor_codes].filter((x) => shared.has(norm(x.code))).map((x) => `${x.manufacturer} ${x.code}`);
    report.kept = [...patch.oem_codes, ...patch.competitor_codes].map((x) => `${x.manufacturer} ${x.code}`);
    const hdHash = sha(hd);
    const othersHash = sha((await db.query(OTHERS_SQL, [SKU])).rows);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    report.exact_part_reference_deleted = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [SKU, [...shared]])).rowCount;
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);
    const s = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    for (const x of [...s.oem_codes, ...s.competitor_codes]) if (shared.has(norm(x.code))) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + x.code);
    if (s.codigo_base !== BASE || s.canonical_source_code !== cur.canonical_source_code || s.duty !== 'LIGHT_DUTY') throw new Error('IDENTITY_CHANGED_AFTER');
    if (sha((await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [HD])).rows[0]) !== hdHash) throw new Error('HD_ROW_CHANGED');
    if (sha((await db.query(OTHERS_SQL, [SKU])).rows) !== othersHash) throw new Error('OTHER_SKUS_CHANGED');
    report.after = [s.oem_codes.length, s.competitor_codes.length];
    report.exact_conflicts_with_es91026 = (await db.query(`SELECT part_number, skus FROM public.exact_part_conflicts WHERE $1=ANY(skus)`, [SKU])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
