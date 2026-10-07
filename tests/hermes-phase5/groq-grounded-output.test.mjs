import test from 'node:test';
import assert from 'node:assert/strict';

import {
  HERMES_GROQ_DEFAULT_MODEL,
  HERMES_GROQ_RESOLUTION_SCHEMA,
  HERMES_GROQ_SYSTEM_PROMPT,
  resolveWithGroq,
  applyResolution
} from '../../scripts/hermes/groq-resolve-intelligence.mjs';
import {
  VALIDATED_KNOWLEDGE_AUTHORITY,
  buildValidatedKnowledgeContext,
  validateNoveltyAgainstValidatedBase
} from '../../scripts/hermes/validated-knowledge-context.mjs';
import {
  HERMES_GROQ_GROUNDING_CONTRACT,
  HERMES_GROQ_GROUNDING_VERSION
} from '../../scripts/hermes/groq-grounding-contract.mjs';

test('resolver uses local LLM first with strict structured output', async () => {
  let requestUrl;
  let requestBody;
  const resolution = {
    resolution_status: 'READY',
    finding_type: 'TECHNICAL',
    specific_item: 'Verified technical update',
    published_at: null,
    evidence_url: 'https://example.com/source',
    evidence_title: 'Source',
    facts: ['A source-supported filtration fact.'],
    neutral_fact: 'A source-supported filtration fact.',
    affected_entities: ['Example entity'],
    destination: 'TECHNICAL_INTELLIGENCE',
    relevance: 'The fact is materially relevant to filtration intelligence.',
    proposed_action: 'Review the evidence before approving any knowledge update.',
    confidence: 0.9,
    blocked_reason: null
  };

  const fetchImpl = async (url, init) => {
    requestUrl = String(url);
    requestBody = JSON.parse(init.body);
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(resolution) } }] })
    };
  };

  const out = await resolveWithGroq({
    candidate: { entity_code: 'HERMES_REAL_TEST', source_url: resolution.evidence_url },
    evidenceBundle: [{ source_url: resolution.evidence_url, raw_snippet: 'supported fact' }],
    apiKey: null,
    fetchImpl
  });

  assert.deepEqual(out, resolution);
  assert.match(requestUrl, /^http:\/\/127\.0\.0\.1:11434\/v1\/chat\/completions/);
  assert.equal(requestBody.model, 'qwen3:8b');
  assert.equal(requestBody.temperature, 0);
  assert.equal(requestBody.response_format.type, 'json_schema');
  assert.equal(requestBody.response_format.json_schema.strict, true);
  assert.deepEqual(requestBody.response_format.json_schema.schema, HERMES_GROQ_RESOLUTION_SCHEMA);
  assert.equal(HERMES_GROQ_DEFAULT_MODEL, 'openai/gpt-oss-120b');
});

test('resolver falls back to Groq only when free tier is confirmed', async () => {
  const previousFreeTier = process.env.HERMES_GROQ_FREE_TIER_CONFIRMED;
  process.env.HERMES_GROQ_FREE_TIER_CONFIRMED = 'true';
  const calls = [];
  const resolution = {
    resolution_status: 'READY',
    finding_type: 'TECHNICAL',
    specific_item: 'Verified technical update',
    published_at: null,
    evidence_url: 'https://example.com/source',
    evidence_title: 'Source',
    facts: ['A source-supported filtration fact.'],
    neutral_fact: 'A source-supported filtration fact.',
    affected_entities: ['Example entity'],
    destination: 'TECHNICAL_INTELLIGENCE',
    relevance: 'The fact is materially relevant to filtration intelligence.',
    proposed_action: 'Review the evidence before approving any knowledge update.',
    confidence: 0.9,
    blocked_reason: null
  };

  const fetchImpl = async (url, init) => {
    calls.push({ url: String(url), body: JSON.parse(init.body) });
    if (String(url).startsWith('http://127.0.0.1:11434')) return { ok: false, status: 503 };
    return {
      ok: true,
      json: async () => ({ choices: [{ message: { content: JSON.stringify(resolution) } }] })
    };
  };

  const out = await resolveWithGroq({
    candidate: { entity_code: 'HERMES_REAL_TEST', source_url: resolution.evidence_url },
    evidenceBundle: [{ source_url: resolution.evidence_url, raw_snippet: 'supported fact' }],
    apiKey: 'test',
    fetchImpl
  });

  assert.deepEqual(out, resolution);
  assert.equal(calls.length, 2);
  assert.match(calls[0].url, /^http:\/\/127\.0\.0\.1:11434/);
  assert.equal(calls[1].url, 'https://api.groq.com/openai/v1/chat/completions');
  assert.equal(calls[1].body.model, 'openai/gpt-oss-120b');
  assert.equal(calls[1].body.reasoning_effort, 'low');

  if (previousFreeTier === undefined) delete process.env.HERMES_GROQ_FREE_TIER_CONFIRMED;
  else process.env.HERMES_GROQ_FREE_TIER_CONFIRMED = previousFreeTier;
});

