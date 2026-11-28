'use strict';
// Operator 2026-11-27 ("manda la furgoneta"): a diesel van filter is Light Duty, so EA32338 owns the Sprinter references it shares with EA12826 (Heavy Duty).
// EA12826 loses every reference EA32338 also holds (and MANN C32338, EA32338's base) and its Sprinter equipment applications (all the lines it has); everything removed is kept in enrichment_data.pending_review.
// Certification state is not touched. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const i = process.argv.indexOf('--snapshot');
const SNAPSHOT = i >= 0 ? process.argv[i + 1] : null;
const raw = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const norm = (v) => raw(v).replace(/^A(?=\d{9,})/, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query("SELECT * FROM public.elimfilters_catalog WHERE sku IN ('EA12826','EA32338') FOR UPDATE")).rows;
    const hd = rows.find((r) => r.sku === 'EA12826');
    const ld = rows.find((r) => r.sku === 'EA32338');
    if (!hd || !ld || !hd.catalog_active || !ld.catalog_active || (hd.equipment_applications || []).length !== 5 || !hd.equipment_applications.every((x) => /SPRINTER/i.test(x.equipment))) throw new Error('SOURCE_CHANGED');
    const van = new Set([...(ld.oem_codes || []), ...(ld.competitor_codes || [])].map((x) => norm(x.code)).concat(norm(ld.codigo_base)));
    const drop = (list) => (list || []).filter((x) => van.has(norm(x.code)));
    const keep = (list) => (list || []).filter((x) => !van.has(norm(x.code)));
    const removed = { oem_codes: drop(hd.oem_codes), competitor_codes: drop(hd.competitor_codes), equipment_applications: hd.equipment_applications };
    const removedCodes = [...new Set([...removed.oem_codes, ...removed.competitor_codes].map((x) => raw(x.code)))];
    const refs = (await db.query("SELECT * FROM public.exact_part_reference WHERE sku='EA12826' AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g'))=ANY($1) AND reference_type<>'SUPERSEDED'", [removedCodes])).rows;
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, exact_part_reference: refs }, null, 2), { flag: 'wx' });
    const empty = [];
    const hash = (await db.query("SELECT md5('[]'::jsonb::text) AS h")).rows[0].h;
    const url = hd.enrichment_data.application_governance.evidence_url;
    for (const kind of ['EQUIPMENT', 'ENGINE']) {
      await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
        SELECT 'EA12826',$1::text,$2::text,'OPERATOR_SUPPLIED',$3::text,$4::text,true,now(),$5::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.catalog_application_evidence WHERE sku='EA12826' AND application_kind=$1::text AND payload_hash=$2::text)`,
      [kind, hash, url, sha({ sku: 'EA12826', kind, run: 'run_510' }), JSON.stringify({ note: 'Sprinter applications withdrawn: diesel van is Light Duty (EA32338); kept in pending_review', migration: 'run_510' })]);
    }
    const e = { ...hd.enrichment_data };
    e.pending_review = { ...(e.pending_review || {}), removed_run_510: removed };
    e.application_governance = { ...e.application_governance, evidence_authority: 'OPERATOR_SUPPLIED', evidence_hash: sha({ sku: 'EA12826', empty, run: 'run_510' }), verified_at: new Date().toISOString(),
      equipment_payload_hash: hash, equipment_db_payload_hash: hash, engine_payload_hash: hash, engine_db_payload_hash: hash };
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb, equipment_applications=$3::jsonb, enrichment_data=$4::jsonb WHERE sku=\'EA12826\'',
      [JSON.stringify(keep(hd.oem_codes)), JSON.stringify(keep(hd.competitor_codes)), JSON.stringify(empty), JSON.stringify(e)]);
    report.exact_rows_removed = refs.length ? (await db.query('DELETE FROM public.exact_part_reference WHERE id=ANY($1)', [refs.map((r) => r.id)])).rowCount : 0;
    for (const s of ['EA12826', 'EA32338']) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]);
    report.removed = [...removed.oem_codes, ...removed.competitor_codes].map((x) => x.code);
    report.resolver = (await db.query("SELECT code, sku FROM public.v_api_resolver_v7 WHERE code IN ('C32338','200129620','2D0129620','0030947504')")).rows;
    report.after = (await db.query("SELECT sku, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp, jsonb_array_length(equipment_applications) equip FROM public.elimfilters_catalog WHERE sku IN ('EA12826','EA32338') ORDER BY sku")).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report));
  } catch (err) { try { await db.query('ROLLBACK'); } catch (_) {} throw err; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
