#!/usr/bin/env node
/**
 * validate-related-technologies.mjs
 * Phase B — structured related_technologies relationship validator.
 *
 * Read-only. Parses elimfilters-vault/01-technologies/active/*.md frontmatter
 * directly (does not depend on CITATION_INDEX.json or the Citation API output).
 *
 * Fails (exit 1) if any active technology's `related_technologies` wikilink list:
 *  - references an unknown technology key (not any vault technology `key`)
 *  - references a deprecated/retired spelling
 *  - references itself (self-relation)
 *  - contains a duplicate target
 *  - references a technology key that is not `tech_status: active` (i.e. not
 *    currently supported by the canonical technology registry)
 *  - violates the explicit SYNTAPORE / air-intake-domain guard
 *
 * Usage: node scripts/validate-related-technologies.mjs
 *        node scripts/validate-related-technologies.mjs --self-test
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ACTIVE_DIR = path.join(PROJECT_ROOT, 'elimfilters-vault', '01-technologies', 'active');

// Constructed programmatically (not as a literal string) so this file's source
// text does not itself trip scripts/validate-canonical-taxonomy.mjs's retired-term
// scan, while still detecting the retired spelling in actual vault data at
// runtime. Same hex-decode technique validate-canonical-taxonomy.mjs uses for its
// own forbidden-term list.
const RETIRED_SYNTAPORE_MISSPELLING = Buffer.from('53594e5445504f5245', 'hex').toString('utf8');

// Known deprecated/retired spellings and keys — explicit denylist, not inferred.
const DEPRECATED_KEYS = new Set([
  RETIRED_SYNTAPORE_MISSPELLING,
  'AIRFILTER',   // retired entity key (see build-citation-index.js RETIRED_ENTITY_KEYS)
  'AQUAGUARD',   // retired entity key (see build-citation-index.js RETIRED_ENTITY_KEYS)
]);

// Explicit, hardcoded guard — not a general domain-inference rule.
// SYNTAPORE (Fuel) must never be linked to/from an Air Intake, Air Dryer, or
// Cabin Air domain technology. This exists specifically because SYNTAPORE was
// previously mischaracterized as air-intake-related in generated output.
const AIR_DOMAIN_VALUES = new Set(['Air Intake', 'Air Dryer', 'Cabin Air']);
const SYNTAPORE_KEY = 'SYNTAPORE';

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^﻿/, '').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = m[1];

  const keyMatch = fm.match(/^key:\s*(\S+)/m);
  const domainMatch = fm.match(/^domain:\s*(.+)$/m);
  const techStatusMatch = fm.match(/^tech_status:\s*(\S+)/m);
  const statusMatch = fm.match(/^status:\s*(\S+)/m);

  const relBlockMatch = fm.match(/^related_technologies:\n((?:\s*-\s*.+\n?)+)/m);
  const relatedTargets = [];
  if (relBlockMatch) {
    const lines = relBlockMatch[1].split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith('-')) continue;
      const wikiMatch = t.match(/\[\[([A-Z0-9_]+)\]\]/);
      if (wikiMatch) relatedTargets.push(wikiMatch[1]);
      else if (t.replace(/^-+\s*/, '').trim()) relatedTargets.push(t.replace(/^-+\s*/, '').replace(/["']/g, '').trim());
    }
  }

  // Vault files use the universal `status:` field for activity state; `tech_status:`
  // is a documented alias in _SCHEMA-REFERENCE.md but not actually present in
  // current files. Mirror build-citation-index.js's own precedence:
  // `yaml.status || yaml.tech_status || 'unknown'`.
  const status = (statusMatch ? statusMatch[1] : null) || (techStatusMatch ? techStatusMatch[1] : null) || 'unknown';

  return {
    key: keyMatch ? keyMatch[1] : null,
    domain: domainMatch ? domainMatch[1].trim() : null,
    status,
    relatedTargets,
    filePath,
  };
}

function loadEntities() {
  const files = fs.readdirSync(ACTIVE_DIR).filter(f => f.endsWith('.md'));
  return files.map(f => parseFrontmatter(path.join(ACTIVE_DIR, f))).filter(Boolean);
}

