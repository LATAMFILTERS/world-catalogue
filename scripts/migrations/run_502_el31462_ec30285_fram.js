'use strict';
// EL31462 (FRAM PH11462) and EC30285 (FRAM CF10285), operator 2026-11-27: FRAM official pages captured by scraper.
//  1. The FRAM identity PH11462 was attached to EL31203 (base "1203", FINI compressor data): it moves to EL31462. EC30285 gets its FRAM identity.
//  2. vehicle_applications and OEM / competitor codes come from the maker of the base (FRAM); what the rows had before stays in enrichment_data.pending_review.
//  3. EC30285 dimensions from the FRAM page (9.06 x 8.07 x 1.38 in).
// Dry-run by default (ROLLBACK), including the Light Duty certification checks. --execute needs --snapshot <file>.
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const APPLY = process.argv.includes('--execute');
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const DIR = arg('--data') || 'C:/ELIMSERVER/state/fram-sin-registro';
const RECERT = arg('--recertify-script') || 'C:/ELIMSERVER/worktrees/seo-404/scripts/migrations/recertify_ld_skus_list.js';
const AT = '2026-11-27T00:00:00.000Z';
const OEM = new Set(['GENERALMOTORS', 'GM', 'JAGUAR', 'LANDROVER', 'SUBARU', 'TOYOTA']); // every other brand on these two pages is aftermarket
const JOBS = [
  { sku: 'EL31462', base: 'PH11462', file: 'fram_ph11462.json', type: 'oil', apps: 42, inter: 28 },
  { sku: 'EC30285', base: 'CF10285', file: 'fram_cf10285.json', type: 'cabin', apps: 713, inter: 90 },
];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const clean = (v) => String(v || '').replace(/&amp;/g, '&').trim();
const letters = (v) => clean(v).toUpperCase().replace(/[^A-Z]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const mm = (inch) => Math.round(inch * 25.4 * 100) / 100;

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const skus = JOBS.map((j) => j.sku);
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=ANY($1) FOR UPDATE', [[...skus, 'EL31203']])).rows;
    const ids = (await db.query('SELECT * FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku=ANY($1) OR canonical_part_number=ANY($2)', [[...skus, 'EL31203'], JOBS.map((j) => j.base)])).rows;
    if (rows.length !== 3 || ids.length !== 1 || ids[0].elimfilters_sku !== 'EL31203' || ids[0].canonical_part_number !== 'PH11462') throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, identity: ids }, null, 2), { flag: 'wx' });
    await db.query("DELETE FROM ld_catalog.ld_canonical_product_identity WHERE elimfilters_sku='EL31203' AND canonical_part_number='PH11462'");

    for (const job of JOBS) {
      const cur = rows.find((r) => r.sku === job.sku);
      const fram = JSON.parse(fs.readFileSync(`${DIR}/${job.file}`, 'utf8'));
      if (!fram.title.includes(job.base) || fram.applications.length !== job.apps || fram.interchange.length !== job.inter) throw new Error('DATA_FILE_MISMATCH ' + job.sku);
      if (cur.duty !== 'LIGHT_DUTY' || !cur.catalog_active || cur.codigo_base !== job.base) throw new Error('ROW_CHANGED ' + job.sku);
      const source = `FRAM_OFFICIAL_PAGE_${job.base}_20261127`;
      const seen = new Set();
      const apps = [];
      for (const [year, make, model, engine] of fram.applications) {
        const k = [year, make, model, engine].map(norm).join('|');
        if (!seen.has(k)) { seen.add(k); apps.push({ make: clean(make), year: String(year), model: clean(model), engine: clean(engine) }); }
      }
      const isOem = (b) => OEM.has(letters(b));
      const oemCodes = new Set(fram.interchange.filter(([b]) => isOem(b)).map(([, p]) => norm(p)));
      const oem = [];
      const comp = [];
      const done = new Set();
      for (const [brand, part] of fram.interchange) {
        const k = norm(part);
        const mk = isOem(brand);
        const dk = `${k}|${letters(brand)}`;
        if (!k || k === norm(job.base) || done.has(dk) || (!mk && oemCodes.has(k))) continue;
        done.add(dk);
        (mk ? oem : comp).push({ code: clean(part), manufacturer: clean(brand), classification: mk ? 'OEM' : 'AFTERMARKET', classification_source: 'OPERATOR_RULE_20261125', source, source_url: fram.url });
      }
      const hash = (await db.query('SELECT md5($1::jsonb::text) AS h', [JSON.stringify(apps)])).rows[0].h;
      const e = { ...(cur.enrichment_data || {}) };
      e.pending_review = { set_aside_at: AT, migration: 'run_502', vehicle_applications: cur.vehicle_applications || [], oem_codes: cur.oem_codes || [], competitor_codes: cur.competitor_codes || [] };
      e.application_governance = { policy_version: '2026-08-19-app-v1', evidence_recorded: true, evidence_authority: source, evidence_url: fram.url, evidence_hash: sha({ sku: job.sku, url: fram.url, payload: hash }), verified_at: AT,
        vehicle_verified: true, engine_verified: true, no_engine_code_inference: true, vehicle_payload_hash: hash, engine_payload_hash: hash, vehicle_db_payload_hash: hash, engine_db_payload_hash: hash };
      e.codigo_base_governance = { ...(e.codigo_base_governance || {}), state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', origin_group: 'NON_EUROPEAN', verified_at: AT, evidence_url: fram.url,
        policy_version: '2026-08-29-regional-v3.2', required_authority: 'REGIONAL_CANONICAL_POLICY_SATISFIED', contamination_flags: [], observed_primary_candidates: [], current_codigo_base: job.base, approved_codigo_base: job.base,
        approved_manufacturer: 'FRAM', approved_source_column: 'CANONICAL_POLICY', primary_manufacturer_verified: true, oem_code_count: oem.length, competitor_code_count: comp.length };
      for (const kind of ['VEHICLE', 'ENGINE']) {
        await db.query(`INSERT INTO public.catalog_application_evidence(sku, application_kind, payload_hash, evidence_authority, source_url, evidence_hash, verified, verified_at, metadata)
          SELECT $1::text,$2::text,$3::text,$4::text,$5::text,$6::text,true,now(),$7::jsonb WHERE NOT EXISTS (SELECT 1 FROM public.catalog_application_evidence WHERE sku=$1::text AND application_kind=$2::text AND payload_hash=$3::text)`,
        [job.sku, kind, hash, source, fram.url, sha({ sku: job.sku, kind, url: fram.url, payload: hash }), JSON.stringify({ rows: apps.length, parent_kind: 'VEHICLE', exact_fram_code: job.base, captured_at: fram.captured_at })]);
      }
      const patch = { vehicle_applications: apps, oem_codes: oem, competitor_codes: comp, enrichment_data: e, canonical_source_brand: 'FRAM', canonical_source_code: job.base, canonical_source_status: 'VERIFIED', canonical_source_url: fram.url,
        canonical_verified_at: AT, canonical_evidence: { source, authority: 'FRAM_OFFICIAL_PAGE', market_scope: 'MULTI_REGION' } };
      if (job.sku === 'EC30285') {
        Object.assign(patch, { product_length_mm: mm(9.06), product_width_mm: mm(8.07), height_mm: mm(1.38), installation_type: 'Fresh Breeze Cabin Air Filter',
          specs: { ...(cur.specs || {}), style: 'Fresh Breeze Cabin Air Filter', location: 'Behind Glove Box', length_in: 9.06, length_mm: mm(9.06), width_in: 8.07, width_mm: mm(8.07), height_in: 1.38, height_mm: mm(1.38), media_type: 'GENUINE FILTER MEDIA', activated_carbon: 'Yes' } });
      }
      const cols = Object.keys(patch);
      const val = (c) => (patch[c] !== null && typeof patch[c] === 'object' ? JSON.stringify(patch[c]) : patch[c]);
      await db.query(`UPDATE public.elimfilters_catalog SET ${cols.map((c, i) => `${c}=$${i + 2}`).join(', ')} WHERE sku=$1`, [job.sku, ...cols.map(val)]);
      await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
        VALUES ($1,'NON_EUROPEAN','FRAM',$2,$3,'ACTIVE',$4)`, [job.sku, job.base, job.type, source]);
      report[job.sku] = { before: { apps: (cur.vehicle_applications || []).length, oem: (cur.oem_codes || []).length, competitor: (cur.competitor_codes || []).length }, after: { apps: apps.length, oem: oem.length, competitor: comp.length },
        oem_codes_lost: [...new Set((cur.oem_codes || []).map((x) => norm(x.code)))].filter((c) => !oem.some((x) => norm(x.code) === c)).length };
    }
    for (const s of [...skus, 'EL31203']) await db.query('SELECT public.refresh_crossref_cache_sku($1)', [s]);
    const evaluate = fs.readFileSync(RECERT, 'utf8').match(/const EVALUATE = `([\s\S]*?)`;/)[1].replace(/\\\\/g, '\\');
    report.certification = (await db.query(`SELECT sku, blockers FROM (${evaluate}) a WHERE a.sku=ANY($1)`, [skus])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.message); process.exit(1); });
