#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { resolveRealCandidatesInputDir } from './hermes-core.mjs';

const inputDir = path.resolve(process.argv[2] || resolveRealCandidatesInputDir());
if (!fs.existsSync(inputDir)) process.exit(0);

let failures = 0;
for (const file of fs.readdirSync(inputDir).filter((f) => f.endsWith('.json')).sort()) {
  const full = path.join(inputDir, file);
  const c = JSON.parse(fs.readFileSync(full, 'utf8'));
  if (!String(c.entity_code || '').startsWith('HERMES_REAL_')) continue;
  if (c.workflow_status !== 'PENDING_REVIEW') continue;
  const r = c.groq_resolution;
  const errors = [];
  if (c.change_classification !== 'GROQ_RESOLVED_VERIFIED_FINDING') errors.push('missing GROQ_RESOLVED_VERIFIED_FINDING');
  if (!r || r.resolution_status !== 'READY') errors.push('missing READY groq_resolution');
  if (!Array.isArray(c.verified_facts) || c.verified_facts.length === 0) errors.push('missing verified_facts');
  if (typeof c.source_url !== 'string' || !/^https?:\/\//i.test(c.source_url)) errors.push('missing evidence URL');
  if (typeof c.proposed_destination !== 'string' || c.proposed_destination.length < 3) errors.push('missing proposed_destination');
  if (typeof c.neutral_fact !== 'string' || c.neutral_fact.trim().length < 5) errors.push('missing neutral_fact');
  if (errors.length) {
    failures += 1;
    console.error(`[HERMES Groq gate] ${c.entity_code}: ${errors.join('; ')}`);
  }
}
if (failures) {
  console.error(`[HERMES Groq gate] FAIL: ${failures} real-source candidate(s) reached PENDING_REVIEW without mandatory Groq resolution.`);
  process.exit(1);
}
console.log('[HERMES Groq gate] PASS');
