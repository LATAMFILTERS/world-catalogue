#!/usr/bin/env node
// HERMES — CLI that restores hermes/baselines/source-baseline.json (the
// local, gitignored, ephemeral operational copy the collector compares
// against) from the durable hermes-state branch, before every collection
// run. Read-only against the remote: it only ever `git fetch`es and
// `git show`s objects from hermes-state — it never pushes, and requires
// nothing beyond the default `contents: read` permission.
//
// If hermes-state (or state/source-baseline.json inside it) does not exist
// yet, this deliberately does NOT create a local baseline file — the
// collector's own loadBaseline() then treats every source as
// BASELINE_REQUIRED rather than silently seeding a baseline from a single
// run's observations.
import path from 'node:path';
import process from 'node:process';
import { restoreBaselineFromState } from './promote-baseline-core.mjs';

const remote = process.env.HERMES_STATE_REMOTE || 'origin';
const localBaselinePath = path.resolve('hermes/baselines/source-baseline.json');

const result = restoreBaselineFromState({ cwd: process.cwd(), remote, localBaselinePath });

if (result.status === 'RESTORED') {
  console.log(`[HERMES restore-baseline] RESTORED from hermes-state@${result.remote_sha} — ${result.sources} source(s)`);
} else {
  console.log(`[HERMES restore-baseline] BASELINE_REQUIRED — ${result.reason}`);
  console.log('[HERMES restore-baseline] no local baseline file was written; every source will report BASELINE_REQUIRED this run');
}
console.log('[HERMES restore-baseline] database_write=false pgvector_write=false unified_data_write=false remote_write=false');
