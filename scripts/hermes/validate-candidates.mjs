#!/usr/bin/env node

import process from 'node:process';
import { analyzeCandidates, loadCandidates, resolveRealCandidatesInputDir } from './hermes-core.mjs';

// '--auto' is an explicit request (used by the hermes:*:real npm scripts)
// to resolve the real-candidates directory based on HERMES_COLLECTION_DRY_RUN
// — DRY RUN reads hermes/real-candidates-previews, LIVE reads
// hermes/real-candidates. A literal path argument still always wins, and
// the bare default (no argument at all) is untouched.
const rawArg = process.argv[2];
const input = rawArg === '--auto' ? resolveRealCandidatesInputDir() : (rawArg || 'hermes/test-candidates');
if (rawArg === '--auto') console.log(`[HERMES validator] --auto resolved to ${input}`);
let results;
try {
  results = analyzeCandidates(loadCandidates(input));
} catch (error) {
  console.error(`[HERMES validator] ${error.message}`);
  process.exit(2);
}

let invalid = 0;
for (const result of results) {
  const code = result.candidate.entity_code || result.file;
  if (result.valid) {
    console.log(`PASS ${code}`);
  } else {
    invalid += 1;
    console.error(`FAIL ${code}`);
    for (const error of result.errors) console.error(`  - ${error}`);
  }
}
console.log(`\nValidated: ${results.length}; passed: ${results.length - invalid}; failed: ${invalid}`);
process.exit(invalid === 0 ? 0 : 1);
