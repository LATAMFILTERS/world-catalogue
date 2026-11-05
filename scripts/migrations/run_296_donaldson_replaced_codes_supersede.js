'use strict';

/**
 * Donaldson recapture 2026-11-05 (shop.donaldson.com in the ELIMSERVER Chrome, out/donaldson-recapture/): searching
 * P171273 returns P165675 and searching P163472 returns P566187 (same product type, HYDRAULIC FILTER). The catalogue
 * already carries both replacements as active SKUs (EH65675, EH66187), so the SKUs on the old codes are duplicates:
 * EH61273 and EH63472 are deactivated (kept), registered SUPERSEDED -> replacement SKU, and the old Donaldson code is
 * added to the replacement's competitor codes as a superseded Donaldson number (Part Search keeps resolving it).
 * Same precedent as EH60950 (P170950) -> EH64378 (P164378). Equipment applications of the old SKU are united into the
 * replacement through the governed gateway. Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'RUN_296_DONALDSON_REPLACED_CODES';
const PAIRS = [
  { from: 'EH61273', old: 'P171273', into: 'EH65675', neu: 'P165675', url: 'https://shop.donaldson.com/store/en-us/product/P165675/16193' },
  { from: 'EH63472', old: 'P163472', into: 'EH66187', neu: 'P566187', url: 'https://shop.donaldson.com/store/en-us/product/P566187/37690' },
];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const k = (x) => JSON.stringify(Object.keys(x).sort().map((y) => [y, String(x[y]).trim().toUpperCase()]));

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', done: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    for (const p of PAIRS) {
      const rows = (await db.query(`SELECT sku, codigo_base, catalog_active, competitor_codes, oem_codes, equipment_applications FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [[p.from, p.into]])).rows;
      const a = rows.find((r) => r.sku === p.from); const b = rows.find((r) => r.sku === p.into);
      if (!a || !a.catalog_active || a.codigo_base !== p.old) throw new Error('STATE_CHANGED ' + p.from);
      if (!b || !b.catalog_active || b.codigo_base !== p.neu) throw new Error('STATE_CHANGED ' + p.into);
      const listed = [...(b.competitor_codes || []), ...(b.oem_codes || [])].map((c) => norm(c && (c.code || c)));
      if (!listed.includes(norm(p.old))) {
        const comp = [...(b.competitor_codes || []), { code: p.old, manufacturer: 'DONALDSON', classification: 'SUPERSEDED_DONALDSON_CODE', classification_source: SOURCE }];
        await db.query(`UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1`, [p.into, JSON.stringify(comp)]);
      }
      const seen = new Set(); const eq = [];
      for (const x of [...(b.equipment_applications || []), ...(a.equipment_applications || [])]) if (!seen.has(k(x))) { seen.add(k(x)); eq.push(x); }
      let gateway = null;
      if (eq.length !== (b.equipment_applications || []).length) {
        gateway = await applyVerifiedApplications(db, { sku: p.into, equipment_applications: eq, evidence: {
          authority: 'DONALDSON_REPLACEMENT_' + p.old + '_TO_' + p.neu, source_url: p.url,
          evidence_hash: crypto.createHash('sha256').update(JSON.stringify(eq)).digest('hex'), metadata: { migration: 'run_296', from_sku: p.from } } });
      }
      await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
          enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{superseded_by}',$2::jsonb) WHERE sku=$1`,
        [p.from, JSON.stringify({ sku: p.into, reason: `Donaldson ${p.old} replaced by ${p.neu} (shop.donaldson.com search, 2026-11-05)`, source: SOURCE, at: new Date().toISOString() })]);
      await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
        ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [p.from, p.into, SOURCE]);
      await db.query(`UPDATE public.exact_part_reference SET sku=$2 WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND sku=$1`, [p.from, p.into]);
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [p.from]);
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [p.into]); await db.query('RELEASE SAVEPOINT c'); }
      catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
      report.done.push({ from: p.from, into: p.into, old_code_added: !listed.includes(norm(p.old)), equipment: { before: (b.equipment_applications || []).length, after: eq.length }, gateway: !!gateway });
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
