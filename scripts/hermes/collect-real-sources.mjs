#!/usr/bin/env node
// HERMES Phase 5 Lite — CLI entry point for the real source collector.
//
// Primary source: hermes/config/source-organizations.json +
// source-endpoints.json (the governed registry). Only endpoints with
// status=ACTIVE and enabled=true are ever fetched; DISCOVERY_REQUIRED,
// REVIEW_REQUIRED, PAUSED and UNSUPPORTED organizations are never touched,
// and an organization's official_domain is never fetched on its own when it
// has no ACTIVE endpoint.
//
// Fallback: hermes/config/real-sources.json (the original flat file) is
// used ONLY as an explicit fallback — either because the registry files are
// missing, or because HERMES_COLLECTION_USE_LEGACY_SOURCES=true was set on
// purpose. Every fallback is logged; none of it is silent.
//
// See hermes/PHASE5-LITE.md for the full operational contract.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { runCollection, sourcesFromRegistry, loadSourcesConfig, DEFAULT_MAX_BYTES, DEFAULT_TIMEOUT_MS } from './collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';

const legacyConfigPath = process.argv[2] || 'hermes/config/real-sources.json';
const organizationsPath = process.env.HERMES_SOURCE_ORGANIZATIONS_PATH || 'hermes/config/source-organizations.json';
const endpointsPath = process.env.HERMES_SOURCE_ENDPOINTS_PATH || 'hermes/config/source-endpoints.json';
const forceLegacy = String(process.env.HERMES_COLLECTION_USE_LEGACY_SOURCES || 'false').toLowerCase() === 'true';

const dryRun = isDryRunActive();
const timeoutMs = Number(process.env.HERMES_COLLECTION_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxBytes = Number(process.env.HERMES_COLLECTION_MAX_BYTES || DEFAULT_MAX_BYTES);
// Governed baseline mode: bootstraps/refreshes hermes/baselines/source-baseline.json
// without ever producing a candidate. Defaults to false (normal comparison
// mode) — a human must set this explicitly, and it is never auto-disabled
// by code; see hermes/PHASE5-LITE.md.
const baselineMode = String(process.env.HERMES_BASELINE_MODE || 'false').toLowerCase() === 'true';
const minContentLength = Number(process.env.HERMES_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);

let sources;
let sourceMode;
const registryAvailable = fs.existsSync(organizationsPath) && fs.existsSync(endpointsPath);

if (forceLegacy) {
  console.warn(`[HERMES collect] FALLBACK (explicit): HERMES_COLLECTION_USE_LEGACY_SOURCES=true — using ${legacyConfigPath}, ignoring the governed registry`);
  sources = loadSourcesConfig(legacyConfigPath).sources;
  sourceMode = 'legacy_forced';
} else if (registryAvailable) {
  const registry = loadRegistry(organizationsPath, endpointsPath);
  const registryErrors = validateRegistry(registry);
  if (registryErrors.length) {
    console.error(`[HERMES collect] source registry failed validation (${registryErrors.length} issue${registryErrors.length === 1 ? '' : 's'}); refusing to collect against an invalid registry`);
    for (const error of registryErrors) console.error(`  - ${error}`);
    process.exit(2);
  }
  sources = sourcesFromRegistry(registry);
  sourceMode = 'registry';
  console.log(`[HERMES collect] source_mode=registry organizations=${registry.organizations.length} endpoints=${registry.endpoints.length} active_and_enabled=${sources.length}`);
} else {
  console.warn(`[HERMES collect] FALLBACK: ${organizationsPath} or ${endpointsPath} not found — using legacy ${legacyConfigPath}`);
  sources = loadSourcesConfig(legacyConfigPath).sources;
  sourceMode = 'legacy_missing_registry';
}

if (baselineMode) {
  console.log('[HERMES collect] HERMES_BASELINE_MODE=true — this run only bootstraps/refreshes hermes/baselines/source-baseline.json; it will not produce any candidate.');
}

const summary = await runCollection({
  sources,
  realCandidatesDir: path.resolve('hermes/real-candidates'),
  sourceCacheDir: path.resolve('hermes/source-cache'),
  previewDir: path.resolve('hermes/real-candidates-previews'),
  auditDir: path.resolve('elimfilters-vault/94-sync-log'),
  baselinePath: path.resolve('hermes/baselines/source-baseline.json'),
  baselinePreviewPath: path.resolve('hermes/baselines/source-baseline.preview.json'),
  dryRun,
  baselineMode,
  minContentLength,
  timeoutMs,
  maxBytes
});

console.log(`[HERMES collect] source_mode=${sourceMode} mode=${summary.mode} baseline_mode=${summary.baseline_mode} sources=${summary.sources_total} enabled=${summary.sources_enabled}`);
console.log(`[HERMES collect] created=${summary.created} previewed=${summary.previewed} unchanged=${summary.unchanged} changed=${summary.changed} empty_content=${summary.empty_content} insufficient_content=${summary.insufficient_content} baseline_required=${summary.baseline_required} baseline_recorded=${summary.baseline_recorded} duplicates=${summary.duplicates} fetch_errors=${summary.fetch_errors} invalid=${summary.invalid} disabled=${summary.disabled}`);
for (const result of summary.results) {
  if (result.status === 'FETCH_ERROR' || result.status === 'INVALID_CANDIDATE' || result.status === 'BUILD_ERROR') {
    console.warn(`[HERMES collect] ${result.status} ${result.id}: ${result.error || (result.errors || []).join('; ')}`);
  }
}
console.log(`[HERMES collect] audit ${summary.audit_path}`);
if (summary.baseline_updated) console.log(`[HERMES collect] baseline ${summary.baseline_output_path}${dryRun ? ' (preview only — real baseline untouched)' : ''}`);
console.log(`[HERMES collect] database_write=false pgvector_write=false unified_data_write=false canonical_vault_writes=false`);
if (dryRun) {
  console.log('[HERMES collect] DRY RUN — no files were written to hermes/real-candidates. Set HERMES_COLLECTION_DRY_RUN=false to persist candidates.');
}
if (summary.baseline_mode) {
  console.log('[HERMES collect] INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED');
}
