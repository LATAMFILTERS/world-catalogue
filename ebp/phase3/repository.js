'use strict';

// EBP Phase 3 — database access. All functions take a `pool` (or `client`
// for transactional helpers) so this module never manages its own
// connection lifecycle. Read-only lookups against Phase 1/Phase 2 tables
// are clearly marked; nothing in this file ever writes to a
// ebp_engineering_passports* or ebp_manufacturer(s)?_* (Phase 2) table.

// ─── Read-only Phase 1 lookups ─────────────────────────────────────────────

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

// ─── Read-only Phase 2 lookups ─────────────────────────────────────────────

async function fetchManufacturerById(pool, manufacturerId) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturers WHERE id = $1', [manufacturerId]);
  return rows[0] || null;
}

async function fetchManufacturerLocationIds(pool, manufacturerId) {
  const { rows } = await pool.query('SELECT id FROM ebp_manufacturer_locations WHERE manufacturer_id = $1', [manufacturerId]);
  return rows.map((r) => r.id);
}

async function fetchQualifiedFamilies(pool, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT product_category, product_subtype, location_id FROM ebp_manufacturer_qualifications
     WHERE manufacturer_id = $1 AND status IN ('QUALIFIED','CONDITIONAL')`,
    [manufacturerId]
  );
  return rows;
}

// ─── Batches ────────────────────────────────────────────────────────────────

async function batchCodeExists(pool, code) {
  const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_request_batches WHERE batch_code = $1 LIMIT 1', [code]);
  return rows.length > 0;
}

async function insertBatch(client, payload, code, actor) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_request_batches
      (batch_code, manufacturer_id, purpose, channel, timezone, response_due_at,
       delivery_language, requested_currency, template_version, created_by, identity_mechanism, internal_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING *`,
    [
      code,
      payload.manufacturer_id,
      payload.purpose,
      payload.channel,
      payload.timezone,
      payload.response_due_at || null,
      payload.delivery_language || null,
      payload.requested_currency || null,
      payload.template_version || null,
      actor.declared_actor,
      actor.identity_mechanism,
      payload.internal_notes || null,
    ]
  );
  return rows[0];
}

// Reads go through ebp_manufacturer_request_batches_effective (ADR-0031) so
// every caller sees the computed effective_status (OVERDUE when
// response_due_at has passed and the batch hasn't reached RESPONDED/
// CLOSED/CANCELLED) alongside the raw, last-explicitly-set `status` column
// — never a second, independently-calculated OVERDUE rule anywhere else.
async function fetchBatchByCode(pool, batchCode) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_request_batches_effective WHERE batch_code = $1', [batchCode]);
  return rows[0] || null;
}

async function fetchBatchByCodeForManufacturer(pool, batchCode, manufacturerId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_request_batches_effective WHERE batch_code = $1 AND manufacturer_id = $2',
    [batchCode, manufacturerId]
  );
  return rows[0] || null;
}

// Locks the underlying base-table row (Postgres permits FOR UPDATE through
// a simple, single-table view with no aggregates/DISTINCT) — the state
// machine below still validates against the raw `status` column, which
// this view exposes unchanged alongside the computed `effective_status`.
async function lockBatchByCode(client, batchCode) {
  const { rows } = await client.query('SELECT * FROM ebp_manufacturer_request_batches_effective WHERE batch_code = $1 FOR UPDATE', [batchCode]);
  return rows[0] || null;
}

