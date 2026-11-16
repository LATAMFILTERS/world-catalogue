'use strict';

/**
 * JAC HFC4253K3R1 (11.6 L, 420 HP, turbo intercooler) as an equipment application of the elements that Petroil Venezuela
 * lists for it and that the catalogue already holds: oil EL89000 (Cummins 3406809 / LF9001 / LF14000NN), fuel EF90529
 * (P550529 / FF5507), fuel-water separator ES91026 (Baldwin BF1359-SP = P559118 kit of P551026), air kit EK10753 with
 * EA15977/EA15978 (Sinotruk HOWO A7 WG9725190103/WG9725190102). Source: the Petroil Venezuela application page, used by
 * operator decision 2026-11-15 (distributor page, not an official JAC sheet; engine make is not stated and not inferred).
 * The previous evidence of each SKU is kept; one extra evidence row (authority DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED) is added.
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
const JAC_PAGE = 'https://petroil.net/productos/aplicaciones/jac/trucks/80553=Camiones-JAC-Modelo-HFC4253K3R1-Motor-6L-11.6L-420HP-TURBO-INTERCOOLER';
const SKUS = ['EL89000', 'EF90529', 'ES91026', 'EK10753', 'EA15977', 'EA15978'];
const ENTRY = { type: 'TRUCK', engine: '6L 11.6L 420HP TURBO INTERCOOLER', equipment: 'JAC HFC4253K3R1', equipment_options: 'VENEZUELA' };
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
      if (current.some((x) => key(x) === key(ENTRY))) { report.skus[row.sku] = 'already'; continue; }
      const ev = (await db.query(`SELECT evidence_authority, source_url, evidence_hash FROM public.catalog_application_evidence WHERE sku=$1 AND application_kind='EQUIPMENT' AND verified ORDER BY id DESC LIMIT 1`, [row.sku])).rows[0];
      const gov = row.enrichment_data?.application_governance || {};
      const authority = ev?.evidence_authority || gov.evidence_authority;
      const source = ev?.source_url || gov.evidence_url;
      if (!authority || !source) throw new Error('NO_PREVIOUS_EVIDENCE ' + row.sku);
      const list = [...current, ENTRY];
      await applyVerifiedApplications(db, { sku: row.sku, equipment_applications: list,
        evidence: { authority, source_url: source, evidence_hash: ev?.evidence_hash || gov.evidence_hash || sha({ sku: row.sku, source }), metadata: { method: 'kept-from-previous-evidence' } } });
      const payloadHash = await dbJsonHash(db, list);
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku: row.sku, ENTRY, JAC_PAGE }), metadata: { method: 'distributor-page-operator-directed', distributor: 'Petroil Venezuela', model: 'JAC HFC4253K3R1', engine: '6L 11.6L 420HP TURBO INTERCOOLER (as stated by the distributor)', fitment: 'distributor stated, not an official JAC sheet' } });
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
