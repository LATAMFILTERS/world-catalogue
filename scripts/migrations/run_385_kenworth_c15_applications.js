'use strict';

/**
 * Kenworth T600 / T800 with Caterpillar C15 (Petroil Venezuela application page pasted by the operator 2026-11-16, distributor page, not an official
 * Kenworth sheet). Adds only the missing (model, engine) pairs to the SKUs the page cross-references via Donaldson base codes:
 * EA14816 (P534816), EL84005 (P554005), EW74071 (P554071), ED41413 (P951413). EH60830, ES90463 and EF91311 already carry both. Not loaded:
 * P551000 (water separator; natural ES91000 is occupied by another product, pending base decision).
 * Same mechanism as run_374 (previous evidence kept, one extra evidence row). Dry-run by default; --execute needs --snapshot <file>.
 */
/* derived from run_374: Sinotruk HOWO A7 (engine TR A7 4X6 380 EURO IV) as an equipment application of the elements that Petroil Venezuela lists for it and that the
 * catalogue holds: oil EL86285, fuel EF90019, brake air dryer ED41413, turbine separator ES92020 and housing ET91000 (FS1000FG, by operator),
 * air kit EK10753 with EA15977 / EA15978. ES96235 already carries it (run_372). Source: the Petroil Venezuela application page, used by operator
 * decision (distributor page, not an official Sinotruk sheet). The previous evidence of each SKU is kept; one extra evidence row is added.
 * Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications, insertEvidence, dbJsonHash } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const JAC_PAGE = 'https://petroil.net/productos/aplicaciones';
const mk = (equipment) => ({ type: 'TRUCK', engine: 'CATERPILLAR C15', equipment, equipment_options: 'VENEZUELA' });
const T600 = mk('KENWORTH T600'), T800 = mk('KENWORTH T800');
const PLAN = { EA14816: [T600], EL84005: [T600, T800], EW74071: [T600], ED41413: [T600, T800] };
const SKUS = Object.keys(PLAN);
const key = (x) => `${x.equipment}|${x.engine}`;

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;

  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT sku, equipment_applications, enrichment_data FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [SKUS])).rows;
    if (rows.length !== SKUS.length) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    for (const row of rows) {
      const current = row.equipment_applications || [];
      const add = PLAN[row.sku].filter((e) => !current.some((x) => key(x) === key(e)));
      if (!add.length) { report.skus[row.sku] = 'already'; continue; }
      const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [row.sku])).rows[0];
      const gov = row.enrichment_data?.application_governance || {};
      const authority = ev?.evidence_authority || gov.evidence_authority;
      const source = ev?.source_url || gov.evidence_url;
      const fresh = !authority || !source;
      const list = [...current, ...add];
      await applyVerifiedApplications(db, { sku: row.sku, equipment_applications: list,
        evidence: fresh ? { authority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', source_url: JAC_PAGE, evidence_hash: sha({ sku: row.sku, add, JAC_PAGE }), metadata: { method: 'distributor-page-operator-directed' } }
          : { authority, source_url: source, evidence_hash: ev?.evidence_hash || gov.evidence_hash || sha({ sku: row.sku, source }), metadata: { method: 'kept-from-previous-evidence' } } });
      const payloadHash = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku: row.sku, add, JAC_PAGE }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela', model: 'KENWORTH T600/T800', engine: 'CATERPILLAR C15 (as stated by the distributor)', fitment: 'distributor stated, not an official Kenworth sheet' } });
      }
      const s = (await db.query('SELECT jsonb_array_length(equipment_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [row.sku])).rows[0];
      if (s.n !== list.length) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + row.sku);
      report.skus[row.sku] = { before: current.length, after: s.n, added: add.map((e) => e.equipment) };
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
