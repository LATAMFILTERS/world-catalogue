import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const FORENSIC_SNAPSHOT_VERSION = '1.0.0';
export const NORMALIZATION_PROFILE = 'HERMES_VISIBLE_TEXT_V1';

export function sha256Hex(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function safeSegment(value) {
  return String(value || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unknown';
}

function safeTimestamp(iso) {
  return String(iso).replace(/[:.]/g, '-');
}

function writeAtomic(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, filePath);
}

export function buildForensicSnapshotManifest({
  sourceId,
  sourceUrl,
  fetchedAt,
  httpStatus,
  rawText,
  normalizedText,
  truncated = false
}) {
  const raw = String(rawText ?? '');
  const normalized = String(normalizedText ?? '');
  const rawResponseSha256 = sha256Hex(raw);
  const normalizedContentSha256 = sha256Hex(normalized);
  const captureComplete = truncated !== true;

  const manifestCore = {
    snapshot_version: FORENSIC_SNAPSHOT_VERSION,
    normalization_profile: NORMALIZATION_PROFILE,
    source_id: sourceId,
    source_url: sourceUrl,
    fetched_at: fetchedAt,
    http_status: httpStatus ?? null,
    capture_complete: captureComplete,
    truncated: truncated === true,
    raw_response_bytes: Buffer.byteLength(raw, 'utf8'),
    normalized_content_chars: normalized.length,
    raw_response_sha256: rawResponseSha256,
    normalized_content_sha256: normalizedContentSha256
  };

  return {
    ...manifestCore,
    manifest_sha256: sha256Hex(JSON.stringify(manifestCore))
  };
}

export function writeForensicSourceSnapshot({
  rootDir,
  sourceId,
  sourceUrl,
  fetchedAt,
  httpStatus,
  rawText,
  normalizedText,
  truncated = false
}) {
  if (!rootDir) throw new Error('forensic snapshot rootDir is required');
  if (!sourceId || !sourceUrl || !fetchedAt) throw new Error('sourceId, sourceUrl and fetchedAt are required');

  const manifest = buildForensicSnapshotManifest({
    sourceId,
    sourceUrl,
    fetchedAt,
    httpStatus,
    rawText,
    normalizedText,
    truncated
  });

  const sourceDir = path.join(rootDir, safeSegment(sourceId));
  const snapshotDir = path.join(sourceDir, `${safeTimestamp(fetchedAt)}-${manifest.normalized_content_sha256.slice(0, 16)}`);
  const contentPath = path.join(snapshotDir, 'normalized-content.txt');
  const manifestPath = path.join(snapshotDir, 'manifest.json');
  const latestPath = path.join(sourceDir, 'latest.json');

  if (fs.existsSync(snapshotDir)) {
    const existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (existing.normalized_content_sha256 !== manifest.normalized_content_sha256 || existing.raw_response_sha256 !== manifest.raw_response_sha256) {
      throw new Error(`forensic snapshot collision for ${sourceId} at ${fetchedAt}`);
    }
    return { manifest: existing, snapshotDir, manifestPath, contentPath, latestPath, status: 'EXISTS' };
  }

  writeAtomic(contentPath, String(normalizedText ?? ''));
  writeAtomic(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  writeAtomic(latestPath, JSON.stringify({
    snapshot_version: FORENSIC_SNAPSHOT_VERSION,
    source_id: sourceId,
    fetched_at: fetchedAt,
    snapshot_dir: path.relative(rootDir, snapshotDir).replaceAll('\\', '/'),
    manifest_sha256: manifest.manifest_sha256,
    normalized_content_sha256: manifest.normalized_content_sha256,
    raw_response_sha256: manifest.raw_response_sha256,
    capture_complete: manifest.capture_complete
  }, null, 2) + '\n');

  return { manifest, snapshotDir, manifestPath, contentPath, latestPath, status: 'CREATED' };
}

export function verifyForensicSourceSnapshot({ manifestPath, contentPath }) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const normalizedContent = fs.readFileSync(contentPath, 'utf8');
  const contentHash = sha256Hex(normalizedContent);
  if (contentHash !== manifest.normalized_content_sha256) {
    throw new Error(`normalized content hash mismatch: expected ${manifest.normalized_content_sha256}, got ${contentHash}`);
  }

  const { manifest_sha256: storedManifestHash, ...manifestCore } = manifest;
  const recomputedManifestHash = sha256Hex(JSON.stringify(manifestCore));
  if (recomputedManifestHash !== storedManifestHash) {
    throw new Error(`manifest hash mismatch: expected ${storedManifestHash}, got ${recomputedManifestHash}`);
  }

  return true;
}