async function listBatches(pool, { manufacturer_id, status, purpose, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];
  if (manufacturer_id) {
    params.push(manufacturer_id);
    conditions.push(`manufacturer_id = $${params.length}`);
  }
  if (status) {
    // Filters against effective_status (ADR-0031), not the raw status
    // column — so ?status=OVERDUE correctly finds a batch whose stored
    // status is still SENT/PARTIALLY_RESPONDED but whose deadline has
    // passed, matching what every other read of this data already shows.
    params.push(status);
    conditions.push(`effective_status = $${params.length}`);
  }
  if (purpose) {
    params.push(purpose);
    conditions.push(`purpose = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  params.push(limit);
  params.push(offset);
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_request_batches_effective ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

async function updateBatchStatus(client, batchId, toStatus, sentAt) {
  const { rows } = await client.query(
    `UPDATE ebp_manufacturer_request_batches SET status = $2, sent_at = COALESCE($3, sent_at), updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [batchId, toStatus, sentAt || null]
  );
  return rows[0];
}

async function insertBatchStatusHistory(client, batchId, fromStatus, toStatus, actor, reason) {
  await client.query(
    `INSERT INTO ebp_manufacturer_request_batch_status_history (batch_id, from_status, to_status, reason, declared_actor, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [batchId, fromStatus || null, toStatus, reason || null, actor.declared_actor, actor.identity_mechanism]
  );
}

async function listBatchStatusHistory(pool, batchId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_request_batch_status_history WHERE batch_id = $1 ORDER BY changed_at ASC',
    [batchId]
  );
  return rows;
}

// ─── Batch Items ────────────────────────────────────────────────────────────

async function insertBatchItem(client, batchId, passportRow, snapshot) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_request_batch_items
      (batch_id, passport_id, engineering_revision, elimfilters_code, manufacturer_visible_snapshot)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [batchId, passportRow.id, passportRow.engineering_revision, passportRow.elimfilters_code, JSON.stringify(snapshot)]
  );
  return rows[0];
}

async function listBatchItems(pool, batchId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_request_batch_items WHERE batch_id = $1 ORDER BY created_at ASC',
    [batchId]
  );
  return rows;
}

async function fetchBatchItem(pool, itemId) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_request_batch_items WHERE id = $1', [itemId]);
  return rows[0] || null;
}

async function fetchBatchItemForBatch(pool, itemId, batchId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_request_batch_items WHERE id = $1 AND batch_id = $2',
    [itemId, batchId]
  );
  return rows[0] || null;
}

// ─── Offers ─────────────────────────────────────────────────────────────────

async function offerCodeExists(pool, code) {
  const { rows } = await pool.query('SELECT 1 FROM ebp_manufacturer_offers WHERE offer_code = $1 LIMIT 1', [code]);
  return rows.length > 0;
}

async function lockActiveOfferForLineage(client, passportId, engineeringRevision, manufacturerId) {
  const { rows } = await client.query(
    `SELECT * FROM ebp_manufacturer_offers
     WHERE passport_id = $1 AND engineering_revision = $2 AND manufacturer_id = $3
       AND status IN ('SUBMITTED','UNDER_REVIEW','VALIDATED')
     FOR UPDATE`,
    [passportId, engineeringRevision, manufacturerId]
  );
  return rows[0] || null;
}

async function fetchLatestRevisionForLineage(pool, passportId, engineeringRevision, manufacturerId) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_manufacturer_offers
     WHERE passport_id = $1 AND engineering_revision = $2 AND manufacturer_id = $3
     ORDER BY offer_revision DESC LIMIT 1`,
    [passportId, engineeringRevision, manufacturerId]
  );
  return rows[0] || null;
}

async function insertOffer(client, code, payload, batchItem, actor, nextRevision, lateSubmission) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_offers
      (offer_code, offer_revision, batch_item_id, manufacturer_id, passport_id, engineering_revision,
       status, submitted_at, late_submission, supersedes_offer_id, factory_user_id, created_by, identity_mechanism,
       fob_price, currency, incoterm, fob_point, moq, lead_time_days, monthly_capacity,
       tooling_cost, sample_cost, offer_validity_until, commercial_notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
     RETURNING *`,
    [
      code,
      nextRevision,
      batchItem.id,
      batchItem.manufacturer_id || payload.manufacturer_id,
      batchItem.passport_id,
      batchItem.engineering_revision,
      payload.submit ? 'SUBMITTED' : 'DRAFT',
      payload.submit ? new Date() : null,
      !!lateSubmission,
      payload.supersedes_offer_id || null,
      actor.factory_user_id || null,
      actor.declared_actor,
      actor.identity_mechanism,
      payload.fob_price,
      payload.currency,
      payload.incoterm || null,
      payload.fob_point || null,
      payload.moq ?? null,
      payload.lead_time_days ?? null,
      payload.monthly_capacity ?? null,
      payload.tooling_cost ?? null,
      payload.sample_cost ?? null,
      payload.offer_validity_until || null,
      payload.commercial_notes || null,
    ]
  );
  return rows[0];
}

async function insertTechnicalField(client, offerId, field) {
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_offer_technical_fields
      (offer_id, field_name, offered_value, unit, tolerance, manufacturer_note, evidence_document_id, completeness_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [
      offerId,
      field.field_name,
      field.offered_value !== undefined ? JSON.stringify(field.offered_value) : null,
      field.unit || null,
      field.tolerance || null,
      field.manufacturer_note || null,
      field.evidence_document_id || null,
      field.completeness_status,
    ]
  );
  return rows[0];
}

async function insertPackaging(client, offerId, packaging) {
  if (!packaging) return null;
  const { rows } = await client.query(
    `INSERT INTO ebp_manufacturer_offer_packaging
      (offer_id, recommended_quantity_per_box, box_length_mm, box_width_mm, box_height_mm,
       net_weight_kg, gross_weight_kg, protection_method, separators_used, palletization,
       units_per_pallet, observations, deviation_from_target)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      offerId,
      packaging.recommended_quantity_per_box ?? null,
      packaging.box_length_mm ?? null,
      packaging.box_width_mm ?? null,
      packaging.box_height_mm ?? null,
      packaging.net_weight_kg ?? null,
      packaging.gross_weight_kg ?? null,
      packaging.protection_method || null,
      packaging.separators_used ?? null,
      packaging.palletization || null,
      packaging.units_per_pallet ?? null,
      packaging.observations || null,
      packaging.deviation_from_target || null,
    ]
  );
  return rows[0];
}

