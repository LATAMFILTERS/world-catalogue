'use strict';

/**
 * Unblocks the priced Heavy Duty SKUs that still fail certification (operator 2026-11-25, "lo que tenga errores hay que corregirlo ya").
 * 1. Cross duty (ruling 2026-11-12, same as run_339): a code shared between an HD Donaldson product and a Light Duty product stays on the HD product and is dropped from the LD product
 *    (catalogue oem/competitor lists, exact_part_reference rows, crossref cache). HD SKUs in scope: EA11558, EL84004, EL88616. The HD rows are never written; LD SKUs the write gateway rejects are skipped and listed.
 * 2. EL81343: the OEM code 2630042040 carries the generic brand "OEM"; the official Donaldson page P551343 lists it as HYUNDAI (a vehicle maker = OEM). Both entries (OEM list and competitor list) become one OEM entry HYUNDAI.
 * 3. Generic brand (operator 2026-11-25): every entry whose brand is the generic word OEM or OE is eliminated from oem_codes and competitor_codes, catalogue wide (284 entries in 77 SKUs at dry-run time),
 *    after the HYUNDAI entry for 2630042040 is added to EL81343. SKUs the write gateway rejects are skipped and listed.
 * 4. EF90632: the VOLVO code 3188140 is in quarantine (Donaldson page P550632 does not list it, run_236) and is no longer in the SKU's lists; the stale quarantine row that keeps QUARANTINED_REFERENCE_PRESENT is deleted (snapshotted).
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
    // 2 + 3. generic brand OEM / OE eliminated catalogue wide; EL81343 first gets its HYUNDAI entry
    const generic = (x) => ['OEM', 'OE'].includes(String(x.manufacturer || '').toUpperCase().trim());
    const gRows = (await db.query(`SELECT * FROM public.elimfilters_catalog WHERE oem_codes::text ~* '"manufacturer": ?"(OEM|OE)"' OR competitor_codes::text ~* '"manufacturer": ?"(OEM|OE)"' ORDER BY sku FOR UPDATE`)).rows;
    report.generic = { skus: gRows.length, entries_removed: 0, gateway_skipped: [] };
    for (const cur of gRows) {
      let oem = (cur.oem_codes || []).filter((x) => !generic(x));
      const comp = (cur.competitor_codes || []).filter((x) => !generic(x));
      if (cur.sku === 'EL81343') {
        if (cur.codigo_base !== 'P551343') throw new Error('EL81343_CHANGED');
        if (!oem.some((x) => norm(x.code) === '2630042040' && /HYUNDAI/i.test(x.manufacturer))) oem.push({ code: '2630042040', manufacturer: 'HYUNDAI', classification: 'OEM', classification_source: 'OPERATOR_RULE_20261125', source_url: 'https://shop.donaldson.com/store/es-us/product/P551343/20754' });
      }
      const removed = (cur.oem_codes || []).length + (cur.competitor_codes || []).length - oem.length - comp.length + (cur.sku === 'EL81343' ? 1 : 0);
      try { assertGovernedCatalogPatch(cur, { oem_codes: oem, competitor_codes: comp }, { validateApplications: false }); } catch (e) { report.generic.gateway_skipped.push(cur.sku); continue; }
      snap.rows.push({ sku: cur.sku, oem_codes: cur.oem_codes, competitor_codes: cur.competitor_codes });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(oem), JSON.stringify(comp)]);
      try { await db.query('SAVEPOINT g'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [cur.sku]); await db.query('RELEASE SAVEPOINT g'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT g'); }
      report.generic.entries_removed += removed;
    }
    // 4. EF90632: the quarantined VOLVO 3188140 is NOT in its code lists any more (it was dropped after run_236); the quarantine row is stale and is what raises QUARANTINED_REFERENCE_PRESENT. Stop if the code is still there.
    const ef = (await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku='EF90632' FOR UPDATE")).rows[0];
    if (!ef || ef.codigo_base !== 'P550632') throw new Error('EF90632_CHANGED');
    if ([...(ef.oem_codes || []), ...(ef.competitor_codes || [])].some((x) => norm(x.code) === '3188140')) throw new Error('QUARANTINED_CODE_STILL_IN_EF90632');
    const q = (await db.query("SELECT * FROM public.bad_crossref_quarantine WHERE source_sku='EF90632'")).rows;
    snap.quarantine_rows = q;
    report.ef90632_quarantine_rows_deleted = (await db.query("DELETE FROM public.bad_crossref_quarantine WHERE source_sku='EF90632' AND upper(regexp_replace(query_code,'[^A-Za-z0-9]','','g'))='3188140'")).rowCount;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ ...snap, row_sha256: sha(snap.rows) }, null, 2));
    report.exact_conflicts_left_for_hd = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [HD_SKUS])).rows.length;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
