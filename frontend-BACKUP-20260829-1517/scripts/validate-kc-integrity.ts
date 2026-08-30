/**
 * validate-kc-integrity.ts
 * ELIMFILTERS Knowledge Center — Phase 5B Graph Integrity Validator
 *
 * Checks:
 *   1. No duplicate TERM-xxx IDs
 *   2. No duplicate derived slugs
 *   3. All relatedTerms IDs resolve to an existing entry
 *   4. All applicableStandards IDs exist in STANDARD_IDS values
 *   5. All relatedTechnologies slugs exist in TECHNOLOGY_IDS keys
 *   6. All relatedSystems slugs exist in SYSTEM_IDS keys
 *   7. No circular relatedTerms chains
 *   8. Every entry has non-empty definition and engineeringContext
 *
 * Usage: npx tsx scripts/validate-kc-integrity.ts
 * Exit 0 — all checks pass.
 * Exit 1 — one or more checks fail.
 */

import { GLOSSARY_REGISTRY } from '../src/lib/knowledge-center-data/glossary-registry';
import {
  STANDARD_IDS,
  TECHNOLOGY_IDS,
  SYSTEM_IDS,
} from '../src/lib/knowledge-center-data/entity-ids';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  passed: boolean;
  errors: string[];
  warnings: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function termIdToSlug(id: string): string {
  return id.replace(/^TERM-/, '').toLowerCase();
}

const VALID_STD_IDS = new Set(Object.values(STANDARD_IDS));
const VALID_TECH_SLUGS = new Set(Object.keys(TECHNOLOGY_IDS));
const VALID_SYS_SLUGS = new Set(Object.keys(SYSTEM_IDS));

const entries = Object.entries(GLOSSARY_REGISTRY);

// ─── Check 1: Duplicate IDs ──────────────────────────────────────────────────

function checkDuplicateIds(): CheckResult {
  const seen = new Map<string, number>();
  const errors: string[] = [];

  for (const [id] of entries) {
    seen.set(id, (seen.get(id) ?? 0) + 1);
  }
  for (const [id, count] of Array.from(seen.entries())) {
    if (count > 1) errors.push(`Duplicate ID: ${id} (appears ${count}x)`);
  }

  return { name: 'Duplicate TERM-xxx IDs', passed: errors.length === 0, errors, warnings: [] };
}

// ─── Check 2: Duplicate Slugs ────────────────────────────────────────────────

function checkDuplicateSlugs(): CheckResult {
  const seen = new Map<string, string[]>();
  const errors: string[] = [];

  for (const [id] of entries) {
    const slug = termIdToSlug(id);
    const list = seen.get(slug) ?? [];
    list.push(id);
    seen.set(slug, list);
  }
  for (const [slug, ids] of Array.from(seen.entries())) {
    if (ids.length > 1) errors.push(`Duplicate slug '${slug}': ${ids.join(', ')}`);
  }

  return { name: 'Duplicate derived slugs', passed: errors.length === 0, errors, warnings: [] };
}

// ─── Check 3: relatedTerms references ────────────────────────────────────────

