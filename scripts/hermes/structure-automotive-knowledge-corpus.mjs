#!/usr/bin/env node
// HERMES — transform the governed LD automotive corpus into structured knowledge.
// Source text is fetched transiently and is NOT persisted. Only normalized
// evidence profiles, canonical ELIMFILTERS-language drafts and hashes/metrics
// are written. Nothing here authorizes public use, product crosses or catalog writes.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fetchWithLimits, DEFAULT_MAX_BYTES, DEFAULT_TIMEOUT_MS } from './collect-real-sources-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';

const require = createRequire(import.meta.url);
const { buildHermesCorpusSources } = require('../../lib/knowledge-governance/fram-automotive-source-corpus');
const { buildEvidenceProfile } = require('../../lib/knowledge-governance/automotive-evidence-profile');
const { AUTOMOTIVE_KNOWLEDGE_SEEDS, allCoveredSourceIds } = require('../../lib/knowledge-governance/automotive-knowledge-seed');
const { synthesizeAutomotiveKnowledge, buildSharedEngineeringFromCanonical } = require('../../lib/knowledge-governance/automotive-knowledge-synthesis');

const dryRun = isDryRunActive();
const timeoutMs = Number(process.env.HERMES_LD_STRUCTURE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxBytes = Number(process.env.HERMES_LD_STRUCTURE_MAX_BYTES || DEFAULT_MAX_BYTES);
const sources = buildHermesCorpusSources();
const expectedSourceIds = sources.map((s) => s.id).sort();
const coveredSourceIds = allCoveredSourceIds();

if (JSON.stringify(expectedSourceIds) !== JSON.stringify(coveredSourceIds)) {
  const missing = expectedSourceIds.filter((id) => !coveredSourceIds.includes(id));
  const unknown = coveredSourceIds.filter((id) => !expectedSourceIds.includes(id));
  throw new Error(`Knowledge seed coverage mismatch. missing=${missing.join(',')} unknown=${unknown.join(',')}`);
}

const outputRoot = path.resolve(dryRun ? 'hermes/structured-knowledge-previews' : 'hermes/structured-knowledge');
const profileDir = path.join(outputRoot, 'ld-automotive', 'source-evidence');
const canonicalDir = path.join(outputRoot, 'ld-automotive', 'canonical-drafts');
const sharedDir = path.join(outputRoot, 'shared-engineering', 'canonical-drafts');
const reviewDir = path.join(outputRoot, 'review-bundles');
for (const dir of [profileDir, canonicalDir, sharedDir, reviewDir]) fs.mkdirSync(dir, { recursive: true });

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function cleanName(value) {
  return String(value).replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
}

const profiles = [];
const fetchFailures = [];
console.log(`[HERMES LD structure] mode=${dryRun ? 'DRY_RUN' : 'LIVE'} sources=${sources.length} canonical_seeds=${AUTOMOTIVE_KNOWLEDGE_SEEDS.length}`);

for (const source of sources) {
  const response = await fetchWithLimits({ url: source.url, timeoutMs, maxBytes });
  if (!response.ok) {
    fetchFailures.push({ source_id: source.id, source_url: source.url, error: response.error, status: response.status });
    console.warn(`[HERMES LD structure] FETCH_ERROR ${source.id}: ${response.error}`);
    continue;
  }
  try {
    const profile = buildEvidenceProfile({ source, html: response.text });
    profiles.push(profile);
    writeJson(path.join(profileDir, `${source.id}.evidence.json`), profile);
  } catch (error) {
    fetchFailures.push({ source_id: source.id, source_url: source.url, error: String(error.message || error), status: response.status });
    console.warn(`[HERMES LD structure] PROFILE_ERROR ${source.id}: ${error.message || error}`);
  }
}

if (fetchFailures.length > 0) {
  writeJson(path.join(reviewDir, 'ld-automotive-fetch-failures.json'), fetchFailures);
}

const canonicalRecords = synthesizeAutomotiveKnowledge(profiles);
const invalidCanonical = canonicalRecords.filter((record) => !record.validation.valid);
if (invalidCanonical.length) {
  writeJson(path.join(reviewDir, 'ld-automotive-invalid-canonical.json'), invalidCanonical);
  throw new Error(`${invalidCanonical.length} canonical knowledge objects failed validation`);
}

for (const record of canonicalRecords) {
  writeJson(path.join(canonicalDir, `${cleanName(record.object.knowledge_object_id)}.json`), record.object);
}

const sharedRecords = buildSharedEngineeringFromCanonical(canonicalRecords);
const invalidShared = sharedRecords.filter((record) => !record.validation.valid);
if (invalidShared.length) {
  writeJson(path.join(reviewDir, 'ld-automotive-invalid-shared.json'), invalidShared);
  throw new Error(`${invalidShared.length} shared engineering objects failed validation`);
}

for (const record of sharedRecords) {
  writeJson(path.join(sharedDir, `${cleanName(record.object.knowledge_object_id)}.json`), record.object);
}

const unresolvedSourceIds = expectedSourceIds.filter((id) => !profiles.some((profile) => profile.source_id === id));
const metricCount = profiles.reduce((sum, profile) => sum + profile.metrics.length, 0);
const relationshipCount = canonicalRecords.reduce((sum, record) => sum + record.object.technical_relationships.length, 0);
const procedureCount = canonicalRecords.reduce((sum, record) => sum + record.object.procedures.length, 0);

const nodalManifest = {
  schema_version: '1.0.0',
  package: 'LD_AUTOMOTIVE_STRUCTURED_KNOWLEDGE',
  mode: dryRun ? 'DRY_RUN' : 'LIVE',
  source_candidates_expected: sources.length,
  source_profiles_created: profiles.length,
  source_profiles_unresolved: unresolvedSourceIds,
  canonical_knowledge_objects: canonicalRecords.length,
  shared_engineering_objects: sharedRecords.length,
  metric_candidates: metricCount,
  normalized_relationships: relationshipCount,
  procedures: procedureCount,
  publication_status: 'awaiting_validation',
  public_use_allowed: false,
  catalog_auto_update: false,
  database_write: false,
  pgvector_write: false,
  catalogue_cross_write: false,
  source_text_retained: false,
  nodal_center_status: 'READY_FOR_REVIEW',
  canonical_ids: canonicalRecords.map((r) => r.object.knowledge_object_id),
  shared_ids: sharedRecords.map((r) => r.object.knowledge_object_id)
};
writeJson(path.join(reviewDir, 'LD_AUTOMOTIVE_NODAL_REVIEW_MANIFEST.json'), nodalManifest);

const lines = [
  '# LD Automotive — Nodal Center Review Bundle', '',
  `Mode: ${nodalManifest.mode}`, '',
  `Source candidates: ${sources.length}`,
  `Evidence profiles created: ${profiles.length}`,
  `Canonical knowledge objects: ${canonicalRecords.length}`,
  `Shared Engineering objects: ${sharedRecords.length}`,
  `Metric candidates awaiting validation: ${metricCount}`,
  `Normalized technical relationships: ${relationshipCount}`,
  `Procedures: ${procedureCount}`, '',
  '> External source text is not retained. Brand/source provenance remains internal evidence only. All technology relationships are probable and all application relationships remain candidate until validation.', '',
  '## Canonical LD objects', ''
];
for (const record of canonicalRecords) {
  const o = record.object;
  lines.push(`- ${o.knowledge_object_id} — ${o.title} | ${o.knowledge_content_type} | systems=${o.systems.join('; ')} | sources=${o.source_evidence.length} | metrics=${o.metrics.length} | relationships=${o.technical_relationships.length} | procedures=${o.procedures.length}`);
}
lines.push('', '## Shared Engineering objects', '');
for (const record of sharedRecords) {
  const o = record.object;
  lines.push(`- ${o.knowledge_object_id} — ${o.title} | sources=${o.source_evidence.length} | supporting_systems=${(o.technical_parameters.source_systems || []).join('; ')}`);
}
lines.push('', '## Governance', '', '- Nodal Center review required before canonical promotion.', '- No public competitor/source branding.', '- No automatic SKU, application or cross-reference writes.', '- PostgreSQL remains SKU authority.', '');
fs.writeFileSync(path.join(reviewDir, 'LD_AUTOMOTIVE_NODAL_REVIEW_BUNDLE.md'), lines.join('\n'), 'utf8');

console.log(`[HERMES LD structure] profiles=${profiles.length}/${sources.length} canonical=${canonicalRecords.length} shared=${sharedRecords.length} metrics=${metricCount} relationships=${relationshipCount} procedures=${procedureCount}`);
console.log(`[HERMES LD structure] unresolved_sources=${unresolvedSourceIds.length} source_text_retained=false public_use_allowed=false`);
console.log(`[HERMES LD structure] review_manifest=${path.join(reviewDir, 'LD_AUTOMOTIVE_NODAL_REVIEW_MANIFEST.json')}`);
console.log('[HERMES LD structure] database_write=false pgvector_write=false catalogue_cross_write=false obsidian_auto_publish=false');
