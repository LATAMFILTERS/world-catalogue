/**
 * propagate-dbl-alias-crossrefs.js
 *
 * The 4 DBL codes below are Donaldson's own alias for a P-code product
 * (same physical filter, different Donaldson part number) and were showing
 * up as "unresolved crossref gaps" only because their brand_crossrefs was
 * never copied from the P-code record that already has it.
 *
 * Run once: node propagate-dbl-alias-crossrefs.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PROGRESS_FILE = path.join(ROOT, 'donaldson_lube_crossref_progress.json');
const RESULTS_FILE = path.join(ROOT, 'donaldson_lube_results.json');

const ALIAS_PAIRS = [
  ['DBL0832', 'P550832'],
  ['DBL4560', 'P554560'],
  ['DBL7739', 'P554004'],
  ['DBL7947', 'P550947'],
];

const progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
const results = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8'));
const resultsByCode = new Map(results.map((r) => [r.part_number, r]));

for (const [dbl, p] of ALIAS_PAIRS) {
  const refs = progress[p];
  if (!refs || Object.keys(refs).length === 0) {
    throw new Error(`${p} has no brand_crossrefs to copy to ${dbl}`);
  }
  progress[dbl] = refs;
  const dblRec = resultsByCode.get(dbl);
  if (!dblRec) throw new Error(`${dbl} not found in results file`);
  dblRec.brand_crossrefs = refs;
  console.log(`${dbl} <- copied ${Object.keys(refs).length} brands from ${p}`);
}

fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));
console.log('Done.');
