#!/usr/bin/env node
/**
 * validate-generation-determinism.mjs
 * Phase G — Gate 7: generated artifact reproducibility.
 *
 * Read-only with respect to the Citation API tree — this script only ever
 * reads frontend/public/api/citation/**, elimfilters-vault/00-meta/CITATION_INDEX.json
 * and PART_SEARCH_MAP.json. It writes only to its own manifest file (a path
 * you supply, outside the citation tree).
 *
 * This is NOT wired into prebuild — regenerating the full chain twice on
 * every build is too expensive for a per-commit gate. Instead it is intended
 * for a periodic/release CI job or manual verification, following this
 * two-step protocol:
 *
 *   node scripts/validate-generation-determinism.mjs --snapshot /tmp/manifest-1.json
 *   node scripts/build-citation-index.js && node scripts/build-part-search-map.js && node scripts/generate-citation-api.js
 *   node scripts/validate-generation-determinism.mjs --compare /tmp/manifest-1.json
 *
 * Content is hashed per-file after normalizing ONLY these explicitly approved
 * volatile timestamp fields (documented here, not broadly ignored):
 *   - elimfilters-vault/00-meta/CITATION_INDEX.json      -> meta.generated
 *   - elimfilters-vault/00-meta/PART_SEARCH_MAP.json     -> meta.generated
 *   - frontend/public/api/citation/index.json            -> meta.generated
 *   - frontend/public/api/citation/README.md             -> "Last generated: ..." line
 * No other field, in any file, is excluded from the hash.
 *
 * Usage:
 *   node scripts/validate-generation-determinism.mjs --snapshot <path>
 *   node scripts/validate-generation-determinism.mjs --compare <path>
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'frontend', 'public', 'api', 'citation');
const CITATION_INDEX_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');
const PART_SEARCH_MAP_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'PART_SEARCH_MAP.json');

// Explicit, documented normalization — nothing else is touched.
function normalize(relPath, text) {
  if (relPath === 'elimfilters-vault/00-meta/CITATION_INDEX.json' || relPath === 'elimfilters-vault/00-meta/PART_SEARCH_MAP.json') {
    return text.replace(/("generated":\s*")[^"]*(")/, '$1<normalized>$2');
  }
  if (relPath === 'frontend/public/api/citation/index.json') {
    return text.replace(/("generated":\s*")[^"]*(")/, '$1<normalized>$2');
  }
  if (relPath === 'frontend/public/api/citation/README.md') {
    return text.replace(/^Last generated: .*$/m, 'Last generated: <normalized>');
  }
  return text;
}

function listFiles() {
  const files = [
    { abs: CITATION_INDEX_PATH, rel: 'elimfilters-vault/00-meta/CITATION_INDEX.json' },
    { abs: PART_SEARCH_MAP_PATH, rel: 'elimfilters-vault/00-meta/PART_SEARCH_MAP.json' },
  ];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else files.push({ abs: full, rel: path.relative(ROOT, full).replaceAll('\\', '/') });
    }
  }
  walk(API_DIR);
  return files;
}

function buildManifest() {
  const manifest = {};
  for (const { abs, rel } of listFiles()) {
    const raw = fs.readFileSync(abs, 'utf8');
    const normalized = normalize(rel, raw);
    manifest[rel] = crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
  }
  return manifest;
}

function main() {
  const snapshotIdx = process.argv.indexOf('--snapshot');
  const compareIdx = process.argv.indexOf('--compare');

  if (snapshotIdx === -1 && compareIdx === -1) {
    console.error('Usage: node scripts/validate-generation-determinism.mjs --snapshot <path> | --compare <path>');
    process.exit(1);
  }

  const manifest = buildManifest();
  const fileCount = Object.keys(manifest).length;

  if (snapshotIdx !== -1) {
    const outPath = process.argv[snapshotIdx + 1];
    if (!outPath) { console.error('--snapshot requires a path argument'); process.exit(1); }
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`GENERATION DETERMINISM — snapshot written (${fileCount} files hashed): ${outPath}`);
    return;
  }

  const comparePath = process.argv[compareIdx + 1];
  if (!comparePath) { console.error('--compare requires a path argument'); process.exit(1); }
  const previous = JSON.parse(fs.readFileSync(comparePath, 'utf8'));

  const diffs = [];
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(manifest)]);
  for (const key of allKeys) {
    if (!(key in previous)) diffs.push(`${key}: new file, not present in prior snapshot`);
    else if (!(key in manifest)) diffs.push(`${key}: present in prior snapshot, missing now`);
    else if (previous[key] !== manifest[key]) diffs.push(`${key}: content hash changed`);
  }

  console.log('GENERATION DETERMINISM — Phase G Gate 7');
  console.log('=========================================');
  console.log(`Files compared: ${fileCount}`);
  console.log('');
  if (diffs.length === 0) {
    console.log('RESULT: PASS — generation is deterministic (identical content modulo the documented timestamp fields).');
  } else {
    console.log(`RESULT: FAIL — ${diffs.length} non-deterministic difference(s).`);
    for (const d of diffs) console.log(`  - ${d}`);
    process.exitCode = 1;
  }
}

main();
