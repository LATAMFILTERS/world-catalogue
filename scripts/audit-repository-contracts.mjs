#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const errors = [];
const warnings = [];

function readJson(relativePath) {
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    errors.push(`missing JSON contract: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(full, 'utf8').replace(/^\uFEFF/, ''));
  } catch (error) {
    errors.push(`invalid JSON ${relativePath}: ${error.message}`);
    return null;
  }
}

const manifest = readJson('knowledge/brain/brain-manifest.json');
const routes = readJson('knowledge/brain/query-routes.json');

const scriptPaths = new Set([
  ...(manifest?.required_validators || []),
  ...((manifest?.conditional_validators || []).map((item) => item.validator)),
  'scripts/build-digital-brain-context.mjs',
  'scripts/audit-digital-brain.mjs',
]);

for (const relativePath of scriptPaths) {
  if (!relativePath) continue;
  const full = path.join(root, relativePath);
  if (!fs.existsSync(full)) {
    errors.push(`referenced script missing: ${relativePath}`);
    continue;
  }
  const check = spawnSync(process.execPath, ['--check', full], { cwd: root, encoding: 'utf8' });
  if (check.status !== 0) {
    errors.push(`syntax check failed: ${relativePath}: ${(check.stderr || check.stdout).trim()}`);
  }
}

for (const source of manifest?.sources || []) {
  if (source.location && source.kind !== 'postgresql') {
    const full = path.join(root, source.location);
    if (!fs.existsSync(full)) warnings.push(`declared source location is not present in checkout: ${source.id} -> ${source.location}`);
  }
}

const sourceIds = new Set((manifest?.sources || []).map((source) => source.id));
for (const route of routes?.routes || []) {
  for (const sourceId of [...(route.required_sources || []), ...(route.optional_sources || [])]) {
    if (!sourceIds.has(sourceId)) errors.push(`route '${route.id}' references undeclared source '${sourceId}'`);
  }
}

const workflowPath = path.join(root, '.github', 'workflows', 'digital-brain.yml');
if (!fs.existsSync(workflowPath)) {
  errors.push('missing master workflow: .github/workflows/digital-brain.yml');
} else {
  const workflow = fs.readFileSync(workflowPath, 'utf8');
  const scriptRefs = [...workflow.matchAll(/node\s+(scripts\/[A-Za-z0-9._/-]+\.mjs)/g)].map((match) => match[1]);
  for (const relativePath of scriptRefs) {
    if (!fs.existsSync(path.join(root, relativePath))) errors.push(`workflow references missing script: ${relativePath}`);
  }
  if (!/permissions:\s*\n\s+contents:\s+read/m.test(workflow)) {
    errors.push('master workflow must keep contents permission read-only');
  }
  if (/DATABASE_URL|ANTHROPIC_API_KEY|OPENAI_API_KEY/.test(workflow)) {
    warnings.push('master workflow references an operational or model secret; verify least-privilege use');
  }
}

for (const warning of warnings) console.warn(`[repository-contracts] warning: ${warning}`);
if (errors.length) {
  console.error(`[repository-contracts] audit failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[repository-contracts] audit passed: ${scriptPaths.size} script contract(s), ${sourceIds.size} source(s), ${routes?.routes?.length || 0} route(s), ${warnings.length} warning(s)`);
