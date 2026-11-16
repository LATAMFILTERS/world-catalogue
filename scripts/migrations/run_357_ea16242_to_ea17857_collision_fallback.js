'use strict';

/**
 * EA16242 (Donaldson P784457, 490 mm) is renumbered to EA17857.
 * The canonical product stays Donaldson P784457 (canonical_source_brand/code). Its natural SKU would be EA14457, but EA14457 is occupied by
 * Donaldson P604457, so the HD collision fallback applies (same mechanism as ES90083 / run_288): codigo_base becomes the Fleetguard
 * AF27857 and the SKU follows its last four digits (7857). Operator ruling 2026-11-16 ("EA17857", "el codigo es Donaldson");
 * Donaldson does not publish the AF27857 cross, as in the ES90083 precedent.
 * Mechanism: run_237/run_240 (rename of the parent, no-FK derived tables, whole-SKU move). No alias is kept for the old SKU
 * (the operator does not want former twin codes to resolve; no page or catalogue mentions EA16242).
 * Dry-run by default (everything runs, then ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const { evaluateCodigoBase } = require('../../lib/catalog-codigo-base-policy');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const FROM = 'EA16242';
const TO = 'EA17857';
const DONALDSON = 'P784457';
const FLEETGUARD = 'AF27857';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P784457/34568';
const URL_FG = 'https://www.fleetguard.com/es/product/af27857/01t5x000008FBviAAG';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

// no-FK surfaces (same list as run_237/run_240)
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.catalog_application_evidence', 'sku'],
  ['public.codigo_base_review_queue', 'sku'], ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'],
  ['public.hermes_catalogue_evidence', 'sku'], ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'],
  ['public.oem_codes_legacy', 'sku'], ['public.catalog_codigo_base_sanitation_queue', 'sku'],
];

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', from: FROM, to: TO, derived: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const found = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) OR sku=\'EA14457\' FOR UPDATE', [[FROM, TO]])).rows;
    const row = found.find((r) => r.sku === FROM);
    const occupied = found.find((r) => r.sku === 'EA14457');
    if (!row || row.codigo_base !== DONALDSON || !row.catalog_active) throw new Error('SOURCE_CHANGED');
    if (found.some((r) => r.sku === TO)) throw new Error('TARGET_OCCUPIED');
    if (!occupied || norm(occupied.codigo_base) !== 'P604457') throw new Error('COLLISION_NOT_CONFIRMED');
    if ((await db.query(`SELECT 1 FROM public.elimfilters_catalog WHERE sku<>$1 AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))='AF27857'`, [FROM])).rowCount) throw new Error('FLEETGUARD_BASE_ALREADY_USED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row, row_sha256: sha(row) }, null, 2));

    const competitor = row.competitor_codes.filter((x) => norm(x.code) !== FLEETGUARD && norm(x.code) !== norm(DONALDSON)); // the base must not repeat in the alternates
    competitor.push({ code: DONALDSON, manufacturer: 'DONALDSON', classification: 'CANONICAL_SOURCE', classification_source: 'RUN_357_P784457_COLLISION_FLEETGUARD_AF27857' }); // as ES90083 / DBF0710
    const enrichment = { ...(row.enrichment_data || {}) };
    enrichment.codigo_base_governance = {
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: '2026-11-16T00:00:00.000Z', evidence_url: URL_DON,
      evidence_level: 'OFFICIAL_PRODUCT_PAGE', evidence_authority: 'DONALDSON_OFFICIAL_CATALOG', policy_version: '2026-08-19-v3.1',
      required_authority: 'VERIFIED_DONALDSON', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: FLEETGUARD, approved_codigo_base: FLEETGUARD, approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
      verification_method: 'RUN_357_P784457_COLLISION_FLEETGUARD_AF27857', alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
      fallback_verification: 'OPERATOR_RULING_20261116 (Donaldson official page P784457 does not publish the AF27857 cross; Fleetguard official page AF27857 ' + URL_FG + ')',
      collision_occupied_sku: 'EA14457', collision_occupied_base: 'P604457', collision_donaldson_code: DONALDSON,
      primary_manufacturer_verified: true, fallback_manufacturer_verified: true, donaldson_sku_collision_verified: true, fallback_commercial_code_verified: true,
      oem_code_count: row.oem_codes.length, competitor_code_count: competitor.length,
      previous_codigo_base: DONALDSON, previous_sku: FROM,
    };
    const candidate = { ...row, sku: TO, codigo_base: FLEETGUARD, competitor_codes: competitor, enrichment_data: enrichment, canonical_source_brand: 'DONALDSON', canonical_source_code: DONALDSON };
    report.gateway = assertCanonicalWrite(candidate, { validateApplications: false }).valid;
    report.policy = evaluateCodigoBase(candidate);
    if (!report.policy.valid) throw new Error('POLICY_REJECTED ' + JSON.stringify(report.policy));

    const u = await db.query(`UPDATE public.elimfilters_catalog SET sku=$2, codigo_base=$3::text, canonical_source_url=$5, competitor_codes=$6::jsonb, enrichment_data=$4::jsonb WHERE sku=$1`,
      [FROM, TO, FLEETGUARD, JSON.stringify(enrichment), URL_DON, JSON.stringify(competitor)]);
    if (u.rowCount !== 1) throw new Error('UPDATE_COUNT_CHANGED');
    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const exists = await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name) WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
      if (!exists.rowCount) continue;
      const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [TO, FROM]);
      if (d.rowCount) report.derived[qualified] = d.rowCount;
    }
    await db.query(`UPDATE public.catalog_sku_certification SET codigo_base=$2 WHERE sku=$1`, [TO, FLEETGUARD]);
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [FROM]);
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]);

    const after = (await db.query('SELECT sku,codigo_base,canonical_source_brand,canonical_source_code,duty,height_mm,jsonb_array_length(equipment_applications) apps FROM public.elimfilters_catalog WHERE sku = ANY($1::text[])', [[FROM, TO]])).rows;
    report.after = after;
    if (after.length !== 1 || after[0].sku !== TO || after[0].codigo_base !== FLEETGUARD || after[0].canonical_source_code !== DONALDSON) throw new Error('POST_RENAME_VERIFICATION_FAILED');
    report.resolver = (await db.query(`SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE sku=$1 AND ld_catalog.norm_part(code) IN (ld_catalog.norm_part('AF27857'), ld_catalog.norm_part('P784457'), ld_catalog.norm_part('1485592'))`, [TO])).rows;
    report.old_resolves = (await db.query(`SELECT code,sku FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code)=ld_catalog.norm_part('EA16242') OR sku=$1`, [FROM])).rows;
    report.ledger = (await db.query('SELECT sku,certification_state,codigo_base,blockers FROM public.catalog_sku_certification WHERE sku=$1', [TO])).rows;
    report.integrity = (await db.query(`SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts`, [TO])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
