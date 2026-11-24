'use strict';

/**
 * HD pilot: register the Fleetguard official product page as canonical source for UNVERIFIED Heavy Duty SKUs
 * whose base code is a Fleetguard code, when Donaldson does not make the filter.
 *
 * Operator ruling 2026-11-24 (Victor Abreu): if Donaldson already makes the filter, the Fleetguard code is only a
 * cross-reference on the Donaldson SKU and no SKU is kept for it; only filters Donaldson does not make stay as
 * Fleetguard-based SKUs. For this pilot the absence of a Donaldson equivalent is recorded as an operator ruling
 * backed by two checks run by this script at execution time:
 *   1. no other active SKU lists the Fleetguard code as an alternate or exact reference (code duplicate), and
 *   2. no active Donaldson-based HD SKU shares 3 or more OEM codes with the row (OEM overlap candidate).
 * Rows that fail either check are held, never written.
 *
 * Evidence: the Fleetguard product page rendered in a browser (the site is a JavaScript app; plain HTTP returns
 * an empty shell). scripts/migrations/data/hd_fleetguard_pilot_20261124.json holds, per SKU, the URL, the page
 * heading and description, the category breadcrumb and the SHA-256 of the rendered page text. Obsolete products
 * and rows whose Fleetguard description does not match the SKU filter type are not in the data file.
 *
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file> and --confirm-count <written count of the dry run>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { normalizeCode } = require('../../lib/catalog-codigo-base-policy');
const { assertCanonicalWrite } = require('../../lib/catalog-write-gateway');
const DATA = require('./data/hd_fleetguard_pilot_20261124.json');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const CONFIRM = arg('--confirm-count');
const AT = '2026-11-24';
const MIN_OEM_OVERLAP = 3;
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const codeOf = (e) => normalizeCode((e && typeof e === 'object' ? e.code || e.reference || e.part_number : e) || '');

// Fleetguard description -> filter_type values accepted for the SKU. Anything else is held.
const TYPE_RULES = [
  [/^Air Filter(?!.*Housing)/i, ['air']],
  [/^Fuel Filter(?!.*Housing)/i, ['fuel']],
  [/^Fuel\/Water Separator/i, ['water', 'separator']],
  [/^Lube Filter/i, ['oil']],
  [/^Hydraulic(, Cartridge|, Spin-On| Filter(?!, Head))/i, ['hydraulic']],
  [/^Transmission Filter/i, ['hydraulic', 'transmission']],
  [/^Water Filter/i, ['other']],
];
const typeOk = (desc, filterType) => TYPE_RULES.some(([re, types]) => re.test(desc || '') && types.includes(String(filterType || '').toLowerCase()));
const lastFour = (v) => { const d = String(v || '').replace(/\D/g, ''); return d ? d.slice(-4).padStart(4, '0') : null; };

if (require.main === module) (async () => {
  if (APPLY && (!SNAPSHOT || CONFIRM == null)) throw new Error('SNAPSHOT_AND_CONFIRM_COUNT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  if (!url) throw new Error('DB_URL_MISSING');
  if (!/(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url)) throw new Error('DATABASE_IS_NOT_LOCAL');
  const db = new Client({ connectionString: url });
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', input: DATA.length, written: [], held: [] };
  try {
    await db.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
    const skus = DATA.map((d) => d.sku);
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [skus])).rows;
    const bySku = new Map(rows.map((r) => [r.sku, r]));
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    const owners = (await db.query(`SELECT sku, upper(regexp_replace(codigo_base,'[^A-Za-z0-9]','','g')) b FROM public.elimfilters_catalog WHERE catalog_active`)).rows;
    const ownerOf = new Map();
    for (const o of owners) { if (!ownerOf.has(o.b)) ownerOf.set(o.b, new Set()); ownerOf.get(o.b).add(o.sku); }

    for (const d of DATA) {
      const row = bySku.get(d.sku);
      const hold = (reason, extra = {}) => report.held.push({ sku: d.sku, code: d.code, reason, ...extra });
      const base = normalizeCode(d.code);
      if (!row || !row.catalog_active) { hold('SKU_NOT_ACTIVE'); continue; }
      if (row.duty !== 'HEAVY_DUTY') { hold('NOT_HEAVY_DUTY'); continue; }
      if (String(row.canonical_source_status || '').toUpperCase() !== 'UNVERIFIED') { hold('ALREADY_' + row.canonical_source_status); continue; }
      if (normalizeCode(row.codigo_base) !== base) { hold('BASE_CHANGED', { current: row.codigo_base }); continue; }
      if (!typeOk(d.description, row.filter_type)) { hold('FILTER_TYPE_MISMATCH', { description: d.description, filter_type: row.filter_type }); continue; }
      const others = [...(ownerOf.get(base) || [])].filter((s) => s !== d.sku);
      if (others.length) { hold('CODIGO_BASE_COLLISION', { others }); continue; }

      // check 1: code duplicate elsewhere
      const dupAlt = (await db.query(
        `SELECT DISTINCT c.sku FROM public.elimfilters_catalog c
          WHERE c.catalog_active AND c.sku <> $1 AND c.duty = 'HEAVY_DUTY'
            AND EXISTS (SELECT 1 FROM jsonb_array_elements(CASE WHEN jsonb_typeof(c.competitor_codes)='array' THEN c.competitor_codes ELSE '[]'::jsonb END) e
                         WHERE upper(regexp_replace(coalesce(e->>'code',''),'[^A-Za-z0-9]','','g')) = $2)`, [d.sku, base])).rows.map((r) => r.sku);
      const dupRef = (await db.query(
        `SELECT DISTINCT e.sku FROM public.exact_part_reference e JOIN public.elimfilters_catalog c ON c.sku=e.sku AND c.catalog_active AND c.duty='HEAVY_DUTY'
          WHERE e.sku <> $1 AND upper(regexp_replace(e.part_number,'[^A-Za-z0-9]','','g')) = $2`, [d.sku, base])).rows.map((r) => r.sku);
      const dup = [...new Set([...dupAlt, ...dupRef])];
      if (dup.length) { hold('DUPLICATE_BY_CODE', { with: dup }); continue; }

      // check 2: OEM overlap with a Donaldson-based SKU
      const oemOverlap = (await db.query(
        `WITH mine AS (SELECT DISTINCT upper(regexp_replace(x->>'code','[^A-Za-z0-9]','','g')) o
                         FROM jsonb_array_elements(CASE WHEN jsonb_typeof($2::jsonb)='array' THEN $2::jsonb ELSE '[]'::jsonb END) x
                        WHERE length(regexp_replace(coalesce(x->>'code',''),'[^A-Za-z0-9]','','g')) >= 6)
         SELECT c.sku, count(DISTINCT upper(regexp_replace(y->>'code','[^A-Za-z0-9]','','g'))) shared
           FROM public.elimfilters_catalog c,
                LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(c.oem_codes)='array' THEN c.oem_codes ELSE '[]'::jsonb END) y
          WHERE c.catalog_active AND c.duty='HEAVY_DUTY' AND c.canonical_source_brand = 'DONALDSON' AND c.sku <> $1
            AND upper(regexp_replace(y->>'code','[^A-Za-z0-9]','','g')) IN (SELECT o FROM mine)
          GROUP BY c.sku HAVING count(DISTINCT upper(regexp_replace(y->>'code','[^A-Za-z0-9]','','g'))) >= $3
          ORDER BY shared DESC LIMIT 3`, [d.sku, JSON.stringify(row.oem_codes || []), MIN_OEM_OVERLAP])).rows;
      if (oemOverlap.length) { hold('DONALDSON_CANDIDATE_BY_OEM', { donaldson: oemOverlap }); continue; }

      const old = row.enrichment_data && typeof row.enrichment_data === 'object' ? row.enrichment_data : {};
      const oem = (Array.isArray(row.oem_codes) ? row.oem_codes : []).filter((e) => codeOf(e) !== base);
      const comp = (Array.isArray(row.competitor_codes) ? row.competitor_codes : []).filter((e) => codeOf(e) !== base);
      const removed = (row.oem_codes || []).length + (row.competitor_codes || []).length - oem.length - comp.length;
      const gov = {
        ...(old.codigo_base_governance || {}),
        state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', policy_version: '2026-08-19-v3.1',
        required_authority: 'VERIFIED_AFTERMARKET_FALLBACK', verified_at: AT + 'T00:00:00.000Z',
        approved_codigo_base: base, current_codigo_base: base, previous_codigo_base: row.codigo_base,
        approved_manufacturer: 'FLEETGUARD', approved_source_column: 'COMPETITOR_CODES',
        primary_manufacturer_verified: false, fallback_manufacturer_verified: true, fallback_commercial_code_verified: true,
        evidence_authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', evidence_kind: 'OFFICIAL_RENDERED_PRODUCT_PAGE',
        evidence_url: d.url, evidence_hash: d.page_text_sha256, verification_method: 'FLEETGUARD_RENDERED_PRODUCT_PAGE_PLUS_OPERATOR_RULING_20261124',
        donaldson_absence_verified: true,
        donaldson_absence_note: `ELIMFILTERS operator ruling 2026-11-24 (pilot run_400): no Donaldson equivalent known. Checked at execution: no active HD SKU lists ${d.code} as alternate or exact reference, and no Donaldson-based HD SKU shares ${MIN_OEM_OVERLAP} or more OEM codes with this SKU.`,
        contamination_flags: [], alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY',
        oem_code_count: oem.length, competitor_code_count: comp.length, base_removed_from_alternates: removed,
      };
      const next = { ...row, oem_codes: oem, competitor_codes: comp, codigo_base: base, enrichment_data: { ...old, codigo_base_governance: gov } };
      try { assertCanonicalWrite(next, { validateApplications: false }); }
      catch (e) { hold('GATEWAY_BLOCKED', { error: e.message.replace('CATALOG_GATEWAY_BLOCKED: ', '') }); continue; }

      await db.query('SAVEPOINT s');
      try {
        const u = await db.query(
          `UPDATE public.elimfilters_catalog SET canonical_source_brand='FLEETGUARD', canonical_source_code=$2::text, canonical_source_url=$3,
             canonical_source_status='VERIFIED', canonical_verified_at=now(), canonical_evidence=$4::jsonb,
             enrichment_data=$5::jsonb, oem_codes=$6::jsonb, competitor_codes=$7::jsonb
           WHERE sku=$1 AND catalog_active AND canonical_source_status='UNVERIFIED'`,
          [d.sku, base, d.url, JSON.stringify({ authority: 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE', method: 'rendered-official-fleetguard-product-page', source_url: d.url, part_number: d.code, description: d.description, category: d.category, captured_at: d.captured_at, evidence_hash: d.page_text_sha256 }),
           JSON.stringify(next.enrichment_data), JSON.stringify(oem), JSON.stringify(comp)]);
        if (u.rowCount !== 1) throw new Error('UPDATE_COUNT_' + u.rowCount);
        await db.query('RELEASE SAVEPOINT s');
        report.written.push({ sku: d.sku, code: d.code, description: d.description, alternates_removed: removed });
      } catch (e) { await db.query('ROLLBACK TO SAVEPOINT s'); hold('DB_REJECTED', { error: String(e.message).slice(0, 160) }); }
    }
    if (APPLY && Number(CONFIRM) !== report.written.length) throw new Error(`CONFIRM_COUNT_MISMATCH expected ${report.written.length}; nothing committed`);
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} report.transaction = 'ROLLBACK_ERROR'; report.error = e.message; process.exitCode = 1; }
  finally { await db.end(); }
  const reasons = report.held.reduce((m, h) => { m[h.reason] = (m[h.reason] || 0) + 1; return m; }, {});
  console.log(JSON.stringify({ mode: report.mode, input: report.input, written: report.written.length, held: report.held.length, held_reasons: reasons, written_rows: report.written, held_rows: report.held, transaction: report.transaction, error: report.error }, null, 2));
})();
