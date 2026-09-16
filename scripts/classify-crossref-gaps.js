/**
 * classify-crossref-gaps.js
 *
 * For a given donaldson_<category>_results.json, splits empty-brand_crossrefs
 * codes into "false gaps" (an alias/alternative code already has the data --
 * just needs propagating) vs "real gaps" (no resolved sibling, needs actual
 * research). Read-only: prints the split, writes nothing.
 *
 * Run: node classify-crossref-gaps.js <category>
 *   e.g. node classify-crossref-gaps.js cabin
 */
'use strict';

const fs = require('fs');
const path = require('path');

const category = process.argv[2];
if (!category) { console.error('Usage: node classify-crossref-gaps.js <category>'); process.exit(1); }

const file = path.join(__dirname, `donaldson_${category}_results.json`);
const results = JSON.parse(fs.readFileSync(file, 'utf8'));
const byCode = new Map(results.map((r) => [r.part_number, r]));

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
const falseGap = [];
const realGap = [];
for (const r of empty) {
  const code = r.part_number;
  const neighbors = adj.get(code) || new Set();
  let resolved = null;
  for (const n of neighbors) {
    if (hasNonEmpty(n)) { resolved = n; break; }
  }
  if (resolved) falseGap.push([code, resolved]);
  else realGap.push(code);
}

console.log(`\n=== ${category} ===`);
console.log('Total productos:', results.length);
console.log('Con brand_crossrefs vacio:', empty.length);
console.log('Falsos gaps (alias, propagable):', falseGap.length);
falseGap.forEach(([c, r]) => console.log('  ', c, '-> copiar de', r));
console.log('Gaps reales (sin alias con dato):', realGap.length);
if (realGap.length <= 80) realGap.forEach((c) => console.log('  -', c));
else console.log('  (', realGap.length, 'codigos, lista omitida por tamano)');
