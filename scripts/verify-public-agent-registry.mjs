import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const registry = JSON.parse(readFileSync('frontend/public/.well-known/agent-registry.json', 'utf8'));
const catalog = JSON.parse(readFileSync('frontend/public/.well-known/ai-catalog.json', 'utf8'));
const internal = JSON.parse(readFileSync('config/elimserver/agents.json', 'utf8'));
assert.equal(registry.status, 'NOT_ACTIVATED');
assert.equal(registry.dnsAidAdvertised, false);
assert.equal(registry.protocol, 'informational-read-only');
assert.deepEqual(registry.agents, [], 'Do not expose private agents without a verified public service');
assert.equal(registry.policy.automaticPublication, false);
assert.equal(registry.policy.applicationsWithoutVerifiedEvidenceExcluded, true);
assert.equal(registry.policy.crossReferencesDoNotEstablishCompatibility, true);
assert.ok(Array.isArray(internal.agents) && internal.agents.length > 0);
const serialized = JSON.stringify(registry);
for (const agent of internal.agents) {
  assert.ok(!serialized.includes(agent.id), 'Internal agent must not be published: ' + agent.id);
}
const resources = registry.resources;
assert.ok(resources.some(r => r.href === 'https://elimfilters.com/.well-known/ai-catalog.json'));
assert.ok(resources.every(r => r.href.startsWith('https://elimfilters.com/')), 'Only canonical public origin permitted');
assert.ok(Array.isArray(catalog.entries) && catalog.entries.length);
assert.ok(catalog.entries.every(e => /^https:\/\/elimfilters\.com\//.test(e.url)));
const forbidden = ['equipment_applications', 'vehicle_applications', 'EVIDENCE_REQUIRED', 'competitor_codes'];
for (const field of forbidden) assert.ok(!serialized.includes(field), 'No raw catalog or fitment data allowed');
console.log('PASS: registry does not advertise agents, mutate governance, or expose withheld applications');
