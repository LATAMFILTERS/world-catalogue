'use strict';

/**
 * EA17203 (Kia Pregio GS / RS passenger van, diesel; round primary air 205 x 128 x 126): operator 2026-11-25. It is a passenger van, so it is a LIGHT DUTY filter even with a diesel engine, and FRAM / MANN
 * do not make it, so the code base is the Millard commercial code MK-7203 (commercially known as 7203; operator authorisation 2026-11-12, official Millard page pasted by the operator).
 * The natural Light Duty number EA37203 is taken by FRAM CA7203SY (368 mm, another filter), and the operator keeps the commercial number: EA17203 stays as an operator exception to the prefix rule
 * ("conservar los números comerciales"), like EA14553.
 * Changes: duty HEAVY_DUTY -> LIGHT_DUTY; its 3 equipment_applications move to vehicle_applications (Light Duty stores vehicles) with VEHICLE / ENGINE evidence (Millard MK-7203, OPERATOR_SUPPLIED) and the
 * application governance the database requires; the SKU slot exception is recorded in enrichment_data. Base, dimensions, photo and price are untouched.
 * The database refuses an LD base that is not FRAM/MANN unless a per-SKU exception function says yes (el35796_millard_exception_approved, ea33603_oem_preservation_approved). This script creates the same kind of
 * function for EA17203 (public.ea17203_millard_exception_approved, one approval id) and adds one call to it in public.enforce_elimfilters_codigo_base_policy (the previous definition is saved in the snapshot).
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { APPROVAL_ID, EVIDENCE_URL } = require('../../lib/ea17203-millard-exception');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA17203';
const PAGE = EVIDENCE_URL;
const AT = '2026-11-25T00:00:00.000Z';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

// "KIA PREGIO GS" + "2001-2005" -> { make: 'KIA', model: 'PREGIO GS', year_from: '2001', year_to: '2005', engine }
const toVehicle = (e) => {
  const parts = String(e.equipment || '').trim().split(/\s+/);
  const years = String(e.equipment_options || '').match(/(\d{4})\s*-\s*(\d{4})/);
  const v = { make: parts[0] || '', model: parts.slice(1).join(' '), engine: String(e.engine || '') };
  if (years) { v.year_from = years[1]; v.year_to = years[2]; }
  return v;
};

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.duty !== 'HEAVY_DUTY' || cur.codigo_base !== 'MK-7203' || !cur.catalog_active) throw new Error('SOURCE_CHANGED');
    if ((cur.vehicle_applications || []).length) throw new Error('VEHICLE_APPLICATIONS_ALREADY_PRESENT');
    const priorEvidence = (await db.query('SELECT application_kind, payload_hash FROM public.catalog_application_evidence WHERE sku=$1', [SKU])).rows;
    report.prior_evidence_kept = priorEvidence.map((r) => r.application_kind);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    // 1. per-SKU exception function + one call in the base policy trigger function
    const fnOld = (await db.query("SELECT pg_get_functiondef('public.enforce_elimfilters_codigo_base_policy'::regproc) AS d")).rows[0].d;
    if (SNAPSHOT) { const snap = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8')); snap.enforce_elimfilters_codigo_base_policy_before = fnOld; fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 2)); }
    await db.query(`CREATE OR REPLACE FUNCTION public.ea17203_millard_exception_approved(c elimfilters_catalog) RETURNS boolean LANGUAGE sql IMMUTABLE AS $f$
      SELECT coalesce(c.sku='EA17203' AND c.duty='LIGHT_DUTY' AND c.filter_type='air' AND c.codigo_base='MK-7203'
        AND c.canonical_source_brand='MILLARD' AND c.canonical_source_code='MK-7203' AND c.canonical_source_status='VERIFIED'
        AND c.enrichment_data->'codigo_base_governance'->>'approved_manufacturer'='MILLARD'
        AND c.enrichment_data->'codigo_base_governance'->>'approved_codigo_base'='MK-7203'
        AND c.enrichment_data->'codigo_base_governance'->'approved_manual_exception'->>'approval_id'='${APPROVAL_ID}'
        AND c.enrichment_data->'codigo_base_governance'->'approved_manual_exception'->>'authorized_by'='OPERATOR'
        AND c.enrichment_data->'codigo_base_governance'->'approved_manual_exception'->>'evidence_url'='${EVIDENCE_URL}', false) $f$`);
    const anchor = 'IF public.el35796_millard_exception_approved(NEW) THEN RETURN NEW; END IF;';
    if (!fnOld.includes(anchor)) throw new Error('TRIGGER_FUNCTION_ANCHOR_MISSING');
    if (!fnOld.includes('ea17203_millard_exception_approved')) await db.query(fnOld.replace(anchor, anchor + '\n          IF public.ea17203_millard_exception_approved(NEW) THEN RETURN NEW; END IF;'));
    report.trigger_function_patched = true;

    const vehicles = (cur.equipment_applications || []).map(toVehicle);
    const hash = (await db.query('SELECT md5($1::jsonb::text) AS h', [JSON.stringify(vehicles)])).rows[0].h;
    const emptyHash = (await db.query("SELECT md5('[]'::jsonb::text) AS h")).rows[0].h; // equipment_applications becomes empty: the trigger wants that (empty) payload verified too
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.application_governance = { policy_version: '2026-08-19-app-v1', evidence_recorded: true, evidence_authority: 'OPERATOR_SUPPLIED', evidence_url: PAGE, evidence_hash: sha({ sku: SKU, page: PAGE, payload: hash }), verified_at: AT,
      vehicle_verified: true, engine_verified: true, no_engine_code_inference: true, vehicle_payload_hash: hash, engine_payload_hash: hash, vehicle_db_payload_hash: hash, engine_db_payload_hash: hash,
      equipment_verified: true, equipment_payload_hash: emptyHash, equipment_db_payload_hash: emptyHash };
    enrichment.codigo_base_governance = { ...(enrichment.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'NON_EUROPEAN', verified_at: AT,
      evidence_url: PAGE, evidence_note: 'Kia Pregio passenger van (diesel): Light Duty. Not made by FRAM/MANN; Millard MK-7203 is the commercial code (7203). Operator exception 2026-11-25.',
      policy_version: '2026-08-19-v3.1', required_authority: 'OPERATOR_MANUAL_EXCEPTION', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: 'MK-7203', approved_codigo_base: 'MK-7203', approved_manufacturer: 'MILLARD', approved_source_column: 'OPERATOR_MANUAL_EXCEPTION', primary_manufacturer_verified: false,
      fram_absence_verified: true, mann_absence_verified: true, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
      approved_manual_exception: { reason: 'Passenger van, diesel: Light Duty; no FRAM/MANN equivalent; Millard is the commercial reference in Latin America; keeps the commercial number 7203 (EA17203)', approval_id: APPROVAL_ID, evidence_url: PAGE, authorized_by: 'OPERATOR', authorized_on: '2026-11-25' } };
    enrichment.sku_slot_exception = { rule: 'OPERATOR_KEEPS_COMMERCIAL_NUMBER_7203', natural_ld_sku: 'EA37203', natural_ld_sku_taken_by: 'FRAM CA7203SY', reclassified_from: 'HEAVY_DUTY', reason: 'Kia Pregio passenger van, diesel: Light Duty', decided_by: 'OPERATOR', decided_at: '2026-11-25', migration: 'run_497' };
    for (const kind of ['VEHICLE', 'ENGINE']) {
      if (priorEvidence.some((r) => r.application_kind === kind && r.payload_hash === hash)) continue;
      await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
        VALUES ($1,$2,$3,'OPERATOR_SUPPLIED',$4,$5,true,now(),$6::jsonb)`,
      [SKU, kind, hash, PAGE, sha({ sku: SKU, kind, page: PAGE, payload: hash }), JSON.stringify({ loaded: vehicles.length, method: 'operator-pasted-millard-catalog-page', moved_from: 'equipment_applications', parent_kind: 'VEHICLE' })]);
    }
    if (!priorEvidence.some((r) => r.application_kind === 'EQUIPMENT' && r.payload_hash === emptyHash)) {
      await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
        VALUES ($1,'EQUIPMENT',$2,'OPERATOR_SUPPLIED',$3,$4,true,now(),$5::jsonb)`,
      [SKU, emptyHash, PAGE, sha({ sku: SKU, kind: 'EQUIPMENT', page: PAGE, payload: emptyHash }), JSON.stringify({ note: 'equipment_applications emptied: the 3 lines moved to vehicle_applications (Light Duty stores vehicles)', moved_to: 'vehicle_applications' })]);
    }
    const patch = { duty: 'LIGHT_DUTY', canonical_source_brand: 'MILLARD', canonical_source_code: 'MK-7203', canonical_source_status: 'VERIFIED', oem_codes: cur.oem_codes || [], competitor_codes: cur.competitor_codes || [], equipment_applications: [], vehicle_applications: vehicles, enrichment_data: enrichment }; // oem_codes was NULL: stored as an empty list
    report.gateway = assertGovernedCatalogPatch(cur, patch).valid;
    await db.query('UPDATE public.elimfilters_catalog SET duty=$2, canonical_source_code=$7, oem_codes=$6::jsonb, equipment_applications=$3::jsonb, vehicle_applications=$4::jsonb, enrichment_data=$5::jsonb WHERE sku=$1',
      [SKU, 'LIGHT_DUTY', JSON.stringify([]), JSON.stringify(vehicles), JSON.stringify(enrichment), JSON.stringify(cur.oem_codes || []), 'MK-7203']);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.vehicles = vehicles;
    report.after = (await db.query('SELECT sku, duty, codigo_base, canonical_source_brand br, jsonb_array_length(vehicle_applications) veh, jsonb_array_length(equipment_applications) eq FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
