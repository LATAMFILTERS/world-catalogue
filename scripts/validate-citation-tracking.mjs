#!/usr/bin/env node
/**
 * validate-citation-tracking.mjs
 * Phase E — Citation API publication-surface tracking guard.
 *
 * Read-only. Verifies: Git artifact set == deployable artifact set for the
 * Citation API publication tree and its direct upstream intermediates.
 *
 * Scope is intentionally narrow — only these three paths are checked:
 *   - frontend/public/api/citation/**  (the deployable Citation API tree)
 *   - elimfilters-vault/00-meta/CITATION_INDEX.json
 *   - elimfilters-vault/00-meta/PART_SEARCH_MAP.json
 * No other repository files are inspected or treated as errors.
 *
 * Fails (exit 1) if, within that scope:
 *   - a file exists on disk but is not tracked by Git ("untracked")
 *   - a file exists on disk but Git reports it as ignored ("ignored")
 *   - a file is tracked by Git but missing from disk ("tracked file missing")
 *
 * Usage: node scripts/validate-citation-tracking.mjs
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

  for (const f of onDisk) {
    if (!tracked.has(f)) violations.push({ code: 'UNTRACKED_FILE', file: f });
  }
  for (const f of tracked) {
    if (!onDisk.has(f)) violations.push({ code: 'TRACKED_FILE_MISSING_FROM_DISK', file: f });
  }
  for (const f of ignored) {
    violations.push({ code: 'IGNORED_FILE_IN_PUBLICATION_SCOPE', file: f });
  }

  return {
    label,
    onDiskCount: onDisk.size,
    trackedCount: tracked.size,
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
    console.log('RESULT: PASS — Git artifact set matches deployable artifact set within scope.');
  } else {
    console.log(`RESULT: FAIL — ${totalViolations} tracking violation(s) in scope.`);
    process.exitCode = 1;
  }
}

main();
