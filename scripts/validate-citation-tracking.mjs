#!/usr/bin/env node
/**
 * validate-citation-tracking.mjs
 * Phase E — Citation publication tracking guard.
 *
 * The Citation API tree under frontend/public/api/citation/** is GENERATED
 * during prebuild. It is intentionally rebuilt from scratch by
 * scripts/generate-citation-api.js and therefore MUST NOT be required to match
 * the Git index file-for-file.
 *
 * Blocking guarantees in this guard are limited to the two direct upstream
 * intermediates that must exist and remain versioned:
 *   - elimfilters-vault/00-meta/CITATION_INDEX.json
 *   - elimfilters-vault/00-meta/PART_SEARCH_MAP.json
 *
 * Structural/content correctness of the generated Citation API is enforced by
 * the dedicated citation API and content-governance validators that run before
 * this guard in prebuild.
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const CITATION_TREE_REL = 'frontend/public/api/citation';
const CITATION_INDEX_REL = 'elimfilters-vault/00-meta/CITATION_INDEX.json';
const PART_SEARCH_MAP_REL = 'elimfilters-vault/00-meta/PART_SEARCH_MAP.json';

function git(args) {
  try {
    return execFileSync('git', args, { cwd: PROJECT_ROOT, encoding: 'utf8' });
  } catch (err) {
    return err.stdout ? err.stdout.toString() : '';
  }
}

function listOnDiskFiles(relDir) {
  const absDir = path.join(PROJECT_ROOT, relDir);
  if (!fs.existsSync(absDir)) return [];
  const results = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else results.push(path.relative(PROJECT_ROOT, full).replaceAll('\\', '/'));
    }
  }

  walk(absDir);
  return results;
}

function listTrackedFiles(relPath) {
  const out = git(['ls-files', '--', relPath]);
  return out.split('\n').map((line) => line.trim()).filter(Boolean);
}

function listIgnoredFiles(relPath) {
  const out = git(['status', '--porcelain', '--ignored', '--', relPath]);
  return out
    .split('\n')
    .filter((line) => line.startsWith('!!'))
    .map((line) => line.slice(3).trim().replaceAll('\\', '/'))
    .filter(Boolean);
}

function inspectGeneratedTree() {
  const onDisk = listOnDiskFiles(CITATION_TREE_REL);
  const tracked = listTrackedFiles(CITATION_TREE_REL);
  const ignored = listIgnoredFiles(CITATION_TREE_REL);

  return {
    onDiskCount: onDisk.length,
    trackedCount: tracked.length,
    ignoredCount: ignored.length,
  };
}

function checkRequiredTrackedFile(label, relPath) {
  const absPath = path.join(PROJECT_ROOT, relPath);
  const onDisk = fs.existsSync(absPath);
  const tracked = listTrackedFiles(relPath).length > 0;
  const ignored = listIgnoredFiles(relPath).length > 0;

  const violations = [];
  if (!onDisk) violations.push({ code: 'REQUIRED_FILE_MISSING', file: relPath });
  if (!tracked) violations.push({ code: 'REQUIRED_FILE_UNTRACKED', file: relPath });
  if (ignored) violations.push({ code: 'REQUIRED_FILE_IGNORED', file: relPath });

  return { label, onDisk, tracked, ignored, violations };
}

function main() {
  console.log('CITATION TRACKING GUARD — Phase E');
  console.log('===================================');

  const generated = inspectGeneratedTree();
  console.log('\nfrontend/public/api/citation/** (generated deployable Citation API tree)');
  console.log(`  On-disk generated files: ${generated.onDiskCount}`);
  console.log(`  Git-tracked files:       ${generated.trackedCount}`);
  console.log(`  Git-ignored files:       ${generated.ignoredCount}`);
  console.log('  Tracking policy: informational only — this tree is rebuilt during prebuild.');

  const citationIndex = checkRequiredTrackedFile(
    'elimfilters-vault/00-meta/CITATION_INDEX.json (upstream intermediate)',
    CITATION_INDEX_REL,
  );
  console.log(`\n${citationIndex.label}`);
  console.log(`  On disk: ${citationIndex.onDisk} | Tracked: ${citationIndex.tracked} | Ignored: ${citationIndex.ignored}`);
  for (const violation of citationIndex.violations) {
    console.log(`    - ${violation.code}: ${violation.file}`);
  }

  const partSearchMap = checkRequiredTrackedFile(
    'elimfilters-vault/00-meta/PART_SEARCH_MAP.json (upstream intermediate)',
    PART_SEARCH_MAP_REL,
  );
  console.log(`\n${partSearchMap.label}`);
  console.log(`  On disk: ${partSearchMap.onDisk} | Tracked: ${partSearchMap.tracked} | Ignored: ${partSearchMap.ignored}`);
  for (const violation of partSearchMap.violations) {
    console.log(`    - ${violation.code}: ${violation.file}`);
  }

  const totalViolations = citationIndex.violations.length + partSearchMap.violations.length;

  console.log('');
  if (totalViolations === 0) {
    console.log('RESULT: PASS — required upstream citation intermediates are present and tracked; generated publication artifacts are validated by dedicated build gates.');
  } else {
    console.log(`RESULT: FAIL — ${totalViolations} upstream tracking violation(s).`);
    process.exitCode = 1;
  }
}

main();
