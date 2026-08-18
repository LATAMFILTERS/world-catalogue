'use strict';

/**
 * Canonical codigo_base audit/correction for elimfilters_catalog.
 *
 * HEAVY_DUTY:
 *   1) DONALDSON
 *   2) FLEETGUARD only after verified Donaldson absence
 *   3) OEM only after verified Donaldson + Fleetguard absence and commercial OEM validation
 *
 * LIGHT_DUTY:
 *   1) MANN / MANN-FILTER
 *   2) OEM only after verified MANN-FILTER absence and commercial OEM validation
 *
 * Critical safety rule:
 *   - If the current codigo_base already matches ANY reference from the required
 *     preferred manufacturer, it is canonical and MUST NOT be replaced by some
 *     other reference from the same manufacturer merely because that reference
 *     appears first in JSONB.
 *   - If multiple preferred-manufacturer references exist and the current base
 *     matches none of them, this script reports an ambiguity. It never picks the
 *     first code arbitrarily.
 *   - Missing references in current JSONB are never treated as proof that a
 *     preferred manufacturer does not make the part.
 *
 * Usage:
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js          # dry run
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js --apply  # apply only unambiguous changes
 */

require('dotenv').config();
const { Pool } = require('pg');

const APPLY = process.argv.includes('--apply');
const DATABASE_URL = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Missing CATALOG_DATABASE_URL or DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

function normalizeManufacturer(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function refsFrom(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      code: String(item && item.code || '').trim(),
      normalizedCode: normalizeCode(item && item.code),
      manufacturer: normalizeManufacturer(item && (item.manufacturer || item.brand || item.oem)),
    }))
    .filter((item) => item.code && item.normalizedCode && item.manufacturer);
}

function byManufacturer(refs, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  const seen = new Set();
  return refs.filter((ref) => {
    if (!wanted.has(ref.manufacturer) || seen.has(ref.normalizedCode)) return false;
    seen.add(ref.normalizedCode);
    return true;
  });
}

function decidePreferredAuthority(row, authority, refs, manufacturers) {
  const preferred = byManufacturer(refs, manufacturers);
  const current = normalizeCode(row.codigo_base);

  if (!preferred.length) return null;

  const currentMatch = preferred.find((ref) => ref.normalizedCode === current);
  if (currentMatch) {
    return {
      code: currentMatch.code,
      authority,
      safe: true,
      alreadyCanonical: true,
      reason: 'Current codigo_base already matches preferred-manufacturer evidence',
    };
  }

  if (preferred.length === 1) {
    return {
      code: preferred[0].code,
      authority,
      safe: true,
      alreadyCanonical: false,
      reason: 'Single unambiguous preferred-manufacturer reference',
    };
  }

  return {
    safe: false,
    authority,
    reason: 'Multiple preferred-manufacturer references exist; primary codigo_base is ambiguous',
    candidates: preferred.map((ref) => ref.code),
  };
}

function choosePreferred(row) {
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const duty = String(row.duty || '').toUpperCase();

  if (duty === 'HEAVY_DUTY') {
    const donaldson = decidePreferredAuthority(row, 'DONALDSON', refs, ['DONALDSON']);
    if (donaldson) return donaldson;

    const fleetguard = byManufacturer(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
    if (fleetguard.length) {
      return {
        safe: false,
        authority: 'FLEETGUARD',
        reason: 'Donaldson absence is not proven by current catalog evidence',
        candidate: fleetguard.length === 1 ? fleetguard[0].code : null,
        candidates: fleetguard.map((ref) => ref.code),
      };
    }

    return { safe: false, authority: 'OEM', reason: 'Requires verified OEM commercial fallback' };
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = decidePreferredAuthority(row, 'MANN_FILTER', refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann) return mann;

    return { safe: false, authority: 'OEM', reason: 'Requires verified OEM commercial fallback' };
  }

  return { safe: false, authority: 'UNKNOWN', reason: `Unsupported duty: ${row.duty || 'NULL'}` };
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT sku, codigo_base, duty, competitor_codes, oem_codes
      FROM elimfilters_catalog
      ORDER BY sku
    `);

    const safeChanges = [];
    const unresolved = [];
    const alreadyCanonical = [];

    for (const row of rows) {
      const decision = choosePreferred(row);

      if (decision.safe && decision.alreadyCanonical) {
        alreadyCanonical.push(row.sku);
        continue;
      }

      if (!decision.safe || !decision.code) {
        unresolved.push({
          sku: row.sku,
          duty: row.duty,
          codigo_base: row.codigo_base,
          authority: decision.authority,
          reason: decision.reason,
          candidate: decision.candidate || decision.code || null,
          candidates: decision.candidates || null,
        });
        continue;
      }

      safeChanges.push({
        sku: row.sku,
        duty: row.duty,
        from: row.codigo_base,
        to: decision.code,
        authority: decision.authority,
        reason: decision.reason,
      });
    }

    console.log(JSON.stringify({
      mode: APPLY ? 'APPLY' : 'DRY_RUN',
      total_rows: rows.length,
      already_canonical: alreadyCanonical.length,
      safe_changes: safeChanges.length,
      unresolved_requires_evidence: unresolved.length,
    }, null, 2));

    if (safeChanges.length) {
      console.log('\nSAFE CHANGES (first 100):');
      console.table(safeChanges.slice(0, 100));
    }

    if (unresolved.length) {
      console.log('\nUNRESOLVED / DO NOT GUESS (first 100):');
      console.table(unresolved.slice(0, 100));
    }

    if (!APPLY) {
      console.log('\nDry run only. Re-run with --apply only after reviewing counts and ambiguities.');
      return;
    }

    await client.query('BEGIN');
    for (const change of safeChanges) {
      await client.query(
        `UPDATE elimfilters_catalog SET codigo_base = $1 WHERE sku = $2`,
        [change.to, change.sku]
      );
    }
    await client.query('COMMIT');

    console.log(`Applied ${safeChanges.length} unambiguous evidence-backed codigo_base changes.`);
    console.log(`${unresolved.length} rows were intentionally left unchanged pending evidence or primary-reference resolution.`);
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch (_) {}
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { normalizeManufacturer, normalizeCode, refsFrom, byManufacturer, decidePreferredAuthority, choosePreferred };
