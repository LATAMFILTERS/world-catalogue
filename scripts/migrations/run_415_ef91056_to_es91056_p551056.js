'use strict';

/**
 * EF91056 (codigo_base ST1056) is Donaldson P551056 (official page, operator pasted 2026-11-18: FILTRO DE COMBUSTIBLE, ENROSCABLE SEPARADOR DE AGUA TWIST&DRAIN,
 * OD 107.3 mm, length 147.1 mm, thread 1-14 UN; Freightliner M2 / Caterpillar C7 C9 C11 C13 = the same 4 applications the row already holds; the cross-reference
 * numbers are already on the row). Same part, so no second SKU is created: the row is rebased to P551056 and renamed ES91056 (ES9 = fuel/water separator,
 * HYDROCORE; operator supplied the render ES9/ES91056.png). EF91056 stays as a SUPERSEDED former SKU. Rename mechanism of run_237/238/407, governance of run_401.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = 'EF91056', TO = 'ES91056', OLD = 'ST1056', BASE = 'P551056';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P551056/62875';
const IMAGE = 'https://cdn.elimfilters.com/ES9/ES91056.png';
const AT = '2026-11-18T00:00:00.000Z';
const SOURCE = 'RUN_415_EF91056_TO_ES91056_P551056';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];
const NORM_BASE = "upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))";

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [FROM])).rows[0];
    if (!cur || !cur.catalog_active || cur.codigo_base !== OLD) throw new Error('SOURCE_CHANGED');
    if ((await db.query(`SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1 OR ${NORM_BASE}=$2`, [TO, BASE])).rowCount) throw new Error('TARGET_OR_BASE_OCCUPIED');
    if ((await db.query("SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1", [TO])).rowCount) throw new Error('TARGET_IS_A_FORMER_SKU');
    if ((await db.query(`SELECT 1 FROM public.elimfilters_catalog WHERE catalog_active AND enrichment_data->'kit'->'components' @> '[{"sku":"EF91056"}]'::jsonb`)).rowCount) throw new Error('SKU_USED_IN_KIT');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));

    // 1. governance: base ST1056 -> Donaldson P551056 (gateway + policy check before writing)
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.rebased_from = { codigo_base: OLD, note: 'Operator 2026-11-18: Donaldson P551056 (107.3 x 147.1 mm, 1-14 UN, Twist&Drain) is this part; ST1056 is not the base', rebased_at: AT };
    enrichment.sku_slot_resolution = { rule: 'OPERATOR_ORDER_DONALDSON_WATER_SEPARATOR_IS_ES9', renamed_from: FROM, decided_by: 'OPERATOR', decided_at: '2026-11-18', migration: 'run_415' };
    enrichment.codigo_base_governance = {
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON, evidence_level: 'OFFICIAL_PRODUCT_PAGE',
      evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
      verification_method: 'DONALDSON_OFFICIAL_PRODUCT_PAGE_P551056_OPERATOR_PASTED', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      primary_manufacturer_verified: true, oem_code_count: (cur.oem_codes || []).length, competitor_code_count: (cur.competitor_codes || []).length,
    };
    const patch = { codigo_base: BASE, enrichment_data: enrichment, canonical_source_brand: 'DONALDSON', canonical_source_code: BASE, canonical_source_url: URL_DON, canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
      canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: TO, base: BASE, url: URL_DON }) } };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase({ ...cur, ...patch });
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));

    // 2. one UPDATE: base + new SKU + separator presentation + image
    const token = `\\m${FROM}\\M`;
    const desc = `ELIMFILTERS® ${TO} HYDROCORE™ premium spin-on fuel/water separator uses GENUINE FILTER MEDIA to capture harmful particles, protect fuel injectors and support cleaner fuel system performance.`;
    const u = await db.query(
      `UPDATE public.elimfilters_catalog SET sku=$1::text, codigo_base=$3::text, enrichment_data=$4::jsonb, canonical_source_brand='DONALDSON', canonical_source_code=$3::text, canonical_source_url=$5::text,
         canonical_source_status='VERIFIED', canonical_verified_at=$6::timestamptz, canonical_evidence=$7::jsonb, filter_type='separator', technology='HYDROCORE™', description=$8::text, image_url=$9::text
       WHERE sku=$2`,
      [TO, FROM, BASE, JSON.stringify(enrichment), URL_DON, AT, JSON.stringify(patch.canonical_evidence), desc, IMAGE]);
    if (u.rowCount !== 1) throw new Error('CATALOG_UPDATE_COUNT');
    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const ex = await db.query("SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'", [schema, table, column]);
      if (!ex.rowCount) continue;
      const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [TO, FROM]);
      if (d.rowCount) report.derived[qualified] = d.rowCount;
    }
    for (const column of JSON_COLUMNS) {
      const j = await db.query(`UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb WHERE sku<>$3 AND ${column}::text ~ $1`, [token, TO, TO]);
      if (j.rowCount) report.derived['json:' + column] = j.rowCount;
    }
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [FROM]);
    const ins = await db.query("INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3) ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING", [FROM, TO, SOURCE]);
    report.superseded_registered = ins.rowCount;
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]);
    report.after = (await db.query('SELECT sku,codigo_base,filter_type,technology,image_url,catalog_active,jsonb_array_length(equipment_applications) apps FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])', [[FROM, TO]])).rows;
    if (report.after.length !== 1 || report.after[0].sku !== TO) throw new Error('VERIFICATION_FAILED ' + JSON.stringify(report.after));
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN (ld_catalog.norm_part('P551056'), ld_catalog.norm_part('ST1056'), ld_catalog.norm_part('EF91056'), ld_catalog.norm_part('ES91056'), ld_catalog.norm_part('1685159C1'))")).rows;
    report.integrity = (await db.query('SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts, (SELECT count(*)::int FROM public.bad_crossref_quarantine WHERE source_sku=$1) quarantine_rows', [TO])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
