/**
 * propagate-crossref-aliases.js
 *
 * Generic version of propagate-dbl-alias-crossrefs.js: for a given
 * donaldson_<category>_results.json, finds every empty-brand_crossrefs code
 * that has an alias/alternative (in either direction) whose brand_crossrefs
 * is already resolved, and copies it across. Never touches genuine gaps
 * (no resolved sibling) and never overwrites a code that already has data.
 *
 * Also updates donaldson_<category>_crossref_progress.json if that cache
 * file exists for the category.
 *
 * Run: node propagate-crossref-aliases.js <category>
 *   e.g. node propagate-crossref-aliases.js hydraulic
 */
'use strict';

const fs = require('fs');
const path = require('path');

const category = process.argv[2];
if (!category) { console.error('Usage: node propagate-crossref-aliases.js <category>'); process.exit(1); }

const resultsFile = path.join(__dirname, `donaldson_${category}_results.json`);
const progressFile = path.join(__dirname, `donaldson_${category}_crossref_progress.json`);

const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
const byCode = new Map(results.map((r) => [r.part_number, r]));
const progress = fs.existsSync(progressFile) ? JSON.parse(fs.readFileSync(progressFile, 'utf8')) : null;

const adj = new Map();
function link(a, b) {
  if (!adj.has(a)) adj.set(a, new Set());
  if (!adj.has(b)) adj.set(b, new Set());
  adj.get(a).add(b);
  adj.get(b).add(a);
}
for (const r of results) {
  for (const alt of (r.alternatives || [])) link(r.part_number, alt);
}

function hasNonEmpty(code) {
  const rec = byCode.get(code);
  return rec && rec.brand_crossrefs && Object.keys(rec.brand_crossrefs).length > 0;
}

const empty = results.filter((r) => !r.brand_crossrefs || Object.keys(r.brand_crossrefs).length === 0);
let propagated = 0;

for (const r of empty) {
  const code = r.part_number;
  const neighbors = adj.get(code) || new Set();
  let source = null;
  for (const n of neighbors) {
    if (hasNonEmpty(n)) { source = n; break; }
  }
  if (!source) continue;

  const refs = byCode.get(source).brand_crossrefs;
  r.brand_crossrefs = refs;
  if (progress) progress[code] = refs;
  console.log(`${code} <- copied ${Object.keys(refs).length} brands from ${source}`);
  propagated++;
}

fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
if (progress) fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));

console.log(`\n${category}: propagated ${propagated} alias(es).`);
