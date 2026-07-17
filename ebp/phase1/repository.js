'use strict';

// EBP Phase 1 — database access. All functions take a `pool` (or `client`
// for the transactional helpers) so this module never manages its own
// connection lifecycle — that's server.js's job, same as every other module
// in this codebase.

async function fetchApplicabilityMatrix(pool, productCategory, productSubtype) {
  const { rows } = await pool.query(
    `SELECT field_name, applicability, approval_status
     FROM ebp_field_applicability_matrix
     WHERE product_category = $1 AND product_subtype = $2`,
    [productCategory, productSubtype]
  );
  return rows;
}

// Re-checks, at the moment of calling (not frozen at Passport-creation
// time), the current approval_status of specific matrix rows. Used by
// activatePassport() to gate activation on ADR-0014.
async function fetchApplicabilityApprovalFor(client, productCategory, productSubtype, fieldNames) {
  if (!fieldNames.length) return [];
  const { rows } = await client.query(
    `SELECT field_name, approval_status
     FROM ebp_field_applicability_matrix
     WHERE product_category = $1 AND product_subtype = $2 AND field_name = ANY($3::text[])`,
    [productCategory, productSubtype, fieldNames]
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

async function fetchEngineeringSource(client, passportId) {
  const { rows } = await client.query(
    `SELECT field_applicability_source FROM ebp_passport_engineering WHERE passport_id = $1`,
    [passportId]
  );
  return (rows[0] && rows[0].field_applicability_source) || {};
}

async function listRevisions(pool, sku) {
  const { rows } = await pool.query(
    `SELECT id, engineering_revision, status, created_by, identity_mechanism, created_at, activated_at, superseded_at
     FROM ebp_engineering_passports WHERE elimfilters_code = $1
     ORDER BY engineering_revision ASC`,
    [sku]
  );
  return rows;
}

// changedBy: a declared_actor label (not a verified identity — see
// ebp/phase1/actor.js). identityMechanism: e.g. 'ADMIN_KEY_SHARED'.
async function insertStatusHistory(client, passportId, fromStatus, toStatus, changedBy, identityMechanism, reason) {
  await client.query(
    `INSERT INTO ebp_passport_status_history (passport_id, from_status, to_status, changed_by, identity_mechanism, reason)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [passportId, fromStatus, toStatus, changedBy, identityMechanism, reason || null]
  );
}

module.exports = {
  fetchApplicabilityMatrix,
  fetchApplicabilityApprovalFor,
  fetchEngineeringSource,
  skuExistsInCatalog,
  fetchPassportRow,
  fetchActivePassport,
  fetchLatestRevision,
  fetchRevision,
  listRevisions,
  insertStatusHistory,
};
