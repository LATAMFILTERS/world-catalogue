#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const args = process.argv.slice(2);
const visibilityArg = args.find((value) => value.startsWith('--visibility='));
const visibility = visibilityArg ? visibilityArg.split('=')[1] : 'internal';
const query = args.filter((value) => !value.startsWith('--')).join(' ').trim();

if (!query) {
  console.error('Usage: node scripts/build-digital-brain-context.mjs "question" [--visibility=public|internal|confidential]');
  process.exit(1);
}
if (!['public', 'internal', 'confidential'].includes(visibility)) {
  console.error(`[digital-brain] unsupported visibility: ${visibility}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'knowledge', 'brain', 'brain-manifest.json'), 'utf8').replace(/^\uFEFF/, ''));
const routing = JSON.parse(fs.readFileSync(path.join(root, 'knowledge', 'brain', 'query-routes.json'), 'utf8').replace(/^\uFEFF/, ''));
const normalized = query.toLowerCase();

const intentKeywords = {
  'product-selection': ['filter', 'sku', 'product', 'selection', 'protect'],
  'cross-reference': ['cross', 'oem', 'competitor', 'equivalent', 'replacement'],
  'equipment-application': ['equipment', 'vehicle', 'engine', 'application', 'fitment'],
  'failure-intelligence': ['failure', 'contamination', 'symptom', 'damage', 'risk'],
  'commercial-intelligence': ['customer', 'supplier', 'offer', 'inventory', 'lead time', 'margin', 'opportunity'],
  'website-implementation': ['website', 'page', 'code', 'frontend', 'implementation'],
  'knowledge-audit': ['audit', 'gap', 'conflict', 'missing', 'orphan'],
};

const scored = routing.routes
  .map((route) => ({
    route,
    score: (intentKeywords[route.id] || []).filter((word) => normalized.includes(word)).length,
  }))
  .sort((a, b) => b.score - a.score);
const selected = scored[0]?.score > 0 ? scored[0].route : routing.routes.find((route) => route.id === 'knowledge-audit');

if (!selected) {
  console.error('[digital-brain] no fallback route configured');
  process.exit(1);
}
if (visibility === 'public' && selected.output_sensitivity !== 'public_safe') {
  console.error(`[digital-brain] route '${selected.id}' cannot produce a public context pack`);
  process.exit(2);
}
if (visibility === 'internal' && selected.output_sensitivity === 'confidential') {
  console.error(`[digital-brain] route '${selected.id}' requires confidential visibility`);
  process.exit(2);
}

const sourceMap = new Map(manifest.sources.map((source) => [source.id, source]));
const requestedSourceIds = [...selected.required_sources, ...(selected.optional_sources || [])];
const omittedSources = [];
const plannedSources = [];

for (const id of requestedSourceIds) {
  const source = sourceMap.get(id);
  if (!source) {
    omittedSources.push({ id, reason: 'undeclared_source' });
    continue;
  }
  if (visibility === 'public' && !source.public_projection_allowed) {
    omittedSources.push({ id, reason: 'not_public_projection_safe' });
    continue;
  }
  if (visibility !== 'confidential' && ['confidential', 'restricted'].includes(source.sensitivity)) {
    omittedSources.push({ id, reason: 'visibility_too_low' });
    continue;
  }
  plannedSources.push(source);
}

const missingRequired = selected.required_sources.filter((id) => !plannedSources.some((source) => source.id === id));
if (missingRequired.length) {
  console.error(`[digital-brain] required source(s) unavailable for visibility '${visibility}': ${missingRequired.join(', ')}`);
  process.exit(2);
}

const pack = {
  schema_version: '1.1.0',
  generated_at: new Date().toISOString(),
  query,
  visibility,
  route: selected.id,
  minimum_evidence: selected.minimum_evidence,
  sources: plannedSources.map(({ id, kind, authority, sensitivity, location, location_env, public_projection_allowed }) => ({
    id,
    kind,
    authority,
    sensitivity,
    location,
    location_env,
    public_projection_allowed,
  })),
  omitted_sources: omittedSources,
  constraints: {
    prohibited_conclusions: selected.prohibited_conclusions || [],
    prohibited_outputs: selected.prohibited_outputs || [],
    required_disclosure: selected.required_disclosure || null,
    blocked_fields: visibility === 'public' ? manifest.public_blocked_fields : [],
  },
  provenance_required: true,
  unresolved_conflicts_must_be_reported: true,
  content: [],
};

const outputDir = path.join(root, 'knowledge', 'generated', 'digital-brain');
fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'context-pack.json');
fs.writeFileSync(outputPath, JSON.stringify(pack, null, 2) + '\n', 'utf8');
console.log(`[digital-brain] route=${selected.id} visibility=${visibility}`);
console.log(`[digital-brain] planned_sources=${plannedSources.length} omitted_sources=${omittedSources.length}`);
console.log(`[digital-brain] context plan written to ${path.relative(root, outputPath).replaceAll('\\', '/')}`);
