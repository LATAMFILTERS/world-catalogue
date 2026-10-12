'use strict';

/**
 * Remove oem_codes / competitor_codes entries that are scraper table debris,
 * not cross references. Only entries recognisable by their own shape:
 *
 *   RELATION    manufacturer is a relation label ("USES SERVICE PART", "UPGRADE OF")
 *   PAGE_LABEL  code is a spec/page label ("LENGTH", "PRODUCT DESCRIPTION"), or the
 *               manufacturer is a page heading
 *   SPEC_VALUE  manufacturer is a measurement ("8.85 INCH / 224.79 MM"), a test
 *               standard or a spec label
 *   PART_CODE   manufacturer is itself a part code known to the catalog AND the
 *               code is a part number too (related-part pairs like FH23000/FS1010)
 *
 * Left alone on purpose: swapped pairs (brand name in the code slot, part number
 * in the manufacturer slot) and any pair that looks like a normal cross.
 *
 * The removed rows stay in backup_scrape_garbage_removal_20261012.
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 * Safe to re-run: a clean catalog yields zero changes.
 */

require('dotenv').config();
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const BACKUP = 'backup_scrape_garbage_removal_20261012';

const RELATION = new Set([
  'UPGRADE OF', 'SAFETY ELEMENT USED WITH', 'PRIMARY AIR FILTER USED WITH', 'FILTER USED WITH',
  'FOR UPGRADE, USE', 'USES SERVICE PART', 'USES SERVICE GASKET', 'USED WITH', 'IS AN ELEMENT FOR',
  'USES FILTER HEAD', 'IS A LONGER VERSION OF', 'HEAD USED WITH', 'HOUSING USED WITH', 'USES ELEMENT',
  'RELATED PARTS',
]);
// same label list as scripts/diag_scraper_label_garbage.sql, normalized
const LABEL_CODES = new Set([
  'LENGTH', 'THREADSIZE', 'LARGESTOD', 'LARGESTID', 'HEIGHT', 'WIDTH', 'INNERDIAMETER', 'OUTERDIAMETER',
  'PRODUCTDESCRIPTION', 'RELATEDPARTS', 'REPLACES', 'REPLACEDBY', 'MEDIATYPE', 'DOWNLOADSPECS',
  'EFFICIENCY', 'FAMILY', 'STYLE', 'TYPE',
]);
const PAGE_HEADINGS = new Set(['DOWNLOAD SPECS', 'THIS PRODUCT IS OBSOLETE', 'PRODUCT DESCRIPTION']);
const SPEC_LABELS = new Set([
  'EMULSIFIED WATER SEPARATION', 'ELEMENT COLLAPSE/BURST, MIN', 'PRIMARY PARTICLE EFFICIENCY',
  'MICRON RATING BY SAE J 1985', 'EFFICIENCY, TWA BY SAE J 1985', 'FREE WATER SEPARATION',
  'HYDROSTATIC BURST MINIMUM', 'GASKET INSIDE DIAMETER',
]);
const MEASUREMENT = /^[\d.,]+\s*(INCH|IN|MM|PSI|KPA|MICRON|GPM|L\/M|%)/;
const TEST_STANDARD = /^(ISO|SAE) ?J? ?\d[\d-]*( MM)?$/;
const PART_CODE = /^[A-Z]{1,3}[0-9]{3,}[A-Z]{0,3}$/;

const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');

function classify(entry, knownCodes) {
  if (!entry || typeof entry !== 'object') return null;
  const mfr = String(entry.manufacturer || '').trim().toUpperCase();
  const rawCode = String(entry.code || entry.reference || '');
  const code = norm(rawCode);
  if (RELATION.has(mfr)) return 'RELATION';
  if (LABEL_CODES.has(code) || PAGE_HEADINGS.has(mfr)) return 'PAGE_LABEL';
  if (MEASUREMENT.test(mfr) || TEST_STANDARD.test(mfr) || SPEC_LABELS.has(mfr)) return 'SPEC_VALUE';
  if (PART_CODE.test(mfr) && /\d/.test(rawCode) && knownCodes.has(norm(mfr))) return 'PART_CODE';
  return null;
}

function selfCheck() {
  const known = new Set(['FS1010']);
  const cases = [
    [{ code: '3308844S', manufacturer: 'USES SERVICE PART' }, 'RELATION'],
    [{ code: 'LENGTH', manufacturer: '8.85 INCH / 224.79 MM' }, 'PAGE_LABEL'],
    [{ code: '0.98', manufacturer: 'EMULSIFIED WATER SEPARATION' }, 'SPEC_VALUE'],
    [{ code: 'APPLICABLE REGION', manufacturer: '2.01 GPM / 7.60 L/MIN' }, 'SPEC_VALUE'],
    [{ code: 'FH23000', manufacturer: 'FS1010' }, 'PART_CODE'],
    [{ code: 'GREYFRIARS', manufacturer: 'FS1010' }, null], // swapped pair: left alone
    [{ code: 'FH23000', manufacturer: 'ZZ9999' }, null], // manufacturer not a known part code
    [{ code: '1R0749', manufacturer: 'CATERPILLAR' }, null],
    [{ code: 'ST100', manufacturer: 'SEPARATION-TECHNOLOGIES' }, null],
    [{ code: '4720900551', manufacturer: '3M' }, null],
  ];
  for (const [entry, expected] of cases) {
    const got = classify(entry, known);
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

    // every part number the catalog knows: bases and cited codes
    const knownCodes = new Set();
    for (const row of rows) {
      knownCodes.add(norm(row.codigo_base));
      for (const field of ['oem_codes', 'competitor_codes']) {
        for (const e of Array.isArray(row[field]) ? row[field] : []) knownCodes.add(norm(e && (e.code || e.reference)));
      }
    }
    knownCodes.delete('');

    await db.query(
      `CREATE TABLE IF NOT EXISTS public.${BACKUP} (sku text, oem_codes jsonb, competitor_codes jsonb, backed_up_at timestamptz DEFAULT now())`);

    for (const row of rows) {
      const patch = {};
      const removed = [];
      for (const field of ['oem_codes', 'competitor_codes']) {
        const before = Array.isArray(row[field]) ? row[field] : [];
        const after = [];
        for (const entry of before) {
          const klass = classify(entry, knownCodes);
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
