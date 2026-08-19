#!/usr/bin/env node
/**
 * validate-path-domain-consistency.mjs
 *
 * Semantic gate for the Citation path graph. Structural validators
 * (validate-part-search-integrity.mjs, and the V001-V004 checks inside
 * build-part-search-map.js) confirm a path's entities exist and its shape is
 * well-formed; they do not confirm the path is semantically true. This
 * validator checks two independent semantic claims for every generated
 * Type A/B/C path:
 *
 *   1. DOMAIN CONSISTENCY — the entry Problem (Type A/B) or Technology
 *      (Type C) and every terminal ProductFamily belong to a compatible
 *      canonical system/sub-scope. A path where they don't is a
 *      cross-domain fan-out (e.g. an air-intake problem resolving to a
 *      lubrication product family).
 *
 *   2. INDUSTRY SCOPE (Type B only) — the entry Industry is present in the
 *      terminal ProductFamily's own governed `target_industries` field, or
 *      that ProductFamily declares no target_industries (unrestricted).
 *      build-part-search-map.js already enforces this at generation time;
 *      this validator re-checks it independently as a regression guard, so
 *      a future edit to the generator cannot silently reintroduce the class
 *      of defect this validator exists to catch.
 *
 * Domain values in vault source use several inconsistent vocabularies
 * (Problem.domain: lowercase-hyphenated scalar; Technology.domain:
 * Title-Case scalar; ProductFamily.belongs_to_domain: a wikilink to a
 * `system`- or `protection-domain`-typed entity, inconsistently typed
 * between those two type labels for the same conceptual role). Rather than
 * rewrite any of that content, this validator normalizes all of them
 * read-time through DOMAIN_TAXONOMY below into a shared
 * { system, subscope } pair, and compares on that.
 *
 * This validator does not hardcode individual path IDs and does not assert
 * a required total path count — it evaluates every path against the rules
 * above and reports whatever it finds.
 *
 * Usage: node scripts/validate-path-domain-consistency.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CITATION_INDEX_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'CITATION_INDEX.json');
const PART_SEARCH_MAP_PATH = path.join(ROOT, 'elimfilters-vault', '00-meta', 'PART_SEARCH_MAP.json');

// ---------------------------------------------------------------------------
// Canonical domain taxonomy — normalization layer only. Does not modify any
// vault content. Top-level systems match brand doctrine's five canonical
// systems (see CLAUDE.md); cabin-air/HVAC is modeled as a sub-scope of
// AIR_INTAKE, not a sixth peer system, per approved governance decision 4.
// ---------------------------------------------------------------------------
const DOMAIN_TAXONOMY = {
  // Problem.domain / ContaminationMode.tags style values (lowercase-hyphenated)
  'air-intake': { system: 'AIR_INTAKE', subscope: 'engine-air' },
  cabin: { system: 'AIR_INTAKE', subscope: 'cabin-air' },
  'lube-oil': { system: 'LUBRICATION', subscope: null },
  fuel: { system: 'FUEL_CLEANLINESS', subscope: null },
  hydraulic: { system: 'HYDRAULIC', subscope: null },
  cooling: { system: 'COOLING', subscope: null },

  // Technology.domain style values (Title Case)
  'Air Intake': { system: 'AIR_INTAKE', subscope: 'engine-air' },
  'Cabin Air': { system: 'AIR_INTAKE', subscope: 'cabin-air' },
  'Air Dryer': { system: 'AIR_INTAKE', subscope: 'pneumatic' },
  Fuel: { system: 'FUEL_CLEANLINESS', subscope: null },
  Lubrication: { system: 'LUBRICATION', subscope: null },
  'Lube Oil': { system: 'LUBRICATION', subscope: null },
  Hydraulic: { system: 'HYDRAULIC', subscope: null },
  Cooling: { system: 'COOLING', subscope: null },

  // ProductFamily.belongs_to_domain wikilink targets (ALL-CAPS entity keys;
  // deliberately keyed on the entity key regardless of whether that entity's
  // own `type` field is `system` or `protection-domain` — normalizing here
  // avoids having to make that typing consistent across the vault).
  AIR_INTAKE_PROTECTION: { system: 'AIR_INTAKE', subscope: 'engine-air' },
  CABIN: { system: 'AIR_INTAKE', subscope: 'cabin-air' },
  COOLING_SYSTEM_PROTECTION: { system: 'COOLING', subscope: null },
  FUEL: { system: 'FUEL_CLEANLINESS', subscope: null },
  HYDRAULIC: { system: 'HYDRAULIC', subscope: null },
  OIL: { system: 'LUBRICATION', subscope: null },
};

function normalizeDomain(raw) {
  if (!raw) return null;
  return DOMAIN_TAXONOMY[raw] || null;
}

function domainsCompatible(a, b) {
  if (!a || !b) return true; // insufficient data to judge — do not false-positive on missing taxonomy entries
  if (a.system !== b.system) return false;
  if (a.subscope && b.subscope && a.subscope !== b.subscope) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Load data
// ---------------------------------------------------------------------------
const citationIndex = JSON.parse(fs.readFileSync(CITATION_INDEX_PATH, 'utf8'));
const partSearchMap = JSON.parse(fs.readFileSync(PART_SEARCH_MAP_PATH, 'utf8'));
const entities = citationIndex.entities;
const paths = partSearchMap.traversal_paths || [];

function entityDomain(key, _seen = new Set()) {
  const e = entities[key];
  if (!e || _seen.has(key)) return null;
  _seen.add(key);
  if (e.type === 'product-family') {
    // A ProductFamily's precise sub-scope comes from the technology it
    // uses (a direct, already-verified 1:1 edge — see Type C verification),
    // not from belongs_to_domain, which groups multiple sub-scopes (e.g.
    // engine-air and pneumatic/compressed-air both point at the same
    // AIR_INTAKE_PROTECTION system entity) under one coarse target.
    const usesTech = (e.relationships && e.relationships.uses_technology) || [];
    if (usesTech.length > 0) {
      const delegated = entityDomain(usesTech[0], _seen);
      if (delegated) return delegated;
    }
    // Fallback: belongs_to_domain, system-level only (subscope dropped —
    // unreliable at this granularity without a uses_technology edge).
    const belongsTo = (e.relationships && e.relationships.belongs_to_domain) || [];
    if (belongsTo.length > 0) {
      const d = normalizeDomain(belongsTo[0]);
      return d ? { system: d.system, subscope: null } : null;
    }
    return null;
  }
  return normalizeDomain(e.domain);
}

function targetIndustriesFor(key) {
  const e = entities[key];
  if (!e) return [];
  return (e.relationships && e.relationships.target_industries) || [];
}

function sourceOf(key) {
  const e = entities[key];
  return e ? e.vault_path : 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Evaluate every path
// ---------------------------------------------------------------------------
const errors = [];
const warnings = [];
let checkedDomain = 0;
let checkedScope = 0;

for (const p of paths) {
  if (!p.valid) continue; // structurally invalid paths are already reported by other gates

  if (p.path_type === 'A' || p.path_type === 'B') {
    const problemKey = p.path_type === 'A' ? p.entry_node : (p.steps[1] ? p.steps[1].key : null);
    const problemDomain = entityDomain(problemKey);
    checkedDomain++;

    for (const pfKey of p.terminal_product_families) {
      const pfDomain = entityDomain(pfKey);
      if (!domainsCompatible(problemDomain, pfDomain)) {
        errors.push({
          code: 'DOMAIN_MISMATCH',
          path_id: p.path_id,
          path_type: p.path_type,
          message: `${problemKey} (domain: ${problemDomain ? problemDomain.system + (problemDomain.subscope ? '/' + problemDomain.subscope : '') : 'unknown'}) resolves to ${pfKey} (domain: ${pfDomain ? pfDomain.system + (pfDomain.subscope ? '/' + pfDomain.subscope : '') : 'unknown'})`,
          source_file: sourceOf(problemKey),
          source_field: 'root_contamination',
          generated_path: p.path_id,
        });
      }
    }

    if (p.path_type === 'B') {
      const indKey = p.industry;
      checkedScope++;
      for (const pfKey of p.terminal_product_families) {
        const allowed = targetIndustriesFor(pfKey);
        if (allowed.length > 0 && !allowed.includes(indKey)) {
          errors.push({
            code: 'INDUSTRY_SCOPE_VIOLATION',
            path_id: p.path_id,
            path_type: p.path_type,
            message: `Industry ${indKey} is not in ${pfKey}'s target_industries scope (${allowed.join(', ')})`,
            source_file: sourceOf(pfKey),
            source_field: 'target_industries',
            generated_path: p.path_id,
          });
        }
      }
    }
  }

  if (p.path_type === 'C') {
    const techKey = p.entry_node;
    const techDomain = entityDomain(techKey);
    for (const pfKey of p.terminal_product_families) {
      const pfDomain = entityDomain(pfKey);
      if (!domainsCompatible(techDomain, pfDomain)) {
        errors.push({
          code: 'DOMAIN_MISMATCH',
          path_id: p.path_id,
          path_type: p.path_type,
          message: `${techKey} (domain: ${techDomain ? techDomain.system : 'unknown'}) is used by ${pfKey} (domain: ${pfDomain ? pfDomain.system : 'unknown'})`,
          source_file: sourceOf(techKey),
          source_field: 'uses_technology',
          generated_path: p.path_id,
        });
      }
    }
  }
}

// Entities with a raw domain value this taxonomy doesn't recognize — not a
// failure, but surfaced so the taxonomy can be extended deliberately rather
// than silently under-checking new content.
const unmappedDomainValues = new Set();
for (const e of Object.values(entities)) {
  if (e.domain && !DOMAIN_TAXONOMY[e.domain]) unmappedDomainValues.add(e.domain);
  if (e.type === 'product-family') {
    const belongsTo = (e.relationships && e.relationships.belongs_to_domain) || [];
    for (const b of belongsTo) {
      if (!DOMAIN_TAXONOMY[b]) unmappedDomainValues.add(b);
    }
  }
}
if (unmappedDomainValues.size > 0) {
  for (const v of unmappedDomainValues) {
    warnings.push({ code: 'UNMAPPED_DOMAIN_VALUE', message: `Domain value '${v}' has no DOMAIN_TAXONOMY entry — paths touching it are not domain-checked` });
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
console.log('SEMANTIC PATH DOMAIN CONSISTENCY VALIDATOR');
console.log('===========================================');
console.log(`Paths checked for domain consistency: ${checkedDomain + paths.filter(p => p.valid && p.path_type === 'C').length}`);
console.log(`Type B paths checked for industry scope: ${checkedScope}`);
console.log(`Errors:   ${errors.length}`);
console.log(`Warnings: ${warnings.length}`);
console.log('');

if (errors.length > 0) {
  console.log('ERRORS');
  for (const err of errors) {
    console.log(`- [${err.code}] ${err.path_id} (${err.path_type}): ${err.message}`);
    console.log(`    source: ${err.source_file} (field: ${err.source_field})`);
  }
  console.log('');
}

if (warnings.length > 0) {
  console.log('WARNINGS');
  for (const w of warnings) console.log(`- [${w.code}] ${w.message}`);
  console.log('');
}

if (errors.length > 0) {
  console.log('RESULT: FAIL');
  process.exitCode = 1;
} else {
  console.log('RESULT: PASS');
}
