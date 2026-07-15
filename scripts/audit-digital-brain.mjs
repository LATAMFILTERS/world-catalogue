#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'knowledge', 'brain', 'brain-manifest.json'), 'utf8'));
const outputDir = path.join(root, 'knowledge', 'generated', 'digital-brain');
fs.mkdirSync(outputDir, { recursive: true });

const results = [];
for (const validator of manifest.required_validators) {
  const run = spawnSync(process.execPath, [validator], { cwd: root, encoding: 'utf8' });
  results.push({
    validator,
    passed: run.status === 0,
    exit_code: run.status,
    stdout: run.stdout.trim(),
    stderr: run.stderr.trim()
  });
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
  if (!text.startsWith('---\n') || end === -1) continue;
  const block = text.slice(4, end);
  const get = (key) => block.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
  const id = get('id');
  const type = get('type') || 'Unknown';
  const status = get('status') || 'unknown';
  typeCounts[type] = (typeCounts[type] || 0) + 1;
  statuses[status] = (statuses[status] || 0) + 1;
  if (id) {
    if (ids.has(id)) conflicts.push({ kind: 'duplicate_id', id, files: [ids.get(id), path.relative(root, file)] });
    else ids.set(id, path.relative(root, file));
  }
  const sourceBlock = block.match(/^source:\s*\n((?:\s+-.*\n?)*)/m)?.[1] || '';
  for (const line of sourceBlock.split('\n')) {
    const source = line.replace(/^\s+-\s*/, '').trim();
    if (source) sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  }
}

const report = {
  schema_version: '1.0.0',
  generated_at: new Date().toISOString(),
  brain_id: manifest.brain_id,
  overall_status: results.every((item) => item.passed) && conflicts.length === 0 ? 'passed' : 'failed',
  validators: results,
  canonical_inventory: {
    total_files: files.length,
    unique_ids: ids.size,
    by_type: typeCounts,
    by_status: statuses,
    by_source: sourceCounts
  },
  conflicts,
  deployment_readiness: {
    architecture: results.every((item) => item.passed),
    canonical_integrity: conflicts.length === 0,
    postgresql_connected: false,
    obsidian_synchronized: false,
    graphify_refreshed: fs.existsSync(path.join(root, 'graphify-out', 'graph.json')),
    production_write_enabled: false
  }
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
  '',
  '## Validators',
  '',
  ...results.map((item) => `- ${item.passed ? 'PASS' : 'FAIL'} — \`${item.validator}\``),
  '',
  '## Deployment boundaries',
  '',
  '- PostgreSQL remains read-only and unconnected in architecture CI.',
  '- Obsidian synchronization requires the local vault or an approved private runner.',
  '- Graphify output is generated context, not canonical authority.',
  '- Production writes remain disabled.',
  ''
].join('\n');
fs.writeFileSync(path.join(outputDir, 'DIGITAL_BRAIN_AUDIT.md'), markdown, 'utf8');

console.log(`[digital-brain] audit ${report.overall_status}: ${files.length} canonical file(s), ${conflicts.length} conflict(s)`);
if (report.overall_status !== 'passed') process.exit(1);
