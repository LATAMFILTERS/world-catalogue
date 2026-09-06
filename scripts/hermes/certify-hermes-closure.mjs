#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const stateRoot = process.env.HERMES_STATE_ROOT || path.resolve('hermes/state');
const requestedCycle = process.env.HERMES_CYCLE_ID || null;
const readJson = p => {
  try { return JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,'')); }
  catch { return null; }
};
const exists = p => fs.existsSync(p);
const asArray = value => Array.isArray(value) ? value : (value == null ? [] : [value]);

const pendingPath = path.join(stateRoot,'recovery-pending.json');
const pending = readJson(pendingPath);
const operational = readJson(path.join(stateRoot,'operational-validation.json'));
const cycle = requestedCycle || pending?.cycle || operational?.cycle || null;
const sweep = cycle ? readJson(path.join(stateRoot,`sweep-${cycle}.json`)) : null;
const research = cycle ? readJson(path.join(stateRoot,`research-${cycle}.json`)) : null;
const sentPath = cycle ? path.join(stateRoot,`weekly-${cycle}.sent.json`) : null;
const weeklySent = sentPath ? readJson(sentPath) : null;

const total = Number(sweep?.total_work || 0);
const completed = Array.isArray(sweep?.completed_work) ? sweep.completed_work.length : 0;
const sweepComplete = !!sweep && sweep.complete === true && total > 0 && completed === total;
const deferredResearch = research?.items && typeof research.items === 'object'
  ? Object.values(research.items).filter(x => x && x.status === 'DEFERRED' && x.terminal !== true).length
  : 0;
const operationalClear = operational?.valid === true && operational?.status === 'PIPELINE_CLEAR';
const noPending = !exists(pendingPath);
const emailConfirmed = !!weeklySent;
const pendingFailed = asArray(pending?.failed).map(String).filter(Boolean);

let status = 'NOT_CLOSED';
let reason = 'UNKNOWN';
if (!cycle) reason = 'NO_ACTIVE_CYCLE';
else if (!noPending) reason = `RECOVERY_PENDING:${pendingFailed.length ? pendingFailed.join(',') : 'UNKNOWN'}`;
else if (!sweepComplete) reason = `SWEEP_INCOMPLETE:${completed}/${total}`;
else if (deferredResearch > 0) reason = `RESEARCH_DEFERRED:${deferredResearch}`;
else if (!operationalClear) reason = `OPERATIONAL_NOT_CLEAR:${operational?.status || 'MISSING'}`;
else if (!emailConfirmed) reason = 'WEEKLY_EMAIL_NOT_CONFIRMED';
else { status = 'CLOSED'; reason = 'PIPELINE_COMPLETE_AND_DELIVERY_CONFIRMED'; }

const payload = {
  schema_version:'1.0.1',
  generated_at:new Date().toISOString(),
  cycle,
  status,
  reason,
  checks:{
    no_pending_recovery:noPending,
    pending_failed:pendingFailed,
    sweep_complete:sweepComplete,
    sweep_progress:`${completed}/${total}`,
    deferred_research:deferredResearch,
    operational_clear:operationalClear,
    weekly_email_confirmed:emailConfirmed
  }
};

fs.mkdirSync(stateRoot,{recursive:true});
fs.writeFileSync(path.join(stateRoot,'hermes-closure-certificate.json'),JSON.stringify(payload,null,2));
console.log(`[HERMES closure] status=${status} reason=${reason} cycle=${cycle || 'none'} sweep=${completed}/${total} deferred=${deferredResearch} email=${emailConfirmed?'yes':'no'}`);
if (process.argv.includes('--require-closed') && status !== 'CLOSED') process.exit(1);
