#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

function walkJson(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJson(full, out);
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return null; }
}

function safeName(value) {
  return String(value || '').replace(/[^A-Za-z0-9._-]/g, '');
}

const sourceRoot = path.resolve(process.argv[2] || '.hermes-review-source');
const outputDir = path.resolve(process.argv[3] || 'hermes/review-decisions');
const candidateCode = String(process.env.HERMES_REVIEW_CANDIDATE || '').trim();
const decision = String(process.env.HERMES_REVIEW_DECISION || '').trim().toLowerCase();
const reason = String(process.env.HERMES_REVIEW_REASON || '').trim();
const sourceRunId = String(process.env.HERMES_REVIEW_SOURCE_RUN_ID || '').trim();

if (!candidateCode) throw new Error('HERMES_REVIEW_CANDIDATE is required');
if (!['approve', 'reject', 'research'].includes(decision)) throw new Error('HERMES_REVIEW_DECISION must be approve, reject, or research');
if (!/^\d+$/.test(sourceRunId)) throw new Error('HERMES_REVIEW_SOURCE_RUN_ID is required');

const matches = [];
for (const file of walkJson(sourceRoot)) {
  const value = readJson(file);
  if (value?.entity_code === candidateCode) matches.push({ file, value });
}

if (matches.length === 0) throw new Error(`Candidate ${candidateCode} not found in weekly artifact ${sourceRunId}`);
if (matches.length > 1) throw new Error(`Candidate ${candidateCode} is ambiguous in weekly artifact ${sourceRunId}`);

const { file: candidateFile, value: before } = matches[0];
if (before.workflow_status !== 'PENDING_REVIEW') {
  throw new Error(`Candidate ${candidateCode} is not PENDING_REVIEW (current: ${before.workflow_status || 'unknown'})`);
}

const script = path.resolve('scripts/hermes/apply-review-decision.mjs');
const args = [script, candidateFile, decision];
if (reason) args.push(reason);
const result = spawnSync(process.execPath, args, { encoding: 'utf8' });
if (result.status !== 0) {
  throw new Error(`apply-review-decision failed: ${(result.stderr || result.stdout || '').trim()}`);
}

const after = readJson(candidateFile);
if (!after) throw new Error('Decision script did not leave a readable candidate file');

const record = {
  schema_version: '1.0.0',
  candidate: candidateCode,
  source_run_id: sourceRunId,
  decision,
  reason: reason || null,
  decided_by: 'Victor Abreu',
  decided_at: new Date().toISOString(),
  previous_workflow_status: before.workflow_status,
  resulting_workflow_status: after.workflow_status,
  approved_by: after.approved_by || null,
  approved_at: after.approved_at || null,
  source_candidate_path: path.relative(sourceRoot, candidateFile),
  source_hash: after.source_hash || before.source_hash || null,
};

fs.mkdirSync(outputDir, { recursive: true });
const output = path.join(outputDir, `${safeName(candidateCode)}.decision.json`);
fs.writeFileSync(output, JSON.stringify(record, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ outcome: 'DECISION_APPLIED', record: path.relative(process.cwd(), output), ...record }, null, 2));
