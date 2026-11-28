'use strict';
// Operator 2026-11-27 ("restaura ambos"): a van with a diesel engine is Light Duty. EA32338 (Mercedes Sprinter, retired by run_331) and EF32003 (Ford Transit, retired by run_505) become active again,
// and EA12826 loses the two Sprinter 2.7 L applications run_331 added, returning to the application list its Donaldson evidence covers. Certification state is not touched.
// Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const OLD505 = arg('--run505') || 'C:/ELIMSERVER/backups/run_505_snapshot_20261127.json';
const ADDED = ['MERCEDES-BENZ SPRINTER 2500', 'MERCEDES-BENZ SPRINTER 3500'];
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [['EA32338', 'EF32003', 'EA12826']])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    if (by.EA32338.catalog_active || by.EF32003.catalog_active || by.EA32338.enrichment_data.resolution_status?.migration !== 'run_331' || by.EF32003.enrichment_data.resolution_status?.migration !== 'run_505') throw new Error('SOURCE_CHANGED');
    const refs = (await db.query("SELECT * FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND part_number=ANY($1)", [['EA32338', 'EF32003']])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, superseded_refs: refs }, null, 2), { flag: 'wx' });

    // EA12826 first: back to the list its Donaldson evidence covers
    const keep = by.EA12826.equipment_applications.filter((x) => !(ADDED.includes(x.equipment) && x.engine === 'MERCEDES-BENZ L5 2.7L FI TURBO DIESEL'));
    if (by.EA12826.equipment_applications.length - keep.length !== 2) throw new Error('EA12826_CHANGED');
    const hash = (await db.query('SELECT md5($1::jsonb::text) AS h', [JSON.stringify(keep)])).rows[0].h;
    const ev = (await db.query("SELECT source_url, evidence_hash, evidence_authority, verified_at FROM public.catalog_application_evidence WHERE sku='EA12826' AND application_kind='EQUIPMENT' AND payload_hash=$1 AND verified ORDER BY id DESC LIMIT 1", [hash])).rows[0];
    if (!ev) throw new Error('NO_EVIDENCE_FOR_PREVIOUS_LIST');
    const g = { ...by.EA12826.enrichment_data.application_governance, evidence_url: ev.source_url, evidence_hash: ev.evidence_hash, evidence_authority: ev.evidence_authority, verified_at: ev.verified_at,
      equipment_payload_hash: hash, equipment_db_payload_hash: hash, engine_payload_hash: hash, engine_db_payload_hash: hash };
    await db.query('UPDATE public.elimfilters_catalog SET equipment_applications=$2::jsonb, enrichment_data=jsonb_set(enrichment_data,\'{application_governance}\',$3::jsonb) WHERE sku=$1', ['EA12826', JSON.stringify(keep), JSON.stringify(g)]);

    // EF32003: the exact enrichment it had before run_505
    const before = JSON.parse(fs.readFileSync(OLD505, 'utf8')).rows.find((r) => r.sku === 'EF32003');
    await db.query('UPDATE public.elimfilters_catalog SET catalog_active=true, enrichment_data=$2::jsonb WHERE sku=$1', ['EF32003', JSON.stringify(before.enrichment_data)]);
    // EA32338: run_331 only added resolution_status
    await db.query("UPDATE public.elimfilters_catalog SET catalog_active=true, enrichment_data=enrichment_data - 'resolution_status' WHERE sku='EA32338'");
    report.superseded_removed = (await db.query("DELETE FROM public.exact_part_reference WHERE reference_type='SUPERSEDED' AND part_number=ANY($1)", [['EA32338', 'EF32003']])).rowCount;
    for (const s of ['EA32338', 'EF32003']) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]);
    report.rows = (await db.query("SELECT e.sku, e.duty, e.catalog_active, jsonb_array_length(coalesce(e.vehicle_applications,'[]'::jsonb)) veh, jsonb_array_length(coalesce(e.equipment_applications,'[]'::jsonb)) equip, z.certification_state cert FROM public.elimfilters_catalog e LEFT JOIN public.catalog_sku_certification z ON z.sku=e.sku WHERE e.sku=ANY($1) ORDER BY e.sku", [['EA32338', 'EF32003', 'EA12826']])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
