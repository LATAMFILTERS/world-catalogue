/**
 * generate-crossref-candidates.js
 *
 * READ-ONLY. Does not touch any donaldson_<category>_results.json or
 * progress cache. Writes crossref_gap_candidates.json: for every real
 * crossref gap (no resolved alias), finds other products in the SAME
 * category with an identical physical `dimensions` signature (od/length/
 * thread, or width/height, depending on category) that already have
 * brand_crossrefs resolved, and lists which competitor brands those
 * dimension-twins carry.
 *
 * Rationale: Donaldson's own part numbering is not sequential by product
 * family, so "nearby part number" is not a reliable signal -- but two
 * products with byte-identical dimensions are extremely likely to be the
 * same physical design (or a very close variant), so a competitor brand
 * that makes an equivalent for one dimension-twin is a strong hint that
 * the same brand makes one for the others too.
 *
 * This produces CANDIDATES ONLY: "check brand X for this code" -- never a
 * predicted part number, and never written into brand_crossrefs. Every
 * suggestion still needs a human to verify the actual part number against
 * a real source before it goes in the catalog.
 *
 * Run: node generate-crossref-candidates.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const CATEGORIES = ['air-dryer', 'air', 'cabin', 'coolant', 'fuel', 'hydraulic'];
const ROOT = __dirname;

function dimSignature(rec) {
  const d = rec.dimensions;
  if (!d || Object.keys(d).length === 0) return null;
  const keys = Object.keys(d).sort();
  return keys.map((k) => `${k}=${JSON.stringify(d[k])}`).join('|');
}

function computeRealGaps(results) {
  const byCode = new Map(results.map((r) => [r.part_number, r]));
  const adj = new Map();
  function link(a, b) {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a).add(b);
    adj.get(b).add(a);
  }
  for (const r of results) for (const alt of (r.alternatives || [])) link(r.part_number, alt);
  function hasNonEmpty(code) {
    const rec = byCode.get(code);
    return rec && rec.brand_crossrefs && Object.keys(rec.brand_crossrefs).length > 0;
  }
  const empty = results.filter((r) => !r.brand_crossrefs || Object.keys(r.brand_crossrefs).length === 0);
  return empty.filter((r) => {
    const neighbors = adj.get(r.part_number) || new Set();
    for (const n of neighbors) if (hasNonEmpty(n)) return false;
    return true;
  });
}

const report = {};

for (const category of CATEGORIES) {
  const file = path.join(ROOT, `donaldson_${category}_results.json`);
  if (!fs.existsSync(file)) continue;
  const results = JSON.parse(fs.readFileSync(file, 'utf8'));

  const resolvedBySignature = new Map();
  for (const r of results) {
    if (!r.brand_crossrefs || Object.keys(r.brand_crossrefs).length === 0) continue;
    const sig = dimSignature(r);
    if (!sig) continue;
    if (!resolvedBySignature.has(sig)) resolvedBySignature.set(sig, []);
    resolvedBySignature.get(sig).push(r);
  }

  const realGaps = computeRealGaps(results);
  const candidates = [];

  for (const gapRec of realGaps) {
    const sig = dimSignature(gapRec);
    if (!sig) continue;
    const twins = resolvedBySignature.get(sig);
    if (!twins || twins.length === 0) continue;

    const brandCount = new Map();
    for (const twin of twins) {
      for (const brand of Object.keys(twin.brand_crossrefs)) {
        brandCount.set(brand, (brandCount.get(brand) || 0) + 1);
      }
    }
    const brandsRanked = [...brandCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([brand, count]) => `${brand} (${count}/${twins.length} gemelos)`);

    candidates.push({
      code: gapRec.part_number,
      dimension_twins: twins.map((t) => t.part_number),
      candidate_brands_to_check: brandsRanked,
    });
  }

  if (candidates.length > 0) report[category] = candidates;
}

const outFile = path.join(ROOT, 'crossref_gap_candidates.json');
fs.writeFileSync(outFile, JSON.stringify(report, null, 2));

let totalGaps = 0, totalWithCandidates = 0;
for (const [cat, list] of Object.entries(report)) {
  totalWithCandidates += list.length;
  console.log(`${cat}: ${list.length} gap code(s) with a dimension-twin match`);
}
console.log(`\nTotal candidates written to ${outFile}: ${totalWithCandidates}`);
console.log('These are NOT verified crossrefs -- they are "check these brands" hints only.');
