#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildHermesLightDutyTechDocSources } = require('../../lib/knowledge-governance/fram-light-duty-techdocs-corpus');
const { buildHermesHeavyDutySources } = require('../../lib/knowledge-governance/fram-heavy-duty-source-corpus');

const TIMEOUT_MS = Number(process.env.HERMES_FRAM_PDF_TIMEOUT_MS || 20000);
const MAX_BYTES = Number(process.env.HERMES_FRAM_PDF_MAX_BYTES || 8000000);
const STRICT = String(process.env.HERMES_FORENSIC_SNAPSHOT_STRICT || 'true').toLowerCase() !== 'false';

function sha256(buffer) { return crypto.createHash('sha256').update(buffer).digest('hex'); }
function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, content);
  fs.renameSync(tmp, filePath);
}
function safeJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return { schema_version: '1.0.0', records: [] }; }
}
function stamp(iso) { return iso.replace(/[:.]/g, '-'); }

async function fetchBinary(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { redirect: 'follow', signal: controller.signal, headers: { 'User-Agent': 'ELIMFILTERS-HERMES/1.0 (+forensic-evidence)' } });
    if (!response.ok) return { ok: false, status: response.status, error: `HTTP ${response.status}` };
    const reader = response.body?.getReader();
    if (!reader) {
      const array = new Uint8Array(await response.arrayBuffer());
      if (array.byteLength > MAX_BYTES) return { ok: false, status: response.status, error: `source exceeds ${MAX_BYTES} bytes` };
      return { ok: true, status: response.status, contentType: response.headers.get('content-type'), buffer: Buffer.from(array) };
    }
    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_BYTES) { try { await reader.cancel(); } catch {} return { ok: false, status: response.status, error: `source exceeds ${MAX_BYTES} bytes` }; }
      chunks.push(Buffer.from(value));
    }
    return { ok: true, status: response.status, contentType: response.headers.get('content-type'), buffer: Buffer.concat(chunks) };
  } catch (error) {
    return { ok: false, status: null, error: String(error?.message || error) };
  } finally { clearTimeout(timer); }
}

const groups = [
  { key: 'ld', domain: 'LIGHT_DUTY_KNOWLEDGE_DOMAIN', root: path.resolve('elimfilters-vault/91-private-evidence/fram-automotive-techdocs'), sources: buildHermesLightDutyTechDocSources() },
  { key: 'hd', domain: 'HEAVY_DUTY_KNOWLEDGE_DOMAIN', root: path.resolve('elimfilters-vault/91-private-evidence/fram-heavy-duty'), sources: buildHermesHeavyDutySources() }
];

const runId = `fram-techdocs-${Date.now()}`;
const capturedAt = new Date().toISOString();
const failures = [];
let captured = 0;

for (const group of groups) {
  const indexPath = path.join(group.root, 'snapshot-index.json');
  const current = safeJson(indexPath);
  const records = Array.isArray(current.records) ? current.records : [];
  for (const source of group.sources) {
    if (source.knowledge_domain !== group.domain) throw new Error(`Domain separation failure for ${source.id}`);
    const fetched = await fetchBinary(source.url);
    if (!fetched.ok || !fetched.buffer?.length) { failures.push({ source_id: source.id, domain: group.domain, url: source.url, error: fetched.error }); continue; }
    if (source.source_type === 'pdf' && !fetched.buffer.subarray(0, 5).toString('ascii').startsWith('%PDF-')) {
      failures.push({ source_id: source.id, domain: group.domain, url: source.url, error: 'expected PDF signature not found' }); continue;
    }
    const rawHash = sha256(fetched.buffer);
    const sourceDir = path.join(group.root, source.id);
    const base = `${stamp(capturedAt)}-${rawHash.slice(0, 16)}`;
    const ext = source.source_type === 'pdf' ? '.pdf' : '.bin';
    const snapshotPath = path.join(sourceDir, `${base}${ext}`);
    const manifestPath = path.join(sourceDir, `${base}.manifest.json`);
    atomicWrite(snapshotPath, fetched.buffer);
    if (sha256(fs.readFileSync(snapshotPath)) !== rawHash) throw new Error(`Snapshot verification failed for ${source.id}`);
    const manifest = {
      schema_version: '1.0.0', run_id: runId, source_id: source.id, source_url: source.url,
      knowledge_domain: source.knowledge_domain, industry: source.industry, industry_scope: source.industry_scope || [source.industry],
      source_type: source.source_type, captured_at: capturedAt, http_status: fetched.status, content_type: fetched.contentType,
      raw_content_bytes: fetched.buffer.byteLength, raw_content_sha256: rawHash,
      snapshot_path: path.relative(process.cwd(), snapshotPath).replaceAll('\\','/'),
      knowledge_systems: source.knowledge_systems, technology_candidates: source.technology_candidates,
      disposition: source.disposition, public_exposure_allowed: false, cross_domain_inheritance_allowed: false,
      integrity_verified: true
    };
    atomicWrite(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    records.push({ ...manifest, manifest_path: path.relative(process.cwd(), manifestPath).replaceAll('\\','/') });
    captured += 1;
  }
  atomicWrite(indexPath, JSON.stringify({ schema_version: '1.0.0', private_evidence_only: true, public_exposure_allowed: false, knowledge_domain: group.domain, updated_at: new Date().toISOString(), records }, null, 2) + '\n');
}

const expected = groups.reduce((n, group) => n + group.sources.length, 0);
console.log(`[HERMES FRAM techdocs forensic] captured=${captured}/${expected} failures=${failures.length}`);
if (failures.length) console.error(JSON.stringify({ failures }, null, 2));
if (STRICT && captured !== expected) throw new Error(`FRAM LD/HD forensic capture gate failed: ${captured}/${expected}`);
