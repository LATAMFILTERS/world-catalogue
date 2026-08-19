'use strict';

/**
 * Canonical codigo_base audit/correction for elimfilters_catalog.
 *
 * UNIQUE POLICY
 * HEAVY_DUTY:
 *   1) DONALDSON
 *   2) FLEETGUARD only after verified Donaldson absence
 *   3) OEM only after verified Donaldson + Fleetguard absence and commercial OEM validation
 *
 * LIGHT_DUTY:
 *   1) MANN / MANN-FILTER
 *   2) OEM only after verified MANN-FILTER absence and commercial OEM validation
 *
 * Safety model:
 *   - Existing preferred-manufacturer codigo_base values are recognized as canonical.
 *   - Raw competitor_codes/oem_codes are useful for AUDIT CANDIDATES only. They are
 *     not trusted strongly enough to authorize a destructive codigo_base rewrite.
 *   - Automatic mutation requires explicit governance approval in:
 *       enrichment_data.codigo_base_governance
 *     with:
 *       replacement_verified: true
 *       approved_codigo_base: '<code>'
 *       approved_authority: 'DONALDSON' | 'MANN_FILTER' | 'FLEETGUARD' | 'OEM'
 *   - The approved replacement must still be consistent with the canonical duty
 *     hierarchy and with the required absence evidence for fallback authorities.
 *
 * Usage:
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js --apply
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
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function refsFrom(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => ({
    code: String(item && item.code || '').trim(),
    normalizedCode: normalizeCode(item && item.code),
    manufacturer: normalizeManufacturer(item && (item.manufacturer || item.brand || item.oem)),
  })).filter((item) => item.code && item.normalizedCode && item.manufacturer);
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

function governanceFrom(row = {}) {
  const enrichment = row.enrichment_data && typeof row.enrichment_data === 'object'
    ? row.enrichment_data
    : {};
  return enrichment.codigo_base_governance && typeof enrichment.codigo_base_governance === 'object'
    ? enrichment.codigo_base_governance
    : {};
}

function approvedReplacement(row, refs) {
  const duty = String(row.duty || '').toUpperCase();
  const gov = governanceFrom(row);
  if (gov.replacement_verified !== true) return null;

  const code = String(gov.approved_codigo_base || '').trim();
  const normalized = normalizeCode(code);
  const authority = String(gov.approved_authority || '').trim().toUpperCase();
  if (!normalized || !authority) return null;

  if (duty === 'HEAVY_DUTY') {
    if (authority === 'DONALDSON') {
      const allowed = byManufacturer(refs, ['DONALDSON']);
      if (!allowed.some((ref) => ref.normalizedCode === normalized)) {
        return { invalid: true, reason: 'Approved Donaldson replacement is not evidenced in catalog references' };
      }
      return { code, authority: 'DONALDSON' };
    }

    if (authority === 'FLEETGUARD') {
      if (gov.donaldson_absence_verified !== true) {
        return { invalid: true, reason: 'Fleetguard approval lacks verified Donaldson absence' };
      }
      const allowed = byManufacturer(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
      if (!allowed.some((ref) => ref.normalizedCode === normalized)) {
        return { invalid: true, reason: 'Approved Fleetguard replacement is not evidenced in catalog references' };
      }
      return { code, authority: 'FLEETGUARD' };
    }

    if (authority === 'OEM') {
      if (gov.donaldson_absence_verified !== true ||
          gov.fleetguard_absence_verified !== true ||
          gov.oem_commercial_code_verified !== true) {
        return { invalid: true, reason: 'OEM approval lacks complete verified fallback evidence' };
      }
      return { code, authority: 'OEM' };
    }

    return { invalid: true, reason: 'Unsupported approved authority for HEAVY_DUTY' };
  }

  if (duty === 'LIGHT_DUTY') {
    if (authority === 'MANN_FILTER') {
      const allowed = byManufacturer(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
      if (!allowed.some((ref) => ref.normalizedCode === normalized)) {
        return { invalid: true, reason: 'Approved MANN-FILTER replacement is not evidenced in catalog references' };
      }
      return { code, authority: 'MANN_FILTER' };
    }

    if (authority === 'OEM') {
      if (gov.mann_absence_verified !== true || gov.oem_commercial_code_verified !== true) {
        return { invalid: true, reason: 'OEM approval lacks verified MANN-FILTER absence/commercial-code evidence' };
      }
      return { code, authority: 'OEM' };
    }

    return { invalid: true, reason: 'Unsupported approved authority for LIGHT_DUTY' };
  }

  return { invalid: true, reason: 'Unsupported duty' };
}

function choosePreferred(row) {
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const duty = String(row.duty || '').toUpperCase();
  const current = normalizeCode(row.codigo_base);

  if (duty === 'HEAVY_DUTY') {
    const donaldson = byManufacturer(refs, ['DONALDSON']);
    if (donaldson.some((ref) => ref.normalizedCode === current)) {
      return { safe: true, alreadyCanonical: true, code: row.codigo_base, authority: 'DONALDSON' };
    }
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = byManufacturer(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann.some((ref) => ref.normalizedCode === current)) {
      return { safe: true, alreadyCanonical: true, code: row.codigo_base, authority: 'MANN_FILTER' };
    }
  }

  const approval = approvedReplacement(row, refs);
  if (approval && approval.invalid) {
    return { safe: false, authority: 'GOVERNANCE', reason: approval.reason };
  }
  if (approval && approval.code) {
    if (normalizeCode(approval.code) === current) {
      return { safe: true, alreadyCanonical: true, code: row.codigo_base, authority: approval.authority };
    }
    return {
      safe: true,
      alreadyCanonical: false,
      code: approval.code,
      authority: approval.authority,
      reason: 'Explicit verified codigo_base governance approval',
    };
  }

  // Audit hints only. These NEVER authorize mutation.
  if (duty === 'HEAVY_DUTY') {
    const donaldson = byManufacturer(refs, ['DONALDSON']);
    if (donaldson.length) {
      return {
        safe: false,
        authority: 'DONALDSON',
        reason: 'Donaldson candidate exists but replacement lacks explicit governance approval',
        candidate: donaldson.length === 1 ? donaldson[0].code : null,
        candidates: donaldson.map((ref) => ref.code),
      };
    }

    const fleetguard = byManufacturer(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
    if (fleetguard.length) {
      return {
        safe: false,
        authority: 'FLEETGUARD',
        reason: 'Fleetguard candidate exists but Donaldson absence/replacement approval is not verified',
        candidate: fleetguard.length === 1 ? fleetguard[0].code : null,
        candidates: fleetguard.map((ref) => ref.code),
      };
    }

    return { safe: false, authority: 'OEM', reason: 'Requires verified OEM commercial fallback governance' };
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = byManufacturer(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER', 'MANN HUMMEL']);
    if (mann.length) {
      return {
        safe: false,
        authority: 'MANN_FILTER',
        reason: 'MANN-FILTER candidate exists but replacement lacks explicit governance approval',
        candidate: mann.length === 1 ? mann[0].code : null,
        candidates: mann.map((ref) => ref.code),
      };
    }
    return { safe: false, authority: 'OEM', reason: 'Requires verified OEM commercial fallback governance' };
  }

  return { safe: false, authority: 'UNKNOWN', reason: `Unsupported duty: ${row.duty || 'NULL'}` };
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(`
      SELECT sku, codigo_base, duty, competitor_codes, oem_codes, enrichment_data
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
          candidate: decision.candidate || null,
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
      mutation_policy: 'ONLY_EXPLICIT_VERIFIED_GOVERNANCE_APPROVALS',
    }, null, 2));

    if (safeChanges.length) {
      console.log('\nSAFE CHANGES (explicitly approved only):');
      console.table(safeChanges.slice(0, 100));
    }

    if (unresolved.length) {
      console.log('\nAUDIT / REQUIRES EVIDENCE (first 100):');
      console.table(unresolved.slice(0, 100));
    }

    if (!APPLY) {
      console.log('\nDry run only. --apply mutates only rows with explicit verified governance approval.');
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

    console.log(`Applied ${safeChanges.length} explicitly approved codigo_base corrections.`);
    console.log(`${unresolved.length} rows were left unchanged pending evidence/governance approval.`);
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

module.exports = {
  normalizeManufacturer,
  normalizeCode,
  refsFrom,
  byManufacturer,
  governanceFrom,
  approvedReplacement,
  choosePreferred,
};
