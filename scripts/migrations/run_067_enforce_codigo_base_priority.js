'use strict';

/**
 * Canonical codigo_base policy for elimfilters_catalog.
 *
 * HEAVY_DUTY:
 *   1) DONALDSON
 *   2) FLEETGUARD when no Donaldson reference is present
 *   3) OEM fallback requires explicit/manual commercial-authority resolution
 *
 * LIGHT_DUTY:
 *   1) MANN / MANN-FILTER
 *   2) OEM fallback requires explicit/manual commercial-authority resolution
 *
 * Safety rule: this migration NEVER guesses that a preferred manufacturer does
 * not make a part merely because that reference is missing from current JSONB.
 * It only auto-updates rows when the preferred code is explicitly present in
 * competitor_codes or oem_codes. Unresolved rows are reported for enrichment.
 *
 * Usage:
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js          # dry run
 *   node scripts/migrations/run_067_enforce_codigo_base_priority.js --apply  # apply safe changes
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
  return String(value || '').trim().toUpperCase();
}

function refsFrom(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      code: normalizeCode(item && item.code),
      manufacturer: normalizeManufacturer(item && (item.manufacturer || item.brand)),
    }))
    .filter((item) => item.code && item.manufacturer);
}

function firstByManufacturer(refs, manufacturers) {
  const wanted = new Set(manufacturers.map(normalizeManufacturer));
  return refs.find((r) => wanted.has(r.manufacturer)) || null;
}

function choosePreferred(row) {
  const refs = [...refsFrom(row.competitor_codes), ...refsFrom(row.oem_codes)];
  const duty = String(row.duty || '').toUpperCase();

  if (duty === 'HEAVY_DUTY') {
    const donaldson = firstByManufacturer(refs, ['DONALDSON']);
    if (donaldson) return { code: donaldson.code, authority: 'DONALDSON', safe: true };

    const fleetguard = firstByManufacturer(refs, ['FLEETGUARD', 'CUMMINS FILTRATION']);
    if (fleetguard) {
      return {
        code: fleetguard.code,
        authority: 'FLEETGUARD',
        safe: false,
        reason: 'Donaldson absence is not proven by current catalog evidence',
      };
    }

    return { safe: false, authority: 'OEM', reason: 'Requires verified OEM commercial fallback' };
  }

  if (duty === 'LIGHT_DUTY') {
    const mann = firstByManufacturer(refs, ['MANN', 'MANN FILTER', 'MANN-FILTER', 'MANNFILTER']);
    if (mann) return { code: mann.code, authority: 'MANN_FILTER', safe: true };

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
      if (!decision.safe || !decision.code) {
        unresolved.push({
          sku: row.sku,
          duty: row.duty,
          codigo_base: row.codigo_base,
          authority: decision.authority,
          reason: decision.reason,
          candidate: decision.code || null,
        });
        continue;
      }

      if (normalizeCode(row.codigo_base) === normalizeCode(decision.code)) {
        alreadyCanonical.push(row.sku);
        continue;
      }

      safeChanges.push({
        sku: row.sku,
        duty: row.duty,
        from: row.codigo_base,
        to: decision.code,
        authority: decision.authority,
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
      console.log('\nDry run only. Re-run with --apply after reviewing counts.');
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

    console.log(`Applied ${safeChanges.length} evidence-backed codigo_base changes.`);
    console.log(`${unresolved.length} rows were intentionally left unchanged pending manufacturer/OEM evidence.`);
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

module.exports = { normalizeManufacturer, normalizeCode, refsFrom, choosePreferred };
