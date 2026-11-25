'use strict';

/**
 * EA38506 (Light Duty air panel, 302 x 475) has the provisional base "8506". Operator 2026-11-25: its code base is MANN-FILTER C 30 850/6 (its 50 applications come from C30850/6; the same
 * 8506 = last four of C308506 is what the SKU formula gives). Stored without punctuation, like EL30236 = W1110236 and EA35004 = C25004: codigo_base C308506.
 *  1. EA38506 gets base C308506, MANN-FILTER canonical fields and governance CANONICAL_VERIFIED (evidence: the MANN official page capture MANN_OFFICIAL_PAGE_OE_20261025 already stored
 *     for this SKU + operator confirmation), and its ld_catalog.ld_canonical_product_identity row (same pattern as EA35004).
 *  2. Ruling 2026-11-12: the HD Donaldson product keeps the codes it shares with a Light Duty product. EA38506 drops the codes shared with EA11558 (11033128, 41925, 5040142);
 *     the code base itself is also removed from its alternates lists. EA11558 is never written.
 * Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA38506';
const HD = 'EA11558';
const OLD_BASE = '8506';
const BASE = 'C308506';
const AT = '2026-11-25T00:00:00.000Z';
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run' };
  try {
    await db.query('BEGIN');
    const rows = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku = ANY($1::text[]) ORDER BY sku FOR UPDATE', [[SKU, HD]])).rows;
    const cur = rows.find((r) => r.sku === SKU);
    const hd = rows.find((r) => r.sku === HD);
    if (!cur || !hd || cur.duty !== 'LIGHT_DUTY' || hd.duty !== 'HEAVY_DUTY' || cur.codigo_base !== OLD_BASE) throw new Error('SOURCE_CHANGED');
    const clash = await db.query(`SELECT sku FROM public.elimfilters_catalog WHERE sku<>$1 AND upper(regexp_replace(coalesce(codigo_base,''),'[^A-Za-z0-9]','','g'))=$2`, [SKU, BASE]);
    if (clash.rowCount) throw new Error('BASE_ALREADY_USED ' + clash.rows.map((r) => r.sku).join(','));
    const hdHash = sha(hd);
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));

    // only the codes the certification audit flags as shared by the two SKUs (exact_part_conflicts), not every overlap of the long catalogue lists: the rest of EA38506's MANN OE references stays
    const flagged = (await db.query('SELECT part_number FROM public.exact_part_conflicts WHERE skus @> $1::varchar[]', [[SKU, HD]])).rows.map((r) => norm(r.part_number));
    if (!flagged.length) throw new Error('NO_FLAGGED_SHARED_CODES');
    report.flagged_shared_codes = flagged;
    const hdCodes = new Set(flagged);
    const drop = (x) => hdCodes.has(norm(x.code)) || norm(x.code) === BASE;
    const oem = (cur.oem_codes || []).filter((x) => !drop(x));
    const comp = (cur.competitor_codes || []).filter((x) => !drop(x));
    report.removed = [...(cur.oem_codes || []), ...(cur.competitor_codes || [])].filter(drop).map((x) => `${x.manufacturer} ${x.code}`);
    const enrichment = { ...(cur.enrichment_data || {}) };
    enrichment.codigo_base_governance = {
      ...(enrichment.codigo_base_governance || {}),
      state: 'CANONICAL_VERIFIED', governance_state: 'CANONICAL_VERIFIED', verified_at: AT, origin_group: 'EUROPEAN',
      evidence_note: 'MANN-FILTER C 30 850/6 (air panel); MANN official page capture MANN_OFFICIAL_PAGE_OE_20261025 stored for this SKU; operator confirmed 2026-11-25. Provisional base 8506 replaced.',
      policy_version: '2026-08-19-v3.1', required_authority: 'VERIFIED_MANN_FILTER', contamination_flags: [], observed_primary_candidates: [],
      current_codigo_base: BASE, approved_codigo_base: BASE, approved_manufacturer: 'MANN-FILTER', approved_source_column: 'CANONICAL_POLICY',
      alternate_code_model: 'OEM_CODES_AND_COMPETITOR_CODES_ARE_ALTERNATES_ONLY', primary_manufacturer_verified: true,
      previous_codigo_base: OLD_BASE, oem_code_count: oem.length, competitor_code_count: comp.length,
    };
    const evidence = { source: 'mann_official_page_oe_20261025_and_operator_20261125', authority: 'MANN_OFFICIAL_PAGE', market_scope: 'US' };
    const patch = {
      codigo_base: BASE, oem_codes: oem, competitor_codes: comp, enrichment_data: enrichment,
      canonical_source_brand: 'MANN-FILTER', canonical_source_code: BASE, canonical_source_status: 'VERIFIED', canonical_verified_at: AT, canonical_evidence: evidence,
    };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query(`UPDATE public.elimfilters_catalog SET codigo_base=$2, oem_codes=$3::jsonb, competitor_codes=$4::jsonb, enrichment_data=$5::jsonb,
      canonical_source_brand=$6, canonical_source_code=$7, canonical_source_status=$8, canonical_verified_at=$9, canonical_evidence=$10::jsonb WHERE sku=$1`,
    [SKU, BASE, JSON.stringify(oem), JSON.stringify(comp), JSON.stringify(enrichment), 'MANN-FILTER', BASE, 'VERIFIED', AT, JSON.stringify(evidence)]);
    report.identity_row = (await db.query(`INSERT INTO ld_catalog.ld_canonical_product_identity(elimfilters_sku, origin_group, canonical_brand, canonical_part_number, filter_type, status, evidence_source)
      VALUES ($1,'EUROPEAN','MANN-FILTER',$2,'air','ACTIVE','MANN_OFFICIAL_PAGE_OE_20261025_OPERATOR_20261125') ON CONFLICT DO NOTHING`, [SKU, BASE])).rowCount;
    report.exact_rows_removed = (await db.query(`DELETE FROM public.exact_part_reference WHERE sku=$1 AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($2::text[])`, [SKU, [...hdCodes]])).rowCount;
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    if (sha((await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1', [HD])).rows[0]) !== hdHash) throw new Error('HD_ROW_CHANGED');
    report.shared_left = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE $1 = ANY(skus)', [HD])).rows.filter((r) => r.skus.includes(SKU)).length;
    report.after = (await db.query('SELECT sku, codigo_base, canonical_source_brand br, canonical_source_status st, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
