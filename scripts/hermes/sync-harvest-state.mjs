#!/usr/bin/env node
// HERMES — CLI for restoring/persisting semantic-harvest state
// (state/source-observations.json on hermes-state). See
// sync-harvest-state-core.mjs for why this is deliberately separate from,
// and not gated the same way as, the governed baseline.
//
// Usage:
//   node scripts/hermes/sync-harvest-state.mjs restore
//   node scripts/hermes/sync-harvest-state.mjs persist
import path from 'node:path';
import process from 'node:process';
import { restoreHarvestStateFromBranch, persistHarvestStateToBranch } from './sync-harvest-state-core.mjs';

const mode = process.argv[2];
const remote = process.env.HERMES_STATE_REMOTE || 'origin';
const localHarvestPath = path.resolve('hermes/baselines/source-observations.json');

if (mode === 'restore') {
  const result = restoreHarvestStateFromBranch({ remote, localHarvestPath });
  if (result.status === 'RESTORED') {
    console.log(`[HERMES harvest-state] RESTORED sources=${result.sources} from ${result.remote_sha}`);
  } else {
    console.log(`[HERMES harvest-state] ${result.status}: ${result.reason} — every source will be treated as never-harvested this run`);
  }
} else if (mode === 'persist') {
  const result = persistHarvestStateToBranch({ remote, localHarvestPath });
  if (result.status === 'PERSISTED') {
    console.log(`[HERMES harvest-state] PERSISTED commit=${result.state_branch_commit}`);
  } else if (result.status === 'SKIPPED') {
    console.log(`[HERMES harvest-state] SKIPPED: ${result.reason}`);
  } else {
    console.error(`[HERMES harvest-state] FAILED: ${result.reason}`);
    process.exitCode = 1;
  }
} else {
  console.error('[HERMES harvest-state] usage: node scripts/hermes/sync-harvest-state.mjs <restore|persist>');
  process.exitCode = 2;
}
