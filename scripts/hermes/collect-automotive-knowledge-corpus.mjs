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
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import {
  runCollection,
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS
} from './collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { isDryRunActive, validateCandidate } from './hermes-core.mjs';
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
const baselineMode = process.argv.includes('--baseline') || String(process.env.HERMES_LD_BASELINE_MODE || 'false').toLowerCase() === 'true';

const baselinePath = path.resolve('hermes/baselines/fram-automotive-source-baseline.json');
const baselinePreviewPath = path.resolve('hermes/baselines/fram-automotive-source-baseline.preview.json');
const harvestStatePath = path.resolve('hermes/baselines/fram-automotive-source-observations.json');
const forensicIndexPath = path.resolve('elimfilters-vault/91-private-evidence/fram-automotive/snapshot-index.json');
const harvestState = loadHarvestState(harvestStatePath);
const sources = buildHermesCorpusSources();
const sourcesById = new Map(sources.map((source) => [source.id, source]));

if (sources.length !== getUniqueCorpusUrls().length) {
  throw new Error('FRAM automotive corpus source count does not match canonical URL count');
}

// Forensic integrity gate: every future HERMES LD collection must first
// capture and verify the exact source bytes privately. If any approved source
// cannot be snapshotted, collection stops before candidate generation.
const capture = spawnSync(process.execPath, ['scripts/hermes/capture-fram-forensic-snapshots.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: { ...process.env, HERMES_FORENSIC_SNAPSHOT_STRICT: 'true' }
});
if (capture.status !== 0) {
  throw new Error(`FRAM forensic snapshot gate failed before HERMES collection (exit ${capture.status ?? 'unknown'})`);
}
const verify = spawnSync(process.execPath, ['scripts/validate-fram-forensic-snapshots.mjs'], {
  cwd: process.cwd(),
  stdio: 'inherit',
  env: process.env
});
if (verify.status !== 0) {
  throw new Error(`FRAM forensic snapshot verification failed before HERMES collection (exit ${verify.status ?? 'unknown'})`);
}

const forensicIndex = JSON.parse(fs.readFileSync(forensicIndexPath, 'utf8'));
const latestSnapshotBySource = new Map();
for (const record of forensicIndex.records || []) {
  const current = latestSnapshotBySource.get(record.source_id);
  if (!current || String(record.captured_at) > String(current.captured_at)) latestSnapshotBySource.set(record.source_id, record);
}
for (const source of sources) {
  const snapshot = latestSnapshotBySource.get(source.id);
  if (!snapshot?.integrity_verified || !snapshot?.raw_content_sha256 || !snapshot?.normalized_text_sha256) {
    throw new Error(`Missing verified forensic snapshot for ${source.id}; candidate generation blocked`);
  }
}

console.log(`[HERMES LD corpus] domain=${SOURCE.knowledge_domain} industry=${SOURCE.industry} sources=${sources.length}`);
console.log('[HERMES LD corpus] governance: internal evidence only; catalog_auto_update=false; public_brand_reference=false');
console.log('[HERMES LD corpus] forensic integrity: raw snapshot + SHA-256 + normalized SHA-256 REQUIRED before candidate generation');
if (baselineMode) {
  console.log('[HERMES LD corpus] baseline mode — baseline refresh only, no candidates generated');
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
  const snapshot = latestSnapshotBySource.get(result.id);
  if (!snapshot) throw new Error(`Cannot classify candidate: missing forensic snapshot ${result.id}`);

  const candidatePath = path.resolve(result.output_path);
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  const enriched = {
    ...candidate,
    knowledge_domain: source.knowledge_domain,
    industries: [source.industry],
    knowledge_systems: source.knowledge_systems,
    knowledge_content_type: source.knowledge_content_type,
    technology_candidates: source.technology_candidates,
    technology_relation: source.technology_relation,
    application_relation: source.application_relation,
    knowledge_topics: source.knowledge_topics,
    forensic_evidence: {
      source_id: snapshot.source_id,
      captured_at: snapshot.captured_at,
      raw_content_sha256: snapshot.raw_content_sha256,
      normalized_text_sha256: snapshot.normalized_text_sha256,
      raw_content_bytes: snapshot.raw_content_bytes,
      snapshot_path: snapshot.snapshot_path,
      integrity_verified: snapshot.integrity_verified,
      public_exposure_allowed: false
    },
    source_governance: {
      public_brand_reference: source.public_brand_reference,
      catalog_auto_update: source.catalog_auto_update,
      external_source_role: 'internal_evidence_only',
      forensic_snapshot_required: true
    }
  };

  const validationErrors = validateCandidate(enriched);
  if (validationErrors.length) {
    throw new Error(`Enriched candidate ${enriched.entity_code} failed Hermes validation: ${validationErrors.join('; ')}`);
  }

  fs.writeFileSync(candidatePath, JSON.stringify(enriched, null, 2) + '\n', 'utf8');
  return true;
}

let enrichedCandidates = 0;
for (const result of summary.results) {
  if (enrichCandidateFile(result)) enrichedCandidates += 1;
}

const domainManifest = {
  schema_version: '1.2.0',
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
  forensic_snapshot_policy: 'FRAM_AUTOMOTIVE_CRYPTOGRAPHIC_SNAPSHOT_V1',
  forensic_snapshot_required: true,
  sources: sources.map((source) => {
    const snapshot = latestSnapshotBySource.get(source.id);
    return {
      id: source.id,
      url: source.url,
      knowledge_systems: source.knowledge_systems,
      knowledge_content_type: source.knowledge_content_type,
      technology_candidates: source.technology_candidates,
      technology_relation: source.technology_relation,
      application_relation: source.application_relation,
      knowledge_topics: source.knowledge_topics,
      forensic_snapshot: {
        captured_at: snapshot.captured_at,
        raw_content_sha256: snapshot.raw_content_sha256,
        normalized_text_sha256: snapshot.normalized_text_sha256,
        integrity_verified: true
      }
    };
  })
};

console.log(`[HERMES LD corpus] mode=${summary.mode} first_harvest=${summary.first_harvest} created=${summary.created} previewed=${summary.previewed} enriched=${enrichedCandidates} unchanged=${summary.unchanged} duplicates=${summary.duplicates} fetch_errors=${summary.fetch_errors}`);
console.log(`[HERMES LD corpus] manifest=${JSON.stringify(domainManifest)}`);
console.log('[HERMES LD corpus] database_write=false pgvector_write=false catalogue_cross_write=false obsidian_auto_publish=false');
