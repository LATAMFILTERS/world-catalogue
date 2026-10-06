'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const { assertGovernedCatalogPatch } = require('../lib/catalog-write-gateway');
const { applyVerifiedApplications } = require('../lib/catalog-application-write-service');

const APPLY = process.argv.includes('--apply');
const limitArg = process.argv.find((x) => x.startsWith('--limit='));
const LIMIT = limitArg ? Math.max(1, Number(limitArg.split('=')[1]) || 1) : Infinity;
const ROOT = path.resolve(__dirname, '..');
const DB_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
if (!DB_URL) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

const INPUT_FILES = [
  'donaldson_air_results.json',
  'donaldson_air-dryer_results.json',
  'donaldson_air-intake_results.json',
  'donaldson_cabin_results.json',
  'donaldson_coolant_final_results_20260917.json',
  'donaldson_coolant_results.json',
  'donaldson_fuel_final_results_20260917.json',
  'donaldson_fuel_results.json',
  'donaldson_hydraulic_results.json',
  'donaldson_lube_results.json'
];

const COMPETITOR_BRANDS = new Set([
  'DONALDSON','BALDWIN','FLEETGUARD','MANN','MANN+HUMMEL','MANN-HUMMEL',
  'WIX','FRAM','PUROLATOR','NAPA','NAPA GOLD','AC DELCO','ACDELCO','BOSCH','MAHLE','MAHLE/KNECHT',
  'HENGST','SAKURA','HASTINGS','LUBER-FINER','LUBERFINER','PARKER','PALL','HYDAC',
  'MP FILTRI','MPFILTRI','UFI','CHAMPION','COOPERSFITERS','COOPERSFILTERS','MOTORCRAFT',
  'KNECHT','SOGEFI','FILTRON','SOFIMA','FIAAM','NIPPARTS','STARLINE','CHAMPION LABS',
  'CARQUEST','PRONTO','DEFENSE','PENNZOIL','CASTROL','MOBIL','MOBIL 1','SHELL','TOTAL',
  'DENSO','TISCO','TRACTORPARTS','AGCO','ATLAS COPCO','SULLAIR','INGERSOLL RAND','COMPAIR',
  'GARDNER DENVER','QUINCY','LEROI','KOBELCO COMPRESSORS','ALCO','INLINE','GOLDENROD',
  'RACOR','PARKER RACOR','DAVCO','FLEETRITE','JOHN DEERE PARTS','CAT PARTS','CASE PARTS',
  'EUROPART','DINEX','TRUCKTEC','FEBI','SWAG','MEYLE','VALEO','ELOFIC','ECOGARD','K&N',
  'PREMIUM GUARD','WABCO','KNORR','ALLISON','ZF'
]);

const INVALID = new Set([
  'THREADSIZE','LARGESTOD','SMALLESTOD','LENGTH','HEIGHT','GASKETOD','GASKETID',
  'PRESSUREVALVE','RATEDFLOW','MEDIATYPE','RELATEDPARTS','RELATED PARTS',
  'MAINTENANCEKITS','MAINTENANCE KITS','TESTSPECIFICATION','PRODUCT DESCRIPTION',
  'PRODUCTDESCRIPTION','APPLICABLEREGION','UPGRADE OF','UPGRADEOF','FOR UPGRADE, USE',
  'FIND A DEALER','DOWNLOAD SPECS','OEM CROSS REFERENCE','CELLULOSE','NO',
  'SPECIFICATION','DOWNLOADSPECS','HYDROSTATIC BURST MINIMUM','USES SERVICE PART','REPLACES'
]);

const MEASUREMENT = /\d\s*(INCH|MM|GPM|L\/MIN|MICRON|PSI|BAR|KPA|UNS?|UNF|KG|LB)\b/i;

