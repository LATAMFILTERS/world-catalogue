'use strict';

// EBP Phase 2 — internal API surface for the Manufacturer Registry. All 16
// routes here are internal-only (mounted behind requireAdmin in server.js,
// same as every other admin endpoint and identical to
// ebp/phase1/passports.routes.js's convention) — see
// docs/ebp/phases/phase-02-manufacturer-registry.md "Internal API Surface".
//
// Route inventory (keep this list and the router below in sync):
//   1.  POST   /
//   2.  GET    /
//   3.  GET    /:manufacturer_code
//   4.  PATCH  /:manufacturer_code
//   5.  POST   /:manufacturer_code/status
//   6.  GET    /:manufacturer_code/history
//   7.  POST   /:manufacturer_code/contacts
//   8.  PATCH  /:manufacturer_code/contacts/:contact_id
//   9.  POST   /:manufacturer_code/locations
//   10. PATCH  /:manufacturer_code/locations/:location_id
//   11. POST   /:manufacturer_code/certifications
//   12. POST   /:manufacturer_code/certifications/:certification_id/verify
//   13. POST   /:manufacturer_code/capabilities
//   14. POST   /:manufacturer_code/capabilities/:capability_id/verify
//   15. POST   /:manufacturer_code/qualifications
//   16. POST   /:manufacturer_code/qualifications/:qualification_id/status

const express = require('express');
const service = require('./service');
const { resolveDeclaredActor } = require('../phase1/actor');
const dto = require('./dto');

function errorToResponse(err) {
  if (err instanceof service.ValidationError) return { status: 400, body: { error: 'validation_failed', details: err.errors } };
  if (err instanceof service.NotFoundError) return { status: 404, body: { error: 'not_found', message: err.message } };
  if (err instanceof service.ConflictError) return { status: 409, body: { error: 'conflict', message: err.message } };
  return { status: 500, body: { error: 'internal_error' } };
}

// declared_actor is a self-reported label from the x-ebp-actor header (or
// the explicit default), never a verified identity. Reused directly from
// ebp/phase1/actor.js — not duplicated.
function actorFrom(req) {
  return resolveDeclaredActor(req.get('x-ebp-actor'));
}

function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/manufacturers] request failed', err);
      res.status(status).json(body);
    }
  };
}

// Factory: createManufacturersRouter(pool) — pool is the existing `pg` Pool
// instance server.js already constructs. This module never creates its own
// connection.
function createManufacturersRouter(pool) {
  const router = express.Router();

  router.post(
    '/',
    handle(async (req, res) => {
      const row = await service.createManufacturer(pool, req.body || {}, actorFrom(req));
      res.status(201).json(dto.toInternalManufacturerDTO(row));
    })
  );

  router.get(
    '/',
    handle(async (req, res) => {
      const { status, country_code, q, limit, offset } = req.query;
      const rows = await service.listManufacturers(pool, {
        status,
        country_code,
        q,
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });
      res.json({ manufacturers: rows.map(dto.toInternalManufacturerDTO) });
    })
  );

  router.get(
    '/:manufacturer_code',
    handle(async (req, res) => {
      const row = await service.getManufacturer(pool, req.params.manufacturer_code);
      res.json(dto.toInternalManufacturerDTO(row));
    })
  );

  router.patch(
    '/:manufacturer_code',
    handle(async (req, res) => {
      const row = await service.updateManufacturer(pool, req.params.manufacturer_code, req.body || {});
      res.json(dto.toInternalManufacturerDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/status',
    handle(async (req, res) => {
      const { status, reason, evidence_reference } = req.body || {};
      const row = await service.transitionManufacturerStatus(
        pool,
        req.params.manufacturer_code,
        status,
        actorFrom(req),
        reason,
        evidence_reference
      );
      res.json(dto.toInternalManufacturerDTO(row));
    })
  );

  router.get(
    '/:manufacturer_code/history',
    handle(async (req, res) => {
      const rows = await service.getManufacturerHistory(pool, req.params.manufacturer_code);
      res.json({ manufacturer_code: req.params.manufacturer_code, history: rows.map(dto.toInternalStatusHistoryDTO) });
    })
  );

  router.post(
    '/:manufacturer_code/contacts',
    handle(async (req, res) => {
      const row = await service.addContact(pool, req.params.manufacturer_code, req.body || {});
      res.status(201).json(dto.toInternalContactDTO(row));
    })
  );

  router.patch(
    '/:manufacturer_code/contacts/:contact_id',
    handle(async (req, res) => {
      const row = await service.updateContact(pool, req.params.manufacturer_code, req.params.contact_id, req.body || {});
      res.json(dto.toInternalContactDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/locations',
    handle(async (req, res) => {
      const row = await service.addLocation(pool, req.params.manufacturer_code, req.body || {});
      res.status(201).json(dto.toInternalLocationDTO(row));
    })
  );

  router.patch(
    '/:manufacturer_code/locations/:location_id',
    handle(async (req, res) => {
      const row = await service.updateLocation(pool, req.params.manufacturer_code, req.params.location_id, req.body || {});
      res.json(dto.toInternalLocationDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/certifications',
    handle(async (req, res) => {
      const row = await service.addCertification(pool, req.params.manufacturer_code, req.body || {});
      res.status(201).json(dto.toInternalCertificationDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/certifications/:certification_id/verify',
    handle(async (req, res) => {
      const row = await service.verifyCertification(pool, req.params.manufacturer_code, req.params.certification_id, req.body || {});
      res.json(dto.toInternalCertificationDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/capabilities',
    handle(async (req, res) => {
      const row = await service.addCapability(pool, req.params.manufacturer_code, req.body || {});
      res.status(201).json(dto.toInternalCapabilityDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/capabilities/:capability_id/verify',
    handle(async (req, res) => {
      const row = await service.verifyCapability(pool, req.params.manufacturer_code, req.params.capability_id, req.body || {}, actorFrom(req));
      res.json(dto.toInternalCapabilityDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/qualifications',
    handle(async (req, res) => {
      const row = await service.addQualification(pool, req.params.manufacturer_code, req.body || {});
      res.status(201).json(dto.toInternalQualificationDTO(row));
    })
  );

  router.post(
    '/:manufacturer_code/qualifications/:qualification_id/status',
    handle(async (req, res) => {
      const { status, reason } = req.body || {};
      await service.transitionQualificationStatus(pool, req.params.manufacturer_code, req.params.qualification_id, status, actorFrom(req), reason);
      const row = await service.getQualificationWithConditions(pool, req.params.manufacturer_code, req.params.qualification_id);
      res.json(dto.toInternalQualificationDTO(row));
    })
  );

  return router;
}

module.exports = createManufacturersRouter;
