#!/usr/bin/env node
// HERMES — governed Light Duty automotive technical corpus collector.
//
// This collector is intentionally separate from the weekly source/news sweep.
// It ingests the explicitly approved FRAM automotive corpus as INTERNAL
// technical evidence for the LIGHT_DUTY_KNOWLEDGE_DOMAIN. It never writes to
// PostgreSQL, never creates cross references, and never authorizes public
// ELIMFILTERS content. All produced candidates remain approval-gated.

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import {
  runCollection,
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS
} from './collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';
import { loadHarvestState } from './semantic-harvest-state-core.mjs';

const require = createRequire(import.meta.url);
const {
  SOURCE,
  getUniqueCorpusUrls,
  buildHermesCorpusSources
} = require('../../lib/knowledge-governance/fram-automotive-source-corpus');

const dryRun = isDryRunActive();
const timeoutMs = Number(process.env.HERMES_LD_COLLECTION_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxBytes = Number(process.env.HERMES_LD_COLLECTION_MAX_BYTES || DEFAULT_MAX_BYTES);
const minContentLength = Number(process.env.HERMES_LD_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);
const baselineMode = String(process.env.HERMES_LD_BASELINE_MODE || 'false').toLowerCase() === 'true';

const baselinePath = path.resolve('hermes/baselines/fram-automotive-source-baseline.json');
const baselinePreviewPath = path.resolve('hermes/baselines/fram-automotive-source-baseline.preview.json');
const harvestStatePath = path.resolve('hermes/baselines/fram-automotive-source-observations.json');
const harvestState = loadHarvestState(harvestStatePath);
const sources = buildHermesCorpusSources();
const sourcesById = new Map(sources.map((source) => [source.id, source]));

if (sources.length !== getUniqueCorpusUrls().length) {
  throw new Error('FRAM automotive corpus source count does not match canonical URL count');
}

console.log(`[HERMES LD corpus] domain=${SOURCE.knowledge_domain} industry=${SOURCE.industry} sources=${sources.length}`);
console.log('[HERMES LD corpus] governance: internal evidence only; catalog_auto_update=false; public_brand_reference=false');
if (baselineMode) {
  console.log('[HERMES LD corpus] HERMES_LD_BASELINE_MODE=true — baseline refresh only, no candidates generated');
}

const summary = await runCollection({
  sources,
  realCandidatesDir: path.resolve('hermes/real-candidates'),
  sourceCacheDir: path.resolve('hermes/automotive-source-cache'),
  previewDir: path.resolve('hermes/real-candidates-previews'),
  auditDir: path.resolve('elimfilters-vault/94-sync-log'),
  baselinePath,
  baselinePreviewPath,
  harvestState,
  harvestStatePath,
  maxSources: 0,
  dryRun,
  baselineMode,
  minContentLength,
  timeoutMs,
  maxBytes
});

function enrichCandidateFile(result) {
  if (!['CREATED', 'PREVIEWED'].includes(result.status) || !result.output_path) return false;
  const source = sourcesById.get(result.id);
  if (!source) throw new Error(`Cannot classify candidate: unknown corpus source ${result.id}`);

  const candidatePath = path.resolve(result.output_path);
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  const enriched = {
    ...candidate,
    knowledge_domain: source.knowledge_domain,
    industries: [source.industry],
    knowledge_systems: source.knowledge_systems,
    technology_candidates: source.technology_candidates,
    technology_relation: source.technology_relation,
    application_relation: source.application_relation,
    knowledge_topics: source.knowledge_topics,
    source_governance: {
      public_brand_reference: source.public_brand_reference,
      catalog_auto_update: source.catalog_auto_update,
      external_source_role: 'internal_evidence_only'
    }
  };

  fs.writeFileSync(candidatePath, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
  return true;
}

let enrichedCandidates = 0;
for (const result of summary.results) {
  if (enrichCandidateFile(result)) enrichedCandidates += 1;
}

const domainManifest = {
  schema_version: '1.0.0',
  corpus: 'FRAM_AUTOMOTIVE_TECHNICAL_CORPUS',
  knowledge_domain: SOURCE.knowledge_domain,
  industry: SOURCE.industry,
  source_count: sources.length,
  public_brand_reference: false,
  catalog_auto_update: false,
  technology_relation_default: 'probable',
  application_relation_default: 'candidate',
  approval_required: true,
  database_write: false,
  pgvector_write: false,
  sources: sources.map((source) => ({
    id: source.id,
    url: source.url,
    knowledge_systems: source.knowledge_systems,
    technology_candidates: source.technology_candidates,
    technology_relation: source.technology_relation,
    application_relation: source.application_relation,
    knowledge_topics: source.knowledge_topics
  }))
};

console.log(`[HERMES LD corpus] mode=${summary.mode} first_harvest=${summary.first_harvest} created=${summary.created} previewed=${summary.previewed} enriched=${enrichedCandidates} unchanged=${summary.unchanged} duplicates=${summary.duplicates} fetch_errors=${summary.fetch_errors}`);
console.log(`[HERMES LD corpus] manifest=${JSON.stringify(domainManifest)}`);
console.log('[HERMES LD corpus] database_write=false pgvector_write=false catalogue_cross_write=false obsidian_auto_publish=false');
