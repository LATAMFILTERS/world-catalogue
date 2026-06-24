/**
 * FASE 4A — LD PRODUCTION READINESS & GAP ANALYSIS
 *
 * Objetivo: Clasificar los 7,833 SKUs en Tiers de producción y generar un Gap Analysis.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const JSONL_PATH = 'C:\\Users\\VICTOR ABREU\\OneDrive\\Documents\\New project\\mann_oem_clean_v2_output\\mann_oem_clean_v2_context.jsonl';
const DIR = __dirname;
const IN_P3F_CSV = path.join(DIR, 'phase3f_catalog_readiness.csv');
const IN_ENRICH_MASTER = path.join(DIR, 'ld_enrichment_master.csv');
const IN_APP_MASTER = path.join(DIR, 'vehicle_applications_master.csv');
const IN_OEM_EXT = path.join(DIR, 'oem_cross_references_external_ld.csv');
const IN_COMP_EXT = path.join(DIR, 'competitor_cross_references_ld.csv');

const OUT_JSON = path.join(DIR, 'phase4a_production_readiness.json');
const OUT_CSV = path.join(DIR, 'phase4a_production_readiness.csv');
const OUT_GAP = path.join(DIR, 'phase4a_gap_analysis.csv');

function log(msg) { console.log(`[${new Date().toISOString()}] ${msg}`); }

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
    } else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
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

function csvEsc(v) { return `"${String(v == null ? '' : v).replace(/"/g, '""')}"`; }
function writeHeader(file, cols) { fs.writeFileSync(file, cols.map(csvEsc).join(',') + '\n'); }
function writeCsvRow(file, fields) { fs.appendFileSync(file, fields.map(csvEsc).join(',') + '\n'); }

function getPrefix(segment) {
  const s = (segment||'').toLowerCase();
  if (s.includes('oil')) return 'EL';
  if (s.includes('air')) return 'EA';
  if (s.includes('fuel')) return 'EF';
  if (s.includes('cabin')) return 'EC';
  return 'EX';
}

function normalizeSku(sku) {
  return (sku || '').replace(/[^A-Z0-9]/ig, '').toUpperCase();
}

function main() {
  log('=== FASE 4A — LD PRODUCTION READINESS & GAP ANALYSIS ===');

  const skus = {}; // source_sku -> data

  // 1. Read Base Catalog (7833 SKUs) from JSONL
  log(`Reading base catalog from JSONL: ${JSONL_PATH}`);
  const jsonlLines = fs.readFileSync(JSONL_PATH, 'utf8').split(/\r?\n/).filter(Boolean);
  for (const line of jsonlLines) {
    const obj = JSON.parse(line);
    if (obj.catalog_source_file && obj.catalog_source_file.includes('ld')) {
      const sourceSku = obj.sku;
      const cleanSku = normalizeSku(sourceSku);
      const prefix = getPrefix(obj.segment);
      let elimSku = '';
      // Quick heuristic to find standard elimfilters_sku if possible. We'll refine later if needed.
      // But we will primarily track by source_sku.

      const hasOem = obj.oem_records && obj.oem_records.length > 0;
      const hasComp = obj.references && obj.references.length > 0;
      const hasApp = obj.applications && obj.applications.length > 0;
      
      let hasSpec = false;
      if (obj.attributes_relevant) {
        if (obj.attributes_relevant.outer_diameter || obj.attributes_relevant.height || obj.attributes_relevant.dimensions) {
          hasSpec = true;
        }
      }

      skus[sourceSku] = {
        source_sku: sourceSku,
        segment: obj.segment || 'Unknown',
        has_oem: hasOem,
        has_comp: hasComp,
        has_app: hasApp,
        has_spec: hasSpec,
        elimfilters_sku: '' // Fill in later from CSVs if available
      };
    }
  }
  log(`Base SKUs loaded: ${Object.keys(skus).length}`);

  // Create a fast lookup by elimfilters_sku
  const elimToSource = {};

  // Read provided Phase CSVs and overlay coverage
  const augmentWithCsv = (file, type) => {
    log(`Augmenting with ${path.basename(file)}...`);
    const rows = parseCsv(file);
    for (const r of rows) {
      const source = r.source_sku;
      const elim = r.elimfilters_sku;
      if (source && skus[source]) {
        if (elim) skus[source].elimfilters_sku = elim;
        if (type === 'oem') skus[source].has_oem = true;
        if (type === 'comp') skus[source].has_comp = true;
        if (type === 'app') skus[source].has_app = true;
        if (type === 'spec') skus[source].has_spec = true;
      } else if (elim) {
        // Try to match if source_sku is slightly different but elim matches?
        // Actually, ld_enrichment_master.csv always has source_sku.
      }
    }
  };

  augmentWithCsv(IN_OEM_EXT, 'oem');
  augmentWithCsv(IN_COMP_EXT, 'comp');
  augmentWithCsv(IN_APP_MASTER, 'app');

  // Also Phase 3F
  log(`Augmenting with phase3f_catalog_readiness.csv...`);
  const p3fRows = parseCsv(IN_P3F_CSV);
  for (const r of p3fRows) {
    // Need to find which source_sku this elimfilters_sku corresponds to
    // Since phase3f doesn't have source_sku, we rely on the ones mapped above
    // or we can read ld_enrichment_master to build the map
  }

  log(`Reading ld_enrichment_master.csv to map elimfilters_sku to source_sku...`);
  const enrichRows = parseCsv(IN_ENRICH_MASTER);
  for (const r of enrichRows) {
    if (r.elimfilters_sku && r.source_sku && skus[r.source_sku]) {
      skus[r.source_sku].elimfilters_sku = r.elimfilters_sku;
      if (parseInt(r.application_count) > 0) skus[r.source_sku].has_app = true;
      if (parseInt(r.specification_count) > 0) skus[r.source_sku].has_spec = true;
    }
  }

  // Now classify all SKUs into Tiers
  const results = [];
  const tiers = { TIER_P1: 0, TIER_P2: 0, TIER_P3: 0, TIER_P4: 0, TIER_P5: 0 };
  const gapStats = { missingOem: 0, missingApps: 0, missingSpecs: 0, missingComp: 0 };
  const segmentStats = {};

  for (const key of Object.keys(skus)) {
    const s = skus[key];
    const seg = s.segment;
    if (!segmentStats[seg]) segmentStats[seg] = { total: 0, ready: 0, missingOem: 0, missingApps: 0, missingSpecs: 0, missingComp: 0 };
    
    segmentStats[seg].total++;

    if (!s.has_oem) { gapStats.missingOem++; segmentStats[seg].missingOem++; }
    if (!s.has_app) { gapStats.missingApps++; segmentStats[seg].missingApps++; }
    if (!s.has_spec) { gapStats.missingSpecs++; segmentStats[seg].missingSpecs++; }
    if (!s.has_comp) { gapStats.missingComp++; segmentStats[seg].missingComp++; }

    let tier = 'TIER_P5';
    if (s.has_oem && s.has_comp && s.has_app && s.has_spec) {
      tier = 'TIER_P1';
      segmentStats[seg].ready++;
    } else if (s.has_oem && s.has_comp && s.has_app) {
      tier = 'TIER_P2';
    } else if (s.has_oem && s.has_comp) {
      tier = 'TIER_P3';
    } else if (s.has_comp) {
      tier = 'TIER_P4';
    } else {
      tier = 'TIER_P5';
    }

    tiers[tier]++;

    // Ensure elimfilters_sku is populated for output
    let finalElim = s.elimfilters_sku;
    if (!finalElim) {
      const prefix = getPrefix(s.segment);
      finalElim = prefix + normalizeSku(s.source_sku);
    }

    results.push({
      elimfilters_sku: finalElim,
      source_sku: s.source_sku,
      segment: seg,
      has_oem: s.has_oem ? 1 : 0,
      has_competitor: s.has_comp ? 1 : 0,
      has_applications: s.has_app ? 1 : 0,
      has_specifications: s.has_spec ? 1 : 0,
      tier: tier
    });
  }

  // Generate CSVs
  writeHeader(OUT_CSV, [
    'elimfilters_sku', 'source_sku', 'segment', 'has_oem', 'has_competitor', 'has_applications', 'has_specifications', 'production_tier'
  ]);
  for (const r of results) {
    writeCsvRow(OUT_CSV, [r.elimfilters_sku, r.source_sku, r.segment, r.has_oem, r.has_competitor, r.has_applications, r.has_specifications, r.tier]);
  }
  log(`CSV escrito: ${OUT_CSV}`);

  // Gap Analysis CSV
  const gaps = results.filter(r => r.tier !== 'TIER_P1').map(r => {
    let missingCount = 0;
    const missingFlags = [];
    if (!r.has_oem) { missingCount++; missingFlags.push('OEM'); }
    if (!r.has_competitor) { missingCount++; missingFlags.push('Competitor'); }
    if (!r.has_applications) { missingCount++; missingFlags.push('Applications'); }
    if (!r.has_specifications) { missingCount++; missingFlags.push('Specifications'); }
    return { ...r, missing_count: missingCount, missing_flags: missingFlags.join(' | ') };
  });
  gaps.sort((a, b) => a.missing_count - b.missing_count);

  writeHeader(OUT_GAP, [
    'elimfilters_sku', 'source_sku', 'segment', 'production_tier', 'missing_data_count', 'missing_components'
  ]);
  for (const r of gaps) {
    writeCsvRow(OUT_GAP, [r.elimfilters_sku, r.source_sku, r.segment, r.tier, r.missing_count, r.missing_flags]);
  }
  log(`Gap Analysis CSV escrito: ${OUT_GAP}`);

  const total = Object.keys(skus).length;
  const pct = (v) => ((v / total) * 100).toFixed(2);

  const segArr = Object.entries(segmentStats).map(([seg, d]) => ({
    segment: seg,
    total_skus: d.total,
    production_ready_skus: d.ready,
    readiness_pct: ((d.ready / d.total) * 100).toFixed(2),
    gap_score: d.missingOem + d.missingApps + d.missingSpecs + d.missingComp
  }));

  const topReady = [...segArr].sort((a, b) => parseFloat(b.readiness_pct) - parseFloat(a.readiness_pct));
  const topGap = [...segArr].sort((a, b) => b.gap_score - a.gap_score);

  const auditJson = {
    generated_at: new Date().toISOString(),
    total_ld_skus: total,
    production_tiers: {
      "TIER_P1": { count: tiers.TIER_P1, pct: pct(tiers.TIER_P1), description: "OEM + Competitor + Apps + Specs" },
      "TIER_P2": { count: tiers.TIER_P2, pct: pct(tiers.TIER_P2), description: "OEM + Competitor + Apps" },
      "TIER_P3": { count: tiers.TIER_P3, pct: pct(tiers.TIER_P3), description: "OEM + Competitor" },
      "TIER_P4": { count: tiers.TIER_P4, pct: pct(tiers.TIER_P4), description: "Competitor Only" },
      "TIER_P5": { count: tiers.TIER_P5, pct: pct(tiers.TIER_P5), description: "No Commercial Data / Partial Non-Compliant" }
    },
    cumulative_coverage: {
      ready_for_production_P1: pct(tiers.TIER_P1),
      acceptable_for_production_P1_P2: pct(tiers.TIER_P1 + tiers.TIER_P2),
      needs_enrichment_P3_P4_P5: pct(tiers.TIER_P3 + tiers.TIER_P4 + tiers.TIER_P5)
    },
    gap_analysis_totals: {
      skus_missing_oem: gapStats.missingOem,
      skus_missing_competitor: gapStats.missingComp,
      skus_missing_applications: gapStats.missingApps,
      skus_missing_specifications: gapStats.missingSpecs
    },
    top_segments_ready: topReady.slice(0, 5),
    top_segments_with_gap: topGap.slice(0, 5)
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(auditJson, null, 2));
  log(`JSON escrito: ${OUT_JSON}`);
}

main();
