'use strict';

/**
 * EL33807 (FRAM PH3807, OD 83 x H 80): cross references from the Millard ML 3807 datasheet (Catalog Guatemala 2026-11-20, supplied by the operator 2026-11-25). Millard 3807 measures OD 83 / H 80 (the
 * catalogue dimensions of EL33807) and crosses to MANN-FILTER W81480, NOT to W 610/6 (OD 66 x H 90), which is another filter.
 * Twelve of the fourteen references on the sheet are missing from EL33807 (HONDA 15400PR3004 and LUBERFINER PH2808 are already there). Classification by the operator rule:
 * vehicle makers = OEM (HYUNDAI, MAZDA, MITSUBISHI, TOYOTA), every other brand = competitor (FRAM PH3593A / PH3950, HENGST, LUBERFINER, MANN-FILTER, PUROLATOR, UFI, WIX).
 * Only oem_codes / competitor_codes change. Dry-run by default (ROLLBACK). --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EL33807';
const SRC = 'OPERATOR_SUPPLIED_MILLARD_ML3807_DATASHEET_20261120';
const OEM = [['HYUNDAI', '2630035056'], ['MAZDA', '037023802'], ['MITSUBISHI', 'MD031805'], ['TOYOTA', '1560187305000']];
const COMP = [['FRAM', 'PH3593A'], ['FRAM', 'PH3950'], ['HENGST', 'H13W01'], ['LUBERFINER', 'PH2856A'], ['MANN-FILTER', 'W81480'], ['PUROLATOR', 'L10193'], ['UFI', '2316500'], ['WIX', '51381']];
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const db = new Client({ host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', added: [] };
  try {
    await db.query('BEGIN');
    const cur = (await db.query('SELECT * FROM public.elimfilters_catalog WHERE sku=$1 FOR UPDATE', [SKU])).rows[0];
    if (!cur || cur.codigo_base !== 'PH3807' || cur.canonical_source_brand !== 'FRAM' || !cur.catalog_active) throw new Error('SOURCE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), row: cur, row_sha256: sha(cur) }, null, 2));
    const have = new Set([...(cur.oem_codes || []), ...(cur.competitor_codes || [])].map((x) => norm(x.code)));
    const oem = [...(cur.oem_codes || [])];
    const comp = [...(cur.competitor_codes || [])];
    for (const [m, c] of OEM) if (!have.has(norm(c))) { oem.push({ code: c, manufacturer: m, classification: 'OEM', classification_source: 'OPERATOR_RULE_20261125', source: SRC }); report.added.push(`OEM ${m} ${c}`); }
    for (const [m, c] of COMP) if (!have.has(norm(c))) { comp.push({ code: c, manufacturer: m, classification: 'AFTERMARKET', classification_source: 'OPERATOR_RULE_20261125', source: SRC }); report.added.push(`COMP ${m} ${c}`); }
    const patch = { oem_codes: oem, competitor_codes: comp };
    report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
    await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem), JSON.stringify(comp)]);
    try { await db.query('SAVEPOINT c'); await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]); await db.query('RELEASE SAVEPOINT c'); } catch (e) { report.cache_refresh_error = e.message; await db.query('ROLLBACK TO SAVEPOINT c'); }
    report.after = (await db.query('SELECT sku, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp, outer_diameter_mm od, height_mm h FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.exact_conflicts_for_el33807 = (await db.query('SELECT part_number, skus FROM public.exact_part_conflicts WHERE $1 = ANY(skus)', [SKU])).rows.length;
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
