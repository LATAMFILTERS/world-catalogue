'use strict';

// EBP Phase 2 — database access. All functions take a `pool` (or `client`
// for transactional helpers) so this module never manages its own
// connection lifecycle — that's server.js's job, same convention as
// ebp/phase1/repository.js.

async function manufacturerCodeExists(pool, code) {
  const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturers WHERE manufacturer_code = $1 LIMIT 1', [code]);
  return rows.length > 0;
}

async function fetchManufacturerByCode(pool, code) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturers WHERE manufacturer_code = $1', [code]);
  return rows[0] || null;
}

async function fetchManufacturerById(client, id) {
  const { rows } = await client.query('SELECT * FROM ebp_manufacturers WHERE id = $1', [id]);
  return rows[0] || null;
}

async function lockManufacturerByCode(client, code) {
  const { rows } = await client.query('SELECT * FROM ebp_manufacturers WHERE manufacturer_code = $1 FOR UPDATE', [code]);
  return rows[0] || null;
}

async function listManufacturers(pool, { status, country_code, q, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (country_code) {
    params.push(country_code);
    conditions.push(`country_code = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(legal_name ILIKE $${params.length} OR trade_name ILIKE $${params.length})`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);
  params.push(offset);
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturers ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

async function insertManufacturer(client, payload, code, actor) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturers
      (manufacturer_code, legal_name, trade_name, country_code, timezone, website,
       registered_on, created_by, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7, CURRENT_DATE),$8,$9)
     RETURNING *`,
    [
      code,
      payload.legal_name,
      payload.trade_name || null,
      payload.country_code,
      payload.timezone,
      payload.website || null,
      payload.registered_on || null,
      actor.declared_actor,
      actor.identity_mechanism,
    ]
  );
  return rows[0];
}

async function updateManufacturerFields(client, id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return fetchManufacturerById(client, id);
  const setClauses = keys.map((k, i) => `${k} = $${i + 2}`);
  setClauses.push('updated_at = NOW()');
  const { rows } = await client.query(
    `UPDATE ebp_manufacturers SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
    [id, ...keys.map((k) => fields[k])]
  );
  return rows[0];
}

async function updateManufacturerStatus(client, id, toStatus, reason, retiredAt) {
  const { rows } = await client.query(
    `UPDATE ebp_manufacturers
     SET status = $2, status_reason = $3, retired_at = $4, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id, toStatus, reason || null, retiredAt || null]
  );
  return rows[0];
}

async function insertManufacturerStatusHistory(client, manufacturerId, fromStatus, toStatus, actor, reason, evidenceReference) {
  await client.query(
    `INSERT INTO ebp_manufacturers_status_history
      (manufacturer_id, from_status, to_status, reason, evidence_reference, declared_actor, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [manufacturerId, fromStatus || null, toStatus, reason || null, evidenceReference || null, actor.declared_actor, actor.identity_mechanism]
  );
}

async function listManufacturerStatusHistory(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturers_status_history WHERE manufacturer_id = $1 ORDER BY changed_at ASC`,
    [manufacturerId]
  );
  return rows;
}

// ─── Contacts ─────────────────────────────────────────────────────────────

async function insertContact(pool, manufacturerId, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_contacts
      (manufacturer_id, full_name, title, email, phone, preferred_language, is_primary, is_technical, is_commercial, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      manufacturerId,
      payload.full_name,
      payload.title || null,
      payload.email,
      payload.phone || null,
      payload.preferred_language || null,
      !!payload.is_primary,
      !!payload.is_technical,
      !!payload.is_commercial,
      payload.is_active === undefined ? true : !!payload.is_active,
    ]
  );
  return rows[0];
}

async function fetchContact(pool, manufacturerId, contactId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_contacts WHERE id = $1 AND manufacturer_id = $2`,
    [contactId, manufacturerId]
  );
  return rows[0] || null;
}

async function updateContact(pool, manufacturerId, contactId, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return fetchContact(pool, manufacturerId, contactId);
  const setClauses = keys.map((k, i) => `${k} = $${i + 3}`);
  setClauses.push('updated_at = NOW()');
  const { rows } = await pool.query(
    `UPDATE ebp_manufacturer_contacts SET ${setClauses.join(', ')} WHERE id = $1 AND manufacturer_id = $2 RETURNING *`,
    [contactId, manufacturerId, ...keys.map((k) => fields[k])]
  );
  return rows[0] || null;
}

async function listContacts(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_contacts WHERE manufacturer_id = $1 ORDER BY created_at ASC`,
    [manufacturerId]
  );
  return rows;
}

// ─── Locations ────────────────────────────────────────────────────────────

async function insertLocation(pool, manufacturerId, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_locations
      (manufacturer_id, location_code, location_type, country_code, region, city, address_line, postal_code, timezone, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      manufacturerId,
      payload.location_code || null,
      payload.location_type,
      payload.country_code,
      payload.region || null,
      payload.city || null,
      payload.address_line || null,
      payload.postal_code || null,
      payload.timezone,
      payload.is_active === undefined ? true : !!payload.is_active,
    ]
  );
  return rows[0];
}

async function fetchLocation(pool, manufacturerId, locationId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_locations WHERE id = $1 AND manufacturer_id = $2`,
    [locationId, manufacturerId]
  );
  return rows[0] || null;
}

async function updateLocation(pool, manufacturerId, locationId, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return fetchLocation(pool, manufacturerId, locationId);
  const setClauses = keys.map((k, i) => `${k} = $${i + 3}`);
  setClauses.push('updated_at = NOW()');
  const { rows } = await pool.query(
    `UPDATE ebp_manufacturer_locations SET ${setClauses.join(', ')} WHERE id = $1 AND manufacturer_id = $2 RETURNING *`,
    [locationId, manufacturerId, ...keys.map((k) => fields[k])]
  );
  return rows[0] || null;
}

