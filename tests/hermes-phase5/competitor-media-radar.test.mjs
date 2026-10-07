import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const mission=JSON.parse(fs.readFileSync('hermes/config/intelligence-mission.json','utf8'));

test('HERMES competitor and media radar covers priority filtration intelligence',()=>{
  const r=mission.competitive_technology_radar;
  assert.equal(r.enabled,true);
  assert.ok(r.priority_organizations.some(x=>x.includes('Donaldson')));
  assert.ok(r.priority_organizations.some(x=>x.includes('Fleetguard')));
  assert.ok(r.priority_organizations.some(x=>x.includes('MANN')));
  assert.ok(r.priority_organizations.some(x=>x.includes('Baldwin')));
  assert.ok(r.filter_media_priority.includes('nanofiber media'));
  assert.ok(r.signal_types.includes('new filter product or part family'));
  assert.ok(r.signal_types.includes('patent or patent application'));
  assert.equal(r.governance.automatic_catalogue_write,false);
  assert.equal(r.governance.approval_required,true);
});
