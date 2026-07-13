'use strict';

// EBP Phase 3 — orchestration layer. See
// docs/ebp/phases/phase-03-supplier-portal.md and ADR-0023 through
// ADR-0029.
//
// Actor convention: `actor` is always `{ declared_actor, identity_mechanism,
// factory_user_id? }`. Internal-surface actors come from
// ebp/phase1/actor.js (reused, ADR-0002-adjacent discipline) with
// identity_mechanism = 'ADMIN_KEY_SHARED'. Factory-surface actors carry a
// real factory_user_id with identity_mechanism = 'FACTORY_SESSION'.

const crypto = require('node:crypto');
const validation = require('./validation');
const repository = require('./repository');
const codes = require('./codes');
const factoryAuth = require('./factory-auth');
const { toManufacturerPassportDTO } = require('../phase1/dto');

class ValidationError extends Error {
  constructor(errors) {
    super(`Validation failed: ${errors.join('; ')}`);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}
class ConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ConflictError';
  }
}
class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// ─── Eligibility gate (ADR-0024) ───────────────────────────────────────────

async function assertBatchEligibleToSend(pool, batch, batchItems) {
  const manufacturer = await repository.fetchManufacturerById(pool, batch.manufacturer_id);
  if (!manufacturer) throw new NotFoundError(`manufacturer ${batch.manufacturer_id} not found`);
  if (['SUSPENDED', 'RETIRED'].includes(manufacturer.status)) {
    throw new ConflictError(`manufacturer is ${manufacturer.status}; cannot send any batch to it`);
  }
  if (batch.purpose !== 'PRODUCTION_CANDIDATE') {
    return; // CAPABILITY_ASSESSMENT / COMMERCIAL_QUOTATION: no family-qualification check
  }
  const qualifications = await repository.fetchQualifiedFamilies(pool, batch.manufacturer_id);
  const qualifiedPairs = new Set(qualifications.map((q) => `${q.product_category}::${q.product_subtype}`));
  const unqualified = [];
  for (const item of batchItems) {
    const snapshot = item.manufacturer_visible_snapshot;
    const key = `${snapshot.product_category}::${snapshot.product_subtype}`;
    if (!qualifiedPairs.has(key)) {
      unqualified.push(`${item.elimfilters_code} (${snapshot.product_category}/${snapshot.product_subtype})`);
    }
  }
  if (unqualified.length) {
    throw new ConflictError(
      `manufacturer is not QUALIFIED/CONDITIONAL for: ${unqualified.join(', ')} — a PRODUCTION_CANDIDATE batch ` +
        'cannot be sent while any item is unqualified (ADR-0024)'
    );
  }
}

// ─── Batches ────────────────────────────────────────────────────────────────

async function createBatch(pool, payload, actor) {
  const errors = validation.validateBatchPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await repository.fetchManufacturerById(pool, payload.manufacturer_id);
  if (!manufacturer) throw new ValidationError([`manufacturer_id ${payload.manufacturer_id} does not exist`]);

  const code = await codes.generateUniqueBatchCode((candidate) => repository.batchCodeExists(pool, candidate));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const row = await repository.insertBatch(client, payload, code, actor);
    await repository.insertBatchStatusHistory(client, row.id, null, row.status, actor, 'created');
    await client.query('COMMIT');
    return row;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getBatch(pool, batchCode) {
  const row = await repository.fetchBatchByCode(pool, batchCode);
  if (!row) throw new NotFoundError(`batch ${batchCode} not found`);
  return row;
}

async function getBatchForManufacturer(pool, batchCode, manufacturerId) {
  const row = await repository.fetchBatchByCodeForManufacturer(pool, batchCode, manufacturerId);
  if (!row) throw new NotFoundError(`batch ${batchCode} not found`);
  return row;
}

async function addBatchItem(pool, batchCode, payload) {
  const errors = validation.validateBatchItemPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const batch = await getBatch(pool, batchCode);
  if (batch.status !== 'DRAFT') {
    throw new ConflictError(`batch ${batchCode} is ${batch.status}; items can only be added while DRAFT`);
  }
  const passportRow = await repository.fetchPassportRow(pool, payload.passport_id);
  if (!passportRow) throw new ValidationError([`passport_id ${payload.passport_id} does not exist`]);

  const snapshot = toManufacturerPassportDTO(passportRow);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const item = await repository.insertBatchItem(client, batch.id, passportRow, snapshot);
    await client.query('COMMIT');
    return item;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      throw new ConflictError(`passport ${payload.passport_id} is already an item of batch ${batchCode}`);
    }
    throw err;
  } finally {
    client.release();
  }
}

