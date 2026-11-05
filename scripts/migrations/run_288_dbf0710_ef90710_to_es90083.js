'use strict';

/**
 * EF90710 carries Donaldson DBF0710 "FUEL FILTER, WATER SEPARATOR DONALDSON BLUE" (official page lists P580710 as its
 * alternative). It is a water separator, so ES9/HYDROCORE™; its natural slot ES90710 is already the published P580710
 * product. HD collision policy (CLAUDE.md, CATALOG_POLICY_V42): Donaldson slot taken -> Fleetguard cross.
 * Operator ruling (Victor, 2026-11-04): DBF0710 becomes ES90083 from Fleetguard FS20083.
 * Donaldson's page does not list FS20083; the Fleetguard cross is recorded as verified by that operator ruling.
 *
 * Row result: sku ES90083, codigo_base FS20083 (approved fallback), canonical source stays DONALDSON DBF0710,
 * DBF0710 moves into competitor_codes, FS20083 leaves them (a base must not repeat as an alternate).
 * Derived tables follow; EF90710 is registered SUPERSEDED so Part Search keeps resolving it.
 * Dry-run by default (ROLLBACK). --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const FROM = 'EF90710'; const TO = 'ES90083'; const DONALDSON = 'DBF0710'; const FLEETGUARD = 'FS20083';
const SOURCE = 'RUN_288_DBF0710_COLLISION_FLEETGUARD_FS20083';
const DESCRIPTION = `ELIMFILTERS® ${TO} Fuel/water separator for diesel fuel systems. HYDROCORE™ media coalesces and drains free water from fuel before it reaches the injection system, preventing injector corrosion and microbial growth in the fuel tank.`;
const DERIVED = [
  ['public.exact_part_reference', 'sku'], ['public.kit_components', 'filter_sku'], ['public.product_element', 'elimfilters_sku'],
  ['public.product_model', 'elimfilters_sku'], ['public.kg_product_equipment', 'product_sku'], ['public.kg_crossrefs', 'product_sku'],
  ['public.catalog_sku_certification', 'sku'], ['public.catalog_codigo_base_evidence', 'sku'], ['public.codigo_base_review_queue', 'sku'],
  ['public.hermes_catalogue_backlog', 'sku'], ['public.hermes_catalogue_dossier', 'sku'], ['public.hermes_catalogue_evidence', 'sku'],
  ['public.kg_product_systems', 'product_sku'], ['public.kg_product_technologies', 'product_sku'], ['public.oem_codes_legacy', 'sku'],
  ['public.catalog_application_evidence', 'sku'],
];
const JSON_COLUMNS = ['alternative_products', 'alternatives', 'enrichment_data', 'canonical_evidence'];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const db = new Client({ connectionString: url, ssl: /@(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', derived: {}, json: {} };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const rows = (await db.query(`SELECT sku, codigo_base, competitor_codes, enrichment_data FROM public.elimfilters_catalog
      WHERE sku = ANY($1) OR upper(codigo_base)=$2 FOR UPDATE`, [[FROM, TO], FLEETGUARD])).rows;
    const src = rows.find((r) => r.sku === FROM);
    if (!src) throw new Error('SOURCE_MISSING');
    if (rows.some((r) => r.sku !== FROM)) throw new Error('TARGET_OR_BASE_OCCUPIED ' + rows.map((r) => r.sku).join(','));
    if (src.codigo_base !== DONALDSON) throw new Error(`BASE_CHANGED ${src.codigo_base}`);
    const comp = src.competitor_codes || [];
    const fg = comp.find((c) => norm(c && c.code) === FLEETGUARD && /FLEETGUARD/i.test(c.manufacturer || ''));
    if (!fg) throw new Error('FLEETGUARD_CROSS_NOT_ON_ROW');
    if ((await db.query(`SELECT 1 FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND brand='ELIMFILTERS' AND part_number=$1`, [TO])).rowCount) throw new Error('TARGET_IS_A_FORMER_SKU');

    const nextComp = comp.filter((c) => norm(c && c.code) !== FLEETGUARD)
      .concat([{ code: DONALDSON, manufacturer: 'DONALDSON', classification: 'CANONICAL_SOURCE', classification_source: SOURCE }]);
    const prevGov = (src.enrichment_data || {}).codigo_base_governance || {};
    const gov = { ...prevGov, state: 'CANONICAL_VERIFIED', approved_codigo_base: FLEETGUARD, approved_manufacturer: 'FLEETGUARD',
      approved_source_column: 'COMPETITOR_CODES', current_codigo_base: FLEETGUARD, primary_manufacturer_verified: true,
      donaldson_sku_collision_verified: true, collision_donaldson_code: DONALDSON, collision_occupied_sku: 'ES90710', collision_occupied_base: 'P580710',
      fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      fallback_verification: 'OPERATOR_RULING_VICTOR_20261104 (Donaldson official page lists P580710 as alternative of DBF0710; FS20083 cross not published by Donaldson)',
      previous_governance: prevGov, verification_method: SOURCE, verified_at: new Date().toISOString() };

    const u = await db.query(`UPDATE public.elimfilters_catalog SET sku=$1, codigo_base=$3, technology='HYDROCORE™', filter_type='water', description=$4,
        canonical_source_brand='DONALDSON', canonical_source_code=$5, competitor_codes=$6::jsonb,
        enrichment_data=jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{codigo_base_governance}', $7::jsonb)
      WHERE sku=$2`, [TO, FROM, FLEETGUARD, DESCRIPTION, DONALDSON, JSON.stringify(nextComp), JSON.stringify(gov)]);
    if (u.rowCount !== 1) throw new Error('CATALOG_RENAME_COUNT_CHANGED');
    for (const [qualified, column] of DERIVED) {
      const [schema, table] = qualified.split('.');
      const exists = await db.query(`SELECT 1 FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
        WHERE c.table_schema=$1 AND c.table_name=$2 AND c.column_name=$3 AND t.table_type='BASE TABLE'`, [schema, table, column]);
      if (!exists.rowCount) continue;
      const d = await db.query(`UPDATE ${qualified} SET ${column}=$1 WHERE ${column}=$2`, [TO, FROM]);
      if (d.rowCount) report.derived[qualified] = d.rowCount;
    }
    for (const column of JSON_COLUMNS) {
      const hits = (await db.query(`SELECT id, ${column}::text AS t FROM public.elimfilters_catalog WHERE ${column}::text LIKE '%${FROM}%'`)).rows;
      for (const h of hits) {
        // previous_governance keeps the historical record untouched only inside this row's governance; replace elsewhere.
        const next = h.t.replace(/[A-Z0-9]+/g, (tok) => (tok === FROM ? TO : tok));
        if (next === h.t) continue;
        await db.query(`UPDATE public.elimfilters_catalog SET ${column}=$1::jsonb WHERE id=$2`, [next, h.id]);
        report.json[column] = (report.json[column] || 0) + 1;
      }
    }
    await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku = $1', [FROM]);
    try { await db.query('SAVEPOINT cache'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [TO]); await db.query('RELEASE SAVEPOINT cache'); }
    catch (_) { await db.query('ROLLBACK TO SAVEPOINT cache'); }
    const ins = await db.query(`INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,$3)
      ON CONFLICT (reference_type, brand, part_number, sku, source) DO NOTHING`, [FROM, TO, SOURCE]);
    report.superseded_registered = ins.rowCount;
    report.after = (await db.query(`SELECT sku, codigo_base, canonical_source_code, technology, filter_type, catalog_active FROM public.elimfilters_catalog WHERE sku = ANY($1)`, [[FROM, TO]])).rows;
    report.part_search = (await db.query(`SELECT count(*)::int n FROM public.crossref_resolved_cache WHERE sku=$1`, [TO])).rows[0].n;
    if (report.after.length !== 1 || report.after[0].sku !== TO) throw new Error('VERIFICATION_FAILED');
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
