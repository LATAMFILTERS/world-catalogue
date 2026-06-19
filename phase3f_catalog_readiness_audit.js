/**
 * FASE 3F — CATALOG READINESS AUDIT
 *
 * Objetivo: Evaluar la calidad comercial real del catálogo LD enriquecido
 * antes de la carga a PostgreSQL.
 *
 * Inputs:
 *   - ld_enrichment_master.csv
 *   - competitor_cross_references_ld.csv
 *   - oem_cross_references_external_ld.csv (agregado implícitamente para OEM)
 *   - external_vehicle_applications_ld.csv
 *   - external_specs_ld.csv
 *
 * Outputs:
 *   - phase3f_catalog_readiness_audit.json
 *   - phase3f_catalog_readiness.csv
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const IN_MASTER = path.join(DIR, 'ld_enrichment_master.csv');
const IN_COMP_CROSS = path.join(DIR, 'competitor_cross_references_ld.csv');
const IN_OEM_CROSS = path.join(DIR, 'oem_cross_references_external_ld.csv');
const IN_APPS = path.join(DIR, 'external_vehicle_applications_ld.csv');
const IN_SPECS = path.join(DIR, 'external_specs_ld.csv');

const OUT_JSON = path.join(DIR, 'phase3f_catalog_readiness_audit.json');
const OUT_CSV = path.join(DIR, 'phase3f_catalog_readiness.csv');

// Total constants given by user
const TOTAL_LD_SKUS = 7833;
const RECOVERED_TARGET_SKUS = 2430;

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
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

function csvEsc(v) {
  v = String(v == null ? '' : v).replace(/"/g, '""');
  return `"${v}"`;
}

function writeHeader(file, cols) {
  fs.writeFileSync(file, cols.map(csvEsc).join(',') + '\n');
}

function writeCsvRow(file, fields) {
  fs.appendFileSync(file, fields.map(csvEsc).join(',') + '\n');
}

function countSkus(rows) {
  const map = {};
  for (const r of rows) {
    if (!r.elimfilters_sku) continue;
    map[r.elimfilters_sku] = (map[r.elimfilters_sku] || 0) + 1;
  }
  return map;
}

function main() {
  log('=== FASE 3F — CATALOG READINESS AUDIT ===');

  log('Leyendo archivos...');
  const masterRows = parseCsv(IN_MASTER);
  const compMap = countSkus(parseCsv(IN_COMP_CROSS));
  const oemMap = countSkus(parseCsv(IN_OEM_CROSS));
  const appMap = countSkus(parseCsv(IN_APPS));
  const specMap = countSkus(parseCsv(IN_SPECS));

  const allSkus = new Set([
    ...masterRows.map(r => r.elimfilters_sku),
    ...Object.keys(compMap),
    ...Object.keys(oemMap),
    ...Object.keys(appMap),
    ...Object.keys(specMap)
  ]);

  const readinessData = [];

  // Categorizations
  let cat1 = 0; // Competitor Cross References solamente
  let cat2 = 0; // Competitor Cross References + Specifications
  let cat3 = 0; // Competitor Cross References + Vehicle Applications
  let cat4 = 0; // Competitor Cross References + Vehicle Applications + Specifications
  let cat5 = 0; // OEM + Competitor + Vehicle Applications + Specifications

  for (const sku of allSkus) {
    if (!sku) continue;
    const compN = compMap[sku] || 0;
    const oemN = oemMap[sku] || 0;
    const appN = appMap[sku] || 0;
    const specN = specMap[sku] || 0;

    // Readiness Score Calculation (0-100)
    // - OEM Coverage: up to 25
    // - Competitor Coverage: up to 25
    // - Vehicle Applications: up to 30
    // - Specifications: up to 20
    let score = 0;
    
    if (oemN > 0) score += 25;
    
    if (compN >= 10) score += 25;
    else if (compN >= 5) score += 20;
    else if (compN > 0) score += 10;
    
    if (appN >= 10) score += 30;
    else if (appN >= 1) score += 15;
    
    if (specN > 0) score += 20;

    readinessData.push({
      elimfilters_sku: sku,
      oem_refs: oemN,
      competitor_refs: compN,
      applications: appN,
      specifications: specN,
      readiness_score: score
    });

    const hasComp = compN > 0;
    const hasOem = oemN > 0;
    const hasApps = appN > 0;
    const hasSpecs = specN > 0;

    // Mutually exclusive categorization for 1-4 based on the phrasing "solamente", "Competitor + Specs"
    // Assuming the user meant exactly these combinations, ignoring OEM for 1-4.
    // Let's check exactly:
    if (hasComp && !hasApps && !hasSpecs && !hasOem) {
      cat1++;
    } else if (hasComp && hasSpecs && !hasApps && !hasOem) {
      cat2++;
    } else if (hasComp && hasApps && !hasSpecs && !hasOem) {
      cat3++;
    } else if (hasComp && hasApps && hasSpecs && !hasOem) {
      cat4++;
    } 

    // Category 5 allows all
    if (hasOem && hasComp && hasApps && hasSpecs) {
      cat5++;
    }
  }

  // Sort and pick top 100
  readinessData.sort((a, b) => b.readiness_score - a.readiness_score);
  const top100 = readinessData.slice(0, 100);

  // Helper for percentages
  const pctTotal = (val) => ((val / TOTAL_LD_SKUS) * 100).toFixed(2);
  const pctRecov = (val) => ((val / RECOVERED_TARGET_SKUS) * 100).toFixed(2);

  const auditJson = {
    generated_at: new Date().toISOString(),
    base_metrics: {
      total_ld_catalog_skus: TOTAL_LD_SKUS,
      target_tier_e_skus: RECOVERED_TARGET_SKUS,
      skus_evaluated_in_this_phase: allSkus.size
    },
    readiness_categories: {
      "1_competitor_only": {
        count: cat1,
        pct_of_total_catalog: pctTotal(cat1),
        pct_of_recovered: pctRecov(cat1)
      },
      "2_competitor_and_specs": {
        count: cat2,
        pct_of_total_catalog: pctTotal(cat2),
        pct_of_recovered: pctRecov(cat2)
      },
      "3_competitor_and_apps": {
        count: cat3,
        pct_of_total_catalog: pctTotal(cat3),
        pct_of_recovered: pctRecov(cat3)
      },
      "4_competitor_apps_specs": {
        count: cat4,
        pct_of_total_catalog: pctTotal(cat4),
        pct_of_recovered: pctRecov(cat4)
      },
      "5_oem_competitor_apps_specs": {
        count: cat5,
        pct_of_total_catalog: pctTotal(cat5),
        pct_of_recovered: pctRecov(cat5)
      }
    },
    top_100_readiness_skus: top100
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(auditJson, null, 2));
  log(`Audit escrito: ${OUT_JSON}`);

  writeHeader(OUT_CSV, [
    'elimfilters_sku', 'oem_refs', 'competitor_refs', 'applications', 'specifications', 'readiness_score'
  ]);
  for (const r of readinessData) {
    writeCsvRow(OUT_CSV, [r.elimfilters_sku, r.oem_refs, r.competitor_refs, r.applications, r.specifications, r.readiness_score]);
  }
  log(`CSV escrito: ${OUT_CSV}`);
}

main();
