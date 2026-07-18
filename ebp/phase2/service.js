'use strict';

// EBP Phase 2 — orchestration layer: validation + repository + the
// create/status-transition/child-entity lifecycle for the Manufacturer
// Registry. See docs/ebp/phases/phase-02-manufacturer-registry.md.
//
// Actor parameter convention (all public functions below): `actor` is
// always `{ declared_actor, identity_mechanism }` as produced by
// ebp/phase1/actor.js (reused directly, not duplicated — ADR per the
// project owner's explicit instruction). `declared_actor` is a
// self-reported label, not a verified identity.

const validation = require('./validation');
const repository = require('./repository');
const efmCode = require('./efm-code');

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

// ─── Manufacturer lifecycle ───────────────────────────────────────────────

async function createManufacturer(pool, payload, actor) {
  const errors = validation.validateManufacturerPayload(payload);
  if (errors.length) throw new ValidationError(errors);

  const code = await efmCode.generateUniqueManufacturerCode((candidate) => repository.manufacturerCodeExists(pool, candidate));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const row = await repository.insertManufacturer(client, payload, code, actor);
    await repository.insertManufacturerStatusHistory(client, row.id, null, row.status, actor, 'created');
    await client.query('COMMIT');
    return row;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function listManufacturers(pool, filters) {
  return repository.listManufacturers(pool, filters);
}

async function getManufacturer(pool, code) {
  const row = await repository.fetchManufacturerByCode(pool, code);
  if (!row) throw new NotFoundError(`manufacturer ${code} not found`);
  return row;
}

async function updateManufacturer(pool, code, payload) {
  const errors = validation.validateManufacturerUpdate(payload);
  if (errors.length) throw new ValidationError(errors);

  const existing = await getManufacturer(pool, code);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const fields = {};
    for (const key of validation.MANUFACTURER_MUTABLE_FIELDS) {
      if (payload[key] !== undefined) fields[key] = payload[key];
    }
    const row = await repository.updateManufacturerFields(client, existing.id, fields);
    await client.query('COMMIT');
    return row;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Atomic status transition: locks the row, validates against the state
// machine (ADR-0020), writes the new status + append-only history entry in
// one transaction. No generic status-set path exists outside this function.
async function transitionManufacturerStatus(pool, code, toStatus, actor, reason, evidenceReference) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const row = await repository.lockManufacturerByCode(client, code);
    if (!row) throw new NotFoundError(`manufacturer ${code} not found`);

    const errors = validation.validateManufacturerTransition(row.status, toStatus);
    if (errors.length) throw new ConflictError(errors.join('; '));

    const retiredAt = toStatus === 'RETIRED' ? new Date() : row.retired_at;
    const updated = await repository.updateManufacturerStatus(client, row.id, toStatus, reason, retiredAt);
    await repository.insertManufacturerStatusHistory(client, row.id, row.status, toStatus, actor, reason, evidenceReference);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getManufacturerHistory(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  return repository.listManufacturerStatusHistory(pool, manufacturer.id);
}

// ─── Contacts ─────────────────────────────────────────────────────────────

async function addContact(pool, code, payload) {
  const errors = validation.validateContactPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  try {
    return await repository.insertContact(pool, manufacturer.id, payload);
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError(`manufacturer ${code} already has an active primary contact`);
    }
    throw err;
  }
}

async function updateContact(pool, code, contactId, payload) {
  const manufacturer = await getManufacturer(pool, code);
  const existing = await repository.fetchContact(pool, manufacturer.id, contactId);
  if (!existing) throw new NotFoundError(`contact ${contactId} not found for manufacturer ${code}`);

  const merged = { ...existing, ...payload };
  const errors = validation.validateContactPayload(merged);
  if (errors.length) throw new ValidationError(errors);

  const allowedFields = ['full_name', 'title', 'email', 'phone', 'preferred_language', 'is_primary', 'is_technical', 'is_commercial', 'is_active'];
  const fields = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) fields[key] = payload[key];
  }
  try {
    return await repository.updateContact(pool, manufacturer.id, contactId, fields);
  } catch (err) {
    if (err.code === '23505') {
      throw new ConflictError(`manufacturer ${code} already has an active primary contact`);
    }
    throw err;
  }
}

async function listContacts(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  return repository.listContacts(pool, manufacturer.id);
}

// ─── Locations ────────────────────────────────────────────────────────────

async function addLocation(pool, code, payload) {
  const errors = validation.validateLocationPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  return repository.insertLocation(pool, manufacturer.id, payload);
}

async function updateLocation(pool, code, locationId, payload) {
  const manufacturer = await getManufacturer(pool, code);
  const existing = await repository.fetchLocation(pool, manufacturer.id, locationId);
  if (!existing) throw new NotFoundError(`location ${locationId} not found for manufacturer ${code}`);

  const merged = { ...existing, ...payload };
  const errors = validation.validateLocationPayload(merged);
  if (errors.length) throw new ValidationError(errors);

  const allowedFields = ['location_code', 'location_type', 'country_code', 'region', 'city', 'address_line', 'postal_code', 'timezone', 'is_active'];
  const fields = {};
  for (const key of allowedFields) {
    if (payload[key] !== undefined) fields[key] = payload[key];
  }
  return repository.updateLocation(pool, manufacturer.id, locationId, fields);
}

async function listLocations(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  return repository.listLocations(pool, manufacturer.id);
}

