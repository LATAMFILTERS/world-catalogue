'use strict';

// EBP Phase 1 — database access. All functions take a `pool` (or `client`
// for the transactional helpers) so this module never manages its own
// connection lifecycle — that's server.js's job, same as every other module
// in this codebase.

async function fetchApplicabilityMatrix(pool, productCategory, productSubtype) {
  const { rows } = await pool.query(
    `SELECT field_name, applicability
     FROM ebp_field_applicability_matrix
     WHERE product_category = $1 AND product_subtype = $2`,
    [productCategory, productSubtype]
  );
  return rows;
}

async function skuExistsInCatalog(pool, sku) {
  const { rows } = await pool.query('SELECT 1 FROM elimfilters_catalog WHERE sku = $1 LIMIT 1', [sku]);
  return rows.length > 0;
}

async function fetchPassportRow(pool, passportId) {
  const { rows } = await pool.query(
    `SELECT p.*,
            row_to_json(e.*) AS engineering,
            row_to_json(pk.*) AS packaging
     FROM ebp_engineering_passports p
     LEFT JOIN ebp_passport_engineering e ON e.passport_id = p.id
     LEFT JOIN ebp_passport_packaging pk ON pk.passport_id = p.id
     WHERE p.id = $1`,
    [passportId]
  );
  return rows[0] || null;
}

async function fetchActivePassport(pool, sku) {
  const { rows } = await pool.query(
    `SELECT id FROM ebp_engineering_passports WHERE elimfilters_code = $1 AND status = 'ACTIVE' LIMIT 1`,
    [sku]
  );
  return rows[0] ? fetchPassportRow(pool, rows[0].id) : null;
}

async function fetchLatestRevision(pool, sku) {
  const { rows } = await pool.query(
    `SELECT id FROM ebp_engineering_passports WHERE elimfilters_code = $1
     ORDER BY engineering_revision DESC LIMIT 1`,
    [sku]
  );
  return rows[0] ? fetchPassportRow(pool, rows[0].id) : null;
}

async function fetchRevision(pool, sku, revision) {
  const { rows } = await pool.query(
    `SELECT id FROM ebp_engineering_passports WHERE elimfilters_code = $1 AND engineering_revision = $2`,
    [sku, revision]
  );
  return rows[0] ? fetchPassportRow(pool, rows[0].id) : null;
}

async function listRevisions(pool, sku) {
  const { rows } = await pool.query(
    `SELECT id, engineering_revision, status, created_by, created_at, activated_at, superseded_at
     FROM ebp_engineering_passports WHERE elimfilters_code = $1
     ORDER BY engineering_revision ASC`,
    [sku]
  );
  return rows;
}

async function insertStatusHistory(client, passportId, fromStatus, toStatus, changedBy, reason) {
  await client.query(
    `INSERT INTO ebp_passport_status_history (passport_id, from_status, to_status, changed_by, reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [passportId, fromStatus, toStatus, changedBy, reason || null]
  );
}

module.exports = {
  fetchApplicabilityMatrix,
  skuExistsInCatalog,
  fetchPassportRow,
  fetchActivePassport,
  fetchLatestRevision,
  fetchRevision,
  listRevisions,
  insertStatusHistory,
};
