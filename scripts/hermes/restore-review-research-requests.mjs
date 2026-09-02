#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execFileSync } from 'node:child_process';
import { resolveRealCandidatesInputDir } from './hermes-core.mjs';

const remote = process.env.HERMES_STATE_REMOTE || 'origin';
const stateBranch = process.env.HERMES_STATE_BRANCH || 'hermes-state';
const outputDir = path.resolve(resolveRealCandidatesInputDir(process.env));

function runGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function safeCode(name) {
  return /^[A-Za-z0-9._-]+\.json$/.test(name);
}

try {
  runGit(['fetch', remote, `${stateBranch}:refs/remotes/${remote}/${stateBranch}`]);
} catch (error) {
  console.log(`[HERMES research-requests] state branch unavailable: ${String(error?.message || error)}`);
  process.exit(0);
}

let files = [];
try {
  const listing = runGit(['ls-tree', '--name-only', `${remote}/${stateBranch}:state/research-requests`]);
  files = listing ? listing.split(/\r?\n/).filter(safeCode) : [];
} catch {
  console.log('[HERMES research-requests] no pending Victor research requests');
  process.exit(0);
}

fs.mkdirSync(outputDir, { recursive: true });
let restored = 0;
for (const name of files) {
  const raw = runGit(['show', `${remote}/${stateBranch}:state/research-requests/${name}`]);
  const candidate = JSON.parse(raw);
  if (candidate.workflow_status !== 'NEEDS_RESEARCH') continue;
  if (!String(candidate.research_instruction || '').trim()) continue;
  const target = path.join(outputDir, name);
  fs.writeFileSync(target, JSON.stringify(candidate, null, 2) + '\n', 'utf8');
  restored += 1;
}

console.log(`[HERMES research-requests] restored ${restored} Victor-requested candidate(s) into ${path.relative(process.cwd(), outputDir)}`);
