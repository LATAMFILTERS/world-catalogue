import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  HERMES_GROQ_GROUNDING_CONTRACT,
  HERMES_GROQ_GROUNDING_VERSION
} from '../../scripts/hermes/groq-grounding-contract.mjs';

test('HERMES GROQ grounding contract is strict, fail-closed and application-safe',()=>{
  assert.match(HERMES_GROQ_GROUNDING_VERSION,/^\d+\.\d+\.\d+$/);
  for (const required of [
    'evidence extraction and coverage intelligence, not conversation',
    'Never infer a filter application from dimensions',
    'exact supported asset context',
    'Dimensions alone are never cross-reference evidence',
    'return zero findings',
    'status=UNRESOLVED',
    'One finding must describe one concrete technical development',
    'Strict JSON only',
    'No invented URLs'
  ]) assert.ok(HERMES_GROQ_GROUNDING_CONTRACT.includes(required), required);
});

test('both live GROQ HERMES research paths import the grounding contract',()=>{
  for(const file of [
    'scripts/hermes/industry-sweep-compound.mjs',
    'scripts/hermes/research-real-candidates-compound.mjs'
  ]){
    const source=fs.readFileSync(file,'utf8');
    assert.match(source,/HERMES_GROQ_GROUNDING_CONTRACT/);
    assert.match(source,/grounding_contract_version/);
  }
});
