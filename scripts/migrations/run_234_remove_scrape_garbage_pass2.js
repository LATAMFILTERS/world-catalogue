'use strict';

/**
 * Second pass of run_233: scraper table debris whose "manufacturer" is a part
 * number, a thread size or page text. A manufacturer is never one of these, so
 * the entry cannot be a cross reference as stored.
 *
 *   PART_NUMBER_MFR  manufacturer is a single part-number token or digit groups
 *                    ("3895084S", "97385488", "1 457 431 707") and the code is a
 *                    part number too
 *   PAGE_LABEL       code is a page label run_233 did not list ("RATED FLOW",
 *                    "SPECIFICATION", "APPLICABLE REGION", "GASKET OD", "UPGRADE OF")
 *   SPEC_VALUE       manufacturer is a thread size, an air-flow value or a
 *                    marketing sentence
 *
 * Left alone on purpose: swapped pairs (brand name in the code slot, part number
 * in the manufacturer slot) and any pair that looks like a normal cross.
 *
 * The removed rows stay in backup_scrape_garbage_removal_pass2_20261012.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 * Safe to re-run: a clean catalog yields zero changes.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const BACKUP = 'backup_scrape_garbage_removal_pass2_20261012';

const LABEL_CODES = new Set(['RATEDFLOW', 'SPECIFICATION', 'APPLICABLEREGION', 'GASKETOD', 'UPGRADEOF']);
const THREAD = /^(M\d+X[\d.]+-\d[A-Z]|[\d.\-/ ]+(UNF|UNC|UNEF|NPT|NPTF)\b.*)$/;
const AIR_FLOW = /^[\d.,]+\s*(CFM|CU\. M\/M)/;
const SENTENCE_LENGTH = 80;
const PART_TOKEN = /^[A-Z0-9]+$/;
const DIGIT_GROUPS = /^[\d .]+$/;

const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function classify(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const mfr = String(entry.manufacturer || '').trim().toUpperCase();
  const code = String(entry.code || entry.reference || '').trim().toUpperCase();
  if (LABEL_CODES.has(norm(code))) return 'PAGE_LABEL';
  if (THREAD.test(mfr) || AIR_FLOW.test(mfr) || mfr.length > SENTENCE_LENGTH) return 'SPEC_VALUE';
  const digits = (mfr.match(/\d/g) || []).length;
  if (/\d/.test(code) && digits >= 3 && (PART_TOKEN.test(mfr) || DIGIT_GROUPS.test(mfr))) return 'PART_NUMBER_MFR';
  return null;
}

function selfCheck() {
  const cases = [
    [{ code: 'FS1010', manufacturer: '3895084S' }, 'PART_NUMBER_MFR'],
    [{ code: 'FS1010', manufacturer: 'FS1020' }, 'PART_NUMBER_MFR'],
    [{ code: '986BF0201', manufacturer: '1 457 431 707' }, 'PART_NUMBER_MFR'],
    [{ code: 'RATED FLOW', manufacturer: '1-14 UNF 2B' }, 'PAGE_LABEL'],
    [{ code: 'LF667', manufacturer: '1.125-16 UNF 2B' }, 'SPEC_VALUE'],
    [{ code: 'LF3000', manufacturer: 'M95X2.5-7H' }, 'SPEC_VALUE'],
    [{ code: 'GENERAL MOTORS', manufacturer: '97385488' }, null], // swapped pair: left alone
    [{ code: '1R0749', manufacturer: 'CATERPILLAR' }, null],
    [{ code: '4720900551', manufacturer: '3M' }, null],
    [{ code: 'A4711800209', manufacturer: 'DDE A4711800209' }, null], // brand word present
    [{ code: 'ST100', manufacturer: 'SELECT-500' }, null],
  ];
  for (const [entry, expected] of cases) {
    const got = classify(entry);
    if (got !== expected) throw new Error(`SELF_CHECK ${JSON.stringify(entry)} -> ${got}, expected ${expected}`);
  }
}

(async () => {
  selfCheck();
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', by_class: {}, skus: 0, entries: 0, legacy_rows_deleted: 0, top: [] };

  try {
    await db.query('BEGIN');
    const { rows } = await db.query(
      `SELECT sku, codigo_base, duty, filter_type, oem_codes, competitor_codes
         FROM public.elimfilters_catalog ORDER BY sku FOR UPDATE`);

    await db.query(
      `CREATE TABLE IF NOT EXISTS public.${BACKUP} (sku text, oem_codes jsonb, competitor_codes jsonb, backed_up_at timestamptz DEFAULT now())`);

    for (const row of rows) {
      const patch = {};
      const removed = [];
      for (const field of ['oem_codes', 'competitor_codes']) {
        const before = Array.isArray(row[field]) ? row[field] : [];
        const after = [];
        for (const entry of before) {
          const klass = classify(entry);
          if (klass) removed.push({ field, klass, entry });
          else after.push(entry);
        }
        if (after.length !== before.length) patch[field] = after;
      }
      if (!removed.length) continue;

      assertGovernedCatalogPatch(row, patch, { rejectionCleanup: true });
      await db.query(
        `INSERT INTO public.${BACKUP}(sku, oem_codes, competitor_codes) VALUES ($1, $2::jsonb, $3::jsonb)`,
        [row.sku, JSON.stringify(row.oem_codes), JSON.stringify(row.competitor_codes)]);
      // trg_sync_crossref_cache rebuilds crossref_resolved_cache for the row on this update
      await db.query(
        `UPDATE public.elimfilters_catalog
            SET oem_codes = coalesce($2::jsonb, oem_codes), competitor_codes = coalesce($3::jsonb, competitor_codes)
          WHERE sku = $1`,
        [row.sku, patch.oem_codes ? JSON.stringify(patch.oem_codes) : null,
          patch.competitor_codes ? JSON.stringify(patch.competitor_codes) : null]);

      // legacy mirror is keyed by (sku, code, manufacturer): drop exactly the removed pairs
      const legacy = await db.query(
        `DELETE FROM public.oem_codes_legacy l USING unnest($2::text[], $3::text[]) AS r(code, manufacturer)
          WHERE l.sku = $1 AND l.code = r.code AND l.manufacturer = r.manufacturer`,
        [row.sku, removed.map((r) => String(r.entry.code || r.entry.reference || '')),
          removed.map((r) => String(r.entry.manufacturer || ''))]);

      report.skus += 1;
      report.entries += removed.length;
      report.legacy_rows_deleted += legacy.rowCount;
      for (const r of removed) report.by_class[r.klass] = (report.by_class[r.klass] || 0) + 1;
      report.top.push({ sku: row.sku, removed: removed.length, kept: (patch.oem_codes || row.oem_codes || []).length + (patch.competitor_codes || row.competitor_codes || []).length });
    }

    report.top = report.top.sort((a, b) => b.removed - a.removed).slice(0, 15);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 2));
  } catch (e) {
    try { await db.query('ROLLBACK'); } catch (_) {}
    throw e;
  } finally {
    await db.end();
  }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