async function updateOfferStatus(client, offerId, toStatus) {
  const { rows } = await client.query(
    `UPDATE ebp_manufacturer_offers SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [offerId, toStatus]
  );
  return rows[0];
}

async function insertOfferStatusHistory(client, offerId, fromStatus, toStatus, actor, reason) {
  await client.query(
    `INSERT INTO ebp_manufacturer_offer_status_history (offer_id, from_status, to_status, reason, declared_actor, factory_user_id, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [offerId, fromStatus || null, toStatus, reason || null, actor.declared_actor || null, actor.factory_user_id || null, actor.identity_mechanism]
  );
}

async function fetchOfferByCode(pool, offerCode) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_offers_effective WHERE offer_code = $1', [offerCode]);
  return rows[0] || null;
}

async function fetchOfferByCodeForManufacturer(pool, offerCode, manufacturerId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_offers_effective WHERE offer_code = $1 AND manufacturer_id = $2',
    [offerCode, manufacturerId]
  );
  return rows[0] || null;
}

async function lockOfferByCode(client, offerCode) {
  const { rows } = await client.query('SELECT * FROM ebp_manufacturer_offers WHERE offer_code = $1 FOR UPDATE', [offerCode]);
  return rows[0] || null;
}

async function listOffersForBatch(pool, batchId) {
  const { rows } = await pool.query(
    `SELECT o.* FROM ebp_manufacturer_offers_effective o
     JOIN ebp_manufacturer_request_batch_items bi ON bi.id = o.batch_item_id
     WHERE bi.batch_id = $1 ORDER BY o.created_at ASC`,
    [batchId]
  );
  return rows;
}

async function listOffersForItem(pool, batchItemId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_offers_effective WHERE batch_item_id = $1 ORDER BY offer_revision ASC',
    [batchItemId]
  );
  return rows;
}

async function listTechnicalFields(pool, offerId) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_offer_technical_fields WHERE offer_id = $1', [offerId]);
  return rows;
}

async function fetchPackaging(pool, offerId) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_offer_packaging WHERE offer_id = $1', [offerId]);
  return rows[0] || null;
}