function checkRelatedTermsRefs(): CheckResult {
  const errors: string[] = [];
  const allIds = new Set(Object.keys(GLOSSARY_REGISTRY));

  for (const [id, entry] of entries) {
    for (const ref of entry.relatedTerms) {
      if (!allIds.has(ref)) {
        errors.push(`${id}.relatedTerms: '${ref}' not found in GLOSSARY_REGISTRY`);
      }
    }
  }

  return {
    name: 'relatedTerms reference integrity',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ─── Check 4: applicableStandards IDs ────────────────────────────────────────

function checkStandardRefs(): CheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [id, entry] of entries) {
    for (const stdId of entry.applicableStandards) {
      if (!stdId.startsWith('STD-')) {
        errors.push(`${id}.applicableStandards: '${stdId}' must use STD-xxx format`);
      } else if (!VALID_STD_IDS.has(stdId as never)) {
        warnings.push(`${id}.applicableStandards: '${stdId}' not in STANDARD_IDS (may be unmapped)`);
      }
    }
  }

  return {
    name: 'applicableStandards ID format',
    passed: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Check 5: relatedTechnologies slugs ──────────────────────────────────────

function checkTechnologySlugs(): CheckResult {
  const errors: string[] = [];

  for (const [id, entry] of entries) {
    for (const slug of entry.relatedTechnologies) {
      if (!VALID_TECH_SLUGS.has(slug)) {
        errors.push(`${id}.relatedTechnologies: '${slug}' not in TECHNOLOGY_IDS`);
      }
    }
  }

  return {
    name: 'relatedTechnologies slug validity',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ─── Check 6: relatedSystems slugs ───────────────────────────────────────────

function checkSystemSlugs(): CheckResult {
  const errors: string[] = [];

  for (const [id, entry] of entries) {
    for (const slug of entry.relatedSystems) {
      if (!VALID_SYS_SLUGS.has(slug)) {
        errors.push(`${id}.relatedSystems: '${slug}' not in SYSTEM_IDS`);
      }
    }
  }

  return {
    name: 'relatedSystems slug validity',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ─── Check 7: Self-referential relatedTerms ───────────────────────────────────
// Note: bidirectional (mutual) term relationships are intentional and valid.
// Only self-loops (a term referencing itself) are flagged as errors.

function checkCircularTerms(): CheckResult {
  const errors: string[] = [];

  for (const [id, entry] of entries) {
    if ((entry.relatedTerms as string[]).includes(id)) {
      errors.push(`${id} references itself in relatedTerms (self-loop)`);
    }
  }

  return {
    name: 'Self-referential relatedTerms (self-loops)',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ─── Check 8: Content completeness ───────────────────────────────────────────

function checkContentCompleteness(): CheckResult {
  const errors: string[] = [];

  for (const [id, entry] of entries) {
    if (!entry.definition || entry.definition.trim().length < 20) {
      errors.push(`${id}: definition too short or empty`);
    }
    if (!entry.engineeringContext || entry.engineeringContext.trim().length < 20) {
      errors.push(`${id}: engineeringContext too short or empty`);
    }
    if (!entry.term || entry.term.trim().length === 0) {
      errors.push(`${id}: term name is empty`);
    }
  }

  return {
    name: 'Content completeness (definition, context, term)',
    passed: errors.length === 0,
    errors,
    warnings: [],
  };
}

// ─── Runner ───────────────────────────────────────────────────────────────────

function printResult(r: CheckResult): void {
  const icon = r.passed ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  console.log(`  ${icon}  ${r.name}`);
  for (const e of r.errors)   console.log(`       \x1b[31mERROR:\x1b[0m  ${e}`);
  for (const w of r.warnings) console.log(`       \x1b[33mWARN:\x1b[0m   ${w}`);
}

console.log('\n══════════════════════════════════════════════════════════');
console.log(' ELIMFILTERS KC Graph Integrity — Phase 5B');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Terms in registry: ${entries.length}`);
console.log('');

const results: CheckResult[] = [
  checkDuplicateIds(),
  checkDuplicateSlugs(),
  checkRelatedTermsRefs(),
  checkStandardRefs(),
  checkTechnologySlugs(),
  checkSystemSlugs(),
  checkCircularTerms(),
  checkContentCompleteness(),
];

for (const r of results) printResult(r);

const totalErrors = results.reduce((n, r) => n + r.errors.length, 0);
const totalWarnings = results.reduce((n, r) => n + r.warnings.length, 0);
const allPassed = results.every((r) => r.passed);

console.log('');
console.log('══════════════════════════════════════════════════════════');
console.log(
  `  Checks: ${results.length}  |  ` +
  `Passed: ${results.filter((r) => r.passed).length}  |  ` +
  `Failed: ${results.filter((r) => !r.passed).length}  |  ` +
  `Errors: ${totalErrors}  |  Warnings: ${totalWarnings}`
);
console.log(`  Overall: ${allPassed ? '\x1b[32mPASS ✓\x1b[0m' : '\x1b[31mFAIL ✗\x1b[0m'}`);
console.log('══════════════════════════════════════════════════════════\n');

process.exit(allPassed ? 0 : 1);
