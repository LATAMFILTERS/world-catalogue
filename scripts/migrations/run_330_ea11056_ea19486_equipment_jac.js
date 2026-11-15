'use strict';

/**
 * EA11056 (primary) and EA19486 (its Donaldson safety element, P539486 lists P181056 as the related primary) share
 * the same equipment list: the 4 Donaldson-backed applications of EA11056 plus JAC HFC-1131KR (Cummins C230-20 8.3 L,
 * client/distributor supplied, same entry as the kit EK50928). Two evidence rows per SKU, one per authority.
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
const JAC_PAGE = 'https://jacvenezuela.com/portfolio/bufalo-12-ton/';
const JAC = { type: 'TRUCK', engine: 'CUMMINS C230-20 8.3L', equipment: 'JAC HFC-1131KR', equipment_options: 'BUFALO (JAC VENEZUELA)' };
const TARGETS = {
  EA11056: 'https://shop.donaldson.com/store/en-us/search?Ntt=P181056',
  EA19486: 'https://shop.donaldson.com/store/es-us/product/P539486/19919',
};
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
    const rows = (await db.query('SELECT sku, equipment_applications, enrichment_data FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) FOR UPDATE', [Object.keys(TARGETS)])).rows;
    const by = Object.fromEntries(rows.map((r) => [r.sku, r]));
    if (!by.EA11056 || !by.EA19486) throw new Error('SKU_NOT_FOUND');
    const base = by.EA11056.equipment_applications.filter((x) => key(x) !== key(JAC));
    if (base.length !== 4) throw new Error('UNEXPECTED_PRIMARY_EQUIPMENT ' + base.length);
    const list = [...base, JAC];
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows }, null, 2));
    const payloadHash = await dbJsonHash(db, list);
    for (const [sku, source] of Object.entries(TARGETS)) {
      await applyVerifiedApplications(db, {
        sku, equipment_applications: list,
        evidence: { authority: 'DONALDSON', source_url: source, evidence_hash: sha({ sku, list, source }),
          metadata: { method: sku === 'EA19486' ? 'safety-element-inherits-primary-P181056' : 'donaldson-official-equipment-list', primary_sku: 'EA11056', safety_sku: 'EA19486' } },
      });
      for (const kind of ['EQUIPMENT', 'ENGINE']) {
        await insertEvidence(db, { sku, kind, payloadHash, evidenceAuthority: 'DISTRIBUTOR_PAGE_OPERATOR_SUPPLIED', sourceUrl: JAC_PAGE,
          evidenceHash: sha({ sku, JAC, JAC_PAGE }), metadata: { method: 'operator-pasted-distributor-page', entry: 'JAC HFC-1131KR', fitment: 'distributor/client supplied, not official', vehicle_engine_source: 'JAC Venezuela official Bufalo page (Cummins C230-20 8.3 L)' } });
      }
      const s = (await db.query('SELECT equipment_applications FROM public.elimfilters_catalog WHERE sku=$1', [sku])).rows[0];
      if (s.equipment_applications.length !== 5 || !s.equipment_applications.some((x) => key(x) === key(JAC))) throw new Error('POST_WRITE_VERIFICATION_FAILED ' + sku);
      report.skus[sku] = { equipment: s.equipment_applications.length };
    }
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
