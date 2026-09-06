#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function cycleId(now = new Date()) {
  const d = new Date(now);
  const diff = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d.toISOString().slice(0, 10);
}

const cycle = process.env.HERMES_CYCLE_ID || cycleId();
const stateRoot = path.resolve(process.env.HERMES_STATE_ROOT || 'hermes/state');
const checkpointPath = path.join(stateRoot, `sweep-${cycle}.json`);

if (!fs.existsSync(checkpointPath)) {
  console.error(`[HERMES sweep gate] INCOMPLETE no checkpoint found: ${checkpointPath}`);
  process.exit(1);
}

let checkpoint;
try {
  checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8').replace(/^\uFEFF/, ''));
} catch (error) {
  console.error(`[HERMES sweep gate] INCOMPLETE invalid checkpoint: ${error.message}`);
  process.exit(1);
}

const totalWork = Number(checkpoint.total_work ?? 0);
const completedWork = Array.isArray(checkpoint.completed_work) ? checkpoint.completed_work.length : 0;
const remaining = Math.max(0, totalWork - completedWork);
const complete = checkpoint.complete === true && totalWork > 0 && remaining === 0;

if (!complete) {
  const reason = checkpoint.last_run_summary?.resume_reason || 'CHECKPOINT_INCOMPLETE';
  console.error(`[HERMES sweep gate] INCOMPLETE cycle=${cycle} completed=${completedWork}/${totalWork} remaining=${remaining} reason=${reason}`);
  process.exit(1);
}

console.log(`[HERMES sweep gate] COMPLETE cycle=${cycle} completed=${completedWork}/${totalWork} remaining=0`);
