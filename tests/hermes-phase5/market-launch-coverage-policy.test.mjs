import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mission = JSON.parse(fs.readFileSync('hermes/config/intelligence-mission.json','utf8'));

test('HERMES market launch response is configured for early filtration coverage',()=>{
  const p=mission.market_launch_response;
  assert.equal(p.enabled,true);
  assert.equal(p.priority,'CRITICAL_EARLY_COVERAGE');
  assert.equal(p.key_metric,'TIME_TO_VERIFIED_COVERAGE');
  assert.ok(p.trigger_entities.includes('new vehicle model'));
  assert.ok(p.required_investigation_sequence.some(x=>x.includes('OE filtration requirements')));
  assert.equal(p.evidence_rules.no_unverified_catalogue_write,true);
  assert.ok(p.destinations.includes('OEM_APPLICATION_INTELLIGENCE'));
  assert.ok(p.destinations.includes('CATALOGUE'));
});
