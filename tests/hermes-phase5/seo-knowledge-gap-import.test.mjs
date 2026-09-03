import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { requestToCandidate, importSeoKnowledgeGaps } from '../../scripts/hermes/import-seo-knowledge-gaps.mjs';
import { isRealHermesCandidate, validateCandidate } from '../../scripts/hermes/hermes-core.mjs';

const NOW = new Date('2026-09-03T15:00:00.000Z');

function request(overrides = {}) {
  return {
    knowledge_gap_request_id: 'SEO_GEO_AEO_001',
    research_type: 'ELIMFILTERS_KNOWLEDGE_GAP',
    source_audit: 'seo-geo-audit',
    page_url: 'https://elimfilters.com/knowledge-center/standards/example-standard/',
    page_type: 'editorial_or_entity',
    triage_action: 'REVIEW_FOR_EXPANSION',
    observed_word_count: 141,
    required_source_types: ['primary_technical_source'],
    minimum_independent_sources: 1,
    research_question: 'Determine whether this page has a real knowledge deficiency and verify any proposed additions.',
    publication_policy: { auto_publish: false, requires_review: true, no_word_count_padding: true },
    ...overrides,
  };
}

test('SEO gap becomes a valid governed HERMES_REAL candidate', () => {
  const candidate = requestToCandidate(request(), NOW);
  assert.equal(isRealHermesCandidate(candidate), true);
  assert.equal(candidate.workflow_status, 'NEEDS_RESEARCH');
  assert.equal(candidate.candidate_type, 'coverage_gap');
  assert.equal(candidate.evidence_level, 'SECONDARY_UNVERIFIED');
  assert.equal(candidate.approval_required, true);
  assert.equal(candidate.sync_status, 'NOT_READY');
  assert.equal(candidate.proposed_target_folder, '04-standards');
  assert.deepEqual(validateCandidate(candidate), []);
});

test('importer writes only REVIEW_FOR_EXPANSION requests', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-seo-gap-'));
  const input = path.join(root, 'gaps.json');
  const outputDir = path.join(root, 'candidates');
  fs.writeFileSync(input, JSON.stringify({ requests: [
    request(),
    request({ knowledge_gap_request_id: 'SEO_GEO_AEO_002', page_url: 'https://elimfilters.com/contact/', triage_action: 'KEEP_CONCISE' }),
  ] }));

  const result = importSeoKnowledgeGaps({ inputPath: input, outputDir, now: NOW });
  assert.equal(result.imported, 1);
  assert.equal(result.skipped, 1);
  const files = fs.readdirSync(outputDir).filter((name) => name.endsWith('.json'));
  assert.equal(files.length, 1);
  const written = JSON.parse(fs.readFileSync(path.join(outputDir, files[0]), 'utf8'));
  assert.equal(written.source_url, 'https://elimfilters.com/knowledge-center/standards/example-standard/');
  assert.equal(written.audit_context.publication_policy.auto_publish, false);
});

test('same URL produces a stable entity code and deduplication key', () => {
  const a = requestToCandidate(request(), NOW);
  const b = requestToCandidate(request({ knowledge_gap_request_id: 'SEO_GEO_AEO_999' }), new Date('2026-09-10T15:00:00.000Z'));
  assert.equal(a.entity_code, b.entity_code);
  assert.equal(a.deduplication_key, b.deduplication_key);
});
