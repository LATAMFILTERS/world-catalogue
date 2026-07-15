#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, 'knowledge', 'brain', 'brain-manifest.json'), 'utf8').replace(/^\uFEFF/, ''),
);
const outputDir = path.join(root, 'knowledge', 'generated', 'digital-brain');
fs.mkdirSync(outputDir, { recursive: true });

function runValidator(validator, mode, prerequisites = []) {
  const missingPrerequisites = prerequisites.filter((item) => !fs.existsSync(path.join(root, item)));
  if (missingPrerequisites.length) {
    return {
      validator,
      mode,
      status: 'skipped',
      passed: true,
      exit_code: null,
      prerequisites,
      missing_prerequisites: missingPrerequisites,
      stdout: '',
      stderr: '',
    };
  }

  const run = spawnSync(process.execPath, [validator], { cwd: root, encoding: 'utf8' });
  return {
    validator,
    mode,
    status: run.status === 0 ? 'passed' : 'failed',
    passed: run.status === 0,
    exit_code: run.status,
    prerequisites,
    missing_prerequisites: [],
    stdout: (run.stdout || '').trim(),
    stderr: (run.stderr || '').trim(),
  };
}

const results = [];
for (const validator of manifest.required_validators || []) {
  results.push(runValidator(validator, 'required'));
}
for (const item of manifest.conditional_validators || []) {
  results.push(runValidator(item.validator, 'conditional', item.prerequisites || []));
}

const canonicalRoot = path.join(root, 'knowledge', 'entities');
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : full.endsWith('.md') ? [full] : [];
  });
}

const files = walk(canonicalRoot);
const typeCounts = {};
const statuses = {};
const sourceCounts = {};
const conflicts = [];
const ids = new Map();

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const end = text.indexOf('\n---\n', 4);
  if (!text.startsWith('---\n') || end === -1) {
    conflicts.push({ kind: 'invalid_frontmatter', file: path.relative(root, file).replaceAll('\\', '/') });
    continue;
  }
  const block = text.slice(4, end);
  const get = (key) => block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  const id = get('id');
  const type = get('type') || 'Unknown';
  const status = get('status') || 'unknown';
  typeCounts[type] = (typeCounts[type] || 0) + 1;
  statuses[status] = (statuses[status] || 0) + 1;
  if (id) {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    if (ids.has(id)) conflicts.push({ kind: 'duplicate_id', id, files: [ids.get(id), relative] });
    else ids.set(id, relative);
  } else {
    conflicts.push({ kind: 'missing_id', file: path.relative(root, file).replaceAll('\\', '/') });
  }
  const sourceBlock = block.match(/^source:\s*\n((?:\s+-.*\n?)*)/m)?.[1] || '';
  for (const line of sourceBlock.split('\n')) {
    const source = line.replace(/^\s+-\s*/, '').trim();
    if (source) sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  }
}

const requiredPassed = results.filter((item) => item.mode === 'required').every((item) => item.passed);
const executedConditionalPassed = results
  .filter((item) => item.mode === 'conditional' && item.status !== 'skipped')
  .every((item) => item.passed);
const overallPassed = requiredPassed && executedConditionalPassed && conflicts.length === 0;

const report = {
  schema_version: '1.1.0',
  generated_at: new Date().toISOString(),
  brain_id: manifest.brain_id,
  overall_status: overallPassed ? 'passed' : 'failed',
  validators: results,
  validator_summary: {
    required_total: results.filter((item) => item.mode === 'required').length,
    conditional_total: results.filter((item) => item.mode === 'conditional').length,
    passed: results.filter((item) => item.status === 'passed').length,
    failed: results.filter((item) => item.status === 'failed').length,
    skipped: results.filter((item) => item.status === 'skipped').length,
  },
  canonical_inventory: {
    total_files: files.length,
    unique_ids: ids.size,
    by_type: typeCounts,
    by_status: statuses,
    by_source: sourceCounts,
  },
  conflicts,
  deployment_readiness: {
    architecture: requiredPassed,
    conditional_artifacts_valid: executedConditionalPassed,
    canonical_integrity: conflicts.length === 0,
    postgresql_connected: false,
    obsidian_synchronized: false,
    graphify_refreshed: fs.existsSync(path.join(root, 'graphify-out', 'graph.json')),
    production_write_enabled: false,
  },
};

fs.writeFileSync(path.join(outputDir, 'digital-brain-audit.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

const markdown = [
  '# ELIMFILTERS Digital Brain Audit',
  '',
  `- Generated: ${report.generated_at}`,
  `- Status: **${report.overall_status.toUpperCase()}**`,
  `- Canonical entities: ${files.length}`,
  `- Unique IDs: ${ids.size}`,
  `- Conflicts: ${conflicts.length}`,
  `- Validators passed: ${report.validator_summary.passed}`,
  `- Validators skipped: ${report.validator_summary.skipped}`,
  `- Validators failed: ${report.validator_summary.failed}`,
  '',
  '## Validators',
  '',
  ...results.map((item) => `- ${item.status.toUpperCase()} — \`${item.validator}\`${item.missing_prerequisites.length ? ` — missing generated prerequisites: ${item.missing_prerequisites.join(', ')}` : ''}`),
  '',
  '## Deployment boundaries',
  '',
  '- PostgreSQL remains read-only and unconnected in architecture CI.',
  '- Obsidian synchronization requires the local vault or an approved private runner.',
  '- Graphify output is generated context, not canonical authority.',
  '- Production writes remain disabled.',
  '',
].join('\n');
fs.writeFileSync(path.join(outputDir, 'DIGITAL_BRAIN_AUDIT.md'), markdown, 'utf8');

console.log(`[digital-brain] audit ${report.overall_status}: ${files.length} canonical file(s), ${conflicts.length} conflict(s), ${report.validator_summary.skipped} conditional validator(s) skipped`);
if (!overallPassed) process.exit(1);