async function transitionBatchStatus(pool, batchCode, toStatus, actor, reason) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const batch = await repository.lockBatchByCode(client, batchCode);
    if (!batch) throw new NotFoundError(`batch ${batchCode} not found`);

    const errors = validation.validateBatchTransition(batch.status, toStatus);
    if (errors.length) throw new ConflictError(errors.join('; '));

    if (toStatus === 'SENT') {
      const items = await repository.listBatchItems(client, batch.id);
      if (!items.length) throw new ConflictError(`batch ${batchCode} has no items; cannot send an empty batch`);
      await assertBatchEligibleToSend(client, batch, items);
    }

    const updated = await repository.updateBatchStatus(client, batch.id, toStatus, toStatus === 'SENT' ? new Date() : null);
    await repository.insertBatchStatusHistory(client, batch.id, batch.status, toStatus, actor, reason);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getBatchHistory(pool, batchCode) {
  const batch = await getBatch(pool, batchCode);
  return repository.listBatchStatusHistory(pool, batch.id);
}

async function listBatches(pool, filters) {
  return repository.listBatches(pool, filters);
}

async function listBatchItems(pool, batchCode) {
  const batch = await getBatch(pool, batchCode);
  return repository.listBatchItems(pool, batch.id);
}

// ─── Offers ─────────────────────────────────────────────────────────────────

async function createOfferRevision(pool, batchCode, itemId, payload, actor) {
  const errors = validation.validateOfferPayload(payload);
  if (errors.length) throw new ValidationError(errors);

  const batch = await getBatch(pool, batchCode);
  const item = await repository.fetchBatchItemForBatch(pool, itemId, batch.id);
  if (!item) throw new NotFoundError(`batch item ${itemId} not found for batch ${batchCode}`);

  // ADR-0032: field_name always comes from the frozen PEP snapshot, never
  // freely entered; every applicable field must be answered before submit.
  const fieldErrors = validation.validateOfferFieldsAgainstSnapshot(
    item.manufacturer_visible_snapshot,
    payload.technical_fields || [],
    !!payload.submit
  );
  if (fieldErrors.length) throw new ValidationError(fieldErrors);

  const code = await codes.generateUniqueOfferCode((candidate) => repository.offerCodeExists(pool, candidate));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const activeOffer = await repository.lockActiveOfferForLineage(client, item.passport_id, item.engineering_revision, batch.manufacturer_id);
    const latest = await repository.fetchLatestRevisionForLineage(client, item.passport_id, item.engineering_revision, batch.manufacturer_id);
    const nextRevision = latest ? latest.offer_revision + 1 : 1;

    const lateSubmission = !!(payload.submit && batch.response_due_at && new Date() > new Date(batch.response_due_at));

    // The prior active offer must be superseded BEFORE the new one is
    // inserted as SUBMITTED — the partial unique index
    // (uq_ebp_offers_one_active_lineage) is checked at statement time, not
    // transaction-commit time, so a moment with two active rows for the
    // same lineage would violate it even inside this same transaction.
    if (activeOffer) {
      await repository.updateOfferStatus(client, activeOffer.id, 'SUPERSEDED');
      await repository.insertOfferStatusHistory(client, activeOffer.id, activeOffer.status, 'SUPERSEDED', actor, `superseded by revision ${nextRevision}`);
    }

    const offer = await repository.insertOffer(
      client,
      code,
      { ...payload, manufacturer_id: batch.manufacturer_id, supersedes_offer_id: activeOffer ? activeOffer.id : null },
      { id: item.id, manufacturer_id: batch.manufacturer_id, passport_id: item.passport_id, engineering_revision: item.engineering_revision },
      actor,
      nextRevision,
      lateSubmission
    );

    for (const field of payload.technical_fields || []) {
      // eslint-disable-next-line no-await-in-loop
      await repository.insertTechnicalField(client, offer.id, field);
    }
    await repository.insertPackaging(client, offer.id, payload.packaging);

    await repository.insertOfferStatusHistory(client, offer.id, null, offer.status, actor, payload.submit ? 'submitted' : 'created draft');

    if (payload.submit) {
      await client.query(
        `UPDATE ebp_manufacturer_request_batch_items SET status = 'RESPONDED', responded_at = NOW() WHERE id = $1`,
        [item.id]
      );
    }

    await client.query('COMMIT');
    return offer;
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505' && /uq_ebp_offers_one_active_lineage/.test(err.message || '')) {
      throw new ConflictError('a concurrent submission already created an active offer for this lineage; retry');
    }
    throw err;
  } finally {
    client.release();
  }
}

