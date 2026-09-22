import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { validateRegistry } from '../../scripts/hermes/source-registry-core.mjs';
import { INDUSTRIAL_PROCESS_ROUTING_POLICY } from '../../scripts/hermes/industrial-research-policy.mjs';

const read = (path) => fs.readFileSync(path, 'utf8');
const architecture = read('frontend/src/lib/industrial-process-architecture.ts');
const generated = JSON.parse(read('frontend/src/generated/canonical-knowledge.json'));
const organizationsDoc = JSON.parse(read('hermes/config/source-organizations.json'));
const endpointsDoc = JSON.parse(read('hermes/config/source-endpoints.json'));
const mission = JSON.parse(read('hermes/config/intelligence-mission.json'));

test('Industrial & Process root plus every internal page resolves to approved canonical knowledge', () => {
  const industrial = generated.records.filter((record) => record.domain === 'INDUSTRIAL_PROCESS_KNOWLEDGE_DOMAIN');
  assert.equal(industrial.length, 21);
  assert.ok(industrial.some((record) => record.slug === 'ip-industrial-process-architecture'));

  const canonicalSlugs = new Set(industrial.map((record) => record.slug));
  const platformBlocks = [...architecture.matchAll(/^  \{\n    slug: '([^']+)'/gm)];
  assert.equal(platformBlocks.length, 5);

  const platformSlugs = platformBlocks.map((match) => match[1]);
  assert.deepEqual(platformSlugs, ['aeremis', 'partion', 'coalvex', 'flurexis', 'aquvexis']);

  const techMatches = [...architecture.matchAll(/\.\.\.tech\(\s*\n\s*'([^']+)'/g)];
  assert.equal(techMatches.length, 15);

  const kcMatches = [...architecture.matchAll(/knowledgeCenterSlug: '([^']+)'/g)].map((match) => match[1]);
  // 5 platform references + 15 technology references.
  assert.equal(kcMatches.length, 20);
  for (const slug of kcMatches) assert.ok(canonicalSlugs.has(slug), `missing canonical knowledge for ${slug}`);
});

test('Industrial & Process canonical records carry mechanism, operating and standards context', () => {
  const industrial = generated.records.filter((record) => record.domain === 'INDUSTRIAL_PROCESS_KNOWLEDGE_DOMAIN');
  for (const record of industrial) {
    assert.ok(record.technicalRelationships.length > 0, `${record.id}: technical relationships missing`);
    assert.ok(record.operatingConditions.length > 0, `${record.id}: operating conditions missing`);
    assert.ok(record.standards.length > 0, `${record.id}: standards missing`);
  }
});

test('public Industrial & Process surfaces state the replacement-element versus equipment boundary', () => {
  const rootPage = read('frontend/src/app/industrial-process/page.tsx');
  const platformPage = read('frontend/src/components/IndustrialProcessPlatformStablePage.tsx');
  const technologyPage = read('frontend/src/components/IndustrialProcessTechnologyStablePage.tsx');
  assert.match(rootPage, /commercial scope is centered on validated filtration, separation and treatment media and replacement elements/i);
  assert.match(platformPage, /The treatment element is the product\. Process equipment is the application context/i);
  assert.match(technologyPage, /Replacement treatment media and elements remain distinct from the surrounding equipment/i);
  assert.match(technologyPage, /unless a separate ELIMFILTERS system scope is explicitly approved/i);
});

test('source registry validates and contains the governed Industrial & Process primary sources', () => {
  assert.deepEqual(validateRegistry({
    organizations: organizationsDoc.organizations,
    endpoints: endpointsDoc.endpoints,
  }), []);

  const active = new Set(endpointsDoc.endpoints
    .filter((endpoint) => endpoint.enabled === true && endpoint.status === 'ACTIVE')
    .map((endpoint) => endpoint.id));

  for (const id of [
    'donaldson__industrial_air_technical_articles',
    'donaldson__industrial_air_case_studies',
    'camfil__general_ventilation',
    'camfil__hepa_ulpa',
    'camfil__molecular_air',
    'pall__seprasol_liquid_gas',
    'pall__hydraulic_filtration',
    'pall__industrial_lubrication',
    'pall__oil_purifiers',
    'pall__varnish_removal',
    'pall__depth_filtration',
    'dupont_water__technologies',
    'dupont_water__ion_exchange',
    'dupont_water__edi',
    'calgon__filtrasorb',
  ]) assert.ok(active.has(id), `missing active source endpoint ${id}`);
});

test('HERMES has evergreen research domains for every Industrial & Process treatment universe', () => {
  for (const id of [
    'industrial_air_filtration',
    'industrial_gas_conditioning',
    'industrial_fluid_conditioning',
    'industrial_water_treatment',
  ]) {
    const domain = mission.domains.find((item) => item.id === id);
    assert.ok(domain, `missing HERMES domain ${id}`);
    assert.equal(domain.research_mode, 'EVERGREEN_TECHNICAL_LIBRARY');
    assert.ok(domain.preferred_source_urls.length > 0);
    assert.ok(domain.research_goal.length > 40);
  }
});

test('shared HERMES routing policy covers all five platforms and blocks equipment overclaiming', () => {
  for (const platform of ['AEREMIS™', 'PARTION™', 'COALVEX™', 'FLUREXIS™', 'AQUVEXIS™']) {
    assert.match(INDUSTRIAL_PROCESS_ROUTING_POLICY, new RegExp(platform.replace('™', '™')));
  }
  assert.match(INDUSTRIAL_PROCESS_ROUTING_POLICY, /media and replacement elements/i);
  assert.match(INDUSTRIAL_PROCESS_ROUTING_POLICY, /complete EDI systems are application context/i);
  assert.match(INDUSTRIAL_PROCESS_ROUTING_POLICY, /Liquid oil\/coolant mist remains an unbranded treatment path/i);
});

test('technical closure registry and primary source registry are present', () => {
  const registry = read('docs/brand/INDUSTRIAL_PROCESS_REGISTRY.md');
  const sources = read('docs/brand/INDUSTRIAL_PROCESS_TECHNICAL_SOURCE_REGISTRY.md');
  assert.match(registry, /INDUSTRIAL & PROCESS TECHNICAL ARCHITECTURE v1 — CLOSED/i);
  assert.match(registry, /ip-industrial-process-architecture/i);
  assert.match(sources, /EXTERNAL-PRIMARY-CAMFIL-GENERAL-VENTILATION/);
  assert.match(sources, /EXTERNAL-PRIMARY-PALL-LIQUID-GAS-COALESCENCE/);
  assert.match(sources, /EXTERNAL-PRIMARY-DUPONT-EDI/);
  assert.match(sources, /EXTERNAL-PRIMARY-CALGON-ACTIVATED-CARBON/);
});
