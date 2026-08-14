#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');

const CORE_TECHNOLOGIES = [
  'MACROCORE',
  'MICROKAPPA',
  'DRYCORE',
  'INTEKCORE',
  'SYNTAPORE',
  'TURBOCORE',
  'SYNTRAX',
  'NANOFORCE',
  'THERMACORE',
];

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Citation index not found: ${INDEX_PATH}. Run build-citation-index.js first.`);
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
const entities = index.entities || {};
const errors = [];

for (const key of CORE_TECHNOLOGIES) {
  const entity = entities[key];
  if (!entity) {
    errors.push(`${key}: missing from citation index`);
    continue;
  }
  if (entity.type !== 'technology') errors.push(`${key}: type is ${entity.type || 'missing'}, expected technology`);
  if (String(entity.status || '').toLowerCase() === 'retired') errors.push(`${key}: canonical technology is marked retired`);
  if (!entity.canonical?.definition) errors.push(`${key}: canonical definition missing`);
  if (!entity.citation?.source_url) errors.push(`${key}: citation source missing`);
  if (!entity.citation?.version) errors.push(`${key}: citation version missing`);
}

const activeTechnologyKeys = Object.values(entities)
  .filter((entity) => entity?.type === 'technology' && String(entity?.status || '').toLowerCase() !== 'retired')
  .map((entity) => entity.key)
  .filter(Boolean);

const missingCore = CORE_TECHNOLOGIES.filter((key) => !activeTechnologyKeys.includes(key));
if (missingCore.length) errors.push(`active technology set is missing: ${missingCore.join(', ')}`);

const dangling = new Set(index.graph?.dangling_keys || []);
const danglingCore = CORE_TECHNOLOGIES.filter((key) => dangling.has(key));
if (danglingCore.length) errors.push(`canonical technology keys remain dangling: ${danglingCore.join(', ')}`);

if (errors.length) {
  console.error('Canonical citation index validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Canonical citation index verified: ${CORE_TECHNOLOGIES.length}/9 core technologies are citation-grade and non-dangling.`);