// ─── Documents ──────────────────────────────────────────────────────────────

async function insertDocument(pool, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_manufacturer_documents
      (manufacturer_id, batch_id, offer_id, technical_field_id, category, original_filename, mime_type,
       size_bytes, sha256_hash, storage_key, uploaded_by_factory_user_id, uploaded_by_declared_actor, identity_mechanism)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      payload.manufacturer_id,
      payload.batch_id || null,
      payload.offer_id || null,
      payload.technical_field_id || null,
      payload.category,
      payload.original_filename,
      payload.mime_type,
      payload.size_bytes,
      payload.sha256_hash,
      payload.storage_key,
      payload.uploaded_by_factory_user_id || null,
      payload.uploaded_by_declared_actor || null,
      payload.identity_mechanism,
    ]
  );
  return rows[0];
}

async function fetchDocument(pool, documentId) {
  const { rows } = await pool.query('SELECT * FROM ebp_manufacturer_documents WHERE id = $1', [documentId]);
  return rows[0] || null;
}

async function fetchDocumentForManufacturer(pool, documentId, manufacturerId) {
  const { rows } = await pool.query(
    'SELECT * FROM ebp_manufacturer_documents WHERE id = $1 AND manufacturer_id = $2',
    [documentId, manufacturerId]
  );
  return rows[0] || null;
}

// ─── Factory Users / Sessions / Invitations / Audit ────────────────────────

async function insertFactoryUser(pool, manufacturerId, payload) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_factory_users (manufacturer_id, email, full_name, role)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [manufacturerId, payload.email.toLowerCase(), payload.full_name, payload.role]
  );
  return rows[0];
}

async function fetchFactoryUserByEmail(pool, email) {
  const { rows } = await pool.query('SELECT * FROM ebp_factory_users WHERE email = $1', [email.toLowerCase()]);
  return rows[0] || null;
}

async function fetchFactoryUserById(pool, id) {
  const { rows } = await pool.query('SELECT * FROM ebp_factory_users WHERE id = $1', [id]);
  return rows[0] || null;
}

async function updateFactoryUserPassword(pool, userId, passwordHash) {
  const { rows } = await pool.query(
    `UPDATE ebp_factory_users
     SET password_hash = $2, status = 'ACTIVE', activated_at = COALESCE(activated_at, NOW()),
         failed_login_count = 0, locked_until = NULL, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId, passwordHash]
  );
  return rows[0];
}

async function updateFactoryUserStatus(pool, userId, status) {
  const { rows } = await pool.query(
    `UPDATE ebp_factory_users SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [userId, status]
  );
  return rows[0];
}

async function recordLoginSuccess(pool, userId) {
  await pool.query(
    `UPDATE ebp_factory_users SET failed_login_count = 0, locked_until = NULL, last_login_at = NOW(), updated_at = NOW() WHERE id = $1`,
    [userId]
  );
}

async function recordLoginFailure(pool, userId, maxFailedLogins, lockoutMs) {
  const { rows } = await pool.query(
    `UPDATE ebp_factory_users
     SET failed_login_count = failed_login_count + 1,
         locked_until = CASE WHEN failed_login_count + 1 >= $2 THEN NOW() + ($3 || ' milliseconds')::interval ELSE locked_until END,
         status = CASE WHEN failed_login_count + 1 >= $2 THEN 'LOCKED' ELSE status END,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId, maxFailedLogins, lockoutMs]
  );
  return rows[0];
}

async function insertInvitation(pool, factoryUserId, tokenHash, purpose, expiresAt) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_factory_user_invitations (factory_user_id, token_hash, purpose, expires_at)
     VALUES ($1,$2,$3,$4) RETURNING *`,
    [factoryUserId, tokenHash, purpose, expiresAt]
  );
  return rows[0];
}

