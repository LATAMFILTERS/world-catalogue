'use strict';

/**
 * Remove 15 equipment-application lists that are repeated, byte for byte,
 * across many products.
 *
 * Grouping products by md5(equipment_applications::text) shows 15 lists held
 * by 10 or more products each (852, 550, 76, 60, 33, 28, 22, 16, 14, 13, 13,
 * 11, 11, 11, 10). None of those products has application evidence. Checked
 * against the Donaldson product pages the scraper captured
 * (donaldson_*_results.json), three kinds of list appear:
 *
 *  - the list is exactly one product's page (EL82016/P502016, EH66488/P566488,
 *    EH66373/P566373, EH66278/P566278) and was copied to the rest;
 *  - the list is larger than any product's page (EH65239/P165239 has 191 of
 *    378, EH64166/P164166 23 of 183, EH665875/P165875 7 of 691,
 *    EH65015/P165015 3 of 13) — a merge of several pages spread over a group;
 *  - no captured page has any of it (Kenworth N14 trucks on 550 air filters,
 *    housings and dryers; 19,271 entries starting with Chevrolet Prizm on 28
 *    hydraulic filters; and so on).
 *
 * Of the captured pages of the other member products, every one lists no
 * equipment at all, or none of the list's. Products without a captured page
 * are cleared on the same ground as run_261: one identical list cannot be the
 * verified application set of that many different filters.
 *
 * What this does, through applyVerifiedApplications (as run_261):
 *  - the 4 exact owners keep their list, now with Donaldson evidence;
 *  - the 4 partial owners are reduced to the rows of their own page;
 *  - every other holder of one of the 15 lists is emptied.
 * The owners' page rows are in run_272_owner_page_equipment.json.
 *
 * Operator order 2026-10-12 ("prepara la limpieza"). Review files:
 * C:/ELIMSERVER/evidence/repeated-equipment-lists-20261012/
 *
 * Rows are matched on the exact payload, so a product whose applications
 * differ in any way is not affected. A row that already has verified evidence
 * for the payload is left alone.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');
const OWNERS = require('./run_272_owner_page_equipment.json');

const APPLY = process.argv.includes('--execute');
const POLICY = 'run_272_remove_repeated_equipment_lists';
const LISTS = [
  '98212b8a5d5a823c2a77423621a6a8de', '3b6c13853c4b12e4f88f01a88cdff9d3', '59ef63e1f1573d3f632083856ed94b86',
  '63a07d5cbb9d814636f454cc23f57653', '87fcd71d28a814493198153e0ae67fa1', '7de525288104ca4db9f2a740b622d3ae',
  'f78eabb1e1d3108377cb6b9599723854', '80f02e45970f05081d9685c4283e123d', 'dd84fc7166e761ec8a30e8cebce4a1e3',
  '37ba4229170ace3220f4916eb04192ac', '5adc842682c2db1680827b471b7b435b', '11de10ea6f43c61a7998caa4f28d75d4',
  'b915e878472ac785383d1f3816d21693', 'ad6ed923fd84d174757901043da87de8', '37cb13539d1f3c613ba4344d9afccf3b',
];
const EXPECTED = { cleared: 1712, owners: 8 };
const GOV_SOURCE = 'ELIMFILTERS governance review 2026-10-12: equipment list repeated identically across many products, no evidence for this product';
const sha = (o) => crypto.createHash('sha256').update(JSON.stringify(o)).digest('hex');

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', cleared: 0, owners: [], kept_with_evidence: [], per_list: {} };

  try {
    await db.query('BEGIN');
    const rows = (await db.query(
      `SELECT c.sku, c.codigo_base, md5(c.equipment_applications::text) AS h,
              jsonb_array_length(c.equipment_applications) AS entries,
              EXISTS (SELECT 1 FROM public.catalog_application_evidence e
                      WHERE e.sku=c.sku AND e.application_kind='EQUIPMENT' AND e.verified IS TRUE
                        AND e.payload_hash = md5(c.equipment_applications::text)) AS has_evidence
       FROM public.elimfilters_catalog c
       WHERE md5(c.equipment_applications::text) = ANY($1::text[]) ORDER BY c.sku FOR UPDATE OF c`, [LISTS])).rows;

    // every owner must still hold the list it was reviewed with
    for (const [sku, o] of Object.entries(OWNERS)) {
      const r = rows.find(x => x.sku === sku);
      if (!r || r.h !== o.list_md5 || r.codigo_base !== o.codigo_base) throw new Error(`OWNER_CHANGED ${sku}`);
    }

    for (const r of rows) {
      if (r.has_evidence) { report.kept_with_evidence.push(r.sku); continue; }
      const owner = OWNERS[r.sku];
      if (owner) {
        await applyVerifiedApplications(db, {
          sku: r.sku,
          equipment_applications: owner.equipment,
          evidence: {
            authority: 'DONALDSON',
            source_url: `shop.donaldson.com product page ${owner.codigo_base}, Equipment (scraper capture, ${owner.source_file})`,
            evidence_hash: sha({ policy: POLICY, sku: r.sku, equipment: owner.equipment }),
            metadata: {
              policy_version: POLICY,
              reason: 'Equipment rows of this product\'s own Donaldson page. The stored list was shared with other products; rows not on this page were removed.',
              entries_before: r.entries,
              entries_after: owner.equipment.length,
            },
          },
        });
        report.owners.push({ sku: r.sku, before: r.entries, after: owner.equipment.length });
        continue;
      }
      await applyVerifiedApplications(db, {
        sku: r.sku,
        equipment_applications: [],
        evidence: {
          authority: 'ELIMFILTERS_GOVERNANCE',
          source_url: GOV_SOURCE,
          evidence_hash: sha({ policy: POLICY, sku: r.sku, list_md5: r.h, action: 'REMOVE_REPEATED_EQUIPMENT_LIST' }),
          metadata: {
            policy_version: POLICY,
            reason: 'This equipment list is identical on 10 or more products and this product has no evidence for it; removed as a copy.',
            removed_list_md5: r.h,
            removed_entries: r.entries,
          },
        },
      });
      report.cleared += 1;
      report.per_list[r.h.slice(0, 8)] = (report.per_list[r.h.slice(0, 8)] || 0) + 1;
    }

    if (report.cleared !== EXPECTED.cleared || report.owners.length !== EXPECTED.owners) {
      throw new Error(`ROW_COUNT_CHANGED: cleared ${report.cleared} (expected ${EXPECTED.cleared}), owners ${report.owners.length} (expected ${EXPECTED.owners})`);
    }
    report.still_holding_a_list = (await db.query(
      `SELECT sku FROM public.elimfilters_catalog WHERE md5(equipment_applications::text) = ANY($1::text[]) ORDER BY sku`, [LISTS])).rows.map(r => r.sku);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
