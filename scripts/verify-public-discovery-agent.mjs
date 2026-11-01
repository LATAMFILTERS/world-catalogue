import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync('frontend/src/app/api/agents/public-discovery/route.ts','utf8');
const registry=JSON.parse(readFileSync('frontend/public/.well-known/agent-registry.json','utf8'));
const catalog=JSON.parse(readFileSync('frontend/public/.well-known/ai-catalog.json','utf8'));
for (const url of ['https://elimfilters.com/.well-known/ai-catalog.json','https://elimfilters.com/llms.txt','https://elimfilters.com/sitemap-index.xml']) {
  assert.ok(source.includes(url), 'Missing public canonical resource '+url);
}
assert.ok(source.includes('export function GET()'), 'Public GET endpoint required');
assert.ok(source.includes('export function POST()'), 'Explicit mutation denial required');
assert.ok(source.includes("status: 405"), 'POST must be denied');
assert.ok(source.includes("noPrivateAgents: true"), 'No private agent exposure');
assert.ok(source.includes("noCatalogFitmentAssertions: true"), 'No unverified fitment');
assert.ok(source.includes("noDatabaseAccess: true"), 'No database exposure');
assert.ok(source.includes("noMutations: true"), 'No mutations');
assert.equal(registry.status,'NOT_ACTIVATED','Registry must stay inactive until live deployment and DNS verified');
assert.equal(registry.dnsAidAdvertised,false);
assert.deepEqual(registry.agents,[]);
assert.ok(catalog.entries.length>0);
console.log('PASS: public read-only discovery endpoint is isolated; public registry remains inactive until live verification.');
