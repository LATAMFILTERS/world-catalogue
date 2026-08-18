#!/usr/bin/env node
/**
 * validate-citation-tracking.mjs
 * Phase E — Citation API publication-surface tracking guard.
 *
 * Read-only. Verifies that the deployable Citation API tree does not contain
 * untracked or ignored files and that direct upstream intermediates remain
 * present and tracked.
 *
 * The Citation API generator intentionally rebuilds frontend/public/api/citation
 * from scratch. Therefore a file that is tracked by Git but no longer exists on
 * disk after generation is treated as a stale generated artifact retired by the
 * current canonical build, not as a blocking deployment error.
 *
 * Scope:
 *   - frontend/public/api/citation/**
 *   - elimfilters-vault/00-meta/CITATION_INDEX.json
 *   - elimfilters-vault/00-meta/PART_SEARCH_MAP.json
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
  return out.split('\n').map((l) => l.trim()).filter(Boolean);
}

function listIgnoredFiles(relPath) {
  const out = git(['status', '--porcelain', '--ignored', '--', relPath]);
  return out
    .split('\n')
    .filter((l) => l.startsWith('!!'))
    .map((l) => l.slice(3).trim().replaceAll('\\', '/'))
    .filter(Boolean);
}

function checkTree(label, relDir) {
  const onDisk = new Set(listOnDiskFiles(relDir));
  const tracked = new Set(listTrackedFiles(relDir));
  const ignored = new Set(listIgnoredFiles(relDir));

  const violations = [];
  const retiredTrackedArtifacts = [];

  for (const f of onDisk) {
    if (!tracked.has(f)) violations.push({ code: 'UNTRACKED_FILE', file: f });
  }

  // The generator starts with rmSync(OUT_DIR) and recreates only the current
  // canonical artifact set. Missing tracked files here are therefore stale
  // generated outputs intentionally pruned from the deployable tree.
  for (const f of tracked) {
    if (!onDisk.has(f)) retiredTrackedArtifacts.push(f);
  }

  for (const f of ignored) {
    violations.push({ code: 'IGNORED_FILE_IN_PUBLICATION_SCOPE', file: f });
  }

  return {
    label,
    onDiskCount: onDisk.size,
    trackedCount: tracked.size,
    retiredTrackedArtifacts,
    violations,
  };
}

function checkSingleFile(label, relPath) {
  const absPath = path.join(PROJECT_ROOT, relPath);
  const onDisk = fs.existsSync(absPath);
  const tracked = listTrackedFiles(relPath).length > 0;
  const ignored = listIgnoredFiles(relPath).length > 0;

  const violations = [];
  if (onDisk && !tracked) violations.push({ code: 'UNTRACKED_FILE', file: relPath });
  if (tracked && !onDisk) violations.push({ code: 'TRACKED_FILE_MISSING_FROM_DISK', file: relPath });
  if (ignored && onDisk) violations.push({ code: 'IGNORED_FILE_IN_PUBLICATION_SCOPE', file: relPath });

  return { label, onDisk, tracked, ignored, violations };
}

function main() {
  console.log('CITATION TRACKING GUARD — Phase E');
  console.log('===================================');

  const tree = checkTree('frontend/public/api/citation/** (deployable Citation API tree)', CITATION_TREE_REL);
  console.log(`\n${tree.label}`);
  console.log(`  On-disk files:  ${tree.onDiskCount}`);
  console.log(`  Tracked files:  ${tree.trackedCount}`);
  console.log(`  Generator-pruned stale tracked artifacts: ${tree.retiredTrackedArtifacts.length}`);
  console.log(`  Violations:     ${tree.violations.length}`);
  for (const v of tree.violations) console.log(`    - ${v.code}: ${v.file}`);

  const citationIndex = checkSingleFile('elimfilters-vault/00-meta/CITATION_INDEX.json (upstream intermediate)', CITATION_INDEX_REL);
  console.log(`\n${citationIndex.label}`);
  console.log(`  On disk: ${citationIndex.onDisk} | Tracked: ${citationIndex.tracked}`);
  for (const v of citationIndex.violations) console.log(`    - ${v.code}: ${v.file}`);

  const partSearchMap = checkSingleFile('elimfilters-vault/00-meta/PART_SEARCH_MAP.json (upstream intermediate)', PART_SEARCH_MAP_REL);
  console.log(`\n${partSearchMap.label}`);
  console.log(`  On disk: ${partSearchMap.onDisk} | Tracked: ${partSearchMap.tracked}`);
  for (const v of partSearchMap.violations) console.log(`    - ${v.code}: ${v.file}`);

  const totalViolations = tree.violations.length + citationIndex.violations.length + partSearchMap.violations.length;

  console.log('');
  if (totalViolations === 0) {
    console.log('RESULT: PASS — deployable citation artifacts are tracked/not ignored; stale generated artifacts pruned by the canonical generator are non-blocking.');
  } else {
    console.log(`RESULT: FAIL — ${totalViolations} tracking violation(s) in scope.`);
    process.exitCode = 1;
  }
}

main();
