'use strict';

/**
 * Unblocks the priced Heavy Duty SKUs that still fail certification (operator 2026-11-25, "lo que tenga errores hay que corregirlo ya").
 * 1. Cross duty (ruling 2026-11-12, same as run_339): a code shared between an HD Donaldson product and a Light Duty product stays on the HD product and is dropped from the LD product
 *    (catalogue oem/competitor lists, exact_part_reference rows, crossref cache). HD SKUs in scope: EA11558, EL84004, EL88616. The HD rows are never written; LD SKUs the write gateway rejects are skipped and listed.
 * 2. EL81343: the OEM code 2630042040 carries the generic brand "OEM"; the official Donaldson page P551343 lists it as HYUNDAI (a vehicle maker = OEM). Both entries (OEM list and competitor list) become one OEM entry HYUNDAI.
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
const HD_SKUS = ['EA11558', 'EL84004', 'EL88616'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', ld_cleaned: [], ld_gateway_skipped: [] };
  const snap = { captured_at: new Date().toISOString(), rows: [] };
  try {
    await db.query('BEGIN');
    // 1. cross duty
    const hdRows = (await db.query("SELECT sku, duty, oem_codes, competitor_codes, md5(row(oem_codes, competitor_codes, codigo_base)::text) h FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])", [HD_SKUS])).rows;
    if (hdRows.length !== HD_SKUS.length || hdRows.some((r) => r.duty !== 'HEAVY_DUTY')) throw new Error('HD_SOURCE_CHANGED');
    const hdBefore = Object.fromEntries(hdRows.map((r) => [r.sku, r.h]));
    for (const hd of hdRows) {
      const codes = [...new Set([...(hd.oem_codes || []), ...(hd.competitor_codes || [])].map((x) => norm(x.code)))];
      const ld = (await db.query(`SELECT DISTINCT r.sku FROM public.exact_part_reference r JOIN public.elimfilters_catalog c ON c.sku=r.sku
        WHERE c.duty='LIGHT_DUTY' AND c.catalog_active AND upper(regexp_replace(r.part_number,'[^A-Za-z0-9]','','g')) = ANY($1::text[])`, [codes])).rows.map((r) => r.sku);
      for (const sku of ld) {
        const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [sku])).rows[0];
        const have = new Set([...(cur.oem_codes || []), ...(cur.competitor_codes || [])].map((x) => norm(x.code)));
        const shared = new Set(codes.filter((c) => have.has(c)));
        if (!shared.size) continue;
        const keep = (list) => (list || []).filter((x) => !shared.has(norm(x.code)));
        const patch = { oem_codes: keep(cur.oem_codes), competitor_codes: keep(cur.competitor_codes) };
        try { assertGovernedCatalogPatch(cur, patch, { validateApplications: false }); } catch (e) { report.ld_gateway_skipped.push(sku + ' (con ' + hd.sku + ')'); continue; }
        snap.rows.push({ sku, oem_codes: cur.oem_codes, competitor_codes: cur.competitor_codes });
        await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
        const del = await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [sku, [...shared]]);
        try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [sku]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
        report.ld_cleaned.push({ ld: sku, hd: hd.sku, codes_removed: shared.size, exact_rows_deleted: del.rowCount });
      }
    }
    const hdAfter = (await db.query("SELECT sku, md5(row(oem_codes, competitor_codes, codigo_base)::text) h FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])", [HD_SKUS])).rows;
    for (const r of hdAfter) if (r.h !== hdBefore[r.sku]) throw new Error('HD_ROW_CHANGED ' + r.sku);
    // 2. EL81343 HYUNDAI
    const el = (await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku='EL81343' FOR UPDATE")).rows[0];
    if (!el || el.codigo_base !== 'P551343') throw new Error('EL81343_CHANGED');
    const isGeneric = (x) => norm(x.code) === '2630042040' && ['OEM', 'OE'].includes(String(x.manufacturer || '').toUpperCase().trim());
    const oem = (el.oem_codes || []).filter((x) => !isGeneric(x));
    const comp = (el.competitor_codes || []).filter((x) => !isGeneric(x));
    if (!oem.some((x) => norm(x.code) === '2630042040' && /HYUNDAI/i.test(x.manufacturer))) oem.push({ code: '2630042040', manufacturer: 'HYUNDAI', classification: 'OEM', classification_source: 'OPERATOR_RULE_20261125', source_url: 'https://shop.donaldson.com/store/es-us/product/P551343/20754' });
    report.el81343 = { oem: [(el.oem_codes || []).length, oem.length], comp: [(el.competitor_codes || []).length, comp.length] };
    assertGovernedCatalogPatch(el, { oem_codes: oem, competitor_codes: comp }, { validateApplications: false });
    snap.rows.push({ sku: 'EL81343', oem_codes: el.oem_codes, competitor_codes: el.competitor_codes });
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', ['EL81343', JSON.stringify(oem), JSON.stringify(comp)]);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ ...snap, row_sha256: sha(snap.rows) }, null, 2));
    report.exact_conflicts_left_for_hd = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [HD_SKUS])).rows.length;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
