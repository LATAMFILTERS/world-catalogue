#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const generatedRoot = path.join(root, 'knowledge', 'generated', 'failure-intelligence');
const matrixPath = path.join(generatedRoot, 'matrix.json');
const unresolvedPath = path.join(generatedRoot, 'unresolved.json');

if (!fs.existsSync(matrixPath) || !fs.existsSync(unresolvedPath)) {
  console.error('[failure-intelligence] generated matrix is missing; run node scripts/build-failure-intelligence.mjs');
  process.exit(1);
}

const matrix = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
const unresolved = JSON.parse(fs.readFileSync(unresolvedPath, 'utf8'));
const errors = [];
const allowedConfidence = new Set(['hypothesis', 'plausible', 'supported', 'validated', 'rejected']);
const allowedSeverity = new Set(['low', 'moderate', 'high', 'critical']);
const allowedActions = new Set(['inspect', 'sample', 'review_selection', 'recommend_candidate', 'validated_recommendation']);

for (const scenario of matrix.scenarios || []) {
  if (!allowedConfidence.has(scenario.confidence)) errors.push(`${scenario.id}: invalid confidence '${scenario.confidence}'`);
  if (!allowedSeverity.has(scenario.severity)) errors.push(`${scenario.id}: invalid severity '${scenario.severity}'`);
  if (scenario.automatic_recommendation_eligible && scenario.confidence !== 'validated') {
    errors.push(`${scenario.id}: automatic eligibility requires validated confidence`);
  }
  if (scenario.automatic_recommendation_eligible && !(scenario.evidence || []).length) {
    errors.push(`${scenario.id}: automatic eligibility requires evidence`);
  }
}

for (const rule of matrix.recommendations || []) {
  if (!allowedActions.has(rule.action_level)) errors.push(`${rule.id}: invalid action level '${rule.action_level}'`);
  if ((rule.skus || []).length && rule.action_level !== 'validated_recommendation') {
    errors.push(`${rule.id}: SKU targets require validated_recommendation`);
  }
  if (rule.action_level === 'validated_recommendation' && !(rule.evidence || []).length) {
    errors.push(`${rule.id}: validated recommendation requires evidence`);
  }
}

if (errors.length) {
  console.error(`[failure-intelligence] validation failed with ${errors.length} error(s)`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[failure-intelligence] validation passed: ${(matrix.scenarios || []).length} scenario(s), ${(matrix.recommendations || []).length} recommendation rule(s), ${unresolved.length} unresolved item(s)`);
if (unresolved.length) {
  console.warn('[failure-intelligence] unresolved items remain and require engineering review; artifact generation may continue');
}
