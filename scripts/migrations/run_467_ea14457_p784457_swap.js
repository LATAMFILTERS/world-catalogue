'use strict';

/**
 * Operator order 2026-11-25: EA14457 must be the Donaldson P784457 radialseal (266 x 490), natural SKU = EA1 + last four of P784457 = EA14457.
 * Today EA14457 is the cone P604457 (104 x 266) and the radialseal lives as EA17857 with base AF27857 (a Fleetguard code recorded with brand DONALDSON).
 * Three moves in ONE transaction:
 *   A. cone P604457: EA14457 -> EA14553 (operator exception: natural SKU EA14457 is taken; SKU built from the Ditch Witch OEM 194553).
 *   B. radialseal: EA17857 -> EA14457 and codigo_base AF27857 -> Donaldson P784457 (operator supplied the Donaldson page; AF27857 kept as a Fleetguard competitor code).
 *   C. EA17857 is registered as a SUPERSEDED former SKU of EA14457 (run_436 mechanism).
 * The CDN images are NOT moved here: copy EA1/EA14457.png -> EA1/EA14553.png FIRST, then EA1/EA17857.png -> EA1/EA14457.png (see the report).
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
const AT = '2026-11-25T00:00:00.000Z';
const CONE = { from: 'EA14457', to: 'EA14553', base: 'P604457' };
const RADIAL = { from: 'EA17857', to: 'EA14457', base: 'AF27857', newBase: 'P784457' };
const URL_DON = 'https://shop.donaldson.com/store/en-us/search?Ntt=P784457';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];

async function rename(db, m, slot, report) {
  const row = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [m.from])).rows[0];
  if (!row || !row.catalog_active || row.codigo_base !== m.base) throw new Error(`SOURCE_CHANGED ${m.from}`);
  if ((await db.query('SELECT 1 FROM public.elimfilters_catalog WHERE sku=$1', [m.to])).rowCount) throw new Error(`TARGET_OCCUPIED ${m.to}`);
  if ((await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [m.to])).rowCount) throw new Error(`TARGET_IS_A_FORMER_SKU ${m.to}`);
  const token = `\\m${m.from}\\M`;
  const prefix = m.to.slice(0, 3);
  const u = await db.query(
    `UPDATE public.elimfilters_catalog SET sku=$1::text, description=regexp_replace(description, $3::text, $1::text, 'g'), image_url=$4::text,
       enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{codigo_base_governance,sku_slot_resolution}', $5::jsonb, true)
     WHERE sku=$2`,
    [m.to, m.from, token, `https://cdn.elimfilters.com/${prefix}/${m.to}.png`, JSON.stringify(slot)]);
  if (u.rowCount !== 1) throw new Error('CATALOG_RENAME_COUNT_CHANGED ' + m.from);
  report.derived[m.from] = {};
  for (const [qualified, column] of DERIVED) {
    const [schema, table] = qualified.split('.');
    const exists = await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
    if (!exists.rowCount) continue;
    const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [m.to, m.from]);
    if (d.rowCount) report.derived[m.from][qualified] = d.rowCount;
  }
  for (const column of JSON_COLUMNS) {
    const j = await db.query(`UPDATE public.elimfilters_catalog SET ${column} = regexp_replace(${column}::text, $1, $2, 'g')::jsonb WHERE sku<>$3 AND ${column}::text ~ $1`, [token, m.to, m.to]);
    if (j.rowCount) report.derived[m.from]['json:' + column] = j.rowCount;
  }
  await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [m.from]);
}

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const before = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[CONE.from, RADIAL.from]])).rows;
    if (before.length !== 2) throw new Error('SOURCE_ROWS_MISSING');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows: before, row_sha256: sha(before) }, null, 2));
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku NOT IN ($1,$2) AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$3`, [CONE.from, RADIAL.from, RADIAL.newBase]);
    if (clash.rowCount) throw new Error('BASE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    const kits = (await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE catalog_active AND (enrichment_data->'kit'->'components' @> '[{"sku":"EA14457"}]'::jsonb OR enrichment_data->'kit'->'components' @> '[{"sku":"EA17857"}]'::jsonb)`)).rows;
    if (kits.length) throw new Error('SKU_USED_IN_KIT ' + kits.map((k) => k.sku).join(','));

    // A. cone EA14457 -> EA14553 (frees EA14457)
    await rename(db, CONE, { rule: 'OPERATOR_EXCEPTION_NATURAL_SKU_EA14457_IS_P784457', natural_sku: 'EA14457', sku_source: 'DITCH_WITCH_OEM_194553', renamed_from: CONE.from, decided_by: 'OPERATOR', decided_at: '2026-11-25', migration: 'run_467' }, report);

    // B. radialseal EA17857 -> EA14457, base AF27857 -> Donaldson P784457
    await rename(db, RADIAL, { rule: 'NATURAL_SKU_P784457_IS_EA14457', natural_sku: 'EA14457', renamed_from: RADIAL.from, decided_by: 'OPERATOR', decided_at: '2026-11-25', migration: 'run_467' }, report);
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [RADIAL.to])).rows[0];
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.rebased_from = { codigo_base: RADIAL.base, note: 'Operator 2026-11-25: Donaldson page P784457 (radialseal 266 x 490, Mercedes-Benz A4760940004); AF27857 kept as Fleetguard competitor code', rebased_at: AT };
    enrichment.codigo_base_governance = {
      ...(enrichment.codigo_base_governance || {}),
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, evidence_url: URL_DON,
      evidence_level: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1',
      required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: RADIAL.newBase, approved_codigo_base: RADIAL.newBase, approved_manufacturer: 'DONALDSON', approved_source_column: 'COMPETITOR_CODES',
      verification_method: 'DONALDSON_PRODUCT_PAGE_P784457_OPERATOR_ORDER', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      primary_manufacturer_verified: true, oem_code_count: (cur.oem_codes || []).length, competitor_code_count: (cur.competitor_codes || []).length,
    };
    const isNew = (x) => norm(x.code) === RADIAL.newBase;
    const hadFg = (cur.competitor_codes || []).some((x) => norm(x.code) === RADIAL.base);
    const comp = [...(cur.competitor_codes || []).filter((x) => !isNew(x)), ...(hadFg ? [] : [{ code: RADIAL.base, manufacturer: 'FLEETGUARD' }])];
    const oemKept = (cur.oem_codes || []).filter((x) => !isNew(x));
    const patch = {
      codigo_base: RADIAL.newBase, enrichment_data: enrichment, competitor_codes: comp, oem_codes: oemKept,
      canonical_source_brand: 'DONALDSON', canonical_source_code: RADIAL.newBase, canonical_source_url: URL_DON, canonical_source_status: 'VERIFIED', canonical_verified_at: AT,
      canonical_evidence: { authority: 'DONALDSON_OFFICIAL_PRODUCT_PAGE', source_url: URL_DON, evidence_hash: sha({ sku: RADIAL.to, base: RADIAL.newBase, url: URL_DON }) },
    };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase({ ...cur, ...patch });
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));
    await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2, enrichment_data=$3::jsonb, canonical_source_brand=$4, canonical_source_code=$5, canonical_source_url=$6,
      canonical_source_status=$7, canonical_verified_at=$8, canonical_evidence=$9::jsonb, competitor_codes=$10::jsonb, oem_codes=$11::jsonb WHERE sku=$1`,
    [RADIAL.to, RADIAL.newBase, JSON.stringify(enrichment), patch.canonical_source_brand, RADIAL.newBase, URL_DON, 'VERIFIED', AT, JSON.stringify(patch.canonical_evidence), JSON.stringify(comp), JSON.stringify(oemKept)]);

    // C. EA17857 is a former SKU of EA14457
    report.superseded_registered = (await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_467_EA17857_TO_EA14457') ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [RADIAL.from, RADIAL.to])).rowCount;
    for (const s of [CONE.to, RADIAL.to]) {
      try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]); await db.query('RELEASE SAVEPOINT c'); } catch (_) { await db.query('ROLLBACK TO SAVEPOINT c'); }
    }
    report.after = (await db.query(`SELECT sku, codigo_base, installation_type, outer_diameter_mm od, height_mm h, image_url, catalog_active, jsonb_array_length(equipment_applications) apps FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku`, [[CONE.from, CONE.to, RADIAL.from, RADIAL.to]])).rows;
    const ok = report.after.length === 2 && report.after.some((r) => r.sku === 'EA14457' && r.codigo_base === 'P784457' && Number(r.od) === 266) && report.after.some((r) => r.sku === 'EA14553' && r.codigo_base === 'P604457' && Number(r.od) === 104);
    if (!ok) throw new Error('VERIFICATION_FAILED ' + JSON.stringify(report.after));
    report.cert = (await db.query(`SELECT sku, certification_state, blockers FROM public.catalog_sku_certification WHERE sku = ANY($1::text[])`, [[CONE.to, RADIAL.to]])).rows;
    report.cdn_copy_order = ['EA1/EA14457.png -> EA1/EA14553.png (cone photo, FIRST)', 'EA1/EA17857.png -> EA1/EA14457.png (radialseal photo; keep EA17857.png)'];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
