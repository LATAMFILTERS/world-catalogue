'use strict';

/**
 * Remove an equipment-application block that was copied onto 344 products.
 *
 * 345 active products carry the same 18 equipment entries, byte for byte:
 * motor graders 16M and 24, excavators 345 to 390, trucks 772 to 785, engines
 * 3508B to 3524B — a type and a model, no make. The block is real for one of
 * them: EF91316 (P551316) has verified evidence for exactly this payload
 * ("Donaldson official technical datasheet P551316"). The other 344 — fuel
 * filters, separators and ten Racor turbines of three different sizes — have
 * no evidence for it at all. It reached them as a copy.
 *
 * Operator order 2026-10-12: remove it. Same mechanism as run_175
 * (applyVerifiedApplications with ELIMFILTERS_GOVERNANCE as authority), which
 * records the removal as evidence and keeps the application trigger satisfied.
 *
 * Untouched: EF91316, and any row that has independent verified evidence for
 * the payload. Rows are matched on the exact payload, so a product whose
 * applications differ in any way is not affected.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const POLICY = 'run_261_remove_copied_p551316_equipment_block';
const BLOCK_MD5 = '0d6d5f80a408fa2fd8856cbc7534035b';
const ORIGIN_SKU = 'EF91316';
const EXPECTED = 344;
const SOURCE = 'ELIMFILTERS governance review 2026-10-12: equipment block copied from EF91316 (Donaldson datasheet P551316)';

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', cleared: [], kept_with_evidence: [] };

  try {
    await db.query('BEGIN');
    // the origin must still hold the block and its evidence, or the premise is gone
    const origin = await db.query(
      `SELECT 1 FROM public.elimfilters_catalog c
       JOIN public.catalog_application_evidence e ON e.sku=c.sku AND e.application_kind='EQUIPMENT' AND e.verified IS TRUE
        AND e.payload_hash = md5(c.equipment_applications::text)
       WHERE c.sku=$1 AND md5(c.equipment_applications::text)=$2`, [ORIGIN_SKU, BLOCK_MD5]);
    if (!origin.rowCount) throw new Error('ORIGIN_NO_LONGER_HOLDS_VERIFIED_BLOCK');

    const rows = (await db.query(
      `SELECT c.sku, c.codigo_base,
              EXISTS (SELECT 1 FROM public.catalog_application_evidence e
                      WHERE e.sku=c.sku AND e.application_kind='EQUIPMENT' AND e.verified IS TRUE
                        AND e.payload_hash = md5(c.equipment_applications::text)) AS has_evidence
       FROM public.elimfilters_catalog c
       WHERE md5(c.equipment_applications::text)=$1 ORDER BY c.sku FOR UPDATE OF c`, [BLOCK_MD5])).rows;
    const targets = rows.filter(r => !r.has_evidence);
    report.kept_with_evidence = rows.filter(r => r.has_evidence).map(r => r.sku);
    if (targets.some(r => r.sku === ORIGIN_SKU)) throw new Error('ORIGIN_WOULD_BE_CLEARED');
    if (targets.length !== EXPECTED) throw new Error(`ROW_COUNT_CHANGED: expected ${EXPECTED}, found ${targets.length}`);

    for (const r of targets) {
      const evidenceHash = crypto.createHash('sha256').update(JSON.stringify({
        policy: POLICY, sku: r.sku, block_md5: BLOCK_MD5, copied_from: ORIGIN_SKU,
        action: 'REMOVE_COPIED_EQUIPMENT_APPLICATIONS',
      })).digest('hex');
      await applyVerifiedApplications(db, {
        sku: r.sku,
        equipment_applications: [],
        evidence: {
          authority: 'ELIMFILTERS_GOVERNANCE',
          source_url: SOURCE,
          evidence_hash: evidenceHash,
          metadata: {
            policy_version: POLICY,
            reason: 'The 18-entry equipment block is identical on 345 products and is evidenced only for EF91316 (Donaldson datasheet P551316). This product has no evidence for it; removed as a copy.',
            copied_from: ORIGIN_SKU,
            removed_block_md5: BLOCK_MD5,
            removed_entries: 18,
          },
        },
      });
      report.cleared.push(r.sku);
    }

    report.still_holding_block = (await db.query(
      `SELECT sku FROM public.elimfilters_catalog WHERE md5(equipment_applications::text)=$1 ORDER BY sku`, [BLOCK_MD5])).rows.map(r => r.sku);
    report.by_family = (await db.query(
      `SELECT left(sku,3) AS family, count(*)::int AS rows FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) GROUP BY 1 ORDER BY 1`,
      [report.cleared])).rows;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify({ ...report, cleared: report.cleared.length }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
