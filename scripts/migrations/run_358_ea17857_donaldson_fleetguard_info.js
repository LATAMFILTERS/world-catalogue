'use strict';

/**
 * EA17857 (canonical Donaldson P784457, codigo_base Fleetguard AF27857): load the information of both official pages.
 *  - Donaldson P784457 official page (operator pasted 2026-11-16): the full equipment list (Mercedes-Benz Actros/Atron, Scania G/P/R/T, SISU).
 *    Evidence authority OFFICIAL_DONALDSON_SHOP, source https://shop.donaldson.com/store/es-us/product/P784457/34568.
 *  - Fleetguard AF27857 official page: the OEM and aftermarket numbers it adds (DAF 1533957 / 1527883, Volvo 20544738, TRP 1534935,
 *    Tec-Fil ARS9840, Bosch 986626793). Its Volvo VM equipment is NOT added here (operator: VM 310 only, already loaded).
 *  - Dimensions stay Donaldson's (490 x 266 x 168 mm); the Fleetguard length (535 mm) is recorded in specs only.
 *  - Scania 1485592 and Volvo 20544738 are dropped from EA31340 (LD, MANN C271340): HD owns shared codes.
 * Existing applications and references are kept; only missing ones are added. Dry-run by default; --execute needs --snapshot <file>.
 */
require('dotenv').config();
const fs = require('fs');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--execute');
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; };
const SNAPSHOT = arg('--snapshot');
const SKU = 'EA17857';
const URL_DON = 'https://shop.donaldson.com/store/es-us/product/P784457/34568';
const URL_FG = 'https://www.fleetguard.com/es/product/af27857/01t5x000008FBviAAG';
const sha = (v) => crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const norm = (v) => String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const SRC = 'FLEETGUARD_OFFICIAL_PRODUCT_PAGE_AF27857_20261116';

const OEM_ADD = [['1533957', 'DAF'], ['1527883', 'DAF'], ['20544738', 'VOLVO']];
const ALT_ADD = [['1534935', 'TRP'], ['ARS9840', 'TEC-FIL'], ['986626793', 'BOSCH']];

// Donaldson P784457 equipment list: model | year | series | engine | emission
const MERCEDES = [['ACTROS 2643', 'OM542 LA'], ['ACTROS 2644', 'OM 541 LA'], ['ACTROS 2651', 'OM542 LA'], ['ACTROS 3244', 'OM541 LA'], ['ACTROS 3246', 'OM541 LA'], ['ACTROS 3260', 'OM542 LA'], ['ATRON 2729', 'OM 926 LA3']];
const SCANIA = `G230|2007|G|DC9 16-230|EURO 4
G270|2007|G|DC9 17-270|EURO 4
G310|2007|G|DC9 18-310|EURO 4
G340|2007|G|DC12|EURO 4
G380|2007|G|DC12 13-380|EURO 4
G380|2007|G|DC12 18-380|EURO 5
G400|2009|G|DC13 05|EURO 5
G420|2007|G|DT12 12-420|EURO 4
G420|2007|G|DC12 15-420|EURO 5
G440|2010|G|DC13 10-440|EURO 5
G470|2007|G|DT12 06-470|EURO 3
G480|2007|G|DC13 07-480|EURO 5
G480|2007|G|DT12 17-480|EURO 4
P230|2004|P|DC9|EURO 3
P230|2005|P|DC9|EURO 4
P230|2007|P|DC9|EURO 5 EEV
P270|2004|P|DC9 12-270|EURO 3
P270|2005|P|DC9 17-270|EURO 4
P280|2007|P|DC9|EURO 5 EEV
P310|2005|P|DC9|EURO 4, EURO 5
P310|2004|P|DC9|EURO 3
P320|2007|P|DC9|EURO 5
P340|2004|P|DC11 08-340|EURO 3
P340|2006|P|DC12|EURO 4
P360|2007|P|DC13 06-360|EURO 5
P380|2004|P|DC11 09-380|EURO 3
P380|2005|P|DC12 13-380|EURO 4
P380|2007|P|DC12 18-380|EURO 5
P400|2007|P|DC13 05-400|EURO 5
P420|2004|P|DT12 12-420|EURO 4
P420|2004|P|DC12 14-420|EURO 3
P420|2006|P|DC12 15-420|EURO 5
P470|2004|P|DT12 06-470|EURO 3
P480|2007|P|DC13 07-480|EURO 5
P480|2006|P|DT12 17-480|EURO 4
R230|2004|R|DC9|EURO 4
R230|2004|R|DC9|EURO 3
R270|2005|R|DC9|EURO 3
R270|2004|R|DC9|EURO 4
R310|2005|R|DC9|EURO 4
R310|2004|R|DC9|EURO 3
R340|2005|R|DC12|EURO 4
R340|2004|R|DC11 08-340|EURO 3
R360|2007|R|DC13 06-360|EURO 5
R380|2006|R|DC12 18-380|EURO 5
R380|2004|R|DC11 09-380|EURO 3
R380|2005|R|DC12 13-380|EURO 4
R400|2007|R|DC13 05-400|EURO 5
R420|2004|R|DT12 12-420|EURO 4
R420|2006|R|DC12 15-420|EURO 5
R420|2004|R|DC12 14-420|EURO 3
R440|2007|R|DC13|EURO 5, EURO 6
R470|2005|R|DT12 03-470|EURO 4
R470|2004|R|DT12 06-470|EURO 3
R480|2007|R|DC13 07-480|EURO 5
R480|2006|R|DT12 17-480|EURO 4
T340|2004|T|DC11 08-340|EURO 3
T380|2004|T|DC11 09-380|EURO 3
T420|2004|T|DC12 14-420|EURO 3
T420|2004|T|DT12 12-420|EURO 4
T470|2004|T|DT12 06-470|EURO 3`.split('\n').map((l) => l.split('|'));
const SISU = [['SISU 550', '2012', 'TIMBER', 'OM 502 LA'], ['SISU 550', '2012', 'ROCK & TIMBER', 'OM 502 LA'], ['SISU ROCK', '2012', '', 'OM 501 LA'], ['SISU ROCK', '2012', '', 'OM 502 LA'], ['SISU TIMBER', '2012', '', 'OM 502 LA'], ['SISU TIMBER', '2012', '', 'OM 501 LA']];