// ─── Certifications ───────────────────────────────────────────────────────

async function addCertification(pool, code, payload) {
  const errors = validation.validateCertificationPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  if (payload.location_id) {
    const location = await repository.fetchLocation(pool, manufacturer.id, payload.location_id);
    if (!location) throw new ValidationError([`location_id ${payload.location_id} does not belong to manufacturer ${code}`]);
  }
  try {
    const inserted = await repository.insertCertification(pool, manufacturer.id, payload);
    return repository.fetchCertificationEffective(pool, manufacturer.id, inserted.id);
  } catch (err) {
    if (err.code === '23503') {
      throw new ValidationError([`location_id ${payload.location_id} does not belong to manufacturer ${code}`]);
    }
    throw err;
  }
}

async function verifyCertification(pool, code, certificationId, payload) {
  const errors = validation.validateCertificationVerification(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  const existing = await repository.fetchCertificationEffective(pool, manufacturer.id, certificationId);
  if (!existing) throw new NotFoundError(`certification ${certificationId} not found for manufacturer ${code}`);
  await repository.updateCertificationStatus(pool, manufacturer.id, certificationId, payload.status, payload.evidence_reference);
  return repository.fetchCertificationEffective(pool, manufacturer.id, certificationId);
}

async function listCertifications(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  return repository.listCertificationsEffective(pool, manufacturer.id);
}

// ─── Capabilities ─────────────────────────────────────────────────────────

async function addCapability(pool, code, payload) {
  const errors = validation.validateCapabilityPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  if (payload.location_id) {
    const location = await repository.fetchLocation(pool, manufacturer.id, payload.location_id);
    if (!location) throw new ValidationError([`location_id ${payload.location_id} does not belong to manufacturer ${code}`]);
  }
  try {
    return await repository.insertCapability(pool, manufacturer.id, payload);
  } catch (err) {
    if (err.code === '23503') {
      throw new ValidationError([`location_id ${payload.location_id} does not belong to manufacturer ${code}`]);
    }
    throw err;
  }
}

async function verifyCapability(pool, code, capabilityId, payload, actor) {
  const errors = validation.validateCapabilityVerification(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);
  const existing = await repository.fetchCapability(pool, manufacturer.id, capabilityId);
  if (!existing) throw new NotFoundError(`capability ${capabilityId} not found for manufacturer ${code}`);
  return repository.updateCapabilityReview(pool, manufacturer.id, capabilityId, payload.review_status, actor.declared_actor);
}

async function listCapabilities(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  return repository.listCapabilities(pool, manufacturer.id);
}

// ─── Qualifications ───────────────────────────────────────────────────────

async function addQualification(pool, code, payload) {
  const errors = validation.validateQualificationPayload(payload);
  if (errors.length) throw new ValidationError(errors);
  const manufacturer = await getManufacturer(pool, code);

  const location = await repository.fetchLocation(pool, manufacturer.id, payload.location_id);
  if (!location) throw new ValidationError([`location_id ${payload.location_id} does not belong to manufacturer ${code}`]);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const qualification = await repository.insertQualification(client, manufacturer.id, payload);
    const conditions = [];
    for (const condition of payload.conditions || []) {
      // eslint-disable-next-line no-await-in-loop
      conditions.push(await repository.insertQualificationCondition(client, qualification.id, condition));
    }
    await client.query('COMMIT');
    return { ...qualification, conditions };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function transitionQualificationStatus(pool, code, qualificationId, toStatus, actor, reason) {
  const manufacturer = await getManufacturer(pool, code);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const qualification = await repository.lockQualification(client, manufacturer.id, qualificationId);
    if (!qualification) throw new NotFoundError(`qualification ${qualificationId} not found for manufacturer ${code}`);

    const errors = validation.validateQualificationTransition(qualification.status, toStatus);
    if (errors.length) throw new ConflictError(errors.join('; '));

    const updated = await repository.updateQualificationStatus(client, qualificationId, toStatus);
    await client.query('COMMIT');
    return updated;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getQualificationWithConditions(pool, code, qualificationId) {
  const manufacturer = await getManufacturer(pool, code);
  const qualification = await repository.fetchQualification(pool, manufacturer.id, qualificationId);
  if (!qualification) throw new NotFoundError(`qualification ${qualificationId} not found for manufacturer ${code}`);
  const conditions = await repository.listQualificationConditions(pool, qualificationId);
  return { ...qualification, conditions };
}

async function listQualifications(pool, code) {
  const manufacturer = await getManufacturer(pool, code);
  const qualifications = await repository.listQualifications(pool, manufacturer.id);
  const withConditions = [];
  for (const qualification of qualifications) {
    // eslint-disable-next-line no-await-in-loop
    const conditions = await repository.listQualificationConditions(pool, qualification.id);
    withConditions.push({ ...qualification, conditions });
  }
  return withConditions;
}

module.exports = {
  ValidationError,
  NotFoundError,
  ConflictError,
  createManufacturer,
  listManufacturers,
  getManufacturer,
  updateManufacturer,
  transitionManufacturerStatus,
  getManufacturerHistory,
  addContact,
  updateContact,
  listContacts,
  addLocation,
  updateLocation,
  listLocations,
  addCertification,
  verifyCertification,
  listCertifications,
  addCapability,
  verifyCapability,
  listCapabilities,
  addQualification,
  transitionQualificationStatus,
  getQualificationWithConditions,
  listQualifications,
};
