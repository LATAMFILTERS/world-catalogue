import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runIndustrySweep } from '../../scripts/hermes/industry-sweep-compound.mjs';

const mission = JSON.parse(fs.readFileSync(path.resolve('hermes/config/intelligence-mission.json'), 'utf8'));

test('HERMES mission covers the complete filtration intelligence ecosystem', () => {
  const ids = new Set(mission.domains.map((d) => d.id));
  for (const required of [
    'oem_engines_equipment',
    'aftermarket_filtration',
    'filter_manufacturing',
    'filter_media_materials',
    'fuel_filtration',
    'lubrication_oil',
    'hydraulics_fluids',
    'cooling_thermal',
    'ev_new_powertrains',
    'solids_fluids_science',
    'standards_testing',
    'environment_regulation',
    'reliability_maintenance'
  ]) assert.ok(ids.has(required), `missing mission domain: ${required}`);
  assert.equal(mission.coverage_policy, 'EXPANSIVE_NOT_CLOSED_LIST');
  assert.deepEqual(mission.knowledge_actions, ['CREATE_NEW','UPDATE_REINFORCE','NO_MATERIAL_CHANGE','INTERNAL_ONLY']);
});

test('industry sweep creates one verified candidate and suppresses repeated evidence', async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-sweep-'));
  let groqCalls = 0;
  const fakeFetch = async (url) => {
    if (String(url).includes('api.groq.com')) {
      groqCalls += 1;
      const finding = groqCalls === 1 ? {
        domain_id: 'filter_media_materials',
        finding_type: 'FILTER_MEDIA',
        finding_title: 'New synthetic filter-media production capability',
        evidence_url: 'https://example.com/media-development',
        source_publisher: 'Example Media Company',
        source_type: 'PRIMARY',
        published_at: '2026-08-17T10:00:00.000Z',
        technical_facts: ['The source reports new production capability for synthetic filtration media.'],
        affected_entities: ['FILTER_MEDIA', 'SYNTHETIC_MEDIA'],
        destination: 'KNOWLEDGE_CENTER',
        knowledge_action: 'UPDATE_REINFORCE',
        existing_elimfilters_url: 'https://elimfilters.com/knowledge-center/filter-media/',
        relevance: 'Adds current manufacturing context to ELIMFILTERS filter-media knowledge.',
        public_safe_fact: 'Synthetic filtration-media production capacity is expanding for technical filtration applications.',
        proposed_action: 'Reinforce the existing filter-media topic with the verified manufacturing development.',
        content_channels: ['BLOG','WEEKLY_PODCAST','NEWSLETTER'],
        confidence: 0.84
      } : null;
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: JSON.stringify({ findings: finding ? [finding] : [] }), executed_tools: [{ type: 'web_search' }] } }] })
      };
    }
    return {
      ok: true,
      status: 200,
      text: async () => '<html><body>' + 'verified technical evidence '.repeat(30) + '</body></html>'
    };
  };

  const summary = await runIndustrySweep({ apiKey: 'test-key', fetchImpl: fakeFetch, outputDir, now: () => new Date('2026-08-17T14:00:00.000Z') });
  assert.equal(summary.created, 1);
  assert.ok(groqCalls >= 1);
  const files = fs.readdirSync(outputDir).filter((f) => f.endsWith('.json'));
  assert.equal(files.length, 1);
  const candidate = JSON.parse(fs.readFileSync(path.join(outputDir, files[0]), 'utf8'));
  assert.equal(candidate.workflow_status, 'PENDING_REVIEW');
  assert.equal(candidate.research_resolution.status, 'VERIFIED');
  assert.equal(candidate.research_resolution.knowledge_action, 'UPDATE_REINFORCE');
  assert.equal(candidate.research_resolution.destination, 'KNOWLEDGE_CENTER');
});

test('industry sweep splits an oversized 413 domain request and preserves the recovered batch', async () => {
  const outputDir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-sweep-413-'));
  let groqCalls = 0;
  let injected413 = false;

  const fakeFetch = async (url) => {
    if (String(url).includes('api.groq.com')) {
      groqCalls += 1;
      if (!injected413) {
        injected413 = true;
        return {
          ok: false,
          status: 413,
          text: async () => JSON.stringify({ error: { code: 'request_too_large' } })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: JSON.stringify({ findings: [] }), executed_tools: [] } }] })
      };
    }
    throw new Error('evidence fetch should not run for an empty finding set');
  };

  const summary = await runIndustrySweep({ apiKey: 'test-key', fetchImpl: fakeFetch, outputDir });

  assert.equal(summary.failed_batches, 0);
  assert.equal(summary.quota_exhausted, false);
  assert.equal(summary.created, 0);
  assert.equal(groqCalls, mission.domains.length + 2, 'one rejected request is replaced by two narrower requests');
});
