const test = require('node:test');
const assert = require('node:assert/strict');

const { buildHermesCorpusSources } = require('../lib/knowledge-governance/fram-automotive-source-corpus');
const { buildEvidenceProfile } = require('../lib/knowledge-governance/automotive-evidence-profile');
const { AUTOMOTIVE_KNOWLEDGE_SEEDS, allCoveredSourceIds } = require('../lib/knowledge-governance/automotive-knowledge-seed');
const { synthesizeAutomotiveKnowledge, buildSharedEngineeringFromCanonical } = require('../lib/knowledge-governance/automotive-knowledge-synthesis');

function fakeProfiles() {
  return buildHermesCorpusSources().map((source) => ({
    source_id: source.id,
    source_url: source.url,
    source_publisher: source.name,
    source_hash: 'a'.repeat(64),
    published_at: null,
    metrics: []
  }));
}

test('all 36 governed source candidates are covered by the canonical seed registry', () => {
  const expected = buildHermesCorpusSources().map((s) => s.id).sort();
  assert.deepEqual(allCoveredSourceIds(), expected);
  assert.equal(expected.length, 36);
});

test('canonical automotive synthesis creates valid non-public review objects', () => {
  const records = synthesizeAutomotiveKnowledge(fakeProfiles());
  assert.equal(records.length, AUTOMOTIVE_KNOWLEDGE_SEEDS.length);
  assert.equal(records.every((r) => r.validation.valid), true);
  assert.equal(records.every((r) => r.object.public_use_allowed === false), true);
  assert.equal(records.every((r) => r.object.publication_status === 'awaiting_validation'), true);
  assert.equal(records.every((r) => r.object.source_evidence.length >= 1), true);
});

test('shared engineering aggregation produces valid source-backed concepts', () => {
  const canonical = synthesizeAutomotiveKnowledge(fakeProfiles());
  const shared = buildSharedEngineeringFromCanonical(canonical);
  assert.equal(shared.length > 5, true);
  assert.equal(shared.every((r) => r.validation.valid), true);
  assert.equal(shared.every((r) => r.object.public_use_allowed === false), true);
  assert.equal(shared.every((r) => r.object.source_evidence.length >= 1), true);
});

test('evidence profile extracts metrics and hashes without retaining article text', () => {
  const source = buildHermesCorpusSources()[0];
  const html = `
    <html><title>Technical Example | FRAM</title>
    <span class="label">Posted:</span><span class="value">July 01, 2025</span>
    <div class="post-text-hld"><p>Filter efficiency can be 95% at 20 microns under a stated test condition.</p><p>Differential pressure may increase as restriction increases.</p></div>
    <div class="post-bottom"></div></html>`;
  const profile = buildEvidenceProfile({ source, html });
  assert.equal(profile.metrics.length >= 2, true);
  assert.equal(profile.evidence_text_retained, false);
  assert.equal(Object.prototype.hasOwnProperty.call(profile, 'article_text'), false);
  assert.match(profile.source_hash, /^[a-f0-9]{64}$/);
});
