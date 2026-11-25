'use strict';

/**
 * EL84004 (HD, Donaldson P554004) lists the code W11102/36 as a MANN competitor reference (Donaldson cross reference search). W11102/36 is the OWN code base of the Light Duty product
 * EL30236 (MANN-FILTER W 11 102/36). Rulings: the HD Donaldson product keeps the codes shared with an LD product (2026-11-12), but the LD product's own base is never touched,
 * so the code is dropped from the HD row instead. Operator 2026-11-25: "límpialos".
 * Only EL84004's oem_codes / competitor_codes (and its exact_part_reference row and cache) change; EL30236 is never written.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const HD = 'EL84004';
const LD = 'EL30236';
const CODE = 'W1110236';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[HD, LD]])).rows;
    const hd = rows.find((r) => r.sku === HD);
    const ld = rows.find((r) => r.sku === LD);
    if (!hd || !ld || hd.duty !== 'HEAVY_DUTY' || ld.duty !== 'LIGHT_DUTY' || norm(ld.codigo_base) !== CODE) throw new Error('IDENTITY_CHANGED');
    const ldHash = sha(ld);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: hd, row_sha256: sha(hd) }, null, 2));
    const keep = (list) => (list || []).filter((x) => norm(x.code) !== CODE);
    const patch = { oem_codes: keep(hd.oem_codes), competitor_codes: keep(hd.competitor_codes) };
    report.removed = [...(hd.oem_codes || []), ...(hd.competitor_codes || [])].filter((x) => norm(x.code) === CODE).map((x) => `${x.manufacturer} ${x.code}`);
    report.gateway = assertGovernedCatalogPatch(hd, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [HD, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
    report.exact_rows_removed = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=$2`, [HD, CODE])).rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [HD]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    const ldAfter = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [LD])).rows[0];
    if (sha(ldAfter) !== ldHash) throw new Error('LD_ROW_CHANGED');
    report.shared_left = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE $1 = ANY(skus)', [HD])).rows.filter((r) => r.skus.includes(LD)).length;
    report.resolver = (await db.query('SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)', ['W11102/36'])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
