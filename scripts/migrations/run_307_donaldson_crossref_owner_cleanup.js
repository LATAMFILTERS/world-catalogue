'use strict';

/**
 * Resolve NO_PER_SKU_OFFICIAL_EVIDENCE for the 60 hydraulic SKUs (59 of the HD certificates at risk plus EH67103) that
 * share competitor/OEM numbers (Atlas Copco 7224xxx/7226xxx, Hydac, Argo, Behringer, Bosch Rexroth, ...).
 * Evidence: Donaldson's own cross-reference search, one query per shared number (run_307_donaldson_crossref_exact.json,
 * 307 numbers with a result, 71 without). For each number, the Donaldson parts that list it are the owners:
 * the entry stays on the in-scope SKUs whose codigo_base is one of those parts and is removed from the other in-scope
 * SKUs. Numbers with no Donaldson result are not touched. SKUs outside the 60 are not touched.
 * Operator rule 2026-11-08: one reference belongs to one product.
 *
 * Writes only: matching oem_codes/competitor_codes entries of in-scope rows (assertGovernedCatalogPatch), their matching
 * exact_part_reference rows (snapshotted) and, through the catalogue trigger, their cache rows.
 * Dry-run by default (ROLLBACK). --execute commits. --snapshot <file> writes before-values for revert.
 */
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const si = process.argv.indexOf('--snapshot');
const SNAPSHOT = si > 0 ? process.argv[si + 1] : null;
const EVID = require('./run_307_donaldson_crossref_exact.json');
const norm = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const codeOf = (e) => norm(e && typeof e === 'object' ? e.code || e.reference : e);
const arr = (v) => (Array.isArray(v) ? v : []);

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  const snap = { rows: [], exact_part_reference: [], crossref_resolved_cache: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const scope = EVID.scope_skus;
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1::text[]) FOR UPDATE', [scope])).rows;
    if (rows.length !== scope.length) throw new Error('SCOPE_ROWS ' + rows.length);
    for (const r of rows) if (r.duty !== 'HEAVY_DUTY' || !r.catalog_active) throw new Error('ROW_STATE ' + r.sku);
    const othersHash = () => db.query(`SELECT md5(string_agg(md5(e::text),'|' ORDER BY e.sku)) h FROM public.elimfilters_catalog e WHERE NOT (e.sku=ANY($1::text[]))`, [scope]).then((r) => r.rows[0].h);
    const conflicts = () => db.query(`SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]`, [scope]).then((r) => r.rows[0].n);
    const noEvidenceConflicts = () => db.query(`SELECT count(*)::int n FROM public.exact_part_conflicts WHERE skus && $1::varchar[]`, [scope]).then((r) => r.rows[0].n);
    const before = await othersHash();
    report.conflicts_before = await noEvidenceConflicts();

    // removal plan from the evidence
    const plan = {}; // sku -> Set(code key)
    const orphans = [];
    let kept = 0;
    for (const [code, parts] of Object.entries(EVID.results)) {
      const key = norm(code), owners = new Set(parts.map(norm));
      const holders = rows.filter((r) => [...arr(r.oem_codes), ...arr(r.competitor_codes)].some((e) => codeOf(e) === key));
      if (holders.length < 2) continue; // not shared among in-scope rows any more
      const keepers = holders.filter((r) => owners.has(norm(r.codigo_base)));
      if (!keepers.length) orphans.push(code);
      kept += keepers.length;
      for (const r of holders) if (!owners.has(norm(r.codigo_base))) (plan[r.sku] = plan[r.sku] || new Set()).add(key);
    }
    report.codes_with_owner_in_scope = Object.keys(EVID.results).length - orphans.length;
    report.orphan_codes_owned_by_a_part_outside_scope = orphans.length;
    report.skus_changed = Object.keys(plan).length;
    report.removals = Object.values(plan).reduce((n, s) => n + s.size, 0);

    for (const sku of Object.keys(plan).sort()) {
      const h = rows.find((r) => r.sku === sku), keys = plan[sku];
      const patch = {};
      let removed = 0;
      for (const f of ['oem_codes', 'competitor_codes']) {
        const cur = arr(h[f]);
        const next = cur.filter((e) => !keys.has(codeOf(e)));
        removed += cur.length - next.length;
        patch[f] = next;
      }
      assertGovernedCatalogPatch(h, patch, { rejectionCleanup: true }); // gateway mode that only allows removing references
      snap.rows.push(h);
      snap.crossref_resolved_cache.push(...(await db.query(`SELECT * FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [sku, [...keys]])).rows);
      snap.exact_part_reference.push(...(await db.query(`SELECT * FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [sku, [...keys]])).rows);
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [sku, JSON.stringify(patch.oem_codes), JSON.stringify(patch.competitor_codes)]);
      await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [sku, [...keys]]);
      const left = (await db.query(`SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1 AND upper(regexp_replace(code,'[^A-Za-z0-9]','','g'))=ANY($2::text[])`, [sku, [...keys]])).rows[0].n;
      if (left) throw new Error('CACHE_STILL_HOLDS ' + sku + ' ' + left);
      if (removed < keys.size) throw new Error('REMOVED_LESS_THAN_PLANNED ' + sku);
    }
    if ((await othersHash()) !== before) throw new Error('OTHER_ROWS_CHANGED');
    report.conflicts_after = await noEvidenceConflicts();
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 1));
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
