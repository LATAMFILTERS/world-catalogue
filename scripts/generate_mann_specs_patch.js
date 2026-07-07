#!/usr/bin/env node
/**
 * generate_mann_specs_patch.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Reads C:\mann\mann_master.jsonl  (output of scraper_mann_master.py)
 * Maps MANN dimension fields → DB column names
 * Infers EL/EA/EC/EF SKU using same logic as /api/import/mann
 * Writes scripts/mann_specs_patch.jsonl  (one JSON object per line)
 *
 * Usage:
 *   node scripts/generate_mann_specs_patch.js
 *   node scripts/generate_mann_specs_patch.js --input C:\mann\mann_master.jsonl
 *   node scripts/generate_mann_specs_patch.js --dry-run
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const INPUT_FILE      = process.argv.includes('--input')
  ? process.argv[process.argv.indexOf('--input') + 1]
  : 'C:\\mann\\mann_master.jsonl';
const INPUT_GAPS_FILE = 'C:\\mann\\mann_master_gaps.jsonl'; // scraper --from-gaps output
const OUTPUT_FILE     = path.join(__dirname, 'mann_specs_patch.jsonl');
const DRY_RUN         = process.argv.includes('--dry-run');

// ── SKU prefix map (same as server.js /api/import/mann) ──────────────────────
const MANN_SKU_PREFIXES = {
  'Oil Filter':    'EL3',
  'Air Filter':    'EA3',
  'Cabin Filter':  'EC3',
  'Fuel Filter':   'EF3',
};

// Mann part-number prefix → filter type (fallback)
const MANN_PREFIX_TYPE = [
  ['CUK',  'Cabin Filter'],
  ['FP',   'Cabin Filter'],
  ['CU',   'Air Filter'],
  ['WK',   'Fuel Filter'],
  ['ML',   'Oil Filter'],
  ['HU',   'Oil Filter'],
  ['MW',   'Oil Filter'],
  ['MH',   'Oil Filter'],
  ['LC',   'Cabin Filter'],
  ['LA',   'Cabin Filter'],
  ['KC',   'Fuel Filter'],
  ['KL',   'Fuel Filter'],
  ['PU',   'Fuel Filter'],
  ['CF',   'Air Filter'],
  ['CP',   'Air Filter'],
  ['SP',   'Oil Filter'],
  ['W',    'Oil Filter'],
  ['C',    'Air Filter'],
  ['H',    'Oil Filter'],
  ['P',    'Fuel Filter'],
];

function inferType(mannCode) {
  const code = (mannCode || '').toUpperCase().replace(/\s/g, '');
  for (const [prefix, ftype] of MANN_PREFIX_TYPE) {
    if (code.startsWith(prefix.toUpperCase())) return ftype;
  }
  return null;
}

function generateSku(mannCode, filterType) {
  const prefix = MANN_SKU_PREFIXES[filterType];
  if (!prefix) return null;
  const digits = mannCode.replace(/[^0-9]/g, '');
  if (!digits) return null;
  const codigoBase = digits.slice(-4).padStart(4, '0');
  return prefix + codigoBase;
}

// ── Dimension key normalization ───────────────────────────────────────────────
// MANN exports dimension names in German, English, or single-letter codes.
// We map ALL known variants to DB column names.

function parseMm(val) {
  if (val == null) return null;
  const str = String(val).toLowerCase().trim();
  
  // Detect if unit is inches
  const isInch = str.includes('inch') || str.includes('in') || str.includes('"');
  
  // Extract number (support decimal comma replacement)
  const s = str.replace(',', '.').replace(/[^0-9.]/g, '');
  let n = parseFloat(s);
  if (isNaN(n)) return null;

  if (isInch) {
    n = n * 25.4;
  }

  // Round to 2 decimal places for database accuracy
  return Math.round(n * 100) / 100;
}

/**
 * Given the `dimensions` object from mann_master.jsonl, extract DB-ready fields.
 * Returns { outer_diameter_mm, height_mm, gasket_od_mm, gasket_id_mm, thread_size }
 */
function mapDimensions(dims) {
  const out = {
    outer_diameter_mm:  null,
    height_mm:          null,
    gasket_od_mm:       null,
    gasket_id_mm:       null,
    thread_size:        null,
  };
  if (!dims || typeof dims !== 'object') return out;

  for (const [key, val] of Object.entries(dims)) {
    const k = key.trim();

    // Height / Höhe / H
    if (/^(H|Height|H\u00f6he)$/i.test(k)) {
      out.height_mm = parseMm(val);
    }
    // Outer diameter / Außendurchmesser / A
    else if (/^(A|Outer diameter|Au.?endurchmesser)$/i.test(k)) {
      out.outer_diameter_mm = parseMm(val);
    }
    // Thread / G
    else if (/^G$/i.test(k)) {
      // G is usually "3/4-16 UNF" or "M20x1,5"
      out.thread_size = String(val).trim() || null;
    }
    // Gasket OD / B
    else if (/^B$/i.test(k)) {
      out.gasket_od_mm = parseMm(val);
    }
    // Gasket ID / Inner diameter / C
    else if (/^(C|Inner diameter|Innendurchmesser)$/i.test(k)) {
      out.gasket_id_mm = parseMm(val);
    }
  }

  return out;
}