function clean(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim(); }
function norm(v) { return clean(v).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function brandKey(v) { return clean(v).toUpperCase().replace(/[®™]/g, '').replace(/[-+]/g, ' ').replace(/\s+/g, ' ').trim(); }
const NORMALIZED_COMPETITORS = new Set(Array.from(COMPETITOR_BRANDS).map(brandKey));
function isCompetitor(v) {
  const k = brandKey(v);
  return NORMALIZED_COMPETITORS.has(k) || k.includes('FILTER') || k.includes('FILTR') || k.includes('FILTRO');
}
function sha(v) { return crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex'); }
function sslFor(url) {
  const host = new URL(url).hostname.toLowerCase();
  return ['127.0.0.1','localhost','::1'].includes(host) ? false : { rejectUnauthorized: false };
}
function arr(v) { return Array.isArray(v) ? v : []; }
function obj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }

function flattenRecords(doc) {
  if (Array.isArray(doc)) return doc;
  if (Array.isArray(doc && doc.results)) return doc.results;
  if (Array.isArray(doc && doc.products)) return doc.products;
  if (Array.isArray(doc && doc.items)) return doc.items;
  if (doc && typeof doc === 'object') {
    const values = Object.values(doc);
    if (values.length && values.every((v) => v && typeof v === 'object')) return values;
  }
  return [];
}

function partNumber(r) {
  return clean(r && (r.part_number || r.codigo_base || r.code || r.part || r.donaldson_part_number));
}

function sourceUrl(r) {
  const candidates = [
    r && r.source_url, r && r.url, r && r.product_url, r && r.donaldson_url,
    r && r.source && r.source.url
  ].map(clean);
  return candidates.find((u) => /(^|\/\/)([^/]*\.)?donaldson\.com\//i.test(u)) || null;
}

function refObject(raw, fallbackBrand) {
  if (typeof raw === 'string') {
    return fallbackBrand && clean(raw) ? { manufacturer: clean(fallbackBrand), code: clean(raw) } : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const manufacturer = clean(raw.manufacturer || raw.brand || raw.make || fallbackBrand);
  const code = clean(raw.code || raw.part_number || raw.part || raw.reference || raw.oem);
  return manufacturer && code ? { manufacturer, code } : null;
}

function validRef(r) {
  if (!r || !r.manufacturer || !r.code) return false;
  if (INVALID.has(clean(r.manufacturer).toUpperCase()) || INVALID.has(clean(r.code).toUpperCase())) return false;
  if (MEASUREMENT.test(r.manufacturer) || MEASUREMENT.test(r.code)) return false;
  if (!/[A-Za-z]/.test(r.manufacturer)) return false;
  if (/^[A-Z]{0,4}\d{3,}[A-Z0-9]*$/i.test(clean(r.manufacturer).replace(/\s+/g, ''))) return false;
  return Boolean(norm(r.code));
}

function extractReferences(record) {
  const all = [];
  arr(record && record.oem_codes).forEach((x) => { const r = refObject(x); if (r) all.push(r); });
  arr(record && record.cross_references).forEach((x) => { const r = refObject(x); if (r) all.push(r); });
  Object.entries(obj(record && record.brand_crossrefs)).forEach(([brand, codes]) => {
    (Array.isArray(codes) ? codes : [codes]).forEach((x) => {
      const r = refObject(x, brand);
      if (r) all.push(r);
    });
  });

  const seen = new Set();
  const oem = [];
  const competitors = [];
  for (const r of all) {
    if (!validRef(r)) continue;
    const key = brandKey(r.manufacturer) + '|' + norm(r.code);
    if (seen.has(key)) continue;
    seen.add(key);
    if (isCompetitor(r.manufacturer)) {
      competitors.push({
        manufacturer: clean(r.manufacturer),
        code: clean(r.code),
        classification: 'AFTERMARKET',
        classification_source: 'DONALDSON_CAPTURE_REPAIR_20261006'
      });
    } else {
      oem.push({
        manufacturer: clean(r.manufacturer),
        code: clean(r.code),
        classification: 'OEM',
        classification_source: 'DONALDSON_CAPTURE_REPAIR_20261006'
      });
    }
  }
  return { oem, competitors };
}

function buildBrandCrossrefs(competitors) {
  const out = {};
  for (const r of competitors) {
    const brand = clean(r.manufacturer).toUpperCase();
    if (!out[brand]) out[brand] = [];
    if (!out[brand].includes(r.code)) out[brand].push(r.code);
  }
  return out;
}

function normalizeApplication(raw) {
  if (typeof raw === 'string') return clean(raw) ? { equipment: clean(raw) } : null;
  if (!raw || typeof raw !== 'object') return null;
  const make = clean(raw.make || raw.manufacturer || raw.brand);
  const model = clean(raw.model);
  const equipment = clean(raw.equipment || raw.machine || raw.name || [make, model].filter(Boolean).join(' '));
  if (!equipment && !make && !model) return null;
  const out = {};
  const type = clean(raw.type || raw.equipment_type);
  const engine = clean(raw.engine || raw.engine_model || raw.motor);
  const year = clean(raw.year || raw.model_year);
  if (equipment) out.equipment = equipment;
  if (type) out.type = type;
  if (engine) out.engine = engine;
  if (year) out.year = year;
  if (make) out.make = make;
  if (model) out.model = model;
  return out;
}

function extractApplications(record) {
  const source = arr(record && record.equipment).concat(arr(record && record.equipment_applications));
  const seen = new Set();
  const out = [];
  for (const raw of source) {
    const app = normalizeApplication(raw);
    if (!app) continue;
    const key = JSON.stringify(app);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(app);
  }
  return out;
}

function loadDataset() {
  const byPart = new Map();
  const collisions = new Map();
  const files = [];

  for (const name of INPUT_FILES) {
    const p = path.join(ROOT, 'scripts', name);
    if (!fs.existsSync(p)) continue;
    const records = flattenRecords(JSON.parse(fs.readFileSync(p, 'utf8')));
    files.push({ file: name, records: records.length });

    for (const record of records) {
      const part = partNumber(record);
      const key = norm(part);
      if (!key) continue;
      const wrapped = Object.assign({}, record, { __capture_file: name, __part_number: part });
      if (!byPart.has(key)) {
        byPart.set(key, wrapped);
        continue;
      }
      const prior = byPart.get(key);
      const same =
        JSON.stringify(extractReferences(prior)) === JSON.stringify(extractReferences(wrapped)) &&
        JSON.stringify(extractApplications(prior)) === JSON.stringify(extractApplications(wrapped));
      if (!same) {
        if (!collisions.has(key)) collisions.set(key, [prior]);
        collisions.get(key).push(wrapped);
      }
    }
  }

  collisions.forEach((_, key) => byPart.delete(key));
  return { byPart, collisions, files };
}

async function insertExactRefs(client, sku, refs, type, captureFile) {
  let inserted = 0;
  for (const r of refs) {
    const q =
      'INSERT INTO public.exact_part_reference(reference_type,brand,part_number,sku,source) ' +
      'VALUES($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING';
    const result = await client.query(q, [
      type,
      clean(r.manufacturer).toUpperCase(),
      clean(r.code).toUpperCase(),
      sku,
      'DONALDSON_CAPTURE:' + captureFile
    ]);
    inserted += result.rowCount || 0;
  }
  return inserted;
}

async function processSku(client, row, record, report) {
  const refs = extractReferences(record);
  const applications = extractApplications(record);
  const captureFile = record.__capture_file;
  const capturePart = record.__part_number;
  const captureHash = sha(record);
  const url = sourceUrl(record);

  const item = {
    sku: row.sku,
    codigo_base: row.codigo_base,
    canonical_source_code: row.canonical_source_code,
    capture_file: captureFile,
    capture_part: capturePart,
    oem_refs: refs.oem.length,
    competitor_refs: refs.competitors.length,
    applications: applications.length,
    refs_ready: false,
    refs_updated: false,
    applications_ready: applications.length > 0,
    applications_updated: false,
    duty_ready: true,
    duty_verified: false,
    exact_refs_inserted: 0,
    blockers: [],
    status: 'NO_CHANGE'
  };

  const patch = {};
  if (refs.oem.length || refs.competitors.length) {
    patch.oem_codes = refs.oem;
    patch.competitor_codes = refs.competitors;
    patch.brand_crossrefs = buildBrandCrossrefs(refs.competitors);
    try {
      assertGovernedCatalogPatch(row, patch, { validateApplications: false });
      item.refs_ready = true;
    } catch (error) {
      item.blockers.push({
        scope: 'REFERENCES',
        code: error.code || 'CATALOG_PATCH_GATEWAY_BLOCKED',
        reasons: error.validation && error.validation.reasons ? error.validation.reasons : [error.message]
      });
      delete patch.oem_codes;
      delete patch.competitor_codes;
      delete patch.brand_crossrefs;
    }
  }

  if (!APPLY) {
    item.status = item.blockers.length ? 'DRY_RUN_PARTIAL' : 'DRY_RUN_READY';
    report.items.push(item);
    return;
  }

  await client.query('SAVEPOINT repair_sku');
  try {
    if (item.refs_ready) {
      await client.query(
        'UPDATE public.elimfilters_catalog SET oem_codes=$1::jsonb, competitor_codes=$2::jsonb, brand_crossrefs=$3::jsonb WHERE sku=$4',
        [
          JSON.stringify(patch.oem_codes),
          JSON.stringify(patch.competitor_codes),
          JSON.stringify(patch.brand_crossrefs),
          row.sku
        ]
      );
      item.refs_updated = true;
      item.exact_refs_inserted += await insertExactRefs(client, row.sku, patch.oem_codes, 'OEM', captureFile);
      item.exact_refs_inserted += await insertExactRefs(client, row.sku, patch.competitor_codes, 'COMPETITOR', captureFile);
    }

    if (applications.length) {
      item.application_write = await applyVerifiedApplications(client, {
        sku: row.sku,
        equipment_applications: applications,
        vehicle_applications: [],
        evidence: {
          authority: 'DONALDSON_OFFICIAL_CAPTURE',
          source_url: url,
          evidence_hash: captureHash,
          metadata: {
            capture_file: captureFile,
            capture_part: capturePart,
            repair: 'CATALOG_COMPLETENESS_20261006'
          }
        }
      });
      item.applications_updated = true;
    }

    await client.query(
      "UPDATE public.elimfilters_catalog SET duty_validation_status='VERIFIED', duty_source_brand='DONALDSON', " +
      'duty_source_url=coalesce($1,duty_source_url), duty_verified_at=now(), duty_evidence=$2::jsonb ' +
      "WHERE sku=$3 AND duty='HEAVY_DUTY'",
      [
        url,
        JSON.stringify({
          authority: 'DONALDSON_OFFICIAL_CAPTURE',
          capture_file: captureFile,
          capture_part: capturePart,
          capture_hash: captureHash,
          verified_basis: 'EXACT_DONALDSON_PART_MATCH'
        }),
        row.sku
      ]
    );
    item.duty_verified = true;

    await client.query('RELEASE SAVEPOINT repair_sku');
    item.status = item.blockers.length ? 'APPLIED_PARTIAL' : 'APPLIED';
  } catch (error) {
    await client.query('ROLLBACK TO SAVEPOINT repair_sku');
    await client.query('RELEASE SAVEPOINT repair_sku');
    item.refs_updated = false;
    item.applications_updated = false;
    item.duty_verified = false;
    item.exact_refs_inserted = 0;
    item.status = 'ROLLED_BACK';
    item.blockers.push({
      scope: 'SKU_TRANSACTION',
      code: error.code || 'ERROR',
      reasons: error.validation && error.validation.reasons ? error.validation.reasons : [error.message]
    });
  }

  report.items.push(item);
}

async function run() {
  const dataset = loadDataset();
  const client = new Client({ connectionString: DB_URL, ssl: sslFor(DB_URL) });
  await client.connect();

  const report = {
    repair: 'CATALOG_COMPLETENESS_DONALDSON_V1',
    mode: APPLY ? 'APPLY' : 'DRY_RUN',
    generated_at: new Date().toISOString(),
    input_files: dataset.files,
    dataset_unique_parts: dataset.byPart.size,
    dataset_collision_parts: dataset.collisions.size,
    matched_catalog_rows: 0,
    unmatched_dataset_parts: 0,
    duplicate_catalog_matches: [],
    items: []
  };

  try {
    await client.query('BEGIN');
    const catalog = (await client.query(
      "SELECT * FROM public.elimfilters_catalog WHERE catalog_active IS TRUE AND duty='HEAVY_DUTY' ORDER BY sku"
    )).rows;

    const byCode = new Map();
    for (const row of catalog) {
      const keys = Array.from(new Set([norm(row.codigo_base), norm(row.canonical_source_code)].filter(Boolean)));
      for (const key of keys) {
        if (!byCode.has(key)) byCode.set(key, []);
        byCode.get(key).push(row);
      }
    }

    const selected = [];
    for (const pair of dataset.byPart.entries()) {
      const key = pair[0];
      const record = pair[1];
      const matches = byCode.get(key) || [];
      if (!matches.length) {
        report.unmatched_dataset_parts += 1;
      } else if (matches.length > 1) {
        report.duplicate_catalog_matches.push({ part: record.__part_number, skus: matches.map((r) => r.sku) });
      } else {
        selected.push({ row: matches[0], record });
      }
    }

    report.matched_catalog_rows = selected.length;
    for (const pair of selected.slice(0, LIMIT)) await processSku(client, pair.row, pair.record, report);

    if (APPLY) await client.query('COMMIT');
    else await client.query('ROLLBACK');
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    await client.end();
  }

  report.summary = {
    processed: report.items.length,
    applied: report.items.filter((x) => x.status === 'APPLIED').length,
    applied_partial: report.items.filter((x) => x.status === 'APPLIED_PARTIAL').length,
    rolled_back: report.items.filter((x) => x.status === 'ROLLED_BACK').length,
    dry_run_ready: report.items.filter((x) => x.status === 'DRY_RUN_READY').length,
    dry_run_partial: report.items.filter((x) => x.status === 'DRY_RUN_PARTIAL').length,
    refs_ready: report.items.filter((x) => x.refs_ready).length,
    refs_updated: report.items.filter((x) => x.refs_updated).length,
    applications_ready: report.items.filter((x) => x.applications_ready).length,
    applications_updated: report.items.filter((x) => x.applications_updated).length,
    duty_verified: report.items.filter((x) => x.duty_verified).length,
    exact_refs_inserted: report.items.reduce((n, x) => n + Number(x.exact_refs_inserted || 0), 0),
    blocked_items: report.items.filter((x) => x.blockers.length).length
  };

  const out = path.join(ROOT, 'reports', 'catalog-completeness-donaldson-repair-latest.json');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(report, null, 2) + '\n');

  console.log(JSON.stringify({
    repair: report.repair,
    mode: report.mode,
    input_files: report.input_files,
    dataset_unique_parts: report.dataset_unique_parts,
    dataset_collision_parts: report.dataset_collision_parts,
    matched_catalog_rows: report.matched_catalog_rows,
    unmatched_dataset_parts: report.unmatched_dataset_parts,
    duplicate_catalog_matches: report.duplicate_catalog_matches.length,
    output: path.relative(ROOT, out),
    summary: report.summary
  }, null, 2));

  return report;
}

if (require.main === module) {
  run().catch((error) => {
    console.error('[catalog-completeness-donaldson-repair] failed', error.stack || error.message);
    process.exit(1);
  });
}

module.exports = {
  INPUT_FILES,
  COMPETITOR_BRANDS,
  norm,
  brandKey,
  isCompetitor,
  validRef,
  flattenRecords,
  partNumber,
  sourceUrl,
  extractReferences,
  buildBrandCrossrefs,
  extractApplications,
  loadDataset,
  run
};
