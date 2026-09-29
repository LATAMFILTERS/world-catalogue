#!/usr/bin/env node
'use strict';

/**
 * Pre-load congruence check for candidate ET9 (TURBOCORE™) records, before
 * they ever reach elimfilters_catalog.
 *
 * The DB trigger `trg_enforce_turbine_et9_sku` (created by
 * run_068_enforce_turbine_et9.js) only enforces ONE direction: turbine-like
 * evidence -> must use an ET9 SKU. It does NOT check the reverse — an ET9
 * SKU whose evidence does NOT look like a turbine (e.g. a Donaldson code)
 * slips through silently. That is exactly how ET91844P (Donaldson P551844,
 * HYDROCORE™) ended up misfiled under the ET9/turbine family; the trigger
 * had nothing to say about it because turbine-like evidence was absent.
 *
 * This script closes that gap on the input side, before INSERT: for every
 * candidate record it checks BOTH directions and refuses to call anything
 * "safe to load" unless they agree.
 *
 * Does not touch the database. Reads a .jsonl batch (one JSON object per
 * line, same shape as scripts/fleetguard_import_ready.jsonl) and reports:
 *   - OK: sku/evidence agree (either both turbine, or both non-turbine)
 *   - SUSPECT_ET9_SKU: sku starts with ET9 but evidence isn't turbine-like
 *     (the ET91844P pattern)
 *   - SUSPECT_MISSING_ET9: evidence is turbine-like but sku doesn't start
 *     with ET9 (the pattern run_068 already remaps deterministically, or
 *     flags as unresolved when it can't)
 *
 * Usage:
 *   node scripts/validate-et9-precarga.js path/to/batch.jsonl
 */

const fs = require('node:fs');
const path = require('node:path');

// --- identical logic to run_068_enforce_turbine_et9.js, kept in sync on
// purpose so pre-load and in-DB enforcement never disagree ---

function normalize(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function collectCodes(row) {
  const values = [row.codigo_base];
  for (const field of ['competitor_codes', 'oem_codes']) {
    const arr = Array.isArray(row[field]) ? row[field] : [];
    for (const item of arr) {
      if (typeof item === 'string') values.push(item);
      else if (item && typeof item === 'object') values.push(item.code || item.reference || item.part_number || item.partNumber);
    }
  }
  return values.map(normalize).filter(Boolean);
}

function turbineVariantFromCodes(row) {
  const variants = new Set();
  for (const code of collectCodes(row)) {
    const m = code.match(/^(2010|2020|2040)(PM|SM|TM)/);
    if (m) {
      const letter = m[2] === 'PM' ? 'P' : m[2] === 'SM' ? 'S' : 'T';
      variants.add(`ET9${m[1]}${letter}`);
      continue;
    }

    // Fleetguard Fuel Pro housing rule confirmed 2026-09-17:
    // FH + digits (+ optional suffix letters) -> ET9 + last 4 numeric digits.
    // The Fleetguard suffix is retained only in codigo_base/reference data.
    const fh = code.match(/^FH(\d{5})(?:[A-Z]+)?$/);
    if (fh) variants.add(`ET9${fh[1].slice(-4)}`);
  }
  return variants.size === 1 ? [...variants][0] : null;
}

function isTurbineLike(row) {
  if (String(row.technology || '').toUpperCase() === 'TURBOCORE™') return true;
  const codes = collectCodes(row);
  return codes.some(code =>
    /^(2010|2020|2040)(PM|SM|TM)/.test(code) ||
    /^(500|900|1000)(FG|FH|FE|FF)/.test(code) ||
    /^FH\d{5}(?:[A-Z]+)?$/.test(code)
  );
}

// --- pre-load specific checks ---

function classify(row) {
  const sku = String(row.sku || '').toUpperCase();
  const hasEt9Sku = /^ET9/.test(sku);
  const turbineEvidence = isTurbineLike(row);

  if (hasEt9Sku && turbineEvidence) return { status: 'OK', detail: 'ET9 sku with turbine evidence' };
  if (!hasEt9Sku && !turbineEvidence) return { status: 'OK', detail: 'non-ET9 sku, no turbine evidence' };

  if (hasEt9Sku && !turbineEvidence) {
    return {
      status: 'SUSPECT_ET9_SKU',
      detail: `sku ${row.sku} uses ET9 prefix but codigo_base/codes don't look like a turbine part — this is the ET91844P pattern`,
    };
  }

  const target = turbineVariantFromCodes(row);
  return {
    status: 'SUSPECT_MISSING_ET9',
    detail: target
      ? `evidence resolves deterministically to ${target}; sku ${row.sku} should be renamed before load`
      : `evidence looks turbine-like but no deterministic ET9 target found; needs manual review before load (do not guess)`,
  };
}

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/validate-et9-precarga.js path/to/batch.jsonl');
    process.exit(1);
  }

  const fullPath = path.resolve(file);
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);

  const results = lines.map((line, i) => {
    let row;
    try {
      row = JSON.parse(line);
    } catch (e) {
      return { line: i + 1, status: 'PARSE_ERROR', detail: e.message };
    }
    return { line: i + 1, sku: row.sku, ...classify(row) };
  });

  const bad = results.filter(r => r.status !== 'OK');
  const ok = results.filter(r => r.status === 'OK');

  console.log(`Checked ${results.length} candidate records from ${file}`);
  console.log(`  OK: ${ok.length}`);
  console.log(`  Needs review before load: ${bad.length}`);

  if (bad.length) {
    console.log('\n--- records to fix before INSERT ---');
    for (const r of bad) {
      console.log(`  line ${r.line} | ${r.sku || '(no sku)'} | ${r.status} | ${r.detail}`);
    }
  }

  process.exitCode = bad.length ? 1 : 0;
}

main();
