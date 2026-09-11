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
  fetchWithLimits,
  normalizeHtmlToText,
  sha256Hex,
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS
} from './collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { isDryRunActive, validateCandidate } from './hermes-core.mjs';
import { loadHarvestState } from './semantic-harvest-state-core.mjs';
import { writeForensicSourceSnapshot } from './source-forensic-snapshot-core.mjs';

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
const sourceCacheDir = path.resolve('hermes/automotive-source-cache');
const forensicSnapshotDir = path.resolve('hermes/forensic-source-snapshots');
const harvestState = loadHarvestState(harvestStatePath);
const sources = buildHermesCorpusSources();
const sourcesById = new Map(sources.map((source) => [source.id, source]));

if (sources.length !== getUniqueCorpusUrls().length) {
  throw new Error('FRAM automotive corpus source count does not match canonical URL count');
}

console.log(`[HERMES LD corpus] domain=${SOURCE.knowledge_domain} industry=${SOURCE.industry} sources=${sources.length}`);
console.log('[HERMES LD corpus] governance: internal evidence only; catalog_auto_update=false; public_brand_reference=false');
console.log('[HERMES LD corpus] forensic snapshots: exact normalized-content capture + SHA-256 manifest; private runtime storage only');
if (baselineMode) {
  console.log('[HERMES LD corpus] baseline mode — baseline refresh only, no candidates generated');
}

const summary = await runCollection({
  sources,
  realCandidatesDir: path.resolve('hermes/real-candidates'),
  sourceCacheDir,
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

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

async function captureExactForensicSnapshots() {
  const snapshotBySource = new Map();

  for (const source of sources) {
    const cache = readJsonSafe(path.join(sourceCacheDir, `${source.id}.json`));
    if (!cache?.ok || !cache?.content_hash) continue;

    const targetUrl = cache.source_url || source.url;
    let matched = null;
    let lastObservedHash = null;

    // The normal collector owns the candidate hash. Re-fetch until we can
    // cryptographically capture the exact same normalized content. We never
    // link a candidate to a snapshot whose digest differs from source_hash.
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const fetched = await fetchWithLimits({ url: targetUrl, timeoutMs, maxBytes });
      if (!fetched.ok) continue;
      const normalized = normalizeHtmlToText(fetched.text);
      const normalizedHash = sha256Hex(normalized);
      lastObservedHash = normalizedHash;
      if (normalizedHash !== cache.content_hash) continue;

      matched = writeForensicSourceSnapshot({
        rootDir: forensicSnapshotDir,
        sourceId: source.id,
        sourceUrl: targetUrl,
        fetchedAt: cache.fetched_at,
        httpStatus: fetched.status,
        rawText: fetched.text,
        normalizedText: normalized,
        truncated: fetched.truncated
      });
      break;
    }

    if (!matched) {
      throw new Error(
        `Forensic exact-content capture failed for ${source.id}: collector_hash=${cache.content_hash} observed_hash=${lastObservedHash || 'unavailable'}`
      );
    }

    if (matched.manifest.normalized_content_sha256 !== cache.content_hash) {
      throw new Error(`Forensic snapshot hash mismatch for ${source.id}`);
    }

    snapshotBySource.set(source.id, matched);
  }

  return snapshotBySource;
}

const forensicSnapshots = await captureExactForensicSnapshots();

function enrichCandidateFile(result) {
  if (!['CREATED', 'PREVIEWED'].includes(result.status) || !result.output_path) return false;
  const source = sourcesById.get(result.id);
  if (!source) throw new Error(`Cannot classify candidate: unknown corpus source ${result.id}`);

  const candidatePath = path.resolve(result.output_path);
  const candidate = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
  const forensic = forensicSnapshots.get(result.id);

  if (!forensic) {
    throw new Error(`Cannot enrich ${candidate.entity_code}: no exact forensic snapshot exists for ${result.id}`);
  }
  if (candidate.source_hash !== forensic.manifest.normalized_content_sha256) {
    throw new Error(`Candidate/source forensic hash mismatch for ${candidate.entity_code}`);
  }

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
    source_forensics: {
      snapshot_version: forensic.manifest.snapshot_version,
      normalization_profile: forensic.manifest.normalization_profile,
      normalized_content_sha256: forensic.manifest.normalized_content_sha256,
      raw_response_sha256: forensic.manifest.raw_response_sha256,
      manifest_sha256: forensic.manifest.manifest_sha256,
      capture_complete: forensic.manifest.capture_complete,
      snapshot_ref: path.relative(process.cwd(), forensic.snapshotDir).replaceAll('\\', '/')
    },
    source_governance: {
      public_brand_reference: source.public_brand_reference,
      catalog_auto_update: source.catalog_auto_update,
      external_source_role: 'internal_evidence_only',
      forensic_snapshot_required: true,
      public_forensic_metadata_allowed: false
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
  forensic_snapshot_required: true,
  forensic_snapshot_storage: 'private_runtime_only',
  forensic_snapshot_count: forensicSnapshots.size,
  sources: sources.map((source) => {
    const forensic = forensicSnapshots.get(source.id);
    return {
      id: source.id,
      url: source.url,
      knowledge_systems: source.knowledge_systems,
      knowledge_content_type: source.knowledge_content_type,
      technology_candidates: source.technology_candidates,
      technology_relation: source.technology_relation,
      application_relation: source.application_relation,
      knowledge_topics: source.knowledge_topics,
      forensic_capture_status: forensic ? 'captured_and_hash_verified' : 'not_fetched_this_run'
    };
  })
};

console.log(`[HERMES LD corpus] mode=${summary.mode} first_harvest=${summary.first_harvest} created=${summary.created} previewed=${summary.previewed} enriched=${enrichedCandidates} unchanged=${summary.unchanged} duplicates=${summary.duplicates} fetch_errors=${summary.fetch_errors}`);
console.log(`[HERMES LD corpus] forensic_snapshots=${forensicSnapshots.size} storage=${forensicSnapshotDir}`);
console.log(`[HERMES LD corpus] manifest=${JSON.stringify(domainManifest)}`);
console.log('[HERMES LD corpus] database_write=false pgvector_write=false catalogue_cross_write=false obsidian_auto_publish=false');
