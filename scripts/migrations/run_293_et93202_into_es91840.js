'use strict';

/**
 * ET93202 (Racor S3202) is merged into ES91840 (Donaldson P551840), same ruling as run_291 for S3203 (operator
 * 2026-11-04: HD base Donaldson when Donaldson makes it).
 * Evidence: Donaldson official P551840 page (operator capture 2026-11-02): FUEL FILTER, WATER SEPARATOR SPIN-ON, OD 96.5 mm,
 * length 188 mm, 1-12 UN, 30 micron; Parker official S3202 page (captured 2026-11-05): Diesel Spin-on FF/WS, OD 97 mm,
 * height 188 mm, 1"-12, 30 micron. shop.donaldson.com search for P555020 (operator-supplied S3202 cross) returns P551840.
 * ET93202 is deactivated (kept), SUPERSEDED -> ES91840, S3202 (RACOR) added to ES91840 competitor codes, and ET93202's
 * equipment applications are united into ES91840 through the governed gateway.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const FROM = 'ET93202'; const INTO = 'ES91840'; const SOURCE = 'RUN_293_S3202_INTO_P551840';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query(`SELECT sku, codigo_base, catalog_active, competitor_codes, oem_codes, equipment_applications FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [[FROM, INTO]])).rows;
    const a = rows.find((r) => r.sku === FROM); const b = rows.find((r) => r.sku === INTO);
    if (!a || !a.catalog_active || a.codigo_base !== 'S3202') throw new Error('ET93202_STATE_CHANGED');
    if (!b || !b.catalog_active || b.codigo_base !== 'P551840') throw new Error('ES91840_STATE_CHANGED');
    const comp = b.competitor_codes || [];
    report.s3202_already_listed = [...comp, ...(b.oem_codes || [])].some((c) => norm(c && (c.code || c)) === 'S3202');
    if (!report.s3202_already_listed) comp.push({ code: 'S3202', manufacturer: 'RACOR', classification: 'AFTERMARKET', classification_source: 'PHYSICAL_MATCH_DONALDSON_P551840_PARKER_S3202_OFFICIAL_PAGES' });
    await db.query(`UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1`, [INTO, JSON.stringify(comp)]);
    const k = (x) => JSON.stringify(Object.keys(x).sort().map((y) => [y, String(x[y]).trim().toUpperCase()]));
    const seen = new Set(); const eq = [];
    for (const x of [...(b.equipment_applications || []), ...(a.equipment_applications || [])]) { if (!seen.has(k(x))) { seen.add(k(x)); eq.push(x); } }
    report.equipment = { es91840_before: (b.equipment_applications || []).length, et93202: (a.equipment_applications || []).length, after: eq.length };
    if (eq.length !== (b.equipment_applications || []).length) {
      report.equipment.gateway = await applyVerifiedApplications(db, { sku: INTO, equipment_applications: eq, evidence: {
        authority: 'MERGED_FROM_' + FROM + '_RACOR_S3202_EQUIVALENT', source_url: 'https://shop.donaldson.com/store/en-us/product/P551840/75214',
        evidence_hash: crypto.createHash('sha256').update(JSON.stringify(eq)).digest('hex'), metadata: { migration: 'run_293', from_sku: FROM } } });
    }
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{superseded_by}',$2::jsonb) WHERE sku=$1`,
      [FROM, JSON.stringify({ sku: INTO, reason: 'Racor S3202 = Donaldson P551840 (official pages, same dimensions/thread/micron); HD base Donaldson', source: SOURCE, at: new Date().toISOString() })]);
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
      ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, INTO, SOURCE]);
    await db.query(`UPDATE public.exact_part_reference SET sku=$2 WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND sku=$1`, [FROM, INTO]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [FROM]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [INTO]); await db.query('RELEASE SAVEPOINT c'); }
    catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query(`SELECT sku, codigo_base, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1)`, [[FROM, INTO]])).rows;
    report.et9_hydrocore_left = (await db.query(`SELECT array_agg(sku) s FROM public.elimfilters_catalog WHERE catalog_active AND sku LIKE 'ET9%' AND technology LIKE 'HYDROCORE%'`)).rows[0].s;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