function inferInstallationType(filterType) {
  if (!filterType) return null;
  const ft = filterType.toLowerCase();
  if (ft.includes('oil')) return 'Spin-On';
  if (ft.includes('fuel')) return 'Spin-On';
  if (ft.includes('air')) return 'Panel';
  if (ft.includes('cabin')) return 'Panel';
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  const allRecordsMap = new Map();

  // 1. Read primary master file
  if (fs.existsSync(INPUT_FILE)) {
    const lines = fs.readFileSync(INPUT_FILE, 'utf8').split('\n').filter(Boolean);
    console.log(`📥 Reading primary file: ${lines.length} records from ${INPUT_FILE}`);
    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        const sku = (record.sku || '').trim().toUpperCase();
        if (sku) {
          allRecordsMap.set(sku, record);
        }
      } catch (e) {}
    }
  } else {
    console.log(`⚠️ Primary input file not found: ${INPUT_FILE}`);
  }

  // 2. Read gaps file and merge (only if not already present to avoid overwriting primary data)
  if (fs.existsSync(INPUT_GAPS_FILE)) {
    const lines = fs.readFileSync(INPUT_GAPS_FILE, 'utf8').split('\n').filter(Boolean);
    console.log(`📥 Reading gaps file: ${lines.length} records from ${INPUT_GAPS_FILE}`);
    let mergedCount = 0;
    for (const line of lines) {
      try {
        const record = JSON.parse(line);
        const sku = (record.sku || '').trim().toUpperCase();
        if (sku) {
          if (!allRecordsMap.has(sku)) {
            allRecordsMap.set(sku, record);
            mergedCount++;
          }
        }
      } catch (e) {}
    }
    console.log(`   Merged ${mergedCount} new unique records from gaps file.`);
  } else {
    console.log(`⚠️ Gaps input file not found: ${INPUT_GAPS_FILE}`);
  }

  console.log(`📊 Combined unique records to process: ${allRecordsMap.size}`);

  const patches = [];
  const stats = { total: 0, skipped_no_sku: 0, skipped_no_type: 0, skipped_no_dims: 0, ok: 0 };

  for (const [mannCode, record] of allRecordsMap.entries()) {
    stats.total++;

    // Resolve filter type
    let filterType = record.filter_type || '';
    if (!MANN_SKU_PREFIXES[filterType]) {
      filterType = inferType(mannCode);
    }
    if (!filterType || !MANN_SKU_PREFIXES[filterType]) {
      stats.skipped_no_type++;
      continue;
    }

    // Generate EL/EA/EC/EF SKU
    const elSku = generateSku(mannCode, filterType);
    if (!elSku) {
      stats.skipped_no_sku++;
      continue;
    }

    // Map dimensions
    const dims    = mapDimensions(record.dimensions || record.dims_inline || {});
    const hasAny  = Object.values(dims).some(v => v != null);
    if (!hasAny) {
      stats.skipped_no_dims++;
      continue;
    }

    const patch = {
      sku:                 elSku,
      mann_source:         mannCode,
      installation_type:   inferInstallationType(filterType),
      thread_size:         dims.thread_size,
      outer_diameter_mm:   dims.outer_diameter_mm,
      height_mm:           dims.height_mm,
      gasket_od_mm:        dims.gasket_od_mm,
      gasket_id_mm:        dims.gasket_id_mm,
      iso_test_method:     null,
      micron_rating:       null,
      nominal_efficiency:  null,
      burst_pressure_psi:  null,
      collapse_pressure_psi: null,
    };

    patches.push(patch);
    stats.ok++;
  }

  console.log('\n📊 Stats:');
  console.log(`   Total records:       ${stats.total}`);
  console.log(`   Skipped (no sku):    ${stats.skipped_no_sku}`);
  console.log(`   Skipped (no type):   ${stats.skipped_no_type}`);
  console.log(`   Skipped (no dims):   ${stats.skipped_no_dims}`);
  console.log(`   Ready to patch:      ${stats.ok}`);

  if (DRY_RUN) {
    console.log('\n🔍 DRY RUN — sample output (first 3):');
    patches.slice(0, 3).forEach(p => console.log(JSON.stringify(p, null, 2)));
    return;
  }

  const out = patches.map(p => JSON.stringify(p)).join('\n') + '\n';
  fs.writeFileSync(OUTPUT_FILE, out, 'utf8');
  console.log(`\n✅ Written ${patches.length} patches → ${OUTPUT_FILE}`);
}

main();
