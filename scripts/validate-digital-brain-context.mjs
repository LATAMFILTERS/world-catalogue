#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const contextPath = path.join(root, 'knowledge', 'generated', 'digital-brain', 'context-pack.json');
const manifestPath = path.join(root, 'knowledge', 'brain', 'brain-manifest.json');
const errors = [];

if (!fs.existsSync(contextPath)) {
  console.error('[digital-brain-context] context-pack.json is missing');
  process.exit(1);
}

const context = JSON.parse(fs.readFileSync(contextPath, 'utf8').replace(/^\uFEFF/, ''));
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^\uFEFF/, ''));

for (const key of ['schema_version', 'generated_at', 'query', 'visibility', 'route', 'minimum_evidence', 'sources', 'constraints']) {
  if (!(key in context) || context[key] === '') errors.push(`context missing '${key}'`);
}

if (typeof context.query === 'string' && /--visibility=|--[a-z-]+/.test(context.query)) {
  errors.push('query contains command-line flags');
}

const sourceMap = new Map((manifest.sources || []).map((source) => [source.id, source]));
for (const source of context.sources || []) {
  const declared = sourceMap.get(source.id);
  if (!declared) errors.push(`context includes undeclared source '${source.id}'`);
  if (context.visibility === 'public' && !declared?.public_projection_allowed) {
    errors.push(`public context includes non-public source '${source.id}'`);
  }
  if (context.visibility !== 'confidential' && ['confidential', 'restricted'].includes(source.sensitivity)) {
    errors.push(`context visibility '${context.visibility}' includes '${source.sensitivity}' source '${source.id}'`);
  }
}

if (context.visibility === 'public') {
  const blocked = new Set(context.constraints?.blocked_fields || []);
  for (const field of manifest.public_blocked_fields || []) {
    if (!blocked.has(field)) errors.push(`public context does not block '${field}'`);
  }
}

if (!context.provenance_required) errors.push('context must require provenance');
if (!context.unresolved_conflicts_must_be_reported) errors.push('context must require unresolved conflict reporting');

if (errors.length) {
  console.error(`[digital-brain-context] validation failed with ${errors.length} error(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`[digital-brain-context] validation passed: route=${context.route} visibility=${context.visibility} sources=${context.sources.length}`);