test('grounding contract forbids fabrication, repetition and parallel truth', () => {
  assert.equal(HERMES_GROQ_GROUNDING_VERSION, '1.1.0');
  assert.match(HERMES_GROQ_SYSTEM_PROMPT, /Every item in facts must be directly supported/i);
  assert.match(HERMES_GROQ_SYSTEM_PROMPT, /One decision, no essay/i);
  assert.match(HERMES_GROQ_SYSTEM_PROMPT, /PostgreSQL remains the only ELIMFILTERS SKU authority/i);
  assert.match(HERMES_GROQ_GROUNDING_CONTRACT, /do not create duplicate knowledge/i);
  assert.match(HERMES_GROQ_GROUNDING_CONTRACT, /One canonical fact, one canonical knowledge record/i);
  assert.match(HERMES_GROQ_GROUNDING_CONTRACT, /customer-facing technical truth must come from the validated canonical knowledge base/i);
});

test('CREATE_NEW fails closed when validated-base comparison is unavailable', () => {
  const errors = validateNoveltyAgainstValidatedBase(
    { knowledge_action: 'CREATE_NEW' },
    { authority: VALIDATED_KNOWLEDGE_AUTHORITY, available: false, matches: [] }
  );
  assert.deepEqual(errors, ['validated knowledge comparison unavailable; CREATE_NEW forbidden']);
});

test('validated canonical context identifies its authority', () => {
  const context = buildValidatedKnowledgeContext('filtration technical knowledge', { limit: 2 });
  assert.equal(context.authority, '13-canonical-knowledge');
  assert.equal(typeof context.available, 'boolean');
  assert.ok(Array.isArray(context.matches));
});

test('READY resolution still stops at human review', () => {
  const next = applyResolution({
    entity_code: 'HERMES_REAL_TEST',
    workflow_status: 'NEEDS_RESEARCH',
    confidence: 0.4,
    affected_entities: []
  }, {
    resolution_status: 'READY',
    finding_type: 'TECHNICAL',
    specific_item: 'Verified technical update',
    published_at: null,
    evidence_url: 'https://example.com/source',
    evidence_title: 'Source',
    facts: ['A source-supported filtration fact.'],
    neutral_fact: 'A source-supported filtration fact.',
    affected_entities: ['Example entity'],
    destination: 'TECHNICAL_INTELLIGENCE',
    relevance: 'The fact is materially relevant to filtration intelligence.',
    proposed_action: 'Review the evidence before approving any knowledge update.',
    confidence: 0.9,
    blocked_reason: null
  }, new Date('2026-10-06T00:00:00Z'));

  assert.equal(next.workflow_status, 'PENDING_REVIEW');
  assert.equal(next.change_classification, 'GROQ_RESOLVED_VERIFIED_FINDING');
});


test('zero-cost policy blocks external Groq unless free tier is explicitly confirmed', async () => {
  const previousFreeTier = process.env.HERMES_GROQ_FREE_TIER_CONFIRMED;
  delete process.env.HERMES_GROQ_FREE_TIER_CONFIRMED;

  await assert.rejects(
    () => resolveWithGroq({
      candidate: { entity_code: 'HERMES_REAL_COST_GUARD' },
      evidenceBundle: [],
      apiKey: 'test',
      fetchImpl: async () => { throw new Error('fetch must not execute'); }
    }),
    /HERMES_ZERO_COST_BLOCK/
  );

  if (previousFreeTier !== undefined) process.env.HERMES_GROQ_FREE_TIER_CONFIRMED = previousFreeTier;
});
