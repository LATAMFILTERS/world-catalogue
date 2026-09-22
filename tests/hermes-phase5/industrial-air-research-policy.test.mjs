import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  INDUSTRIAL_AIR_RESEARCH_POLICY,
  DEEP_TECHNICAL_LIBRARY_POLICY
} from '../../scripts/hermes/industrial-research-policy.mjs';
import { sourcesFromRegistry, sourcePriorityTier } from '../../scripts/hermes/collect-real-sources-core.mjs';

const endpoints = JSON.parse(fs.readFileSync('hermes/config/source-endpoints.json', 'utf8')).endpoints;
const mission = JSON.parse(fs.readFileSync('hermes/config/intelligence-mission.json', 'utf8'));

test('Donaldson Industrial Air technical libraries are governed active endpoints', () => {
  const ids = new Set(endpoints.filter((e) => e.organization_id === 'donaldson' && e.enabled && e.status === 'ACTIVE').map((e) => e.id));
  assert.equal(ids.has('donaldson__industrial_air_technical_articles'), true);
  assert.equal(ids.has('donaldson__industrial_air_case_studies'), true);
});

test('HERMES mission contains a dedicated Industrial Air domain including mist mechanics', () => {
  const domain = mission.domains.find((d) => d.id === 'industrial_air_filtration');
  assert.ok(domain);
  assert.ok(domain.topics.includes('oil mist filtration'));
  assert.ok(domain.topics.includes('coalescence'));
  assert.ok(domain.topics.includes('liquid drainage'));
  assert.equal(mission.evidence_policy.follow_same_domain_article_and_case_study_pages, true);
  assert.equal(mission.evidence_policy.case_study_results_are_application_specific, true);
});

test('shared Industrial Air policy prevents automatic FUMEVRA assignment for liquid mist', () => {
  assert.match(INDUSTRIAL_AIR_RESEARCH_POLICY, /not automatically FUMEVRA/i);
  assert.match(INDUSTRIAL_AIR_RESEARCH_POLICY, /coalescence/i);
  assert.match(INDUSTRIAL_AIR_RESEARCH_POLICY, /drainage/i);
  assert.match(DEEP_TECHNICAL_LIBRARY_POLICY, /follow the relevant individual same-domain article or case-study pages/i);
  assert.match(DEEP_TECHNICAL_LIBRARY_POLICY, /application-specific evidence/i);
});


test('technical Donaldson endpoints outrank the generic competitor-news tier', () => {
  const organizations = [{
    id: 'donaldson',
    name: 'Donaldson Company',
    category: 'filtration_competitor',
    official: true,
    trust_level: 'high',
    region: 'North America'
  }];
  const selected = endpoints.filter((e) => e.organization_id === 'donaldson' && e.enabled && e.status === 'ACTIVE');
  const sources = sourcesFromRegistry({ organizations, endpoints: selected });
  const technical = sources.find((s) => s.id === 'donaldson__industrial_air_technical_articles');
  const cases = sources.find((s) => s.id === 'donaldson__industrial_air_case_studies');
  const news = sources.find((s) => s.id === 'donaldson__news');
  assert.equal(technical.endpoint_type, 'technical_bulletins');
  assert.equal(cases.endpoint_type, 'documentation');
  assert.ok(sourcePriorityTier(technical) < sourcePriorityTier(news));
  assert.ok(sourcePriorityTier(cases) < sourcePriorityTier(news));
});
