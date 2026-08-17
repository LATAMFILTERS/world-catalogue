import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCandidate, isResearchResolved } from '../../scripts/hermes/hermes-core.mjs';
import { extractSameDomainLinks, linkScore, validateResolution } from '../../scripts/hermes/research-real-candidates.mjs';

function realCandidate(overrides = {}) {
  return {
    entity_type: 'intelligence_candidate',
    entity_code: 'HERMES_REAL_TEST_12345678',
    workflow_status: 'PENDING_REVIEW',
    candidate_type: 'technical_bulletin',
    source_type: 'html',
    source_url: 'https://example.com/news',
    source_publisher: 'Example Source',
    source_title: 'Example News',
    published_at: null,
    captured_at: '2026-08-17T13:00:00.000Z',
    confidence: 0.7,
    evidence_level: 'PRIMARY',
    claim_scope: 'SOURCE_REPORTED',
    affected_entities: ['TECHNICAL_PUBLICATION'],
    proposed_action: 'Review the verified technical finding for knowledge relevance.',
    proposed_target_folder: '14-intelligence',
    proposed_target_entity: null,
    deduplication_key: 'real-test-1234567890',
    approval_required: true,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    sync_status: 'NOT_READY',
    sync_target: [],
    source_hash: 'a'.repeat(64),
    category: 'technical_publication',
    ...overrides
  };
}

test('real HERMES candidates cannot enter review before Groq resolution', () => {
  const errors = validateCandidate(realCandidate());
  assert.ok(errors.some((e) => e.includes('requires VERIFIED Groq research_resolution')));
});

test('Groq-verified real candidate passes the research gate', () => {
  const candidate = realCandidate({
    research_resolution: {
      status: 'VERIFIED',
      engine: 'GROQ',
      model: 'llama-3.3-70b-versatile',
      finding_title: 'New filtration technical bulletin',
      evidence_url: 'https://example.com/news/item',
      technical_facts: ['A concrete technical fact grounded in the source.'],
      relevance: 'Relevant to ELIMFILTERS technical intelligence.',
      confidence: 0.82
    }
  });
  assert.equal(isResearchResolved(candidate), true);
  assert.deepEqual(validateCandidate(candidate), []);
});

test('NEEDS_RESEARCH remains a valid non-review operational state', () => {
  const candidate = realCandidate({ workflow_status: 'NEEDS_RESEARCH', confidence: 0.4, research_resolution: { status: 'UNRESOLVED', reason: 'SOURCE_FETCH_FAILED' } });
  assert.deepEqual(validateCandidate(candidate), []);
});

test('crawler keeps same-domain links and prioritizes news/article paths', () => {
  const html = `
    <a href="/about">About</a>
    <a href="/news/2026/new-filter-media">New filter media technology announced</a>
    <a href="https://other.example.org/news/x">External story</a>`;
  const links = extractSameDomainLinks(html, 'https://example.com/');
  assert.equal(links.length, 2);
  const news = links.find((l) => l.url.includes('/news/2026/'));
  const about = links.find((l) => l.url.includes('/about'));
  assert.ok(news);
  assert.ok(linkScore(news) > linkScore(about));
});

test('Groq resolution must point to evidence HERMES actually fetched', () => {
  const pages = [{ url: 'https://example.com/news/item', title: 'Item', text: 'Evidence', published_at: null }];
  const good = validateResolution({
    status: 'VERIFIED',
    finding_title: 'Specific technical item',
    evidence_url: 'https://example.com/news/item',
    technical_facts: ['Fact'],
    relevance: 'Relevant technical intelligence for filtration systems.',
    proposed_action: 'Review this specific technical finding for canonical relevance.',
    confidence: 0.8
  }, pages);
  assert.deepEqual(good, []);

  const bad = validateResolution({
    status: 'VERIFIED',
    finding_title: 'Specific technical item',
    evidence_url: 'https://invented.example.net/fake',
    technical_facts: ['Fact'],
    relevance: 'Relevant technical intelligence for filtration systems.',
    proposed_action: 'Review this specific technical finding for canonical relevance.',
    confidence: 0.8
  }, pages);
  assert.ok(bad.includes('evidence_url was not fetched by HERMES'));
});
