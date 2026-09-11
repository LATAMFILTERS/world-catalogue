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
import { runCollection, sourcesFromRegistry, loadSourcesConfig, DEFAULT_MAX_BYTES, DEFAULT_TIMEOUT_MS, DEFAULT_MAX_SOURCES_PER_RUN, SOURCE_PRIORITY, DEFAULT_SOURCE_PRIORITY_TIER } from './collect-real-sources-core.mjs';
import { DEFAULT_MIN_CONTENT_LENGTH } from './source-baseline-core.mjs';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';
import { isDryRunActive } from './hermes-core.mjs';
import { loadHarvestState } from './semantic-harvest-state-core.mjs';
import { captureForensicSnapshotsForRun } from './forensic-capture-run.mjs';

const legacyConfigPath = process.argv[2] || 'hermes/config/real-sources.json';
const organizationsPath = process.env.HERMES_SOURCE_ORGANIZATIONS_PATH || 'hermes/config/source-organizations.json';
const endpointsPath = process.env.HERMES_SOURCE_ENDPOINTS_PATH || 'hermes/config/source-endpoints.json';
const forceLegacy = String(process.env.HERMES_COLLECTION_USE_LEGACY_SOURCES || 'false').toLowerCase() === 'true';

const dryRun = isDryRunActive();
const timeoutMs = Number(process.env.HERMES_COLLECTION_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
const maxBytes = Number(process.env.HERMES_COLLECTION_MAX_BYTES || DEFAULT_MAX_BYTES);
const baselineMode = String(process.env.HERMES_BASELINE_MODE || 'false').toLowerCase() === 'true';
const minContentLength = Number(process.env.HERMES_COLLECTION_MIN_CONTENT_LENGTH || DEFAULT_MIN_CONTENT_LENGTH);
const maxSources = baselineMode ? 0 : Number(process.env.HERMES_MAX_SOURCES_PER_RUN ?? DEFAULT_MAX_SOURCES_PER_RUN);
const fairnessSlots = Math.max(0, Number(process.env.HERMES_SOURCE_FAIRNESS_SLOTS ?? 3));
const harvestStatePath = path.resolve('hermes/baselines/source-observations.json');
const harvestState = loadHarvestState(harvestStatePath);
const sourceCacheDir = path.resolve('hermes/source-cache');
const forensicSnapshotDir = path.resolve('hermes/forensic-source-snapshots');

function isoWeekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return (d.getUTCFullYear() * 100) + week;
}

function applyWeeklyFairRotation(allSources, cap, slots, rotationKey = isoWeekKey()) {
  if (!Number.isFinite(cap) || cap <= 0 || allSources.length <= cap) {
    return { selected: allSources, rotatingPool: 0, fairnessUsed: 0, rotationKey };
  }

  const indexed = allSources.map((source, index) => ({
    source,
    index,
    tier: SOURCE_PRIORITY[source.category] ?? DEFAULT_SOURCE_PRIORITY_TIER
  }));
  indexed.sort((a, b) => (a.tier - b.tier) || (a.index - b.index));

  const requestedFairness = Math.min(Math.max(0, Math.floor(slots)), cap);
  const guaranteedCount = Math.max(0, cap - requestedFairness);
  const guaranteed = indexed.slice(0, guaranteedCount);
  const pool = indexed.slice(guaranteedCount);
  const fairnessUsed = Math.min(requestedFairness, pool.length, cap - guaranteed.length);

  const rotated = [];
  if (fairnessUsed > 0 && pool.length > 0) {
    const offset = Math.abs(rotationKey) % pool.length;
    for (let i = 0; i < fairnessUsed; i += 1) rotated.push(pool[(offset + i) % pool.length]);
  }

  const selectedEntries = [...guaranteed, ...rotated]
    .sort((a, b) => a.index - b.index);
  return {
    selected: selectedEntries.map((entry) => entry.source),
    rotatingPool: pool.length,
    fairnessUsed,
    rotationKey
  };
}

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

const availableSourceCount = sources.length;
const rotation = baselineMode
  ? { selected: sources, rotatingPool: 0, fairnessUsed: 0, rotationKey: isoWeekKey() }
  : applyWeeklyFairRotation(sources, maxSources, fairnessSlots);
