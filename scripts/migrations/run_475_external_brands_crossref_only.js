'use strict';

/**
 * Operator rule 2026-11-25: a code that comes from an external source (not the manufacturer of the filter) is a cross reference.
 * Brands ASAHI, NIPPON, AMC (AMERICAN MOTORS CORPORATION), EXXEL (EXXEL PTY LTD), FSA, ROMAN and PERMATIC sit in BOTH oem_codes and competitor_codes
 * (Donaldson product pages list them under "(OEM) Cross Reference", Donaldson's competitor search lists them as competitors).
 * For every SKU: an OEM entry of one of these brands whose code also exists in competitor_codes is removed from oem_codes (the competitor entry stays).
 * OEM entries WITHOUT a competitor twin are NOT touched (reported only). SKUs the catalogue write gateway rejects are skipped and listed.
 * Only oem_codes changes. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const BRANDS = new Set(['ASAHI', 'NIPPON', 'AMC', 'AMERICANMOTORSCORPORATION', 'EXXEL', 'EXXELPTYLTD', 'FSA', 'ROMAN', 'PERMATIC']);
const brandKey = (x) => String(x.manufacturer || '').toUpperCase().replace(/[^A-Z]/g, '');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus_changed: 0, entries_removed: 0, oem_only_untouched: 0, gateway_skipped: [] };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE oem_codes IS NOT NULL AND competitor_codes IS NOT NULL ORDER BY sku FOR UPDATE')).rows;
    const touched = [];
    const hash = "SELECT md5((to_jsonb(c)-'oem_codes')::text) h FROM public.elimfilters_catalog c WHERE sku=$1";
    for (const cur of rows) {
      const compCodes = new Set((cur.competitor_codes || []).map((x) => norm(x.code)));
      const oem = [];
      let removed = 0;
      for (const x of cur.oem_codes || []) {
        if (BRANDS.has(brandKey(x))) { if (compCodes.has(norm(x.code))) { removed++; continue; } report.oem_only_untouched++; }
        oem.push(x);
      }
      if (!removed) continue;
      try { assertGovernedCatalogPatch(cur, { oem_codes: oem }, { validateApplications: false }); } catch (e) { report.gateway_skipped.push(cur.sku); continue; }
      touched.push(cur);
      const h0 = (await db.query(hash, [cur.sku])).rows[0].h;
      const u = await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb WHERE sku=$1', [cur.sku, JSON.stringify(oem)]);
      if (u.rowCount !== 1) throw new Error('UPDATE_COUNT ' + cur.sku);
      if ((await db.query(hash, [cur.sku])).rows[0].h !== h0) throw new Error('PROTECTED_FIELD_CHANGED ' + cur.sku);
      report.skus_changed++; report.entries_removed += removed;
    }
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: touched.map((r) => ({ sku: r.sku, oem_codes: r.oem_codes })), row_sha256: sha(touched.map((r) => [r.sku, r.oem_codes])) }, null, 2));
    const rep = arg('--report-skus');
    if (rep) {
      const list = JSON.parse(fs.readFileSync(rep, 'utf8'));
      const left = (await db.query('SELECT sku, count(*)::int n FROM public.catalog_reference_classification_conflicts_v WHERE sku = ANY($1) GROUP BY sku', [list])).rows;
      report.listed_skus_with_conflicts_after = left.length;
      report.listed_skus_conflict_free_after = list.length - left.length;
      report.listed_remaining = left.map((r) => r.sku + ':' + r.n).join(' ');
    }
    report.conflict_view_remaining_for_these_brands = (await db.query("SELECT count(*) n FROM public.catalog_reference_classification_conflicts_v")).rows[0].n;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
