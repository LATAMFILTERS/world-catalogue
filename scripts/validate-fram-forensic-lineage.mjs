import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildForensicLineageLedger } = require('../lib/knowledge-governance/fram-automotive-forensic-lineage');
const { buildHermesCorpusSources } = require('../lib/knowledge-governance/fram-automotive-source-corpus');

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const canonicalPath = path.join(repo, 'frontend', 'src', 'generated', 'canonical-knowledge.json');
const canonical = JSON.parse(fs.readFileSync(canonicalPath, 'utf8'));
const canonicalIds = new Set((canonical.records || []).map((r) => r.id));
const sources = buildHermesCorpusSources();
const ledger = buildForensicLineageLedger();

function fail(message) {
  throw new Error(`FRAM forensic lineage validation failed: ${message}`);
}

if (ledger.length !== sources.length) fail(`expected ${sources.length} lineage records, got ${ledger.length}`);

const unique = (values) => new Set(values).size === values.length;
if (!unique(ledger.map((r) => r.source_id))) fail('duplicate source_id');
if (!unique(ledger.map((r) => r.evidence_id))) fail('duplicate evidence_id');
if (!unique(ledger.map((r) => r.candidate_id))) fail('duplicate candidate_id');
if (!unique(ledger.map((r) => r.source_identity_sha256))) fail('duplicate source identity hash');

for (const record of ledger) {
  if (!record.source_id || !record.source_url || !record.source_identity_sha256) fail('missing source identity');
  if (!record.evidence_id || !record.candidate_id) fail(`${record.source_id} missing evidence/candidate forensic ids`);
  if (record.public_brand_reference !== false || record.public_provenance_allowed !== false) {
    fail(`${record.source_id} public provenance isolation flags are not closed`);
  }
  if (!record.canonical_ids.length && record.disposition !== 'support_only_not_promoted') {
    fail(`${record.source_id} has no canonical target and no explicit support-only disposition`);
  }
  for (const id of record.canonical_ids) {
    if (!canonicalIds.has(id)) fail(`${record.source_id} references missing canonical id ${id}`);
  }
}

const canonicalText = JSON.stringify(canonical);
const privateSignatures = [
  /\bFRAM\b/i,
  /fram\.com/i,
  /EVID-FRAM-LD-/i,
  /KCAND-FRAM-LD-/i,
  /source_identity_sha256/i,
  /source_content_sha256/i,
  /raw_content_sha256/i,
  /normalized_text_sha256/i,
  /forensic_backfill/i,
  /FRAM_AUTOMOTIVE_CRYPTOGRAPHIC_SNAPSHOT_V1/i,
  /91-private-evidence\/fram-automotive/i,
  /source_registration_commit/i,
  /hermes_classification_commit/i,
  /canonical_promotion_commit/i
];
for (const signature of privateSignatures) {
  if (signature.test(canonicalText)) fail(`private lineage signature leaked into canonical public projection: ${signature}`);
}

const publicCandidates = [
  path.join(repo, 'frontend', 'public', 'knowledge-center'),
  path.join(repo, 'frontend', 'public', 'api'),
  path.join(repo, 'frontend', 'src', 'generated')
].filter(fs.existsSync);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

for (const root of publicCandidates) {
  for (const file of walk(root)) {
    if (!/\.(json|html|txt|xml|js|ts|tsx)$/i.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const signature of privateSignatures) {
      if (signature.test(text)) fail(`private lineage signature leaked into public/generated artifact ${path.relative(repo, file)}: ${signature}`);
    }
  }
}

// If post-policy snapshots exist, cryptographically verify every stored byte
// and re-run the public-isolation checks. If no post-policy snapshot exists
// yet, historical records remain explicitly marked as unsnapshotted.
const snapshotValidation = spawnSync(process.execPath, [path.join(repo, 'scripts', 'validate-fram-forensic-snapshots.mjs')], {
  cwd: repo,
  stdio: 'inherit',
  env: process.env
});
if (snapshotValidation.status !== 0) fail(`snapshot integrity validator exited ${snapshotValidation.status ?? 'unknown'}`);

const promoted = ledger.filter((r) => r.canonical_ids.length > 0).length;
const supportOnly = ledger.length - promoted;
console.log(`FRAM forensic lineage PASS: ${ledger.length}/${ledger.length} sources traced; ${promoted} promoted; ${supportOnly} support-only; public lineage leakage=0; snapshot integrity gate=active.`);
