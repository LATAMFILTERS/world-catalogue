'use strict';

/**
 * EL80067: Mitsubishi CANTER 434 / 444 / FE 434 / FE444 / FE649D, engine 4D31 / 4D31T / 4D31-OA/OAT / 4D31-OAT TURBO, as equipment applications.
 * Source: operator instruction 2026-11-16 (the Venezuela catalogue card lists exactly these models and engines for EL80067). Not an official sheet:
 * recorded as OPERATOR_SUPPLIED_VENEZUELA_CATALOGUE. The previous evidence rows are kept. Dry-run by default; --execute needs --snapshot <file>.
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
const JAC_PAGE = 'https://part-search.elimfilters.com/catalogo-venezuela/';
const SKUS = ['EL80067'];
const ENGINE = 'MITSUBISHI 4D31 / 4D31T / 4D31-OA / OAT / 4D31-OAT TURBO';
const ENTRIES = ['CANTER 434', 'CANTER 444', 'FE 434', 'FE444', 'FE649D'].map((m) => ({ type: 'TRUCK', engine: ENGINE, equipment: 'MITSUBISHI ' + m, equipment_options: 'VENEZUELA' }));
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
      const add = ENTRIES.filter((e) => !current.some((x) => key(x) === key(e)));
      if (!add.length) { report.skus[row.sku] = 'already'; continue; }
      const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [row.sku])).rows[0];
      const gov = row.enrichment_data?.application_governance || {};
      const authority = ev?.evidence_authority || gov.evidence_authority;
      const source = ev?.source_url || gov.evidence_url;
      const fresh = true; // the Donaldson sheet does not list these models: the new rows carry the operator evidence
      const list = [...current, ...add];
      await applyVerifiedApplications(db, { sku: row.sku, equipment_applications: list,
        evidence: fresh ? { authority: 'OPERATOR_SUPPLIED_VENEZUELA_CATALOGUE', source_url: JAC_PAGE, evidence_hash: sha({ sku: row.sku, ENTRIES, JAC_PAGE }), metadata: { method: 'operator-supplied' } }
          : { authority, source_url: source, evidence_hash: ev?.evidence_hash || gov.evidence_hash || sha({ sku: row.sku, source }), metadata: { method: 'kept-from-previous-evidence' } } });
      const payloadHash = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'OPERATOR_SUPPLIED_VENEZUELA_CATALOGUE', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku: row.sku, ENTRIES, JAC_PAGE }), metadata: { method: 'operator-supplied', models: 'CANTER 434 / 444 / FE 434 / FE444 / FE649D', engine: 'as stated by the operator', fitment: 'operator stated, not an official sheet' } });
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
