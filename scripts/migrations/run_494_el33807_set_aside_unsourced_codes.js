'use strict';

/**
 * EL33807 (Light Duty, FRAM PH3807): operator 2026-11-25, "aparta los sin fuente de EL33807". Technical rule: a code stays on a SKU only when it is backed by the source of its code base
 * (FRAM/MANN for Light Duty) or, for Light Duty with no information from FRAM/MANN, by the Millard fallback. FRAM no longer publishes PH3807, so the valid source is the Millard ML 3807 datasheet
 * (14 references, the operator's capture of 2026-11-20). Every other code of EL33807 has no written source: it is SET ASIDE, not deleted: removed from oem_codes / competitor_codes and kept in
 * enrichment_data.codes_pending_review (with its brand and classification) so the operator can review and restore any of them.
 * Kept in the lists: the 14 Millard references and any code whose entry carries a written source (the one fram_ld_sku_formula_match entry). Applications, base, price, certification: untouched.
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
const SKU = 'EL33807';
const MILLARD = ['PH3593A', 'PH3950', 'H13W01', '15400PR3004', '2630035056', 'PH2808', 'PH2856A', 'W81480', '037023802', 'MD031805', 'L10193', '1560187305000', '2316500', '51381'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const sheet = new Set(MILLARD.map(norm));
const hasSource = (x) => Boolean(x.source || x.source_url || x.evidence_authority);

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.duty !== 'LIGHT_DUTY' || cur.codigo_base !== 'PH3807' || cur.canonical_source_brand !== 'FRAM' || !cur.catalog_active) throw new Error('SOURCE_CHANGED');
    if (cur.enrichment_data?.codes_pending_review) throw new Error('ALREADY_SET_ASIDE');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const keepIt = (x) => sheet.has(norm(x.code)) || hasSource(x);
    const oem = (cur.oem_codes || []).filter(keepIt);
    const comp = (cur.competitor_codes || []).filter(keepIt);
    const asideOem = (cur.oem_codes || []).filter((x) => !keepIt(x));
    const asideComp = (cur.competitor_codes || []).filter((x) => !keepIt(x));
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.codes_pending_review = { set_aside_at: '2026-11-25T00:00:00.000Z', decided_by: 'OPERATOR', reason: 'NO_WRITTEN_SOURCE_FOR_BASE_FRAM_PH3807', migration: 'run_494', oem: asideOem, competitor: asideComp };
    report.before = [(cur.oem_codes || []).length, (cur.competitor_codes || []).length];
    report.kept = [oem.length, comp.length];
    report.set_aside = [asideOem.length, asideComp.length];
    report.millard_found_in_lists = MILLARD.filter((c) => [...oem, ...comp].some((x) => norm(x.code) === norm(c))).length;
    const patch = { oem_codes: oem, competitor_codes: comp, enrichment_data: enrichment };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb, enrichment_data=$4::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem), JSON.stringify(comp), JSON.stringify(enrichment)]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    const s = (await db.query('SELECT codigo_base, canonical_source_brand, jsonb_array_length(vehicle_applications) veh FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    if (s.codigo_base !== 'PH3807' || s.canonical_source_brand !== 'FRAM' || s.veh !== (cur.vehicle_applications || []).length) throw new Error('IDENTITY_OR_APPLICATIONS_CHANGED');
    report.vehicle_applications_kept = s.veh;
    report.resolver_ph3807 = (await db.query('SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part($1)', ['PH3807'])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
