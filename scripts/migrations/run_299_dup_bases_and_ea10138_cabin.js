'use strict';

/**
 * Operator approval (Victor, 2026-11-04, "apruebo los tres cambios"):
 *  A. Duplicate Donaldson bases (official pages, same dimensions on both rows):
 *     EA10051 (P610903, wrong suffix, description says EA19030) -> merged into EA10903 (P610903)
 *     EA18466 (P606288, wrong suffix, description says EA12886) -> merged into EA16288 (P606288)
 *     The wrong row is deactivated (kept), SUPERSEDED -> correct SKU; its OEM/competitor codes, alternatives and
 *     equipment applications are united into the correct SKU (nothing lost; applications via the governed gateway).
 *  B. EA10138 (Donaldson P500138 "AIR FILTER, PANEL VENTILATION", 220 x 163 x 51 mm) -> EC10138 MICROKAPPA™, like the other
 *     Donaldson ventilation panels already filed as EC1 (EC10286, EC10450...). Rename + derived tables + SUPERSEDED.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SOURCE = 'RUN_299_OPERATOR_20261104';
const MERGES = [{ from: 'EA10051', into: 'EA10903', base: 'P610903' }, { from: 'EA18466', into: 'EA16288', base: 'P606288' }];
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'],
];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const ek = (x) => JSON.stringify(Object.keys(x).sort().map((y) => [y, String(x[y]).trim().toUpperCase()]));
const refresh = async (db, sku) => { try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [sku]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); } };

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', merges: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    for (const m of MERGES) {
      const rows = (await db.query(`SELECT sku, codigo_base, catalog_active, oem_codes, competitor_codes, alternatives, equipment_applications FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [[m.from, m.into]])).rows;
      const a = rows.find((r) => r.sku === m.from); const b = rows.find((r) => r.sku === m.into);
      if (!a || !a.catalog_active || a.codigo_base !== m.base || !b || !b.catalog_active || b.codigo_base !== m.base) throw new Error('STATE_CHANGED ' + m.from);
      const own = new Set([norm(m.base), norm(m.into), norm(m.from)]);
      const oemSeen = new Set((b.oem_codes || []).map((c) => norm(c && (c.code || c))));
      const compSeen = new Set((b.competitor_codes || []).map((c) => norm(c && (c.code || c))));
      const oem = [...(b.oem_codes || [])]; const comp = [...(b.competitor_codes || [])];
      for (const c of a.oem_codes || []) { const k = norm(c && (c.code || c)); if (k && !own.has(k) && !oemSeen.has(k) && !compSeen.has(k)) { oemSeen.add(k); oem.push(c); } }
      for (const c of a.competitor_codes || []) { const k = norm(c && (c.code || c)); if (k && !own.has(k) && !oemSeen.has(k) && !compSeen.has(k)) { compSeen.add(k); comp.push(c); } }
      const alts = [...new Set([...(b.alternatives || []), ...(a.alternatives || [])])].filter((x) => x !== m.from && x !== m.into);
      await db.query(`UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb, alternatives=$4::jsonb WHERE sku=$1`, [m.into, JSON.stringify(oem), JSON.stringify(comp), JSON.stringify(alts)]);
      const seen = new Set(); const eq = [];
      for (const x of [...(b.equipment_applications || []), ...(a.equipment_applications || [])]) if (!seen.has(ek(x))) { seen.add(ek(x)); eq.push(x); }
      if (eq.length !== (b.equipment_applications || []).length) {
        await applyVerifiedApplications(db, { sku: m.into, equipment_applications: eq, evidence: { authority: 'MERGED_DUPLICATE_' + m.from + '_SAME_DONALDSON_' + m.base,
          source_url: null, evidence_hash: crypto.createHash('sha256').update(JSON.stringify(eq)).digest('hex'), metadata: { migration: 'run_299', from_sku: m.from } } });
      }
      await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false, enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb),'{superseded_by}',$2::jsonb) WHERE sku=$1`,
        [m.from, JSON.stringify({ sku: m.into, reason: `Duplicate of ${m.into}: same Donaldson base ${m.base}, wrong SKU suffix`, source: SOURCE, at: new Date().toISOString() })]);
      await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [m.from, m.into, SOURCE]);
      await db.query(`UPDATE public.exact_part_reference SET sku=$2 WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND sku=$1`, [m.from, m.into]);
      await db.query(`UPDATE public.elimfilters_catalog SET alternatives=(SELECT coalesce(jsonb_agg(DISTINCT CASE WHEN v=$1 THEN $2 ELSE v END),'[]'::jsonb) FROM jsonb_array_elements_text(alternatives) v)
        WHERE alternatives @> to_jsonb(ARRAY[$1::text])`, [m.from, m.into]);
      await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [m.from]);
      await refresh(db, m.into);
      report.merges.push({ ...m, oem: `${(b.oem_codes || []).length}->${oem.length}`, comp: `${(b.competitor_codes || []).length}->${comp.length}`, equipment: `${(b.equipment_applications || []).length}->${eq.length}` });
    }
    // B. EA10138 -> EC10138
    const FROM = 'EA10138'; const TO = 'EC10138';
    const r = (await db.query(`SELECT sku, codigo_base FROM public.elimfilters_catalog WHERE sku = ANY($1) FOR UPDATE`, [[FROM, TO]])).rows;
    if (r.length !== 1 || r[0].sku !== FROM || r[0].codigo_base !== 'P500138') throw new Error('EA10138_STATE_CHANGED');
    if ((await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [TO])).rowCount) throw new Error('EC10138_IS_A_FORMER_SKU');
    const tpl = (await db.query(`SELECT filter_type, description FROM public.elimfilters_catalog WHERE sku='EC10286'`)).rows[0];
    const desc = tpl ? tpl.description.replace(/EC10286/g, TO) : null;
    await db.query(`UPDATE public.elimfilters_catalog SET sku=$1, technology='MICROKAPPA™', filter_type=coalesce($3, filter_type), description=coalesce($4, description) WHERE sku=$2`, [TO, FROM, tpl && tpl.filter_type, desc]);
    report.ec10138 = { filter_type: tpl && tpl.filter_type, description: desc && desc.slice(0, 120), derived: {} };
    for (const [q, col] of DERIVED) {
      const [s, t] = q.split('.');
      if (!(await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [s, t, col])).rowCount) continue;
      const d = await db.query(`UPDATE ${q} SET ${col}=$1 WHERE ${col}=$2`, [TO, FROM]);
      if (d.rowCount) report.ec10138.derived[q] = d.rowCount;
    }
    for (const column of ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence']) {
      const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text LIKE $1`, ['%' + FROM + '%'])).rows;
      for (const h of hits) { const next = h.t.replace(/[A-Z0-9]+/g, (tok) => (tok === FROM ? TO : tok)); if (next !== h.t) await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]); }
    }
    await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO, SOURCE]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [FROM]);
    await refresh(db, TO);
    report.after = (await db.query(`SELECT sku, codigo_base, catalog_active, technology, jsonb_array_length(coalesce(equipment_applications,'[]')) eq FROM public.elimfilters_catalog
      WHERE sku = ANY($1) ORDER BY sku`, [['EA10051', 'EA10903', 'EA18466', 'EA16288', 'EA10138', 'EC10138']])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
