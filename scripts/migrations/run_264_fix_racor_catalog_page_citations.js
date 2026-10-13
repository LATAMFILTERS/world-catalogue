'use strict';

/**
 * Correct the page numbers cited from the Parker Racor catalog.
 *
 * run_251, run_252, run_253, run_260, run_262 and run_263 recorded evidence as
 * "RacorCatalog.pdf ... PDF page N". Those N were positions in the extracted
 * text, split on form feeds — and that extraction has 1,302 breaks for a PDF of
 * 888 pages, so N is not a page of the file. The content cited is right; the
 * page number is wrong.
 *
 * Each cited position was matched to the catalog's own printed page label and
 * then to the real page of the file (the page whose text carries that label
 * and the same part number):
 *   357 -> A180 (PDF page 202)    371 -> A194 (216)    372 -> A195 (217)
 *   442 -> A251 (273)             444 -> A253 (275)    448 -> A257 (279)
 *   450 -> A259 (281)             452 -> A261 (283)
 *
 * The citation becomes "printed page A194 (PDF page 216)". The printed label is
 * the stable reference. Only the text of evidence notes changes: 50 governance
 * notes and 50 evidence rows.
 *
 * The header comments of the six earlier scripts keep the old numbers; this
 * file is the correction of record. The other PDFs cited this session
 * (Donaldson F112100 and F116023, Racor 7529) were checked and their page
 * numbers are real.
 *
 * Dry-run by default (everything runs, then ROLLBACK). Pass --execute to COMMIT.
 */

require('dotenv').config();
const { Client } = require('pg');

const APPLY = process.argv.includes('--execute');
const MARK = 'RacorCatalog.pdf';
// extracted-text position -> [printed label, real PDF page]
const MAP = {
  357: ['A180', 202], 371: ['A194', 216], 372: ['A195', 217], 442: ['A251', 273],
  444: ['A253', 275], 448: ['A257', 279], 450: ['A259', 281], 452: ['A261', 283],
};
const EXPECTED = 50;

function fix(text) {
  return text.replace(/PDF page (\d+)/g, (all, n) => {
    const hit = MAP[n];
    if (!hit) throw new Error(`UNMAPPED_PAGE ${n}`);
    return `printed page ${hit[0]} (PDF page ${hit[1]})`;
  });
}

(async () => {
  if (fix('x, PDF page 371: S3201S') !== 'x, printed page A194 (PDF page 216): S3201S') throw new Error('SELF_CHECK');
  // a note that was already corrected carries a real page number, which is not in the map
  let refusedTwice = false;
  try { fix(fix('PDF page 372')); } catch (_) { refusedTwice = true; }
  if (!refusedTwice) throw new Error('SELF_CHECK_SECOND_PASS_MUST_FAIL');

  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB URL missing');
  const local = /@(127\.0\.0\.1|localhost)[:/]/.test(url);
  const db = new Client({ connectionString: url, ssl: local ? false : { rejectUnauthorized: false } });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', governance_notes: 0, evidence_rows: 0 };

  try {
    await db.query('BEGIN');
    const pending = `like '%${MARK}%' AND`;
    const gov = (await db.query(
      `SELECT sku, enrichment_data->'codigo_base_governance'->>'evidence_note' AS note FROM public.elimfilters_catalog
       WHERE enrichment_data->'codigo_base_governance'->>'evidence_note' ${pending}
             enrichment_data->'codigo_base_governance'->>'evidence_note' NOT LIKE '%printed page%' FOR UPDATE`)).rows;
    for (const r of gov) {
      await db.query(
        `UPDATE public.elimfilters_catalog
         SET enrichment_data=jsonb_set(enrichment_data, '{codigo_base_governance,evidence_note}', to_jsonb($2::text))
         WHERE sku=$1`, [r.sku, fix(r.note)]);
      report.governance_notes += 1;
    }
    const ev = (await db.query(
      `SELECT id, source_url FROM public.catalog_codigo_base_evidence
       WHERE source_url ${pending} source_url NOT LIKE '%printed page%' FOR UPDATE`)).rows;
    for (const r of ev) {
      await db.query('UPDATE public.catalog_codigo_base_evidence SET source_url=$2 WHERE id=$1', [r.id, fix(r.source_url)]);
      report.evidence_rows += 1;
    }
    if (report.governance_notes !== EXPECTED || report.evidence_rows !== EXPECTED) {
      throw new Error(`COUNT_CHANGED: governance ${report.governance_notes}, evidence ${report.evidence_rows}, expected ${EXPECTED} each`);
    }
    report.sample = (await db.query(
      `SELECT sku, enrichment_data->'codigo_base_governance'->>'evidence_note' AS note FROM public.elimfilters_catalog
       WHERE sku = ANY($1::text[]) ORDER BY sku`, [['ET93204S', 'ET92040S', 'ET90900']])).rows;
    report.old_style_left = (await db.query(
      `SELECT count(*)::int AS n FROM public.catalog_codigo_base_evidence WHERE source_url LIKE '%${MARK}%' AND source_url NOT LIKE '%printed page%'`)).rows[0].n;
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
