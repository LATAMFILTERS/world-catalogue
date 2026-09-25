#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const manifestPath = path.join(repoRoot, 'config', 'vehicle-platform-closure', 'isuzu-aisin-evidence-pack.json');
const pack = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const root = path.join(repoRoot, pack.extraction_contract.evidence_root);
const output = path.join(repoRoot, pack.extraction_contract.output_matrix);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

function oenRegex(oen) {
  const chars = String(oen || '').replace(/\D/g, '').split('');
  return new RegExp(chars.join('\\D*'), 'i');
}

function extractContext(text, index, radius = 500) {
  return text.slice(Math.max(0, index - radius), Math.min(text.length, index + radius));
}

const searchable = new Set(['.txt','.md','.json','.csv','.html','.htm','.xml']);
const files = walk(root).filter((p) => searchable.has(path.extname(p).toLowerCase()) && p !== output);
const rows = [];

for (const oen of pack.oen_targets) {
  const matcher = oenRegex(oen);
  let hits = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8');
    const match = matcher.exec(text);
    if (!match) continue;
    hits += 1;
    rows.push({
      oen,
      document: path.relative(root, file).replace(/\\/g, '/'),
      page_or_section: null,
      model_year: null,
      model: null,
      engine: null,
      transmission: null,
      filter_position: null,
      kit_or_element: null,
      evidence_text: extractContext(text, match.index),
      evidence_class: 'FIRST_PARTY_PARTIAL',
      review_state: 'NEEDS_STRUCTURED_REVIEW'
    });
  }
  if (!hits) rows.push({
    oen,
    document: null,
    page_or_section: null,
    model_year: null,
    model: null,
    engine: null,
    transmission: null,
    filter_position: null,
    kit_or_element: null,
    evidence_text: null,
    evidence_class: 'NOT_FOUND_IN_ACQUIRED_PACK',
    review_state: 'TERMINAL_CANDIDATE_AFTER_PACK_COMPLETENESS_CHECK'
  });
}

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({
  pack_id: pack.pack_id,
  generated_at: new Date().toISOString(),
  files_scanned: files.length,
  oen_targets: pack.oen_targets.length,
  rows
}, null, 2) + '\n');

console.log(JSON.stringify({ output, files_scanned: files.length, oen_targets: pack.oen_targets.length, matrix_rows: rows.length }, null, 2));