async function listLocations(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_locations WHERE manufacturer_id = $1 ORDER BY created_at ASC`,
    [manufacturerId]
  );
  return rows;
}

// ─── Certifications ───────────────────────────────────────────────────────

async function insertCertification(pool, manufacturerId, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_certifications
      (manufacturer_id, location_id, certification_code, certificate_number, issuing_body, issued_on, expires_on, evidence_reference, scope)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      manufacturerId,
      payload.location_id || null,
      payload.certification_code,
      payload.certificate_number || null,
      payload.issuing_body,
      payload.issued_on,
      payload.expires_on || null,
      payload.evidence_reference || null,
      payload.scope || null,
    ]
  );
  return rows[0];
}

async function fetchCertificationEffective(pool, manufacturerId, certificationId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_certifications_effective WHERE id = $1 AND manufacturer_id = $2`,
    [certificationId, manufacturerId]
  );
  return rows[0] || null;
}

async function updateCertificationStatus(pool, manufacturerId, certificationId, status, evidenceReference) {
  const { rows } = await pool.query(
    `UPDATE ebp_manufacturer_certifications
     SET status = $3, evidence_reference = COALESCE($4, evidence_reference), updated_at = NOW()
     WHERE id = $1 AND manufacturer_id = $2 RETURNING *`,
    [certificationId, manufacturerId, status, evidenceReference || null]
  );
  return rows[0] || null;
}

async function listCertificationsEffective(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_certifications_effective WHERE manufacturer_id = $1 ORDER BY created_at ASC`,
    [manufacturerId]
  );
  return rows;
}

// ─── Capabilities ─────────────────────────────────────────────────────────

async function insertCapability(pool, manufacturerId, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_capabilities
      (manufacturer_id, location_id, capability_type, capability_value, expires_on, notes)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`,
    [
      manufacturerId,
      payload.location_id || null,
      payload.capability_type,
      JSON.stringify(payload.capability_value),
      payload.expires_on || null,
      payload.notes || null,
    ]
  );
  return rows[0];
}

async function fetchCapability(pool, manufacturerId, capabilityId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_capabilities WHERE id = $1 AND manufacturer_id = $2`,
    [capabilityId, manufacturerId]
  );
  return rows[0] || null;
}

async function updateCapabilityReview(pool, manufacturerId, capabilityId, reviewStatus, verifiedBy) {
  const { rows } = await pool.query(
    `UPDATE ebp_manufacturer_capabilities
     SET review_status = $3, verified_at = NOW(), verified_by = $4
     WHERE id = $1 AND manufacturer_id = $2 RETURNING *`,
    [capabilityId, manufacturerId, reviewStatus, verifiedBy]
  );
  return rows[0] || null;
}

async function listCapabilities(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_capabilities WHERE manufacturer_id = $1 ORDER BY declared_at ASC`,
    [manufacturerId]
  );
  return rows;
}

// ─── Qualifications & Conditions ──────────────────────────────────────────

async function insertQualification(client, manufacturerId, payload) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_qualifications
      (manufacturer_id, location_id, product_category, product_subtype, effective_from, review_due_on, approved_by, evidence_reference)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      manufacturerId,
      payload.location_id,
      payload.product_category,
      payload.product_subtype,
      payload.effective_from || null,
      payload.review_due_on || null,
      payload.approved_by || null,
      payload.evidence_reference || null,
    ]
  );
  return rows[0];
}

async function insertQualificationCondition(client, qualificationId, condition) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_qualification_conditions
      (qualification_id, condition_type, parameters, notes)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [qualificationId, condition.condition_type, JSON.stringify(condition.parameters), condition.notes || null]
  );
  return rows[0];
}

async function fetchQualification(pool, manufacturerId, qualificationId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_qualifications WHERE id = $1 AND manufacturer_id = $2`,
    [qualificationId, manufacturerId]
  );
  return rows[0] || null;
}

async function lockQualification(client, manufacturerId, qualificationId) {
  const { rows } = await client.query(
    `SELECT * FROM ebp_manufacturer_qualifications WHERE id = $1 AND manufacturer_id = $2 FOR UPDATE`,
    [qualificationId, manufacturerId]
  );
  return rows[0] || null;
}

async function updateQualificationStatus(client, qualificationId, status) {
  const { rows } = await client.query(
    `UPDATE ebp_manufacturer_qualifications SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [qualificationId, status]
  );
  return rows[0];
}

async function listQualificationConditions(pool, qualificationId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_qualification_conditions WHERE qualification_id = $1 ORDER BY created_at ASC`,
    [qualificationId]
  );
  return rows;
}

async function listQualifications(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_qualifications WHERE manufacturer_id = $1 ORDER BY created_at ASC`,
    [manufacturerId]
  );
  return rows;
}

module.exports = {
  manufacturerCodeExists,
  fetchManufacturerByCode,
  fetchManufacturerById,
  lockManufacturerByCode,
  listManufacturers,
  insertManufacturer,
  updateManufacturerFields,
  updateManufacturerStatus,
  insertManufacturerStatusHistory,
  listManufacturerStatusHistory,
  insertContact,
  fetchContact,
  updateContact,
  listContacts,
  insertLocation,
  fetchLocation,
  updateLocation,
  listLocations,
  insertCertification,
  fetchCertificationEffective,
  updateCertificationStatus,
  listCertificationsEffective,
  insertCapability,
  fetchCapability,
  updateCapabilityReview,
  listCapabilities,
  insertQualification,
  insertQualificationCondition,
  fetchQualification,
  lockQualification,
  updateQualificationStatus,
  listQualificationConditions,
  listQualifications,
};
