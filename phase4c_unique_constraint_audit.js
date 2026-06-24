/**
 * FASE 4C — UNIQUE CONSTRAINT AUDIT
 *
 * Objetivo: Validar la cardinalidad de las cruces y detectar el colapso masivo.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const IN_COMP = path.join(DIR, 'competitor_cross_references_ld.csv');
const IN_OEM = path.join(DIR, 'oem_cross_references_external_ld.csv');

const OUT_JSON = path.join(DIR, 'phase4c_unique_constraint_audit.json');
const OUT_CSV = path.join(DIR, 'phase4c_unique_constraint_examples.csv');

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
  if (!fs.existsSync(filePath)) return null;
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

function hash(row, keys) {
  return keys.map(k => String(row[k] || '').toLowerCase().trim()).join('|');
}

function analyzeTable(rows) {
  // Scenario A: The bugged one used in the script (mapped wrong headers so it was essentially only elimfilters_sku)
  const setA = new Set();
  
  // Scenario B: (elimfilters_sku, ref_brand, ref_code)
  const setB = new Set();
  const groupsB = {};

  // Scenario C: (elimfilters_sku, ref_brand, ref_code, source_sku)
  const setC = new Set();

  for (const r of rows) {
    const elim = r.elimfilters_sku || '';
    const src = r.source_sku || '';
    const brand = r.ref_brand || '';
    const code = r.ref_code || '';

    // A: In the dry run, I accidentally asked for row['competitor_brand'] which was undefined.
    // So the hash was exactly: `elim||`
    const hashA = `${elim.toLowerCase()}||`;
    setA.add(hashA);

    const hashB = `${elim.toLowerCase()}|${brand.toLowerCase()}|${code.toLowerCase()}`;
    setB.add(hashB);
    
    if (!groupsB[hashB]) {
      groupsB[hashB] = { elimfilters_sku: elim, brand: brand, code: code, count: 0 };
    }
    groupsB[hashB].count++;

    const hashC = `${elim.toLowerCase()}|${brand.toLowerCase()}|${code.toLowerCase()}|${src.toLowerCase()}`;
    setC.add(hashC);
  }

  // Find top 100 collapsed groups for Scenario B
  // "Collapsed" means count > 1
  const allGroups = Object.values(groupsB);
  const collapsed = allGroups.filter(g => g.count > 1);
  collapsed.sort((a, b) => b.count - a.count);
  const top100 = collapsed.slice(0, 100);

  return {
    total_raw: rows.length,
    scenario_A: setA.size,
    scenario_B: setB.size,
    scenario_C: setC.size,
    top_100_collapsed: top100.map(g => ({
      elimfilters_sku: g.elimfilters_sku,
      brand: g.brand,
      part_number: g.code,
      cantidad_original: g.count,
      cantidad_resultante: 1
    }))
  };
}

function main() {
  const compRows = parseCsv(IN_COMP) || [];
  const oemRows = parseCsv(IN_OEM) || [];

  const compAnalysis = analyzeTable(compRows);
  const oemAnalysis = analyzeTable(oemRows);

  const report = {
    generated_at: new Date().toISOString(),
    ld_competitor_cross_references: {
      exact_unique_used_in_dryrun: "elimfilters_sku, undefined, undefined (Bug de mapeo de headers en el script anterior)",
      top_100_collapsed_groups: compAnalysis.top_100_collapsed
    },
    ld_oem_cross_references: {
      exact_unique_used_in_dryrun: "elimfilters_sku, undefined, undefined (Bug de mapeo de headers)",
      top_100_collapsed_groups: oemAnalysis.top_100_collapsed
    },
    scenarios: {
      "Escenario_A": {
        "description": "UNIQUE actual usada en el Dry-Run (Solo elimfilters_sku por bug de variable)",
        "competitor_refs": compAnalysis.scenario_A,
        "oem_refs": oemAnalysis.scenario_A
      },
      "Escenario_B": {
        "description": "UNIQUE (elimfilters_sku, brand, code)",
        "competitor_refs": compAnalysis.scenario_B,
        "oem_refs": oemAnalysis.scenario_B
      },
      "Escenario_C": {
        "description": "UNIQUE (elimfilters_sku, brand, code, source_sku)",
        "competitor_refs": compAnalysis.scenario_C,
        "oem_refs": oemAnalysis.scenario_C
      }
    }
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2));

  // Write examples CSV for Competitor
  writeHeader(OUT_CSV, ['table', 'elimfilters_sku', 'brand', 'part_number', 'cantidad_original', 'cantidad_resultante']);
  for (const g of compAnalysis.top_100_collapsed) {
    writeCsvRow(OUT_CSV, ['ld_competitor_cross_references', g.elimfilters_sku, g.brand, g.part_number, g.cantidad_original, g.cantidad_resultante]);
  }
  for (const g of oemAnalysis.top_100_collapsed) {
    writeCsvRow(OUT_CSV, ['ld_oem_cross_references', g.elimfilters_sku, g.brand, g.part_number, g.cantidad_original, g.cantidad_resultante]);
  }

  console.log("Audit Complete.");
}

main();