async function transitionOfferStatus(pool, offerCode, toStatus, actor, reason) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const offer = await repository.lockOfferByCode(client, offerCode);
    if (!offer) throw new NotFoundError(`offer ${offerCode} not found`);

    const errors = validation.validateOfferTransition(offer.status, toStatus);
    if (errors.length) throw new ConflictError(errors.join('; '));

    const updated = await repository.updateOfferStatus(client, offer.id, toStatus);
    await repository.insertOfferStatusHistory(client, offer.id, offer.status, toStatus, actor, reason);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOfferWithDetail(pool, offerCode) {
  const offer = await repository.fetchOfferByCode(pool, offerCode);
  if (!offer) throw new NotFoundError(`offer ${offerCode} not found`);
  const [technical_fields, packaging] = await Promise.all([
    repository.listTechnicalFields(pool, offer.id),
    repository.fetchPackaging(pool, offer.id),
  ]);
  return { ...offer, technical_fields, packaging };
}

async function listOffersForBatch(pool, batchCode) {
  const batch = await getBatch(pool, batchCode);
  return repository.listOffersForBatch(pool, batch.id);
}

async function listOffersForItem(pool, batchCode, itemId) {
  const batch = await getBatch(pool, batchCode);
  const item = await repository.fetchBatchItemForBatch(pool, itemId, batch.id);
  if (!item) throw new NotFoundError(`batch item ${itemId} not found for batch ${batchCode}`);
  return repository.listOffersForItem(pool, item.id);
}

// ─── Documents (ADR-0027) ───────────────────────────────────────────────────

async function uploadDocument(pool, storageAdapter, { manufacturerId, batchId, offerId, technicalFieldId, category, originalFilename, mimeType, buffer, actor }) {
  const errors = validation.validateDocumentUpload({ mimeType, sizeBytes: buffer.length });
  if (!validation.DOCUMENT_CATEGORIES.has(category)) errors.push('category is invalid');
  if (errors.length) throw new ValidationError(errors);

  const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
  const documentId = crypto.randomUUID();
  const { buildStorageKey } = require('./storage');
  const storageKey = buildStorageKey(manufacturerId, documentId);

  await storageAdapter.put(storageKey, buffer);

  try {
    return await repository.insertDocument(pool, {
      manufacturer_id: manufacturerId,
      batch_id: batchId || null,
      offer_id: offerId || null,
      technical_field_id: technicalFieldId || null,
      category,
      original_filename: originalFilename,
      mime_type: mimeType,
      size_bytes: buffer.length,
      sha256_hash: sha256Hash,
      storage_key: storageKey,
      uploaded_by_factory_user_id: actor.factory_user_id || null,
      uploaded_by_declared_actor: actor.declared_actor || null,
      identity_mechanism: actor.identity_mechanism,
    });
  } catch (err) {
    await storageAdapter.remove(storageKey);
    throw err;
  }
}

async function getDocumentForDownload(pool, storageAdapter, documentId, manufacturerId) {
  const document = manufacturerId
    ? await repository.fetchDocumentForManufacturer(pool, documentId, manufacturerId)
    : await repository.fetchDocument(pool, documentId);
  if (!document) throw new NotFoundError(`document ${documentId} not found`);
  const buffer = await storageAdapter.get(document.storage_key);
  return { document, buffer };
}

// ─── Factory Users / Auth (ADR-0023) ───────────────────────────────────────

async function inviteFactoryUser(pool, manufacturerId, payload, actor) {
  const errors = validation.validateFactoryUserPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await repository.fetchManufacturerById(pool, manufacturerId);
  if (!manufacturer) throw new ValidationError([`manufacturer_id ${manufacturerId} does not exist`]);

  let user;
  try {
    user = await repository.insertFactoryUser(pool, manufacturerId, payload);
  } catch (err) {
    if (err.code === '23505') throw new ConflictError(`a factory user with email ${payload.email} already exists`);
    throw err;
  }
  const { raw, hash } = factoryAuth.generateOpaqueToken();
  await repository.insertInvitation(pool, user.id, hash, 'INVITE', factoryAuth.inviteExpiryFromNow());
  await repository.insertAuditLog(pool, user.id, 'INVITED', null, { invited_by: actor.declared_actor });
  return { user, inviteToken: raw };
}

async function disableFactoryUser(pool, userId, actor) {
  const user = await repository.fetchFactoryUserById(pool, userId);
  if (!user) throw new NotFoundError(`factory user ${userId} not found`);
  const updated = await repository.updateFactoryUserStatus(pool, userId, 'DISABLED');
  await repository.insertAuditLog(pool, userId, 'DISABLED', null, { disabled_by: actor.declared_actor });
  return updated;
}

