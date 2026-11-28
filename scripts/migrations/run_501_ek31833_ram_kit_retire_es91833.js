'use strict';
// Operator 2026-11-27: Ram 6.7L Cummins diesel pickup filter kit EK31833 (Light Duty, EK3) = EF37291 fuel filter + EF37867 fuel/water separator, carrying Mopar 68197867AB / 68197867AA.
// ES91833 (Heavy Duty twin holding the same Mopar numbers) is retired whole, never erased, and registered as SUPERSEDED by EK31833. Its equipment applications and cross-references stay in the retired row.
// Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const KIT = 'EK31833', FUEL = 'EF37291', SEP = 'EF37867', OLD = 'ES91833';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [[KIT, SEP, OLD]])).rows;
    const sep = rows.find((r) => r.sku === SEP), old = rows.find((r) => r.sku === OLD);
    if (rows.some((r) => r.sku === KIT) || !sep || !old || !sep.catalog_active || !old.catalog_active || old.codigo_base !== 'P551833') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2), { flag: 'wx' });
    const apps = sep.vehicle_applications; // 2013-2018 Ram 2500 / 3500: the years both filters share
    const url = sep.enrichment_data.application_governance.evidence_url;
    const hash = (await db.query('SELECT md5($1::jsonb::text) AS h', [JSON.stringify(apps)])).rows[0].h;
    const oem = ['68197867AB', '68197867AA'].map((code) => ({ code, manufacturer: 'MOPAR', classification: 'OEM', source: 'operator_defined_kit_ek31833_2026-11-27', kit_components: [SEP] }));
    const enrichment = {
      source: 'operator_defined_kit_ek31833_2026-11-27', operator_supplied: true, oem_reference_url: url,
      kit: { components: [{ qty: 1, sku: FUEL, role: 'FUEL' }, { qty: 1, sku: SEP, role: 'FUEL_WATER_SEPARATOR' }] },
      application_governance: { ...sep.enrichment_data.application_governance, evidence_hash: sha({ sku: KIT, url, payload: hash }), vehicle_payload_hash: hash, engine_payload_hash: hash, vehicle_db_payload_hash: hash, engine_db_payload_hash: hash },
      codigo_base_governance: { ...sep.enrichment_data.codigo_base_governance, approved_codigo_base: KIT, current_codigo_base: KIT,
        approved_manual_exception: { approval_id: 'LD_MOPAR_KIT_OPERATOR_EXCEPTION_20261127', authorized_by: 'OPERATOR', authorized_on: '2026-11-27', evidence_url: url, reason: 'Ram 6.7L Cummins diesel pickup filter kit, Light Duty' } },
    };
    for (const kind of ['VEHICLE', 'ENGINE']) {
      await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
        VALUES ($1,$2,$3,$4,$5,$6,true,now(),$7::jsonb)`,
      [KIT, kind, hash, enrichment.application_governance.evidence_authority, url, sha({ sku: KIT, kind, url, payload: hash }), JSON.stringify({ rows: apps.length, copied_from: SEP, parent_kind: 'VEHICLE' })]);
    }
    const description = `ELIMFILTERS® ${KIT} SYNTAPORE™ diesel fuel filter kit for 2013–2018 Ram 2500 / 3500 6.7L Cummins: ${FUEL} fuel filter and ${SEP} fuel/water separator filter, with GENUINE FILTER MEDIA. Replaces Mopar 68197867AB / 68197867AA.`;
    const specs = { style: 'Filter Kit', fuel_type: 'Diesel', media_type: 'GENUINE FILTER MEDIA', kit_contents: `1 fuel filter (${FUEL}) + 1 fuel/water separator filter (${SEP})`, kit_components: [FUEL, SEP] };
    await db.query(`INSERT INTO public.elimfilters_catalog(sku, codigo_base, duty, filter_type, technology, filter_media, installation_type, sub_type, name, description, specs, alternatives, oem_codes, competitor_codes, vehicle_applications, equipment_applications, enrichment_data,
        canonical_source_brand, canonical_source_code, canonical_source_status, canonical_source_url, canonical_verified_at, canonical_evidence, catalog_active)
      VALUES ($1::text,$1::text,'LIGHT_DUTY','fuel',$2,'GENUINE FILTER MEDIA','Kit','Kit',$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,'[]'::jsonb,$8::jsonb,'[]'::jsonb,$9::jsonb,'ELIMFILTERS',$1::text,'VERIFIED',$10,now(),$11::jsonb,true)`,
    [KIT, sep.technology, `${KIT} Diesel Fuel Filter Kit - ${FUEL} + ${SEP}`, description, JSON.stringify(specs), JSON.stringify([FUEL, SEP]), JSON.stringify(oem), JSON.stringify(apps), JSON.stringify(enrichment), url, JSON.stringify({ source: enrichment.source, components: [FUEL, SEP] })]);
    await db.query(`UPDATE public.elimfilters_catalog SET catalog_active=false,
      enrichment_data=jsonb_set(jsonb_set(jsonb_set(coalesce(enrichment_data,'{}'::jsonb), '{resolution_status}', $2::jsonb), '{codigo_base_governance,state}', '"RETIRED_DUPLICATE"'::jsonb), '{codigo_base_governance,governance_state}', '"RETIRED_DUPLICATE"'::jsonb) WHERE sku=$1`,
    [OLD, JSON.stringify({ state: 'INACTIVE_RETIRED', reason: 'LIGHT_DUTY_MOPAR_PICKUP_KIT_REPLACES_HEAVY_DUTY_ROW', correct_product: KIT, superseded_by: KIT, decided_by: 'OPERATOR', updated_at: '2026-11-27', migration: 'run_501' })]);
    report.cache_removed = (await db.query('DELETE FROM public.crossref_resolved_cache WHERE sku=$1', [OLD])).rowCount;
    report.exact_removed = (await db.query("DELETE FROM public.exact_part_reference WHERE sku=$1 AND reference_type<>'SUPERSEDED'", [OLD])).rowCount;
    await db.query("INSERT INTO public.exact_part_reference(reference_type, brand, part_number, sku, source) VALUES ('SUPERSEDED','ELIMFILTERS',$1,$2,'RUN_501_ES91833_TO_EK31833') ON CONFLICT DO NOTHING", [OLD, KIT]);
    for (const s of [KIT, SEP]) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]);
    report.resolver = (await db.query("SELECT code,sku,status FROM public.v_api_resolver_v7 WHERE ld_catalog.norm_part(code) IN ('EK31833','68197867AB','68197867AA','EF37867','EF37291','68157291AA','ES91833')")).rows;
    report.conflicts = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE skus && $1::varchar[]', [[KIT, SEP, FUEL]])).rows;
    report.classification = (await db.query('SELECT sku,count(*)::int n FROM public.catalog_reference_classification_conflicts_v WHERE sku=ANY($1) GROUP BY sku', [[KIT, SEP, FUEL]])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