const opts = (...p) => p.filter(Boolean).join('; ');
const DONALDSON_APPS = [
  ...MERCEDES.map(([m, e]) => ({ type: 'TRUCK', engine: `MERCEDES-BENZ ${e}`, equipment: `MERCEDES-BENZ ${m}`, ...(m.startsWith('ACTROS') && { equipment_options: 'BLUETEC' }) })),
  ...SCANIA.map(([m, y, s, e, em]) => ({ type: 'TRUCK', engine: `SCANIA ${e}`, equipment: `SCANIA ${m}`, equipment_options: opts(y, `${s} SERIES`, em) })),
  ...SISU.map(([m, y, s, e]) => ({ type: 'TRUCK', engine: `MERCEDES-BENZ ${e}`, equipment: m, equipment_options: opts(y, s) })),
];
const appKey = (x) => norm(`${x.equipment}|${x.engine}|${x.equipment_options || ''}`);
const looseKey = (x) => norm(`${x.equipment}|${x.engine}`);

(async () => {
  if (APPLY && !SNAPSHOT) throw new Error('SNAPSHOT_REQUIRED_FOR_EXECUTE');
  const url = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
  const db = new Client(url
    ? { connectionString: url, ssl: /(?:@|\/\/)(127\.0\.0\.1|localhost)[:/]/.test(url) ? false : { rejectUnauthorized: false } }
    : { host: '127.0.0.1', port: 5432, database: 'catalogo_elimfilters', user: 'postgres' }); // password from pgpass
  await db.connect();
  const report = { mode: APPLY ? 'execute' : 'dry-run', sku: SKU };
  try {
    await db.query('BEGIN');
    const rows = (await db.query(`SELECT * FROM public.elimfilters_catalog WHERE sku IN ($1,'EA31340') ORDER BY sku FOR UPDATE`, [SKU])).rows;
    const cur = rows.find((r) => r.sku === SKU);
    const ld = rows.find((r) => r.sku === 'EA31340');
    if (!cur || cur.codigo_base !== 'AF27857' || cur.canonical_source_code !== 'P784457' || !ld) throw new Error('STATE_CHANGED');
    if (SNAPSHOT) fs.writeFileSync(SNAPSHOT, JSON.stringify({ captured_at: new Date().toISOString(), rows, row_sha256: sha(rows) }, null, 2));

    // 1. references of the Fleetguard page that EA17857 lacks
    const have = new Set([...cur.oem_codes, ...cur.competitor_codes].map((x) => norm(x.code)));
    const oem = [...cur.oem_codes]; const comp = [...cur.competitor_codes];
    report.refs_added = [];
    for (const [code, m] of OEM_ADD) if (!have.has(norm(code))) { oem.push({ code, manufacturer: m, classification: 'OEM', classification_source: SRC, source_url: URL_FG }); report.refs_added.push(`${m} ${code}`); }
    for (const [code, m] of ALT_ADD) if (!have.has(norm(code))) { comp.push({ code, manufacturer: m, classification: 'AFTERMARKET', classification_source: SRC, source_url: URL_FG }); report.refs_added.push(`${m} ${code}`); }
    const specs = { ...(cur.specs || {}), fleetguard_af27857_length_mm: 535.0, fleetguard_af27857_largest_outer_diameter_mm: 267.5, fleetguard_af27857_inner_diameter_mm: 170.0, fleetguard_af27857_spec_url: URL_FG };

    // 2. free the codes that EA31340 (LD) shares with EA17857
    const all = new Set([...oem, ...comp].map((x) => norm(x.code)));
    const sharedLd = [...ld.oem_codes, ...ld.competitor_codes].filter((x) => all.has(norm(x.code)) && norm(x.code) !== norm(ld.codigo_base));
    report.dropped_from_EA31340 = sharedLd.map((x) => `${x.manufacturer} ${x.code}`);
    const dropSet = new Set(sharedLd.map((x) => norm(x.code)));
    const ldPatch = { oem_codes: ld.oem_codes.filter((x) => !dropSet.has(norm(x.code))), competitor_codes: ld.competitor_codes.filter((x) => !dropSet.has(norm(x.code))) };
    if (sharedLd.length) {
      assertGovernedCatalogPatch(ld, ldPatch, { validateApplications: false });
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb WHERE sku=$1', ['EA31340', JSON.stringify(ldPatch.oem_codes), JSON.stringify(ldPatch.competitor_codes)]);
      await db.query(`DELETE FROM public.exact_part_reference WHERE sku='EA31340' AND upper(regexp_replace(part_number,'[^A-Za-z0-9]','','g')) = ANY($1::text[])`, [[...dropSet]]);
      await db.query('SELECT public.refresh_crossref_cache_sku($1)', ['EA31340']);
    }
    if (report.refs_added.length) {
      const patch = { oem_codes: oem, competitor_codes: comp };
      report.gateway = assertGovernedCatalogPatch(cur, patch, { validateApplications: false }).valid;
      await db.query('UPDATE public.elimfilters_catalog SET oem_codes=$2::jsonb, competitor_codes=$3::jsonb, specs=$4::jsonb WHERE sku=$1', [SKU, JSON.stringify(oem), JSON.stringify(comp), JSON.stringify(specs)]);
    } else {
      await db.query('UPDATE public.elimfilters_catalog SET specs=$2::jsonb WHERE sku=$1', [SKU, JSON.stringify(specs)]);
    }

    // 3. applications of the Donaldson page that EA17857 lacks
    const existing = cur.equipment_applications || [];
    const seen = new Set(existing.map(looseKey));
    const add = [];
    for (const a of DONALDSON_APPS) { const k = appKey(a); if (seen.has(looseKey(a)) && existing.some((x) => looseKey(x) === looseKey(a))) { if (!add.length || true) { /* already loaded */ } continue; } if (add.some((x) => appKey(x) === k)) continue; add.push(a); }
    report.applications = { existing: existing.length, donaldson_listed: DONALDSON_APPS.length, to_add: add.length };
    if (add.length) {
      await applyVerifiedApplications(db, { sku: SKU, equipment_applications: [...existing, ...add],
        evidence: { authority: 'OFFICIAL_DONALDSON_SHOP', source_url: URL_DON, evidence_hash: sha({ sku: SKU, add, URL_DON }), metadata: { method: 'official-donaldson-equipment-list', reference_code: 'P784457', added: add.length } } });
    }
    await db.query('SELECT public.refresh_crossref_cache_sku($1)', [SKU]);

    const s = (await db.query('SELECT jsonb_array_length(equipment_applications) apps, jsonb_array_length(oem_codes) oem, jsonb_array_length(competitor_codes) comp, height_mm, outer_diameter_mm, inner_diameter_mm FROM public.elimfilters_catalog WHERE sku=$1', [SKU])).rows[0];
    report.after = s;
    if (s.apps !== existing.length + add.length) throw new Error('POST_WRITE_VERIFICATION_FAILED apps');
    if (Number(s.height_mm) !== 490) throw new Error('DIMENSIONS_CHANGED');
    report.integrity = (await db.query(`SELECT (SELECT count(*)::int FROM public.exact_part_conflicts WHERE $1=ANY(skus) OR 'EA31340'=ANY(skus)) exact_conflicts, (SELECT count(*)::int FROM public.catalog_reference_classification_conflicts_v WHERE sku=$1) classification_conflicts, (SELECT certification_state FROM public.catalog_sku_certification WHERE sku=$1) cert`, [SKU])).rows[0];
    await db.query(APPLY ? 'COMMIT' : 'ROLLBACK');
    report.transaction = APPLY ? 'COMMIT' : 'ROLLBACK';
    console.log(JSON.stringify(report, null, 1));
  } catch (e) { try { await db.query('ROLLBACK'); } catch (_) {} throw e; } finally { await db.end(); }
})().catch((e) => { console.error(e.stack || e); process.exit(1); });