async function acceptInvite(pool, rawToken, password) {
  const pwErrors = validation.validatePasswordStrength(password);
  if (pwErrors.length) throw new ValidationError(pwErrors);
  const hash = factoryAuth.hashToken(rawToken);
  const invitation = await repository.fetchValidInvitationByHash(pool, hash, 'INVITE');
  if (!invitation) throw new UnauthorizedError('invite token is invalid, expired, or already used');

  const passwordHash = await factoryAuth.hashPassword(password);
  const user = await repository.updateFactoryUserPassword(pool, invitation.factory_user_id, passwordHash);
  await repository.markInvitationUsed(pool, invitation.id);
  await repository.insertAuditLog(pool, user.id, 'ACTIVATED', null, {});
  return user;
}

async function requestPasswordReset(pool, email) {
  const user = await repository.fetchFactoryUserByEmail(pool, email);
  if (!user || user.status === 'DISABLED') {
    // Never confirm/deny account existence to the caller.
    return null;
  }
  const { raw, hash } = factoryAuth.generateOpaqueToken();
  await repository.insertInvitation(pool, user.id, hash, 'PASSWORD_RESET', factoryAuth.passwordResetExpiryFromNow());
  await repository.insertAuditLog(pool, user.id, 'PASSWORD_RESET_REQUESTED', null, {});
  return { user, resetToken: raw };
}

async function resetPassword(pool, rawToken, password) {
  const pwErrors = validation.validatePasswordStrength(password);
  if (pwErrors.length) throw new ValidationError(pwErrors);
  const hash = factoryAuth.hashToken(rawToken);
  const invitation = await repository.fetchValidInvitationByHash(pool, hash, 'PASSWORD_RESET');
  if (!invitation) throw new UnauthorizedError('reset token is invalid, expired, or already used');

  const passwordHash = await factoryAuth.hashPassword(password);
  const user = await repository.updateFactoryUserPassword(pool, invitation.factory_user_id, passwordHash);
  await repository.markInvitationUsed(pool, invitation.id);
  await repository.insertAuditLog(pool, user.id, 'PASSWORD_RESET_COMPLETED', null, {});
  return user;
}

async function login(pool, email, password, requestMeta = {}) {
  const loginErrors = validation.validateLoginPayload({ email, password });
  if (loginErrors.length) throw new ValidationError(loginErrors);

  const user = await repository.fetchFactoryUserByEmail(pool, email);
  if (!user) throw new UnauthorizedError('invalid email or password');

  if (user.status === 'DISABLED') throw new UnauthorizedError('invalid email or password');
  if (user.status === 'LOCKED' && user.locked_until && new Date(user.locked_until) > new Date()) {
    throw new UnauthorizedError('account is temporarily locked; try again later');
  }
  if (user.status === 'INVITED' || !user.password_hash) throw new UnauthorizedError('invalid email or password');

  const valid = await factoryAuth.verifyPassword(password, user.password_hash);
  if (!valid) {
    await repository.recordLoginFailure(pool, user.id, factoryAuth.MAX_FAILED_LOGINS, factoryAuth.LOCKOUT_MS);
    const failureCount = user.failed_login_count + 1;
    await repository.insertAuditLog(pool, user.id, failureCount >= factoryAuth.MAX_FAILED_LOGINS ? 'LOCKOUT' : 'LOGIN_FAILURE', requestMeta.ip, {});
    throw new UnauthorizedError('invalid email or password');
  }

  await repository.recordLoginSuccess(pool, user.id);
  await repository.insertAuditLog(pool, user.id, 'LOGIN_SUCCESS', requestMeta.ip, {});

  const { raw, hash } = factoryAuth.generateOpaqueToken();
  await repository.insertSession(pool, user.id, hash, factoryAuth.sessionExpiryFromNow(), requestMeta.ip, requestMeta.userAgent);
  return { user, sessionToken: raw };
}

async function logout(pool, rawToken, userId) {
  await repository.revokeSessionByHash(pool, factoryAuth.hashToken(rawToken));
  await repository.insertAuditLog(pool, userId, 'SESSION_REVOKED', null, {});
}

async function resolveSession(pool, rawToken) {
  const hash = factoryAuth.hashToken(rawToken);
  const session = await repository.fetchLiveSessionByHash(pool, hash);
  if (!session || session.user_status === 'DISABLED') return null;
  await repository.touchSession(pool, session.id);
  return { factory_user_id: session.factory_user_id, manufacturer_id: session.manufacturer_id, role: session.role };
}

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  createBatch,
  getBatch,
  getBatchForManufacturer,
  addBatchItem,
  transitionBatchStatus,
  getBatchHistory,
  listBatches,
  listBatchItems,
  createOfferRevision,
  transitionOfferStatus,
  getOfferWithDetail,
  listOffersForBatch,
  listOffersForItem,
  uploadDocument,
  getDocumentForDownload,
  inviteFactoryUser,
  disableFactoryUser,
  acceptInvite,
  requestPasswordReset,
  resetPassword,
  login,
  logout,
  resolveSession,
};
