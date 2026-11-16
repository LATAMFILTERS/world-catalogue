'use strict';

/**
 * Corrects run_374: the Petroil FS2020TM turbine element (Racor 2020TM) was attached to ES92020 (HYDROCORE, Donaldson P552020 spin-on)
 * instead of ET92020T (TURBOCORE, base 2020TM-OR). Moves the Sinotruk HOWO A7 application from ES92020 to ET92020T.
 * Source/evidence: same Petroil page as run_374 (distributor page, operator-directed). ES92020 keeps all its other applications.
 * Dry-run by default (ROLLBACK); --execute needs --snapshot <file>.
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
const PAGE = 'https://petroil.net/productos/aplicaciones/sinotruck/trucks/80588=Camiones-SInotruck-HOWO-A7-Motor-TR-A7-4X6-380-EURO-IV';
const FROM = 'ES92020', TO = 'ET92020T';
const ENTRY = { type: 'TRUCK', engine: 'TR A7 4X6 380 EURO IV', equipment: 'SINOTRUK HOWO A7', equipment_options: 'VENEZUELA' };
const key = (x) => `${x.equipment}|${x.engine}`;

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } } : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', skus: {} };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT sku, technology, equipment_applications, enrichment_data FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[FROM, TO]])).rows;
    if (rows.length !== 2) throw new Error('SKU_NOT_FOUND');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    for (const row of rows) {
      const current = row.equipment_applications || [];
      const has = current.some((x) => key(x) === key(ENTRY));
      const list = row.sku === TO ? (has ? null : [...current, ENTRY]) : (has ? current.filter((x) => key(x) !== key(ENTRY)) : null);
      if (!list) { report.skus[row.sku] = 'already'; continue; }
      const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [row.sku])).rows[0];
      const gov = row.enrichment_data?.application_governance || {};
      const authority = ev?.evidence_authority || gov.evidence_authority;
      const source = ev?.source_url || gov.evidence_url;
      const fresh = !authority || !source;
      await applyVerifiedApplications(db, { sku: row.sku, equipment_applications: list,
        evidence: fresh ? { authority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', source_url: PAGE, evidence_hash: sha({ sku: row.sku, ENTRY, PAGE }), metadata: { method: 'distributor-page-operator-directed' } }
          : { authority, source_url: source, evidence_hash: ev?.evidence_hash || gov.evidence_hash || sha({ sku: row.sku, source }), metadata: { method: 'kept-from-previous-evidence' } } });
      const payloadHash = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: PAGE,
          evidenceHash: sha({ sku: row.sku, ENTRY, PAGE, fix: 'run_383' }), metadata: { method: 'distributor-page-operator-directed', correction: row.sku === TO ? 'turbine element added' : 'turbine element removed (wrong SKU in run_374)', model: 'SINOTRUK HOWO A7' } });
      }
      const s = (await db.query('SELECT jsonb_array_length(equipment_applications) n FROM public.elimfilters_catalog WHERE sku=$1', [row.sku])).rows[0];
      if (s.n !== list.length) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + row.sku);
      report.skus[row.sku] = { before: current.length, after: s.n };
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
