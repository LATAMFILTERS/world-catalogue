#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fetchWithLimits, normalizeHtmlToText } from './collect-real-sources-core.mjs';

const require = createRequire(import.meta.url);
const { buildHermesCorpusSources } = require('../../lib/knowledge-governance/fram-automotive-source-corpus');

const SNAPSHOT_ROOT = path.resolve('elimfilters-vault/91-private-evidence/fram-automotive');
const INDEX_PATH = path.join(SNAPSHOT_ROOT, 'snapshot-index.json');
const TIMEOUT_MS = Number(process.env.HERMES_LD_COLLECTION_TIMEOUT_MS || 15000);
const MAX_BYTES = Number(process.env.HERMES_LD_COLLECTION_MAX_BYTES || 3000000);
const STRICT = String(process.env.HERMES_FORENSIC_SNAPSHOT_STRICT || 'true').toLowerCase() !== 'false';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function safeJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return { schema_version: '1.0.0', records: [] }; }
}

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(temp, content);
  fs.renameSync(temp, filePath);
}

function isoFileStamp(iso) {
  return iso.replace(/[:.]/g, '-');
}

const sources = buildHermesCorpusSources();
const index = safeJson(INDEX_PATH);
const records = Array.isArray(index.records) ? index.records : [];
const runId = `fram-forensic-${Date.now()}`;
const capturedAt = new Date().toISOString();
const failures = [];
let captured = 0;

for (const source of sources) {
  const result = await fetchWithLimits({ url: source.url, timeoutMs: TIMEOUT_MS, maxBytes: MAX_BYTES });
  if (!result.ok || !result.text) {
    failures.push({ source_id: source.id, url: source.url, error: result.error || `HTTP ${result.status}` });
    continue;
  }

  const rawBuffer = Buffer.from(result.text, 'utf8');
  const normalized = normalizeHtmlToText(result.text);
  if (!normalized) {
    failures.push({ source_id: source.id, url: source.url, error: 'normalized source content is empty' });
    continue;
  }

  const rawSha256 = sha256(rawBuffer);
  const normalizedSha256 = sha256(Buffer.from(normalized, 'utf8'));
  const sourceDir = path.join(SNAPSHOT_ROOT, source.id);
  const base = `${isoFileStamp(capturedAt)}-${rawSha256.slice(0, 16)}`;
  const snapshotPath = path.join(sourceDir, `${base}.html`);
  const manifestPath = path.join(sourceDir, `${base}.manifest.json`);

  atomicWrite(snapshotPath, rawBuffer);
  const verifyRaw = fs.readFileSync(snapshotPath);
  if (sha256(verifyRaw) !== rawSha256) throw new Error(`Forensic write verification failed for ${source.id}`);

  const manifest = {
    schema_version: '1.0.0',
    forensic_capture_policy: 'FRAM_AUTOMOTIVE_CRYPTOGRAPHIC_SNAPSHOT_V1',
    run_id: runId,
    source_id: source.id,
    source_url: source.url,
    captured_at: capturedAt,
    http_status: result.status,
    truncated: Boolean(result.truncated),
    raw_content_bytes: rawBuffer.byteLength,
    raw_content_sha256: rawSha256,
    normalized_text_bytes: Buffer.byteLength(normalized, 'utf8'),
    normalized_text_sha256: normalizedSha256,
    snapshot_path: path.relative(process.cwd(), snapshotPath).replaceAll('\\', '/'),
    public_exposure_allowed: false,
    catalog_auto_update: false,
    knowledge_domain: source.knowledge_domain,
    industry: source.industry,
    knowledge_systems: source.knowledge_systems,
    technology_candidates: source.technology_candidates,
    integrity_verified: true
  };

  atomicWrite(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  records.push({ ...manifest, manifest_path: path.relative(process.cwd(), manifestPath).replaceAll('\\', '/') });
  captured += 1;
}

const nextIndex = {
  schema_version: '1.0.0',
  private_evidence_only: true,
  public_exposure_allowed: false,
  last_run_id: runId,
  updated_at: new Date().toISOString(),
  source_count_expected: sources.length,
  records
};
atomicWrite(INDEX_PATH, JSON.stringify(nextIndex, null, 2) + '\n');

console.log(`[HERMES forensic snapshot] captured=${captured}/${sources.length} failures=${failures.length} root=${SNAPSHOT_ROOT}`);
if (failures.length) console.error(JSON.stringify({ failures }, null, 2));
if (STRICT && captured !== sources.length) {
  throw new Error(`Forensic snapshot gate failed: captured ${captured}/${sources.length} approved FRAM sources`);
}
