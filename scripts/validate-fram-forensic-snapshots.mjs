#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repo = process.cwd();
const root = path.resolve('elimfilters-vault/91-private-evidence/fram-automotive');
const indexPath = path.join(root, 'snapshot-index.json');
const publicRoots = [
  path.resolve('frontend/public'),
  path.resolve('frontend/src/generated/canonical-knowledge.json')
];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function fail(message) {
  throw new Error(`FRAM forensic snapshot validation failed: ${message}`);
}

function walk(target) {
  if (!fs.existsSync(target)) return [];
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(target, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

if (!fs.existsSync(indexPath)) {
  console.log('FRAM forensic snapshot policy PASS: no post-policy snapshots captured yet; historical sources remain explicitly unsnapshotted.');
} else {
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  if (index.public_exposure_allowed !== false || index.private_evidence_only !== true) fail('snapshot index privacy flags are not closed');
  if (!Array.isArray(index.records)) fail('snapshot index records missing');

  for (const record of index.records) {
    if (!record.source_id || !record.source_url || !record.captured_at) fail('snapshot metadata incomplete');
    if (!/^[a-f0-9]{64}$/i.test(record.raw_content_sha256 || '')) fail(`${record.source_id} raw SHA-256 invalid`);
    if (!/^[a-f0-9]{64}$/i.test(record.normalized_text_sha256 || '')) fail(`${record.source_id} normalized SHA-256 invalid`);
    if (record.integrity_verified !== true || record.public_exposure_allowed !== false) fail(`${record.source_id} integrity/privacy flags invalid`);
    const snapshot = path.resolve(repo, record.snapshot_path || '');
    if (!snapshot.startsWith(root + path.sep)) fail(`${record.source_id} snapshot escaped private evidence root`);
    if (!fs.existsSync(snapshot)) fail(`${record.source_id} snapshot file missing`);
    const raw = fs.readFileSync(snapshot);
    if (raw.byteLength !== record.raw_content_bytes) fail(`${record.source_id} byte length mismatch`);
    if (sha256(raw) !== record.raw_content_sha256) fail(`${record.source_id} raw content hash mismatch`);
  }

  console.log(`FRAM forensic snapshot integrity PASS: ${index.records.length} captured versions verified.`);
}

const forbidden = [
  /91-private-evidence\/fram-automotive/i,
  /raw_content_sha256/i,
  /normalized_text_sha256/i,
  /FRAM_AUTOMOTIVE_CRYPTOGRAPHIC_SNAPSHOT_V1/i,
  /snapshot-index\.json/i
];
for (const rootCandidate of publicRoots) {
  for (const file of walk(rootCandidate)) {
    if (!/\.(json|html|txt|xml|js|ts|tsx)$/i.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const signature of forbidden) {
      if (signature.test(text)) fail(`private snapshot signature leaked into public artifact ${path.relative(repo, file)}`);
    }
  }
}
console.log('FRAM forensic public isolation PASS: snapshot metadata leakage=0.');
