#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import process from 'node:process';

function run(label, script, extra=[]) {
  console.log(`\n[HERMES FRAM LD] ${label}`);
  const result = spawnSync(process.execPath,[script,...extra],{stdio:'inherit',env:process.env,cwd:process.cwd()});
  if (result.status !== 0) throw new Error(`${label} failed with exit ${result.status ?? 'unknown'}`);
}

const reconcile = process.argv.includes('--reconcile');
const limitIndex = process.argv.indexOf('--limit');
const extractArgs = [];
if (reconcile) extractArgs.push('--reconcile');
if (limitIndex >= 0 && process.argv[limitIndex+1]) extractArgs.push('--limit',process.argv[limitIndex+1]);

run('discover FRAM LD LUBE/AIR/CABIN/FUEL pages','scripts/hermes/discover-fram-ld-product-pages.mjs');
run('extract private applications/cross evidence','scripts/hermes/extract-fram-ld-product-evidence.mjs',extractArgs);
run('enrich four-family, logistics and competitor-cross evidence','scripts/hermes/enrich-fram-ld-four-family-evidence.mjs');

console.log('\n[HERMES FRAM LD] COMPLETE');
console.log('[HERMES FRAM LD] allowed families: LUBE, AIR, CABIN, FUEL only');
console.log('[HERMES FRAM LD] source pages → private snapshots → applications/cross candidates → logistics evidence → optional read-only DB reconciliation');
console.log('[HERMES FRAM LD] Europe promotion excluded; MANN-FILTER remains European LD nomenclature authority');
console.log('[HERMES FRAM LD] MANN-FILTER references observed in non-European FRAM evidence are classified only as Cross Reference Competitor candidates');
console.log('[HERMES FRAM LD] confirmed catalog/logistics writes remain blocked until validation');