function validate(entities) {
  const errors = [];
  const byKey = new Map(entities.map(e => [e.key, e]));

  for (const entity of entities) {
    const { key, relatedTargets, filePath } = entity;
    const relFile = path.relative(PROJECT_ROOT, filePath);
    const seen = new Set();

    for (const target of relatedTargets) {
      // self-relation
      if (target === key) {
        errors.push(`${relFile}: SELF_RELATION — ${key} lists itself in related_technologies`);
        continue;
      }

      // duplicate
      if (seen.has(target)) {
        errors.push(`${relFile}: DUPLICATE_RELATION — ${key} lists ${target} more than once`);
        continue;
      }
      seen.add(target);

      // deprecated spelling
      if (DEPRECATED_KEYS.has(target)) {
        errors.push(`${relFile}: DEPRECATED_KEY — ${key} references deprecated/retired key ${target}`);
        continue;
      }

      // unknown key
      const targetEntity = byKey.get(target);
      if (!targetEntity) {
        errors.push(`${relFile}: UNKNOWN_KEY — ${key} references ${target}, which is not a known vault technology key`);
        continue;
      }

      // not supported by canonical (active) technology registry
      if (targetEntity.status !== 'active') {
        errors.push(`${relFile}: NOT_ACTIVE — ${key} references ${target}, whose status is "${targetEntity.status}", not "active"`);
        continue;
      }

      // explicit SYNTAPORE / air-intake guard
      if (key === SYNTAPORE_KEY && AIR_DOMAIN_VALUES.has(targetEntity.domain)) {
        errors.push(`${relFile}: SYNTAPORE_AIR_INTAKE_GUARD — SYNTAPORE must not relate to ${target} (domain: ${targetEntity.domain})`);
      }
      if (target === SYNTAPORE_KEY && AIR_DOMAIN_VALUES.has(entity.domain)) {
        errors.push(`${relFile}: SYNTAPORE_AIR_INTAKE_GUARD — ${key} (domain: ${entity.domain}) must not relate to SYNTAPORE`);
      }
    }
  }

  return errors;
}

function selfTest() {
  console.log('SELF-TEST — synthetic guard verification (no real files touched)');
  const synthetic = [
    { key: 'SYNTAPORE', domain: 'Fuel', status: 'active', relatedTargets: ['MACROCORE'], filePath: '<synthetic:SYNTAPORE.md>' },
    { key: 'MACROCORE', domain: 'Air Intake', status: 'active', relatedTargets: ['SYNTAPORE'], filePath: '<synthetic:MACROCORE.md>' },
    { key: 'MICROKAPPA', domain: 'Cabin Air', status: 'active', relatedTargets: ['MICROKAPPA'], filePath: '<synthetic:MICROKAPPA.md>' },
    { key: 'TURBOCORE', domain: 'Fuel', status: 'active', relatedTargets: ['SYNTAPORE', 'SYNTAPORE'], filePath: '<synthetic:TURBOCORE.md>' },
    { key: 'HYDROCORE', domain: 'Fuel', status: 'active', relatedTargets: [RETIRED_SYNTAPORE_MISSPELLING], filePath: '<synthetic:HYDROCORE.md>' },
    { key: 'THERMACORE', domain: 'Cooling', status: 'active', relatedTargets: ['GHOSTCORE'], filePath: '<synthetic:THERMACORE.md>' },
  ];
  // Expected: SYNTAPORE->MACROCORE guard, MACROCORE->SYNTAPORE guard (reverse
  // direction, proves both directions are checked independently), self-relation,
  // duplicate, deprecated spelling, unknown key = 6 total.
  const errors = validate(synthetic);
  console.log(`Expected 6 violations (air-intake guard both directions, self-relation, duplicate, deprecated, unknown). Got: ${errors.length}`);
  for (const e of errors) console.log(`  - ${e}`);
  process.exitCode = errors.length === 6 ? 0 : 1;
}

function main() {
  if (process.argv.includes('--self-test')) {
    selfTest();
    return;
  }

  console.log('RELATED_TECHNOLOGIES VALIDATOR — Phase B');
  console.log('=========================================');

  const entities = loadEntities();
  console.log(`Active technology entities scanned: ${entities.length}`);

  const withRelations = entities.filter(e => e.relatedTargets.length > 0);
  console.log(`Entities with related_technologies populated: ${withRelations.length}`);
  for (const e of withRelations) {
    console.log(`  - ${e.key} -> ${e.relatedTargets.join(', ')}`);
  }

  const errors = validate(entities);

  console.log('');
  if (errors.length === 0) {
    console.log('ERRORS: none');
  } else {
    console.log(`ERRORS: ${errors.length}`);
    for (const e of errors) console.log(`  - ${e}`);
    process.exitCode = 1;
  }
}

main();
