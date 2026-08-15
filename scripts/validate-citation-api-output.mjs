#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'frontend', 'public', 'api', 'citation');
const TECHNOLOGY_INDEX = path.join(API_DIR, 'type', 'technology.json');

const CORE = [
  ['MACROCORE', 'macrocore'],
  ['MICROKAPPA', 'microkappa'],
  ['DRYCORE', 'drycore'],
  ['INTEKCORE', 'intekcore'],
  ['SYNTAPORE', 'syntapore'],
  ['TURBOCORE', 'turbocore'],
  ['SYNTRAX', 'syntrax'],
  ['NANOFORCE', 'nanoforce'],
  ['THERMACORE', 'thermacore'],
  ['HYDROCORE', 'hydrocore'],
];

const RETIRED_PUBLIC_KEYS = ['AIRFILTER', 'AQUAGUARD'];
const errors = [];

if (!fs.existsSync(TECHNOLOGY_INDEX)) {
  throw new Error(`Generated technology citation index not found: ${TECHNOLOGY_INDEX}`);
}

const technologyIndex = JSON.parse(fs.readFileSync(TECHNOLOGY_INDEX, 'utf8'));
const technologies = Array.isArray(technologyIndex.entities) ? technologyIndex.entities : [];
const byKey = new Map(technologies.map((entity) => [entity.key, entity]));

for (const [key, slug] of CORE) {
  const entity = byKey.get(key);
  if (!entity) {
    errors.push(`${key}: missing from generated type/technology.json`);
    continue;
  }

  if (String(entity.status || '').toLowerCase() === 'retired') {
    errors.push(`${key}: generated entity is marked retired`);
  }

  const expectedSource = `https://elimfilters.com/knowledge-center/technologies/${slug}/`;
  if (entity.citation?.source_url !== expectedSource) {
    errors.push(`${key}: generated citation source must be ${expectedSource}`);
  }

  const entityFile = path.join(API_DIR, `${key}.json`);
  if (!fs.existsSync(entityFile)) {
    errors.push(`${key}: generated entity endpoint is missing`);
  }
}

for (const retiredKey of RETIRED_PUBLIC_KEYS) {
  if (byKey.has(retiredKey)) {
    errors.push(`${retiredKey}: retired key remains in generated technology index`);
  }
  if (fs.existsSync(path.join(API_DIR, `${retiredKey}.json`))) {
    errors.push(`${retiredKey}: retired public citation endpoint still exists`);
  }
}

const declaredCount = Number(technologyIndex.count);
if (declaredCount !== technologies.length) {
  errors.push(`technology count mismatch: declared ${declaredCount}, actual ${technologies.length}`);
}

if (errors.length) {
  console.error('Generated Citation API validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Generated Citation API verified: all ${CORE.length} canonical core technologies are present, canonically sourced, and retired endpoints are absent.`);