const selectedSources = rotation.selected;

if (!baselineMode && availableSourceCount > selectedSources.length) {
  console.log(`[HERMES collect] fairness_rotation=weekly rotation_key=${rotation.rotationKey} fairness_slots=${rotation.fairnessUsed} rotating_pool=${rotation.rotatingPool} selected=${selectedSources.length}/${availableSourceCount}`);
}

const summary = await runCollection({
  sources: selectedSources,
  realCandidatesDir: path.resolve('hermes/real-candidates'),
  sourceCacheDir,
  previewDir: path.resolve('hermes/real-candidates-previews'),
  auditDir: path.resolve('elimfilters-vault/94-sync-log'),
  baselinePath: path.resolve('hermes/baselines/source-baseline.json'),
  baselinePreviewPath: path.resolve('hermes/baselines/source-baseline.preview.json'),
  harvestState,
  harvestStatePath,
  maxSources: 0,
  dryRun,
  baselineMode,
  minContentLength,
  timeoutMs,
  maxBytes
});

// Universal forensic rule: every successfully observed governed source —
// regardless of industry — receives a private cryptographic snapshot.
// Newly-created candidates are linked to that snapshot before any later
// approval/promotion step. The snapshot tree is gitignored and forbidden
// from public/canonical projections.
const forensicCaptures = await captureForensicSnapshotsForRun({
  sources: selectedSources,
  summary,
  sourceCacheDir,
  forensicSnapshotDir,
  timeoutMs,
  maxBytes
});

summary.forensic_snapshot_required = true;
summary.forensic_snapshot_storage = 'private_runtime_only';
summary.forensic_snapshots_captured = forensicCaptures.size;

summary.sources_available = availableSourceCount;
summary.sources_capped = Math.max(0, availableSourceCount - selectedSources.length);

console.log(`[HERMES collect] source_mode=${sourceMode} mode=${summary.mode} baseline_mode=${summary.baseline_mode} sources_available=${summary.sources_available} sources=${summary.sources_total} sources_capped=${summary.sources_capped} enabled=${summary.sources_enabled}`);
console.log(`[HERMES collect] created=${summary.created} previewed=${summary.previewed} unchanged=${summary.unchanged} changed=${summary.changed} first_harvest=${summary.first_harvest} empty_content=${summary.empty_content} insufficient_content=${summary.insufficient_content} baseline_required=${summary.baseline_required} baseline_recorded=${summary.baseline_recorded} duplicates=${summary.duplicates} fetch_errors=${summary.fetch_errors} invalid=${summary.invalid} disabled=${summary.disabled}`);
console.log(`[HERMES collect] forensic_snapshots=${summary.forensic_snapshots_captured} storage=${forensicSnapshotDir} scope=ALL_GOVERNED_INDUSTRIES`);
if (summary.zero_result_reason) console.log(`[HERMES collect] ${summary.zero_result_reason}`);
if (summary.harvest_state_updated) console.log(`[HERMES collect] harvest state ${harvestStatePath}${dryRun ? ' (dry run — not written)' : ''}`);
for (const result of summary.results) {
  if (result.status === 'FETCH_ERROR' || result.status === 'INVALID_CANDIDATE' || result.status === 'BUILD_ERROR') {
    console.warn(`[HERMES collect] ${result.status} ${result.id}: ${result.error || (result.errors || []).join('; ')}`);
  }
}
console.log(`[HERMES collect] audit ${summary.audit_path}`);
if (summary.baseline_updated) console.log(`[HERMES collect] baseline ${summary.baseline_output_path}${dryRun ? ' (preview only — real baseline untouched)' : ''}`);
console.log(`[HERMES collect] database_write=false pgvector_write=false unified_data_write=false canonical_vault_writes=false forensic_publication=false`);
if (dryRun) {
  console.log('[HERMES collect] DRY RUN — no files were written to hermes/real-candidates. Set HERMES_COLLECTION_DRY_RUN=false to persist candidates.');
}
if (summary.baseline_mode) {
  console.log('[HERMES collect] INITIAL BASELINE — NO INTELLIGENCE CANDIDATES GENERATED');
}
