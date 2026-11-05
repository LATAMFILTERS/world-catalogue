'use strict';

/**
 * ET93212 (Racor S3212) is merged into ES90944 (Donaldson P550944). Operator ruling (Victor, 2026-11-04): option A,
 * HD base Donaldson because Donaldson gives P550944 as the cross of S3212 (shop.donaldson.com search "S3212" ->
 * P550944 FUEL FILTER, WATER SEPARATOR SPIN-ON), same treatment as S3203 -> ES93203 (run_291).
 * Recorded for traceability: physically P550944 is 93.9 x 137.5 mm, 38 micron (official page, operator capture) while
 * S3212 is 97 x 102 mm, 30 micron (Parker official page) and Fleetguard FS19965 (obsolete) is 96.5 x 102 mm.
 * The operator-supplied cross P550639 was not used: Donaldson lists it as LUBE FILTER, SPIN-ON FULL FLOW.
 * ES90944 already lists S3212 and FS19965. ET93212 is deactivated (kept), SUPERSEDED -> ES90944, and its equipment
 * applications are united into ES90944 through the governed gateway.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const FROM = 'ET93212'; const INTO = 'ES90944'; const SOURCE = 'RUN_295_S3212_INTO_P550944';
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
    if (!a || !a.catalog_active || a.codigo_base !== 'S3212') throw new Error('ET93212_STATE_CHANGED');
    if (!b || !b.catalog_active || b.codigo_base !== 'P550944') throw new Error('ES90944_STATE_CHANGED');
    const listed = [...(b.competitor_codes || []), ...(b.oem_codes || [])].map((c) => norm(c && (c.code || c)));
    report.already_listed = { S3212: listed.includes('S3212'), FS19965: listed.includes('FS19965') };
    const comp = b.competitor_codes || [];
    if (!report.already_listed.S3212) comp.push({ code: 'S3212', manufacturer: 'RACOR', classification: 'AFTERMARKET', classification_source: 'DONALDSON_OFFICIAL_SEARCH_S3212_TO_P550944' });
    if (!report.already_listed.S3212) await db.query(`UPDATE public.elimfilters_catalog SET competitor_codes=$2::jsonb WHERE sku=$1`, [INTO, JSON.stringify(comp)]);
    const k = (x) => JSON.stringify(Object.keys(x).sort().map((y) => [y, String(x[y]).trim().toUpperCase()]));
    const seen = new Set(); const eq = [];
    for (const x of [...(b.equipment_applications || []), ...(a.equipment_applications || [])]) { if (!seen.has(k(x))) { seen.add(k(x)); eq.push(x); } }
    report.equipment = { es90944_before: (b.equipment_applications || []).length, et93212: (a.equipment_applications || []).length, after: eq.length };
    if (eq.length !== (b.equipment_applications || []).length) {
      report.equipment.gateway = await applyVerifiedApplications(db, { sku: INTO, equipment_applications: eq, evidence: {
        authority: 'MERGED_FROM_' + FROM + '_RACOR_S3212_DONALDSON_CROSS', source_url: 'https://shop.donaldson.com/store/en-us/product/P550944/20546',
        evidence_hash: crypto.createHash('sha256').update(JSON.stringify(eq)).digest('hex'), metadata: { migration: 'run_295', from_sku: FROM } } });
    }
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{superseded_by}',$2::jsonb) WHERE sku=$1`,
      [FROM, JSON.stringify({ sku: INTO, reason: 'Donaldson official search gives P550944 as cross of Racor S3212; HD base Donaldson (operator option A)', source: SOURCE, at: new Date().toISOString() })]);
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
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
