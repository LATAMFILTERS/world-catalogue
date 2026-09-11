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

run('discover official LD product pages','scripts/hermes/discover-fram-ld-product-pages.mjs');
run('extract private applications/cross evidence','scripts/hermes/extract-fram-ld-product-evidence.mjs',extractArgs);

console.log('\n[HERMES FRAM LD] COMPLETE');
console.log('[HERMES FRAM LD] source pages → private snapshots → candidate applications/crosses → optional read-only DB reconciliation');
console.log('[HERMES FRAM LD] confirmed catalog writes remain blocked by governance');
