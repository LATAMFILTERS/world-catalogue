#!/usr/bin/env node

import process from 'node:process';
import { analyzeCandidates, loadCandidates } from './hermes-core.mjs';

const input = process.argv[2] || 'hermes/test-candidates';
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
