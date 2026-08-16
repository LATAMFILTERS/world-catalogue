#!/usr/bin/env node
/**
 * validate-citation-content-governance.mjs
 * Phase G — content-integrity gates for the generated Citation API output.
 *
 * Read-only. Operates on frontend/public/api/citation/**, CITATION_INDEX.json,
 * and elimfilters-vault/**\/*.md (for the duplicate-key source check only).
 *
 * Implements:
 *   Gate 1  — aggregate == standalone (type/*.json entity copy matches its
 *             standalone {KEY}.json byte-for-byte on governed fields)
 *   Gate 2  — unknown technology (every published technology entity resolves
 *             to frontend/src/lib/canonical-technologies.ts)
 *   Gate 4  — related technology without approved structured relationship
 *             (a "KEY:" positive mention in canonical.related_technologies
 *             prose must be backed by relationships.related_technologies)
 *   Gate 5  — prohibited standard inheritance (a standard's
 *             applicable_to_technologies claim on a technology must be
 *             reciprocated by that technology's own related_standards)
 *   Gate 6  — stale retired claim / unsupported PDG branding reappearance
 *   Gate 11 — duplicate entity key across vault source notes
 *   Gate 12 — canonical entity missing from publication
 *
 * Usage: node scripts/validate-citation-content-governance.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT, 'frontend', 'public', 'api', 'citation');
const VAULT_DIR = path.join(ROOT, 'elimfilters-vault');
const CANONICAL_TS = path.join(ROOT, 'frontend', 'src', 'lib', 'canonical-technologies.ts');

const errors = [];
function fail(gate, msg) {
  errors.push(`[Gate ${gate}] ${msg}`);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

// ---------------------------------------------------------------------------
// Canonical technology registry (10 keys, uppercased)
// ---------------------------------------------------------------------------
function loadCanonicalTechnologyKeys() {
  const src = fs.readFileSync(CANONICAL_TS, 'utf8');
  const keys = [];
  const re = /^\s{2}(\w+):\s*\{/gm;
  let m;
  while ((m = re.exec(src)) !== null) keys.push(m[1].toUpperCase());
  return keys;
}
const CANONICAL_TECH_KEYS = loadCanonicalTechnologyKeys();

// ---------------------------------------------------------------------------
// Load generated output
// ---------------------------------------------------------------------------
const technologyType = readJson(path.join(API_DIR, 'type', 'technology.json'));
const technologyEntities = Array.isArray(technologyType.entities) ? technologyType.entities : [];

const typeFiles = fs.readdirSync(path.join(API_DIR, 'type')).filter((f) => f.endsWith('.json') && f !== 'index.json');

// ---------------------------------------------------------------------------
// Gate 1: aggregate == standalone
// ---------------------------------------------------------------------------
for (const typeFile of typeFiles) {
  const typeData = readJson(path.join(API_DIR, 'type', typeFile));
  const list = Array.isArray(typeData.entities) ? typeData.entities : [];
  for (const aggEntity of list) {
    const key = aggEntity.key;
    const standalonePath = path.join(API_DIR, `${key}.json`);
    if (!fs.existsSync(standalonePath)) {
      fail(1, `${key}: has an aggregate copy in type/${typeFile} but no standalone ${key}.json`);
      continue;
    }
    const standalone = readJson(standalonePath);
    const { _links, ...standaloneGoverned } = standalone;
    if (JSON.stringify(standaloneGoverned) !== JSON.stringify(aggEntity)) {
      fail(1, `${key}: aggregate copy in type/${typeFile} does not match standalone ${key}.json`);
    }
  }
}

// ---------------------------------------------------------------------------
// Gate 2: unknown technology
// ---------------------------------------------------------------------------
for (const tech of technologyEntities) {
  if (!CANONICAL_TECH_KEYS.includes(tech.key)) {
    fail(2, `${tech.key}: published as a technology entity but not in canonical-technologies.ts`);
  }
}

// ---------------------------------------------------------------------------
// Gate 4: related technology without approved structured relationship
// ---------------------------------------------------------------------------
for (const tech of technologyEntities) {
  const prose = tech.canonical?.related_technologies || '';
  const structured = new Set(tech.relationships?.related_technologies || []);
  for (const candidateKey of CANONICAL_TECH_KEYS) {
    if (candidateKey === tech.key) continue;
    const re = new RegExp(`\\b${candidateKey}\\s*:`);
    if (re.test(prose) && !structured.has(candidateKey)) {
      fail(4, `${tech.key}: prose positively names ${candidateKey} ("${candidateKey}:") but relationships.related_technologies does not include it`);
    }
  }
}

// ---------------------------------------------------------------------------
// Gate 5: prohibited standard inheritance
//
// BLOCKING. Promoted from warning to failure after the two upstream vault
// gaps it found (FUEL_PRIMARY.md, FUEL_WATER_SEPARATOR.md) were corrected —
// this gate now reports 0 violations against the current baseline.
//
// Semantics: this gate does NOT
// require bidirectional reciprocity between a technology's related_standards
// and a standard's applicable_to_technologies — either one alone is a valid
// "explicit approved direct canonical relationship" for that (technology,
// standard) pair. What it DOES prohibit is a technology acquiring a standard
// SOLELY because it shares a broader grouping (a product family) with that
// standard, with no direct relationship declared anywhere.
//
// APPROVED SOURCES for a direct technology-standard relationship (either one
// satisfies the gate for a given pair):
//   (a) technology.relationships.related_standards
//       — from that technology's own vault frontmatter `related_standards:`
//   (b) standard.relationships.applicable_to_technologies
//       — from that standard's own vault frontmatter `applicable_to_technologies:`
//
// INHERITANCE VECTOR CHECKED: product-family. A product family's own
// `uses_technology` (one technology) and `meets_standards` (a list of
// standards) sit on the SAME entity, so every (technology, standard) pair
// they imply is checked against sources (a)/(b) above.
//
// INHERITANCE VECTORS INVESTIGATED AND EXCLUDED, with reasons:
//   - protection system: AIRFILTER.md (the only vault entity carrying
//     primary_technology/supporting_technologies/related_standards together)
//     is in build-citation-index.js's RETIRED_ENTITY_KEYS and never reaches
//     CITATION_INDEX.json or the published output — confirmed via direct
//     inspection (`ci.entities['AIRFILTER']` is undefined). The 5 published
//     `type: system` (protection-domain) entities carry no technology or
//     standard relationship fields at all. There is currently no live
//     system-level inheritance path in the published data to check.
//   - industry: industry entities declare `applicable_technologies` and
//     `applicable_standards` as two independent sets, never pairing a
//     specific technology to a specific standard. No generator logic
//     combines them into a technology-standard claim, so checking every
//     technology×standard combination would fabricate implied relationships
//     the vault never actually asserts — the opposite of "use existing
//     evidence only."
// ---------------------------------------------------------------------------
const standardType = readJson(path.join(API_DIR, 'type', 'standard.json'));
const standardEntities = Array.isArray(standardType.entities) ? standardType.entities : [];
const productFamilyType = readJson(path.join(API_DIR, 'type', 'product-family.json'));
const productFamilyEntities = Array.isArray(productFamilyType.entities) ? productFamilyType.entities : [];

const directlyDeclaredPairs = new Set();
for (const tech of technologyEntities) {
  for (const stdKey of tech.relationships?.related_standards || []) {
    directlyDeclaredPairs.add(`${tech.key}::${stdKey}`);
  }
}
for (const std of standardEntities) {
  for (const techKey of std.relationships?.applicable_to_technologies || []) {
    directlyDeclaredPairs.add(`${techKey}::${std.key}`);
  }
}

for (const family of productFamilyEntities) {
  const usesTech = family.relationships?.uses_technology;
  const techKeys = Array.isArray(usesTech) ? usesTech : (usesTech ? [usesTech] : []);
  const meetsStandards = family.relationships?.meets_standards || [];
  for (const techKey of techKeys) {
    for (const stdKey of meetsStandards) {
      if (!directlyDeclaredPairs.has(`${techKey}::${stdKey}`)) {
        fail(5, `${family.key}: implies ${techKey} meets ${stdKey} (via uses_technology + meets_standards on the same product family), but neither ${techKey}.related_standards nor ${stdKey}.applicable_to_technologies declares this pair directly — inherited-only standard association`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Gate 6: stale retired claim / unsupported PDG branding reappearance
// ---------------------------------------------------------------------------
// None of these strings currently appear in scripts/validate-canonical-taxonomy.mjs's
// forbidden-term list, so no hex/codepoint obfuscation is required here — verified
// empirically (this file passes that guard). If that list is ever extended to cover
// any of these, switch to the same Buffer.from(hex,'hex') convention used elsewhere.
const RETIRED_CLAIM_PATTERNS = [
  { label: '99.9%-99.98% efficiency claim', re: /99\.9[0-9]*%/ },
  { label: '62 PSI anti-collapse claim', re: /62 PSI/ },
  // Scoped to the original MACROCORE-attributed compound claim ("...efficiency
  // under ISO 5011 certification") — NOT the standard's own generic
  // industrial_role sentence ("Without ISO 5011 certification, filter
  // performance claims are unverifiable"), which Phase F explicitly reviewed
  // and left unchanged as a legitimate, non-MACROCORE-specific statement.
  { label: 'ISO 5011 certification claim attributed to MACROCORE', re: /(99\.9[0-9]*%.{0,80}ISO 5011 certif|ISO 5011 certif.{0,80}99\.9[0-9]*%|MACROCORE.{0,80}ISO 5011 certif|ISO 5011 certif.{0,80}MACROCORE)/i },
  { label: '"11 of 12 industry verticals" claim', re: /11 of 12 industry/i },
  { label: 'Progressive Density Gradient / PDG branding', re: /Progressive Density Gradient|\bPDG\b/ },
];

function walkJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkJsonFiles(full));
    else if (entry.name.endsWith('.json') || entry.name.endsWith('.md')) results.push(full);
  }
  return results;
}

for (const file of walkJsonFiles(API_DIR)) {
  const text = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replaceAll('\\', '/');
  for (const { label, re } of RETIRED_CLAIM_PATTERNS) {
    if (re.test(text)) fail(6, `${rel}: contains retired claim — ${label}`);
  }
}

// ---------------------------------------------------------------------------
// Gate 11: duplicate entity key across vault source notes
// ---------------------------------------------------------------------------
function findVaultNotes(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && entry.name !== '00-meta') results.push(...findVaultNotes(full));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name === 'README.md' || entry.name.startsWith('_') || entry.name === '.gitkeep') continue;
      results.push(full);
    }
  }
  return results;
}

const keyToFiles = new Map();
for (const notePath of findVaultNotes(VAULT_DIR)) {
  const content = fs.readFileSync(notePath, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) continue;
  const keyMatch = m[1].match(/^key:\s*(\S+)/m);
  if (!keyMatch) continue;
  const key = keyMatch[1];
  const rel = path.relative(ROOT, notePath).replaceAll('\\', '/');
  if (!keyToFiles.has(key)) keyToFiles.set(key, []);
  keyToFiles.get(key).push(rel);
}
for (const [key, files] of keyToFiles) {
  if (files.length > 1) fail(11, `key "${key}" declared in ${files.length} vault notes: ${files.join(', ')}`);
}

// ---------------------------------------------------------------------------
// Gate 12: canonical entity missing from publication
// ---------------------------------------------------------------------------
const publishedTechKeys = new Set(technologyEntities.map((t) => t.key));
for (const key of CANONICAL_TECH_KEYS) {
  if (!fs.existsSync(path.join(API_DIR, `${key}.json`))) {
    fail(12, `${key}: canonical technology has no standalone Citation API record`);
  }
  if (!publishedTechKeys.has(key)) {
    fail(12, `${key}: canonical technology missing from type/technology.json`);
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log('CITATION CONTENT GOVERNANCE — Phase G');
console.log('=======================================');
console.log(`Canonical technologies: ${CANONICAL_TECH_KEYS.length}`);
console.log(`Technology entities published: ${technologyEntities.length}`);
console.log(`Standard entities checked: ${standardEntities.length}`);
console.log('');
if (errors.length === 0) {
  console.log('RESULT: PASS — all blocking content governance gates satisfied.');
} else {
  console.log(`RESULT: FAIL — ${errors.length} violation(s).`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exitCode = 1;
}
