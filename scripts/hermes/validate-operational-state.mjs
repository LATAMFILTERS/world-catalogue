#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const stateRoot = path.resolve(process.env.HERMES_STATE_ROOT || 'hermes/state');
const pendingPath = path.join(stateRoot, 'recovery-pending.json');

const readJson = (file) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')); }
  catch { return null; }
};

const pending = readJson(pendingPath);
const cycle = process.env.HERMES_CYCLE_ID || pending?.cycle || null;
const sweepPath = cycle ? path.join(stateRoot, `sweep-${cycle}.json`) : null;
const researchPath = cycle ? path.join(stateRoot, `research-${cycle}.json`) : null;
const sweep = sweepPath ? readJson(sweepPath) : null;
const research = researchPath ? readJson(researchPath) : null;

const failed = new Set(Array.isArray(pending?.failed) ? pending.failed : []);
const sweepTotal = Number(sweep?.total_work || 0);
const sweepDone = Array.isArray(sweep?.completed_work) ? sweep.completed_work.length : 0;
const sweepComplete = Boolean(sweep?.complete === true && sweepTotal > 0 && sweepDone === sweepTotal);
const researchItems = Object.values(research?.items || {});
const deferredResearch = researchItems.filter((item) => item?.status === 'DEFERRED' && item?.terminal !== true);

let status = 'UNKNOWN';
let valid = true;
let reason = null;

if (!pending) {
  if (sweep && !sweepComplete) {
    valid = false;
    status = 'INVALID_STATE';
    reason = `SWEEP_INCOMPLETE_WITHOUT_PENDING_${sweepDone}_${sweepTotal}`;
  } else if (deferredResearch.length > 0) {
    valid = false;
    status = 'INVALID_STATE';
    reason = `RESEARCH_DEFERRED_WITHOUT_PENDING_${deferredResearch.length}`;
  } else {
    status = 'PIPELINE_CLEAR';
  }
} else if (sweep && !sweepComplete) {
  if (!failed.has('sweep')) {
    valid = false;
    status = 'INVALID_STATE';
    reason = `SWEEP_INCOMPLETE_BUT_PENDING_${[...failed].join(',') || 'EMPTY'}`;
  } else {
    status = 'WAITING_SWEEP';
    reason = sweep?.last_run_summary?.resume_reason || 'SWEEP_INCOMPLETE';
  }
} else if (deferredResearch.length > 0) {
  if (!failed.has('research')) {
    valid = false;
    status = 'INVALID_STATE';
    reason = `RESEARCH_DEFERRED_BUT_PENDING_${[...failed].join(',') || 'EMPTY'}`;
  } else {
    status = 'WAITING_RESEARCH';
    reason = deferredResearch[0]?.reason || 'RESEARCH_DEFERRED';
  }
} else if (failed.size === 1 && failed.has('email')) {
  status = 'WAITING_EMAIL';
  reason = pending?.emailState || 'EMAIL_FAILED';
} else if (failed.size > 0) {
  status = 'WAITING_STAGE';
  reason = [...failed].join(',');
} else {
  valid = false;
  status = 'INVALID_STATE';
  reason = 'PENDING_EXISTS_WITHOUT_FAILED_STAGE';
}

const output = {
  schema_version: '1.0.0',
  generated_at: new Date().toISOString(),
  cycle,
  valid,
  status,
  reason,
  pending: pending ? {
    attempts: Number(pending.attempts || 0),
    failed: [...failed],
    emailState: pending.emailState || null
  } : null,
  sweep: sweep ? {
    complete: sweepComplete,
    completed: sweepDone,
    total: sweepTotal,
    remaining: Math.max(0, sweepTotal - sweepDone),
    resume_reason: sweep?.last_run_summary?.resume_reason || null
  } : null,
  research: research ? {
    deferred: deferredResearch.length,
    total_items: researchItems.length,
    resume_required: Boolean(research?.last_summary?.resume_required)
  } : null
};

fs.mkdirSync(stateRoot, { recursive: true });
fs.writeFileSync(path.join(stateRoot, 'operational-validation.json'), `${JSON.stringify(output, null, 2)}\n`, 'utf8');
console.log(`[HERMES operational validation] valid=${valid} status=${status} reason=${reason || 'none'} cycle=${cycle || 'none'} sweep=${sweepDone}/${sweepTotal} research_deferred=${deferredResearch.length}`);
if (!valid) process.exitCode = 1;
