#!/usr/bin/env node
// HERMES — CLI for the durable "already sent this ISO week" guard.
// See weekly-send-guard-core.mjs for why this replaced the old exact-hour
// DST guard.
//
// Usage:
//   node scripts/hermes/weekly-send-guard.mjs check   # writes proceed=true/false to $GITHUB_OUTPUT if set
//   node scripts/hermes/weekly-send-guard.mjs mark     # records a successful send for the current ISO week
import fs from 'node:fs';
import process from 'node:process';
import { hasSentThisWeek, markSentThisWeek } from './weekly-send-guard-core.mjs';

const mode = process.argv[2];
const remote = process.env.HERMES_STATE_REMOTE || 'origin';

function writeGithubOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (!file) return;
  fs.appendFileSync(file, `${name}=${value}\n`, 'utf8');
}

if (mode === 'check') {
  const result = hasSentThisWeek({ remote });
  const proceed = !result.sent;
  console.log(`[HERMES weekly-send-guard] currentWeek=${result.currentWeek} alreadySent=${result.sent} (${result.reason})`);
  writeGithubOutput('proceed', String(proceed));
} else if (mode === 'mark') {
  const result = markSentThisWeek({ remote });
  if (result.status === 'MARKED') {
    console.log(`[HERMES weekly-send-guard] MARKED week=${result.iso_week} commit=${result.commitSha}`);
  } else {
    console.error(`[HERMES weekly-send-guard] FAILED: ${result.reason}`);
    process.exitCode = 1;
  }
} else {
  console.error('[HERMES weekly-send-guard] usage: node scripts/hermes/weekly-send-guard.mjs <check|mark>');
  process.exitCode = 2;
}
