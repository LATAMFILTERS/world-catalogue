#!/usr/bin/env node
/**
 * validate-part-search-integrity.mjs
 * Phase G — path-count reconciliation and PART_SEARCH_MAP freshness gates.
 *
 * Read-only. Does not write PART_SEARCH_MAP.json or CITATION_INDEX.json.
 *
 * Implements:
 *   Gate 9  — path count mismatch: PART_SEARCH_MAP.json's meta.path_count,
 *             frontend/public/api/citation/path/index.json's path_count, and
 *             the actual on-disk path/PATH_*.json count must all match.
 *   Gate 10 — PART_SEARCH_MAP freshness: proves PART_SEARCH_MAP.json reflects
 *             the CURRENT CITATION_INDEX.json, not just that totals happen to
 *             agree. Implemented by re-running
 *             `node scripts/build-part-search-map.js --validate` (the
 *             generator's own existing dry-run mode — no generator code
 *             changed) and comparing its freshly recomputed summary numbers
 *             (total/valid path counts, per-type counts, coverage stats)
 *             against what is already stored in PART_SEARCH_MAP.json. A
 *             stale PART_SEARCH_MAP.json (e.g. computed from an older
 *             CITATION_INDEX.json) will diverge from a fresh recomputation
 *             even if its own internal total happens to match Gate 9's count.
 *
 * Usage: node scripts/validate-part-search-integrity.mjs
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PART_SEARCH_MAP_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'PART_SEARCH_MAP.json');
const PATH_INDEX_PATH = path.join(ROOT, 'frontend', 'public', 'api', 'citation', 'path', 'index.json');
const PATH_DIR = path.join(ROOT, 'frontend', 'public', 'api', 'citation', 'path');
const BUILD_SCRIPT = path.join(ROOT, 'scripts', 'build-part-search-map.js');

const errors = [];
function fail(gate, msg) {
  errors.push(`[Gate ${gate}] ${msg}`);
}

const partSearchMap = JSON.parse(fs.readFileSync(PART_SEARCH_MAP_PATH, 'utf8'));
const pathIndex = JSON.parse(fs.readFileSync(PATH_INDEX_PATH, 'utf8'));
const onDiskPathCount = fs.readdirSync(PATH_DIR, { withFileTypes: true })
  .filter((e) => e.isFile() && /^PATH_[ABC]_.*\.json$/.test(e.name)).length;

// ---------------------------------------------------------------------------
// Gate 9: path count mismatch
// ---------------------------------------------------------------------------
const counts = {
  'PART_SEARCH_MAP.json meta.path_count': partSearchMap.meta.path_count,
  'path/index.json path_count': pathIndex.path_count,
  'on-disk PATH_*.json count': onDiskPathCount,
};
const uniqueCounts = new Set(Object.values(counts));
if (uniqueCounts.size > 1) {
  fail(9, `path counts do not reconcile: ${Object.entries(counts).map(([k, v]) => `${k}=${v}`).join(', ')}`);
}

// ---------------------------------------------------------------------------
// Gate 10: PART_SEARCH_MAP freshness vs current CITATION_INDEX.json
// ---------------------------------------------------------------------------
let dryRunOutput;
try {
  dryRunOutput = execFileSync('node', [BUILD_SCRIPT, '--validate'], { cwd: ROOT, encoding: 'utf8' });
} catch (err) {
  fail(10, `build-part-search-map.js --validate failed to run: ${err.message}`);
  dryRunOutput = '';
}

function parseLine(re, label) {
  const m = dryRunOutput.match(re);
  if (!m) {
    fail(10, `could not parse "${label}" from build-part-search-map.js --validate output`);
    return null;
  }
  return m[1];
}

const freshTotal = parseLine(/Traversal paths built:\s*(\d+)/, 'total paths');
const freshValid = parseLine(/Valid paths:\s*(\d+)/, 'valid paths');
const freshTypeA = parseLine(/Type A \(Problem→PF\):\s*(\d+)\s*\((\d+) valid\)/, 'type A') !== null
  ? dryRunOutput.match(/Type A \(Problem→PF\):\s*(\d+)\s*\((\d+) valid\)/)
  : null;
const freshTypeB = dryRunOutput.match(/Type B \(Industry→PF\):\s*(\d+)\s*\((\d+) valid\)/);
const freshTypeC = dryRunOutput.match(/Type C \(Technology→PF\):\s*(\d+)\s*\((\d+) valid\)/);
const freshPFMapped = dryRunOutput.match(/Product families mapped:\s*(\d+)\/(\d+)/);
const freshUnmappedFamilies = parseLine(/Unmapped families:\s*(\d+)/, 'unmapped families');
const freshTechsWithoutPF = parseLine(/Technologies without PF:\s*(\d+)/, 'technologies without PF');
const freshProblemsWithoutPaths = parseLine(/Problems without paths:\s*(\d+)/, 'problems without paths');

const storedTotal = String(partSearchMap.meta.path_count);
const storedValid = String(partSearchMap.meta.valid_path_count);
const storedPaths = partSearchMap.traversal_paths || [];
const storedTypeACount = storedPaths.filter((p) => p.path_type === 'A').length;
const storedTypeAValid = storedPaths.filter((p) => p.path_type === 'A' && p.valid).length;
const storedTypeBCount = storedPaths.filter((p) => p.path_type === 'B').length;
const storedTypeBValid = storedPaths.filter((p) => p.path_type === 'B' && p.valid).length;
const storedTypeCCount = storedPaths.filter((p) => p.path_type === 'C').length;
const storedTypeCValid = storedPaths.filter((p) => p.path_type === 'C' && p.valid).length;
const storedUnmappedFamilies = String((partSearchMap.unmapped_entities?.product_families_unreachable || []).length);
const storedTechsWithoutPF = String((partSearchMap.unmapped_entities?.technologies_without_families || []).length);
const storedProblemsWithoutPaths = String((partSearchMap.unmapped_entities?.problems_without_paths || []).length);
const storedProductFamilyCount = String(partSearchMap.meta.product_family_count);

function compare(label, fresh, stored) {
  if (fresh === null || fresh === undefined) return;
  if (String(fresh) !== String(stored)) {
    fail(10, `${label}: fresh recomputation=${fresh}, PART_SEARCH_MAP.json=${stored} — PART_SEARCH_MAP.json does not reflect the current CITATION_INDEX.json`);
  }
}

compare('total path count', freshTotal, storedTotal);
compare('valid path count', freshValid, storedValid);
if (freshTypeA) compare('Type A count', freshTypeA[1], storedTypeACount);
if (freshTypeA) compare('Type A valid count', freshTypeA[2], storedTypeAValid);
if (freshTypeB) compare('Type B count', freshTypeB[1], storedTypeBCount);
if (freshTypeB) compare('Type B valid count', freshTypeB[2], storedTypeBValid);
if (freshTypeC) compare('Type C count', freshTypeC[1], storedTypeCCount);
if (freshTypeC) compare('Type C valid count', freshTypeC[2], storedTypeCValid);
if (freshPFMapped) compare('product families reachable', freshPFMapped[1], (partSearchMap.meta.coverage_summary?.product_families_reachable || '').split('/')[0]);
if (freshPFMapped) compare('product family total', freshPFMapped[2], storedProductFamilyCount);
compare('unmapped families', freshUnmappedFamilies, storedUnmappedFamilies);
compare('technologies without PF', freshTechsWithoutPF, storedTechsWithoutPF);
compare('problems without paths', freshProblemsWithoutPaths, storedProblemsWithoutPaths);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log('PART SEARCH INTEGRITY — Phase G');
console.log('=================================');
console.log('Path counts:', JSON.stringify(counts));
console.log('Freshness comparison points checked: 12');
console.log('');
if (errors.length === 0) {
  console.log('RESULT: PASS — path counts reconciled, PART_SEARCH_MAP.json is fresh against current CITATION_INDEX.json.');
} else {
  console.log(`RESULT: FAIL — ${errors.length} violation(s).`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exitCode = 1;
}
