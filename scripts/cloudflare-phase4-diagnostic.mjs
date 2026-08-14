#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const frontend = path.join(root, 'frontend');
const out = path.join(frontend, 'out');
const statePath = path.join(root, '.phase4-build-diagnostics.json');
const mode = process.argv[2];

function readState() {
  try { return JSON.parse(fs.readFileSync(statePath, 'utf8')); }
  catch { return { started_at: new Date().toISOString(), stages: [] }; }
}

function saveState(state) {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
}

function run(name, command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  const stage = {
    name,
    command: [command, ...args].join(' '),
    cwd: path.relative(root, cwd) || '.',
    status: result.status ?? 1,
    signal: result.signal || null,
    stdout: String(result.stdout || '').slice(-30000),
    stderr: String(result.stderr || '').slice(-30000),
  };
  const state = readState();
  state.stages.push(stage);
  state.last_stage = name;
  state.last_status = stage.status;
  saveState(state);
  console.log(`[phase4-diagnostic] ${name}: ${stage.status === 0 ? 'PASS' : 'FAIL'}`);
  return stage.status === 0;
}

function publishDiagnostics() {
  const state = readState();
  state.completed_at = new Date().toISOString();
  state.overall_pass = state.stages.every(stage => stage.status === 0);
  saveState(state);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'phase4-build-diagnostics.json'), JSON.stringify(state, null, 2), 'utf8');
  if (!fs.existsSync(path.join(out, 'index.html'))) {
    fs.writeFileSync(
      path.join(out, 'index.html'),
      '<!doctype html><html><head><meta charset="utf-8"><title>ELIMFILTERS Phase 4 Build Diagnostics</title></head><body><h1>ELIMFILTERS Phase 4 Build Diagnostics</h1><p>Open <a href="/phase4-build-diagnostics.json">phase4-build-diagnostics.json</a>.</p></body></html>',
      'utf8'
    );
  }
}

if (mode === 'prebuild') {
  fs.rmSync(statePath, { force: true });
  const stages = [
    ['canonical-taxonomy', process.execPath, ['scripts/validate-canonical-taxonomy.mjs'], root],
    ['legacy-catalogue-dependency', process.execPath, ['scripts/validate-legacy-catalogue-dependency.mjs'], root],
    ['citation-index', process.execPath, ['scripts/build-citation-index.js'], root],
    ['citation-api', process.execPath, ['scripts/generate-citation-api.js'], root],
    ['air-intake-guard', process.execPath, ['scripts/validate-air-intake-page-guard.mjs'], root],
    ['next-cache', process.execPath, ['scripts/ensure-next-cache.mjs'], root],
  ];
  for (const [name, command, args, cwd] of stages) run(name, command, args, cwd);
  process.exit(0);
}

if (mode === 'build') {
  run('next-build', process.execPath, [path.join(frontend, 'node_modules', 'next', 'dist', 'bin', 'next'), 'build'], frontend);
  publishDiagnostics();
  process.exit(0);
}

if (mode === 'postbuild') {
  const stages = [
    ['kc-sitemap', process.execPath, ['scripts/generate-kc-sitemap.mjs'], root],
    ['video-sitemap', process.execPath, ['scripts/generate-video-sitemap.mjs'], root],
    ['sitemap-index', process.execPath, ['scripts/generate-sitemap-index.mjs'], root],
  ];
  for (const [name, command, args, cwd] of stages) run(name, command, args, cwd);
  publishDiagnostics();
  process.exit(0);
}

throw new Error(`Unknown diagnostic mode: ${mode}`);
