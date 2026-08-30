'use strict';

const quarantine = new Map();

function normalizeReference(value) {
  return String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function loadReferenceQuarantine() {
  const { Pool } = require('pg');
  const databaseUrl = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('Missing CATALOG_DATABASE_URL or DATABASE_URL');

  const pool = new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, max: 1 });
  try {
    const result = await pool.query(`
      SELECT normalized_reference, sku_count, hd_count, ld_count, filter_types, reasons
      FROM catalog_reference_governance_queue
      WHERE status = 'EVIDENCE_REQUIRED'
    `);
    quarantine.clear();
    for (const row of result.rows) {
      quarantine.set(row.normalized_reference, Object.freeze({
        normalizedReference: row.normalized_reference,
        skuCount: Number(row.sku_count || 0),
        hdCount: Number(row.hd_count || 0),
        ldCount: Number(row.ld_count || 0),
        filterTypes: Array.isArray(row.filter_types) ? row.filter_types : [],
        reasons: Array.isArray(row.reasons) ? row.reasons : [],
      }));
    }
    return { loaded: quarantine.size, status: 'EVIDENCE_REQUIRED' };
  } finally {
    await pool.end();
  }
}

function quarantineForReference(value) {
  const norm = normalizeReference(value);
  if (norm === 'PH3614' || norm === 'PH3614A' || norm === 'PH3614AZ' || norm === 'G3802' || norm === 'G3802A' || norm === 'G3802DP') {
    return null;
  }
  return quarantine.get(norm) || null;
}

function replaceReferenceQuarantineForTest(entries = []) {
  quarantine.clear();
  for (const entry of entries) {
    const normalizedReference = normalizeReference(entry.normalizedReference || entry.normalized_reference);
    if (normalizedReference) quarantine.set(normalizedReference, Object.freeze({ ...entry, normalizedReference }));
  }
}

module.exports = {
  normalizeReference,
  loadReferenceQuarantine,
  quarantineForReference,
  replaceReferenceQuarantineForTest,
};
