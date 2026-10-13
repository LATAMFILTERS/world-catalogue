'use strict';

/**
 * EH60416 (Donaldson P550416): add the two equipment rows of Donaldson's page
 * that the catalog row lacks.
 *
 * Donaldson's P550416 page lists 50 equipment rows; the row holds 48. Compared
 * row by row (equipment + engine), the 48 are all on the page and two are
 * missing from the catalog:
 *   XCMG GR135T    GRADER   CUMMINS 6BT5.9
 *   XCMG GR1905T   GRADER   SHANGHAI DIESEL SC7H190.2G2
 * The page's 87 cross references are all on the row already.
 *
 * Page text pasted by the operator on 2026-10-12 (Donaldson's store still
 * refuses this machine); the lists are kept in
 * C:/ELIMSERVER/evidence/donaldson-pages-pasted-20261012/P550416-page-lists.json
 *
 * Written through applyVerifiedApplications, which records the evidence the
 * application trigger requires. The two rows go where the page has them,
 * before ZF 130; nothing else in the list changes.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const crypto = require('crypto');
const { Client } = require('pg');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const SKU = 'EH60416';
const BASE = 'P550416';
const POLICY = 'run_271_eh60416_add_xcmg_applications';
const SOURCE = 'shop.donaldson.com product page P550416, Equipment (page text pasted by the operator 2026-10-12)';
const ADD = [
  { type: 'GRADER', engine: 'CUMMINS 6BT5.9', equipment: 'XCMG GR135T' },
  { type: 'GRADER', engine: 'SHANGHAI DIESEL SC7H190.2G2', equipment: 'XCMG GR1905T' },
];
const BEFORE = 'ZF 130'; // the page lists the XCMG rows just before this one

(async () => {
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();

  try {
    await db.query('BEGIN');
    const found = await db.query('SELECT sku, codigo_base, equipment_applications FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU]);
    if (found.rowCount !== 1) throw new Error(`SKU_MISSING ${SKU}`);
    const row = found.rows[0];
    if (row.codigo_base !== BASE) throw new Error(`BASE_CHANGED: found ${row.codigo_base}`);
    const current = Array.isArray(row.equipment_applications) ? row.equipment_applications : [];
    if (current.length !== 48) throw new Error(`EQUIPMENT_COUNT_CHANGED: expected 48, found ${current.length}`);
    if (current.some(e => /^XCMG /.test(e.equipment || ''))) throw new Error('XCMG_ALREADY_PRESENT');
    const at = current.findIndex(e => e.equipment === BEFORE);
    if (at < 0) throw new Error(`ANCHOR_ROW_MISSING ${BEFORE}`);

    const next = [...current.slice(0, at), ...ADD, ...current.slice(at)];
    const evidenceHash = crypto.createHash('sha256').update(JSON.stringify({ policy: POLICY, sku: SKU, added: ADD })).digest('hex');
    await applyVerifiedApplications(db, {
      sku: SKU,
      equipment_applications: next,
      evidence: {
        authority: 'DONALDSON',
        source_url: SOURCE,
        evidence_hash: evidenceHash,
        metadata: {
          policy_version: POLICY,
          reason: 'The 48 existing rows are all on the Donaldson page; these two page rows were missing from the catalog.',
          added: ADD,
          page_equipment_rows: 50,
          pasted_by: 'OPERATOR',
          read_by_automation: false,
        },
      },
    });

    const after = await db.query(
      `SELECT jsonb_array_length(equipment_applications) AS n,
              (SELECT jsonb_agg(x) FROM jsonb_array_elements(equipment_applications) x WHERE x->>'equipment' LIKE 'XCMG %') AS xcmg
       FROM public.elimfilters_catalog WHERE sku=$1`, [SKU]);
    if (after.rows[0].n !== 50) throw new Error(`UNEXPECTED_COUNT_AFTER ${after.rows[0].n}`);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    console.log(JSON.stringify({ mode: APPLY ? 'execute' : 'dry-run', sku: SKU, equipment_rows: after.rows[0].n, added: after.rows[0].xcmg,
      transaction: APPLY ? 'COMMIT' : 'ROLLBACK' }, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch(e => { console.error(e.stack || e); process.exit(1); });
