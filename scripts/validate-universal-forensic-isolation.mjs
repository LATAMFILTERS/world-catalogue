import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function fail(message) {
  throw new Error(`Universal forensic isolation failed: ${message}`);
}

const forbidden = [
  /source_forensics/i,
  /forensic_snapshot/i,
  /forensic-source-snapshots/i,
  /snapshot_ref/i,
  /manifest_sha256/i,
  /raw_response_sha256/i,
  /normalized_content_sha256/i,
  /source_identity_sha256/i,
  /source_content_sha256/i,
  /public_forensic_metadata_allowed/i,
  /evidence_record_origin/i,
  /candidate_record_origin/i,
  /lineage_origin/i,
  /lineage_status/i,
  /source_registration_commit/i,
  /hermes_classification_commit/i,
  /canonical_promotion_commit/i
];

const explicitFiles = [
  path.join(repo, 'frontend', 'src', 'generated', 'canonical-knowledge.json')
].filter(fs.existsSync);

const publicRoots = [
  path.join(repo, 'frontend', 'public', 'knowledge-center'),
  path.join(repo, 'frontend', 'public', 'api')
].filter(fs.existsSync);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const files = [
  ...explicitFiles,
  ...publicRoots.flatMap(walk)
].filter((file) => /\.(json|html|txt|xml|js|ts|tsx)$/i.test(file));

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const signature of forbidden) {
    if (signature.test(text)) {
      fail(`private forensic signature ${signature} leaked into ${path.relative(repo, file)}`);
    }
  }
}

const gitignorePath = path.join(repo, '.gitignore');
const gitignore = fs.readFileSync(gitignorePath, 'utf8');
for (const required of ['hermes/forensic-source-snapshots/', 'hermes/source-cache/', 'hermes/automotive-source-cache/']) {
  if (!gitignore.includes(required)) fail(`missing private runtime ignore rule: ${required}`);
}

console.log(`Universal forensic isolation PASS: ${files.length} public/canonical artifacts checked; forensic runtime paths are private.`);
