'use strict';

/**
 * JAC CHUTO 4251 430 HP (Weichai WP12.430E201, 11.6 L) as an equipment application of the elements that hold the
 * OEM numbers of the Venezuela catalogue card: oil EL83771 (61000070005), fuel EF90036 (612600081334), fuel/water
 * ES90017 (612600081335), air EK50928 (1109010G1510-1) with its components EA11056/EA19486, secondary EA18040
 * (28120Y3070). Model and engine come from the official JAC Venezuela page; the filter link is derived from the
 * Weichai/JAC OEM part numbers, not stated by JAC. The previous evidence of each SKU is kept; one extra evidence
 * row (authority JAC_VENEZUELA_OFFICIAL_MODEL_PAGE) is added per SKU.
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
const JAC_PAGE = 'https://jacvenezuela.com/portfolio/chuto-4251-430-hp/';
const SKUS = ['EL83771', 'EF90036', 'ES90017', 'EK50928', 'EA18040', 'EA11056', 'EA19486'];
const ENTRY = { type: 'TRUCK', engine: 'WEICHAI WP12.430E201 11.6L', equipment: 'JAC CHUTO 4251 430 HP', equipment_options: 'JAC VENEZUELA' };
const key = (x) => `${x.equipment}|${x.engine}`;

if (require.main === module) (async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  const db = new Client({ connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } });
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
        await insertEvidence(db, { sku: row.sku, kind, payloadHash, evidenceAuthority: 'JAC_VENEZUELA_OFFICIAL_MODEL_PAGE', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku: row.sku, ENTRY, JAC_PAGE }), metadata: { method: 'official-model-page + OEM part-number cross', model: 'JAC CHUTO 4251 430 HP', engine: 'Weichai WP12.430E201 11.6 L Euro II', fitment: 'derived from Weichai/JAC OEM numbers, not stated by JAC' } });
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
