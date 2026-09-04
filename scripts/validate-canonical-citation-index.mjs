#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');

const CORE_TECHNOLOGIES = [
  ['MACROCORE', 'macrocore'],
  ['MICROKAPPA', 'microkappa'],
  ['DRYCORE', 'drycore'],
  ['INTEKCORE', 'intekcore'],
  ['SYNTAPORE', 'syntapore'],
  ['HYDROCORE', 'hydrocore'],
  ['TURBOCORE', 'turbocore'],
  ['SYNTRAX', 'syntrax'],
  ['NANOFORCE', 'nanoforce'],
  ['THERMACORE', 'thermacore'],
];

if (!fs.existsSync(INDEX_PATH)) {
  throw new Error(`Citation index not found: ${INDEX_PATH}. Run build-citation-index.js first.`);
}

const index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf8'));
const entities = index.entities || {};
const errors = [];

for (const [key, slug] of CORE_TECHNOLOGIES) {
  const entity = entities[key];
  if (!entity) {
    errors.push(`${key}: missing from citation index`);
    continue;
  }

  if (entity.type !== 'technology') {
    errors.push(`${key}: type is ${entity.type || 'missing'}, expected technology`);
  }
  if (String(entity.status || '').toLowerCase() === 'retired') {
    errors.push(`${key}: canonical technology is marked retired`);
  }
  if (!entity.canonical?.definition) {
    errors.push(`${key}: canonical definition missing`);
  }
  if (!entity.citation?.version) {
    errors.push(`${key}: citation version missing`);
  }

  const expectedSource = `https://elimfilters.com/knowledge-center/technologies/${slug}/`;
  if (entity.citation?.source_url !== expectedSource) {
    errors.push(`${key}: citation source must be ${expectedSource}`);
  }
}

const activeTechnologyKeys = Object.values(entities)
  .filter((entity) => entity?.type === 'technology' && String(entity?.status || '').toLowerCase() !== 'retired')
  .map((entity) => entity.key)
  .filter(Boolean);

const coreKeys = CORE_TECHNOLOGIES.map(([key]) => key);
const missingCore = coreKeys.filter((key) => !activeTechnologyKeys.includes(key));
if (missingCore.length) {
  errors.push(`active technology set is missing: ${missingCore.join(', ')}`);
}

const dangling = new Set(index.graph?.dangling_keys || []);
const danglingCore = coreKeys.filter((key) => dangling.has(key));
if (danglingCore.length) {
  errors.push(`canonical technology keys remain dangling: ${danglingCore.join(', ')}`);
}

if (errors.length) {
  console.error('Canonical citation index validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Canonical citation index verified: ${CORE_TECHNOLOGIES.length}/${CORE_TECHNOLOGIES.length} core technologies are citation-grade, canonically sourced, and non-dangling.`);