async function fetchValidInvitationByHash(pool, tokenHash, purpose) {
  const { rows } = await pool.query(
    `SELECT * FROM ebp_factory_user_invitations
     WHERE token_hash = $1 AND purpose = $2 AND used_at IS NULL AND expires_at > NOW()`,
    [tokenHash, purpose]
  );
  return rows[0] || null;
}

async function markInvitationUsed(pool, invitationId) {
  await pool.query('UPDATE ebp_factory_user_invitations SET used_at = NOW() WHERE id = $1', [invitationId]);
}

async function insertSession(pool, factoryUserId, tokenHash, expiresAt, ipAddress, userAgent, csrfToken) {
  const { rows } = await pool.query(
    `INSERT INTO ebp_factory_sessions (factory_user_id, token_hash, expires_at, ip_address, user_agent, csrf_token)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [factoryUserId, tokenHash, expiresAt, ipAddress || null, userAgent || null, csrfToken]
  );
  return rows[0];
}

async function fetchLiveSessionByHash(pool, tokenHash) {
  const { rows } = await pool.query(
    `SELECT s.*, u.manufacturer_id, u.role, u.status AS user_status
     FROM ebp_factory_sessions s
     JOIN ebp_factory_users u ON u.id = s.factory_user_id
     WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > NOW()`,
    [tokenHash]
  );
  return rows[0] || null;
}

async function touchSession(pool, sessionId) {
  await pool.query('UPDATE ebp_factory_sessions SET last_used_at = NOW() WHERE id = $1', [sessionId]);
}

async function revokeSessionByHash(pool, tokenHash) {
  await pool.query('UPDATE ebp_factory_sessions SET revoked_at = NOW() WHERE token_hash = $1 AND revoked_at IS NULL', [tokenHash]);
}

// ADR-0035: every live session for a user is revoked on password
// change/reset, so a stolen/leaked session token stops working the
// moment the account holder resets their credentials — not just future
// logins requiring the new password.
async function revokeAllSessionsForUser(pool, factoryUserId) {
  await pool.query('UPDATE ebp_factory_sessions SET revoked_at = NOW() WHERE factory_user_id = $1 AND revoked_at IS NULL', [factoryUserId]);
}

async function insertAuditLog(pool, factoryUserId, eventType, ipAddress, metadata) {
  await pool.query(
    `INSERT INTO ebp_factory_user_audit_log (factory_user_id, event_type, ip_address, metadata)
     VALUES ($1,$2,$3,$4)`,
    [factoryUserId, eventType, ipAddress || null, metadata ? JSON.stringify(metadata) : null]
  );
}

module.exports = {
  fetchPassportRow,
  fetchManufacturerById,
  fetchManufacturerLocationIds,
  fetchQualifiedFamilies,
  batchCodeExists,
  insertBatch,
  fetchBatchByCode,
  fetchBatchByCodeForManufacturer,
  lockBatchByCode,
  listBatches,
  updateBatchStatus,
  insertBatchStatusHistory,
  listBatchStatusHistory,
  insertBatchItem,
  listBatchItems,
  fetchBatchItem,
  fetchBatchItemForBatch,
  offerCodeExists,
  lockActiveOfferForLineage,
  fetchLatestRevisionForLineage,
  insertOffer,
  insertTechnicalField,
  insertPackaging,
  updateOfferStatus,
  insertOfferStatusHistory,
  fetchOfferByCode,
  fetchOfferByCodeForManufacturer,
  lockOfferByCode,
  listOffersForBatch,
  listOffersForItem,
  listTechnicalFields,
  fetchPackaging,
  insertDocument,
  fetchDocument,
  fetchDocumentForManufacturer,
  insertFactoryUser,
  fetchFactoryUserByEmail,
  fetchFactoryUserById,
  updateFactoryUserPassword,
  updateFactoryUserStatus,
  recordLoginSuccess,
  recordLoginFailure,
  insertInvitation,
  fetchValidInvitationByHash,
  markInvitationUsed,
  insertSession,
  fetchLiveSessionByHash,
  touchSession,
  revokeSessionByHash,
  revokeAllSessionsForUser,
  insertAuditLog,
};
