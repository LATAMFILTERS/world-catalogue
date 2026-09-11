import fs from 'node:fs';
import path from 'node:path';
import {
  fetchWithLimits,
  normalizeHtmlToText,
  sha256Hex,
  DEFAULT_MAX_BYTES,
  DEFAULT_TIMEOUT_MS
} from './collect-real-sources-core.mjs';
import { writeForensicSourceSnapshot } from './source-forensic-snapshot-core.mjs';

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

/**
 * Creates a private cryptographic snapshot for every source successfully
 * observed in a HERMES run. HTML sources are linked only when the re-fetched
 * normalized digest exactly matches the collector's content_hash. RSS/XML
 * sources, whose candidates use item-level hashes, retain a source-level
 * cryptographic snapshot but are explicitly marked as source-level rather
 * than falsely claiming item-level byte identity.
 */
export async function captureForensicSnapshotsForRun({
  sources,
  summary,
  sourceCacheDir,
  forensicSnapshotDir = path.resolve('hermes/forensic-source-snapshots'),
  timeoutMs = DEFAULT_TIMEOUT_MS,
  maxBytes = DEFAULT_MAX_BYTES,
  fetchImpl
}) {
  const sourcesById = new Map(sources.map((source) => [source.id, source]));
  const captures = new Map();

  for (const source of sources) {
    const cachePath = path.join(sourceCacheDir, `${source.id}.json`);
    const cache = readJsonSafe(cachePath);
    if (!cache?.ok) continue;

    const targetUrl = cache.source_url || source.url;
    let captured = null;
    let observedHash = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      const fetched = await fetchWithLimits({ url: targetUrl, timeoutMs, maxBytes, fetchImpl });
      if (!fetched.ok) continue;

      const isRss = source.source_type === 'rss';
      const normalized = isRss ? String(fetched.text).trim() : normalizeHtmlToText(fetched.text);
      const normalizedHash = sha256Hex(normalized);
      observedHash = normalizedHash;

      // HTML candidates are derived from the collector's normalized whole-page
      // hash, so do not persist a forensic link unless the exact digest matches.
      if (!isRss && cache.content_hash && normalizedHash !== cache.content_hash) continue;

      const snapshot = writeForensicSourceSnapshot({
        rootDir: forensicSnapshotDir,
        sourceId: source.id,
        sourceUrl: targetUrl,
        fetchedAt: cache.fetched_at,
        httpStatus: fetched.status,
        rawText: fetched.text,
        normalizedText: normalized,
        truncated: fetched.truncated
      });

      captured = {
        ...snapshot,
        relation: isRss ? 'source_level_snapshot_for_item_candidates' : 'exact_collector_content_hash_match'
      };
      break;
    }

    if (!captured) {
      throw new Error(
        `HERMES forensic capture failed for ${source.id}: collector_hash=${cache.content_hash || 'item-level/not-recorded'} observed_hash=${observedHash || 'unavailable'}`
      );
    }

    captures.set(source.id, captured);
  }

  // Attach private forensic references to candidates produced by this run.
  // Candidate directories are already private/ignored; public projection
  // validators independently reject these signatures from canonical output.
  for (const result of summary.results || []) {
    if (!['CREATED', 'PREVIEWED'].includes(result.status) || !result.output_path) continue;
    const source = sourcesById.get(result.id);
    const capture = captures.get(result.id);
    if (!source || !capture) {
      throw new Error(`Candidate ${result.entity_code || result.output_path} has no forensic source capture`);
    }

    const candidatePath = path.resolve(result.output_path);
    const candidate = readJsonSafe(candidatePath);
    if (!candidate) throw new Error(`Cannot read candidate for forensic enrichment: ${candidatePath}`);

    if (source.source_type !== 'rss' && candidate.source_hash !== capture.manifest.normalized_content_sha256) {
      throw new Error(`Candidate/source forensic hash mismatch for ${candidate.entity_code}`);
    }

    candidate.source_forensics = {
      snapshot_version: capture.manifest.snapshot_version,
      normalization_profile: capture.manifest.normalization_profile,
      relation: capture.relation,
      normalized_content_sha256: capture.manifest.normalized_content_sha256,
      raw_response_sha256: capture.manifest.raw_response_sha256,
      manifest_sha256: capture.manifest.manifest_sha256,
      capture_complete: capture.manifest.capture_complete,
      snapshot_ref: path.relative(process.cwd(), capture.snapshotDir).replaceAll('\\', '/'),
      candidate_source_hash: candidate.source_hash || null
    };
    candidate.source_governance = {
      ...(candidate.source_governance || {}),
      forensic_snapshot_required: true,
      public_forensic_metadata_allowed: false
    };
    writeJson(candidatePath, candidate);
  }

  return captures;
}
