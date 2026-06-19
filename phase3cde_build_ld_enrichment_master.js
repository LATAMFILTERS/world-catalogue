/**
 * FASE 3CDE — LD ENRICHMENT MASTER PIPELINE
 *
 * Prerequisito: Phase 3B completada al 100% (2430/2430 SKUs).
 *
 * Inputs:
 *   external_cross_reference_master_ld.csv
 *   external_vehicle_applications_ld.csv
 *   external_specs_ld.csv
 *
 * Outputs:
 *   PASO 1: competitor_cross_references_ld.csv
 *           oem_cross_references_external_ld.csv
 *   PASO 2: brand_coverage_ld.csv
 *   PASO 3: sku_competitor_matrix_ld.csv
 *   PASO 4: ld_enrichment_master.csv
 *   PASO 5: phase3cde_summary.json
 *
 * REGLAS:
 *   - No modificar PostgreSQL
 *   - No modificar frontend
 *   - No modificar APIs
 *   - No modificar código de aplicación
 *   - Leer cada archivo de entrada UNA SOLA VEZ
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ─── PATHS ───────────────────────────────────────────────────────────────────
const DIR = __dirname;

const IN_CROSS = path.join(DIR, 'external_cross_reference_master_ld.csv');
const IN_APPS  = path.join(DIR, 'external_vehicle_applications_ld.csv');
const IN_SPECS = path.join(DIR, 'external_specs_ld.csv');

const OUT_COMPETITOR_CROSS = path.join(DIR, 'competitor_cross_references_ld.csv');
const OUT_OEM_CROSS        = path.join(DIR, 'oem_cross_references_external_ld.csv');
const OUT_BRAND_COVERAGE   = path.join(DIR, 'brand_coverage_ld.csv');
const OUT_MATRIX           = path.join(DIR, 'sku_competitor_matrix_ld.csv');
const OUT_MASTER           = path.join(DIR, 'ld_enrichment_master.csv');
const OUT_SUMMARY          = path.join(DIR, 'phase3cde_summary.json');
const OUT_AUDIT            = path.join(DIR, 'phase3cde_audit.json');

// ─── OEM BRANDS ──────────────────────────────────────────────────────────────
// Brands classified as OEM (Original Equipment Manufacturer part numbers)
const OEM_BRANDS = new Set([
  'BMW', 'AUDI', 'VOLKSWAGEN', 'VW', 'MERCEDES', 'MERCEDES-BENZ', 'FORD', 'HONDA',
  'TOYOTA', 'NISSAN', 'RENAULT', 'PEUGEOT', 'CITROEN', 'FIAT', 'OPEL', 'VAUXHALL',
  'VOLVO', 'SKODA', 'SEAT', 'KIA', 'HYUNDAI', 'MAZDA', 'MITSUBISHI', 'SUBARU',
  'SUZUKI', 'DACIA', 'ALFA-ROMEO', 'LANCIA', 'PORSCHE', 'LAND-ROVER', 'JAGUAR',
  'MINI', 'CHRYSLER', 'JEEP', 'DODGE', 'GM', 'GENERAL-MOTORS', 'CHEVROLET',
  'BUICK', 'CADILLAC', 'GMC', 'PONTIAC', 'SATURN', 'ACURA', 'INFINITI', 'LEXUS',
  'LINCOLN', 'MERCURY', 'OLDSMOBILE', 'OE', 'OEM',
]);

// ─── KEY COMPETITORS for matrix columns ──────────────────────────────────────
const KEY_COMPETITORS = [
  'WIX', 'FRAM', 'MAHLE', 'KNECHT', 'HENGST', 'UFI', 'FILTRON',
  'FLEETGUARD', 'DONALDSON', 'BOSCH', 'CHAMPION', 'ALCO', 'FEBI',
  'BLUE-PRINT', 'AC-DELCO', 'PURFLUX', 'COMLINE', 'SOFIMA',
  'DENCKERMANN', 'COOPERS-FIAAM',
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
}

function csvEsc(v) {
  v = String(v == null ? '' : v).replace(/"/g, '""');
  return `"${v}"`;
}

function writeCsvRow(file, fields) {
  fs.appendFileSync(file, fields.map(csvEsc).join(',') + '\n');
}

function writeHeader(file, cols) {
  fs.writeFileSync(file, cols.map(csvEsc).join(',') + '\n');
}

function splitCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`WARNING: File not found — ${filePath}`);
    return [];
  }
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const obj = {};
    header.forEach((h, idx) => { obj[h] = cols[idx] !== undefined ? cols[idx] : ''; });
    rows.push(obj);
  }
  return rows;
}

function classifyBrand(brand) {
  const b = (brand || '').toUpperCase().trim();
  if (OEM_BRANDS.has(b)) return 'OEM';
  if (/^\d{6,}$/.test(b)) return 'OEM';
  return 'COMPETITOR';
}

// ─── PASO 1: CROSS REFERENCE CLASSIFICATION ──────────────────────────────────
function paso1_classifyCrossRefs(crossRows) {
  log('PASO 1 — Clasificando cross references (OEM vs COMPETITOR)...');

  writeHeader(OUT_COMPETITOR_CROSS, [
    'elimfilters_sku', 'source_sku', 'segment', 'ref_brand', 'ref_code', 'source_url'
  ]);
  writeHeader(OUT_OEM_CROSS, [
    'elimfilters_sku', 'source_sku', 'segment', 'ref_brand', 'ref_code', 'source_url'
  ]);

  let competitorCount = 0;
  let oemCount = 0;

  for (const row of crossRows) {
    const type = classifyBrand(row.ref_brand);
    if (type === 'COMPETITOR') {
      writeCsvRow(OUT_COMPETITOR_CROSS, [
        row.elimfilters_sku, row.source_sku, row.segment,
        row.ref_brand, row.ref_code, row.source_url
      ]);
      competitorCount++;
    } else {
      writeCsvRow(OUT_OEM_CROSS, [
        row.elimfilters_sku, row.source_sku, row.segment,
        row.ref_brand, row.ref_code, row.source_url
      ]);
      oemCount++;
    }
  }

  log(`  COMPETITOR rows: ${competitorCount}`);
  log(`  OEM rows:        ${oemCount}`);
  return { competitorCount, oemCount };
}

// ─── PASO 2: BRAND COVERAGE ──────────────────────────────────────────────────
function paso2_brandCoverage(crossRows) {
  log('PASO 2 — Generando cobertura por marca...');

  const brandMap = {};
  for (const row of crossRows) {
    const brand = (row.ref_brand || '').toUpperCase().trim();
    if (!brand) continue;
    if (!brandMap[brand]) brandMap[brand] = { skus: new Set(), refs: 0 };
    brandMap[brand].skus.add(row.elimfilters_sku);
    brandMap[brand].refs++;
  }

  const sorted = Object.entries(brandMap)
    .map(([brand, d]) => ({ brand, sku_count: d.skus.size, reference_count: d.refs }))
    .sort((a, b) => b.sku_count - a.sku_count || b.reference_count - a.reference_count);

  writeHeader(OUT_BRAND_COVERAGE, ['brand', 'sku_count', 'reference_count']);
  for (const r of sorted) {
    writeCsvRow(OUT_BRAND_COVERAGE, [r.brand, r.sku_count, r.reference_count]);
  }

  log(`  Marcas únicas: ${sorted.length}`);
  return sorted;
}

// ─── PASO 3: COMPETITOR MATRIX ───────────────────────────────────────────────
function paso3_competitorMatrix(crossRows) {
  log('PASO 3 — Generando matriz de competidores...');

  const skuMap = {};
  for (const row of crossRows) {
    const sku   = row.elimfilters_sku;
    const brand = (row.ref_brand || '').toUpperCase().trim();
    if (!skuMap[sku]) skuMap[sku] = { source_sku: row.source_sku, segment: row.segment };
    if (KEY_COMPETITORS.includes(brand) && !skuMap[sku][brand]) {
      skuMap[sku][brand] = row.ref_code;
    }
  }

  writeHeader(OUT_MATRIX, ['elimfilters_sku', 'source_sku', 'segment', ...KEY_COMPETITORS]);
  for (const [sku, data] of Object.entries(skuMap)) {
    const cols = [sku, data.source_sku, data.segment, ...KEY_COMPETITORS.map(b => data[b] || '')];
    writeCsvRow(OUT_MATRIX, cols);
  }

  log(`  SKUs en la matriz: ${Object.keys(skuMap).length}`);
  return Object.keys(skuMap).length;
}

// ─── PASO 4: ENRICHMENT MASTER ───────────────────────────────────────────────
function paso4_enrichmentMaster(crossRows, appRows, specRows) {
  log('PASO 4 — Generando ld_enrichment_master...');

  const crossCount = {};
  for (const r of crossRows) crossCount[r.elimfilters_sku] = (crossCount[r.elimfilters_sku] || 0) + 1;

  const appCount = {};
  const appMakes = {};
  for (const r of appRows) {
    appCount[r.elimfilters_sku] = (appCount[r.elimfilters_sku] || 0) + 1;
    if (!appMakes[r.elimfilters_sku]) appMakes[r.elimfilters_sku] = new Set();
    if (r.make) appMakes[r.elimfilters_sku].add(r.make.toUpperCase().trim());
  }

  const specCount = {};
  for (const r of specRows) specCount[r.elimfilters_sku] = (specCount[r.elimfilters_sku] || 0) + 1;

  const allSkus = new Set([
    ...Object.keys(crossCount),
    ...Object.keys(appCount),
    ...Object.keys(specCount),
  ]);

  const skuMeta = {};
  for (const r of [...crossRows, ...appRows, ...specRows]) {
    if (!skuMeta[r.elimfilters_sku]) {
      skuMeta[r.elimfilters_sku] = { source_sku: r.source_sku, segment: r.segment };
    }
  }

  function calcCoverage(crossN, appN, specN) {
    let score = 0;
    if      (crossN >= 10) score += 40;
    else if (crossN >= 5)  score += 25;
    else if (crossN >= 1)  score += 15;
    if      (appN >= 10)   score += 40;
    else if (appN >= 1)    score += 25;
    if      (specN >= 1)   score += 20;
    return Math.min(score, 100);
  }

  writeHeader(OUT_MASTER, [
    'elimfilters_sku', 'source_sku', 'segment',
    'cross_reference_count', 'application_count', 'specification_count',
    'unique_makes', 'coverage_score',
  ]);

  for (const sku of [...allSkus].sort()) {
    const meta   = skuMeta[sku] || { source_sku: '', segment: '' };
    const crossN = crossCount[sku] || 0;
    const appN   = appCount[sku]   || 0;
    const specN  = specCount[sku]  || 0;
    const makes  = appMakes[sku]   ? appMakes[sku].size : 0;
    const score  = calcCoverage(crossN, appN, specN);

    writeCsvRow(OUT_MASTER, [
      sku, meta.source_sku, meta.segment,
      crossN, appN, specN, makes, score,
    ]);
  }

  log(`  SKUs en el master: ${allSkus.size}`);
  return allSkus.size;
}

// ─── PASO 5: EXECUTIVE SUMMARY ───────────────────────────────────────────────
function paso5_summary(crossRows, appRows, specRows, brandSorted, paso1Stats) {
  log('PASO 5 — Generando resumen ejecutivo...');

  const skusWithCross = new Set(crossRows.map(r => r.elimfilters_sku));
  const skusWithApps  = new Set(appRows.map(r => r.elimfilters_sku));
  const skusWithSpecs = new Set(specRows.map(r => r.elimfilters_sku));
  const allSkus       = new Set([...skusWithCross, ...skusWithApps, ...skusWithSpecs]);

  const bySegment = {};
  for (const r of crossRows) {
    const seg = r.segment || 'Unknown';
    if (!bySegment[seg]) bySegment[seg] = { cross_refs: 0, skus: new Set() };
    bySegment[seg].cross_refs++;
    bySegment[seg].skus.add(r.elimfilters_sku);
  }
  const crossRefBySegment = {};
  for (const [seg, d] of Object.entries(bySegment)) {
    crossRefBySegment[seg] = { cross_refs: d.cross_refs, unique_skus: d.skus.size };
  }

  const summary = {
    run_timestamp:              new Date().toISOString(),
    phase:                      '3CDE',
    total_sku_with_any_data:    allSkus.size,
    sku_with_cross_references:  skusWithCross.size,
    sku_with_applications:      skusWithApps.size,
    sku_with_specs:             skusWithSpecs.size,
    total_cross_references:     crossRows.length,
    total_competitor_refs:      paso1Stats.competitorCount,
    total_oem_refs:             paso1Stats.oemCount,
    total_vehicle_applications: appRows.length,
    total_specs:                specRows.length,
    unique_brands_found:        brandSorted.length,
    cross_refs_by_segment:      crossRefBySegment,
    top_50_brands:              brandSorted.slice(0, 50).map(b => ({
      brand: b.brand,
      sku_count: b.sku_count,
      reference_count: b.reference_count,
    })),
  };

  fs.writeFileSync(OUT_SUMMARY, JSON.stringify(summary, null, 2));
  log(`  Summary escrito: phase3cde_summary.json`);
  return summary;
}

// ─── PASO AUDIT: INTERMEDIATE REPORT ────────────────────────────────────────
function pasoAudit(crossRows, appRows, specRows, brandSorted) {
  log('AUDIT — Generando phase3cde_audit.json...');

  // Unique SKUs
  const skusWithCross = new Set(crossRows.map(r => r.elimfilters_sku));
  const skusWithApps  = new Set(appRows.map(r => r.elimfilters_sku));
  const skusWithSpecs = new Set(specRows.map(r => r.elimfilters_sku));
  const allSkus       = new Set([...skusWithCross, ...skusWithApps, ...skusWithSpecs]);

  // Top 100 brands by SKU coverage
  const top100Brands = brandSorted.slice(0, 100).map(b => ({
    brand: b.brand,
    sku_count: b.sku_count,
    reference_count: b.reference_count,
  }));

  // Top 100 SKUs by cross-reference count
  const crossCountMap = {};
  const crossSourceMap = {};
  for (const r of crossRows) {
    crossCountMap[r.elimfilters_sku] = (crossCountMap[r.elimfilters_sku] || 0) + 1;
    if (!crossSourceMap[r.elimfilters_sku]) crossSourceMap[r.elimfilters_sku] = { source_sku: r.source_sku, segment: r.segment };
  }
  const top100ByCross = Object.entries(crossCountMap)
    .map(([sku, count]) => ({
      elimfilters_sku: sku,
      source_sku: (crossSourceMap[sku] || {}).source_sku || '',
      segment: (crossSourceMap[sku] || {}).segment || '',
      cross_reference_count: count,
    }))
    .sort((a, b) => b.cross_reference_count - a.cross_reference_count)
    .slice(0, 100);

  // Top 100 SKUs by application count
  const appCountMap = {};
  const appSourceMap = {};
  for (const r of appRows) {
    appCountMap[r.elimfilters_sku] = (appCountMap[r.elimfilters_sku] || 0) + 1;
    if (!appSourceMap[r.elimfilters_sku]) appSourceMap[r.elimfilters_sku] = { source_sku: r.source_sku, segment: r.segment };
  }
  const top100ByApps = Object.entries(appCountMap)
    .map(([sku, count]) => ({
      elimfilters_sku: sku,
      source_sku: (appSourceMap[sku] || {}).source_sku || '',
      segment: (appSourceMap[sku] || {}).segment || '',
      application_count: count,
    }))
    .sort((a, b) => b.application_count - a.application_count)
    .slice(0, 100);

  const audit = {
    generated_at:                  new Date().toISOString(),
    total_unique_skus_recovered:   allSkus.size,
    sku_with_competitor_crossrefs: skusWithCross.size,
    sku_with_vehicle_applications: skusWithApps.size,
    sku_with_specifications:       skusWithSpecs.size,
    total_cross_reference_rows:    crossRows.length,
    total_application_rows:        appRows.length,
    total_spec_rows:               specRows.length,
    unique_brands_found:           brandSorted.length,
    top_100_brands_by_coverage:    top100Brands,
    top_100_skus_by_cross_refs:    top100ByCross,
    top_100_skus_by_applications:  top100ByApps,
  };

  fs.writeFileSync(OUT_AUDIT, JSON.stringify(audit, null, 2));
  log(`  Audit escrito: phase3cde_audit.json`);
  log(`  Total SKUs únicos: ${allSkus.size}`);
  log(`  SKUs con cross refs: ${skusWithCross.size}`);
  log(`  SKUs con apps: ${skusWithApps.size}`);
  log(`  SKUs con specs: ${skusWithSpecs.size}`);
  return audit;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main() {
  log('=== FASE 3CDE — LD ENRICHMENT MASTER PIPELINE START ===');

  for (const f of [IN_CROSS, IN_APPS, IN_SPECS]) {
    if (!fs.existsSync(f)) {
      log(`ERROR: Archivo de entrada faltante — ${f}`);
      log('Phase 3B debe completarse primero.');
      process.exit(1);
    }
  }

  log('Leyendo archivos de entrada (una sola vez cada uno)...');
  const crossRows = parseCsv(IN_CROSS);
  const appRows   = parseCsv(IN_APPS);
  const specRows  = parseCsv(IN_SPECS);

  log(`  cross_reference_master: ${crossRows.length} rows`);
  log(`  vehicle_applications:   ${appRows.length} rows`);
  log(`  specs:                  ${specRows.length} rows`);

  if (crossRows.length === 0 && appRows.length === 0 && specRows.length === 0) {
    log('ERROR: Todos los archivos de entrada están vacíos. Verificar Phase 3B.');
    process.exit(1);
  }

  // AUDIT — intermediate report (before final outputs)
  const brandSorted = paso2_brandCoverage(crossRows);  // needed by audit
  pasoAudit(crossRows, appRows, specRows, brandSorted);

  // FINAL OUTPUTS
  const paso1Stats = paso1_classifyCrossRefs(crossRows);
  paso3_competitorMatrix(crossRows);
  paso4_enrichmentMaster(crossRows, appRows, specRows);
  const summary = paso5_summary(crossRows, appRows, specRows, brandSorted, paso1Stats);

  log('');
  log('=== PIPELINE COMPLETADO ===');
  log(`SKUs con cross refs:     ${summary.sku_with_cross_references}`);
  log(`SKUs con aplicaciones:   ${summary.sku_with_applications}`);
  log(`SKUs con specs:          ${summary.sku_with_specs}`);
  log(`Total cross refs:        ${summary.total_cross_references}`);
  log(`Total apps:              ${summary.total_vehicle_applications}`);
  log(`Total specs:             ${summary.total_specs}`);
  log(`Marcas únicas:           ${summary.unique_brands_found}`);
  log('');
  log('Archivos generados:');
  for (const f of [
    OUT_AUDIT,
    OUT_COMPETITOR_CROSS, OUT_OEM_CROSS, OUT_BRAND_COVERAGE,
    OUT_MATRIX, OUT_MASTER, OUT_SUMMARY,
  ]) log(`  ${path.basename(f)}`);
}

main().catch(e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
