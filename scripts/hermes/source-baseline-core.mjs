// HERMES — governed source baseline.
// A baseline is the last known-good, minimal fingerprint of each ACTIVE
// endpoint's content: just enough to detect a real change on a later run,
// never the content itself. It is what makes "content changed" mean
// something on the SECOND real run onward — before a baseline exists for a
// source, HERMES has nothing to compare against, so it must not guess.
//
// Pure functions only — no fs access except loadBaseline/saveBaseline,
// which take an explicit path so callers (and tests) control exactly where
// reads/writes happen. Never touches PostgreSQL, pgvector, legacy catalogue layer, or
// any canonical Obsidian note.
import fs from 'node:fs';
import path from 'node:path';

// The SHA-256 digest of an empty string. If a page's normalized text hashes
// to exactly this, the fetch returned no usable visible content (a
// redirect stub, a bot-protection interstitial, a blank shell) — never a
// real observation worth reporting as "content changed".
export const EMPTY_STRING_SHA256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

// Conservative default: real press/news pages are virtually always longer
// than this once scripts/styles/tags are stripped. Configurable via
// HERMES_COLLECTION_MIN_CONTENT_LENGTH so it can be tuned per operational
// experience without a code change.
export const DEFAULT_MIN_CONTENT_LENGTH = 200;

/**
 * Classifies whether normalized page text is usable evidence at all.
 * Returns 'EMPTY_CONTENT', 'INSUFFICIENT_CONTENT', or 'SUFFICIENT'.
 */
export function classifyContentSufficiency(normalizedText, contentHash, minContentLength = DEFAULT_MIN_CONTENT_LENGTH) {
  const text = String(normalizedText ?? '');
  if (text.length === 0 || contentHash === EMPTY_STRING_SHA256) return 'EMPTY_CONTENT';
  if (text.length < minContentLength) return 'INSUFFICIENT_CONTENT';
  return 'SUFFICIENT';
}

const EMPTY_BASELINE = Object.freeze({ schema_version: '1.0.0', generated_at: null, sources: {} });

export function loadBaseline(filePath) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (parsed && typeof parsed.sources === 'object' && parsed.sources !== null) return parsed;
    return { ...EMPTY_BASELINE, sources: {} };
  } catch {
    return { ...EMPTY_BASELINE, sources: {} };
  }
}

export function saveBaseline(filePath, baseline) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
}

/**
 * The baseline entry schema is deliberately minimal: an identifying
 * fingerprint, never the page content itself.
 */
export function buildBaselineEntry({ organizationId, endpointId, sourceUrl, normalizedHash, observedAt, contentLength, responseStatus }) {
  return {
    organization_id: organizationId ?? null,
    endpoint_id: endpointId,
    source_url: sourceUrl,
    normalized_hash: normalizedHash,
    observed_at: observedAt,
    content_length: contentLength,
    response_status: responseStatus
  };
}

/** Pure — returns a new baseline object with this endpoint's entry set. */
export function withUpdatedEntry(baseline, endpointId, entry) {
  return {
    ...baseline,
    generated_at: entry.observed_at,
    sources: { ...baseline.sources, [endpointId]: entry }
  };
}

/**
 * Compares a freshly observed hash against the stored baseline for this
 * endpoint. Never mutates the baseline — the caller decides what to do
 * with the verdict (including whether/how to update it).
 */
export function compareAgainstBaseline(baseline, endpointId, normalizedHash) {
  const existing = baseline.sources?.[endpointId] ?? null;
  if (!existing) return { status: 'BASELINE_REQUIRED', previousEntry: null };
  if (existing.normalized_hash === normalizedHash) return { status: 'UNCHANGED', previousEntry: existing };
  return { status: 'CHANGED', previousEntry: existing };
}
