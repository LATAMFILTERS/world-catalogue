'use strict';

// EBP Phase 1 — internal API surface for the Product Engineering Passport.
// All ten endpoints here are internal-only (mounted behind requireAdmin in
// server.js, same as every other admin endpoint) — see
// docs/ebp/phases/phase-01-product-engineering-passport.md "Permissions".

const express = require('express');
const repository = require('./repository');
const service = require('./service');
const { toInternalPassportDTO } = require('./dto');

function errorToResponse(err) {
  if (err instanceof service.ValidationError) return { status: 400, body: { error: 'validation_failed', details: err.errors } };
  if (err instanceof service.NotFoundError) return { status: 404, body: { error: 'not_found', message: err.message } };
  if (err instanceof service.ConflictError) return { status: 409, body: { error: 'conflict', message: err.message } };
  return { status: 500, body: { error: 'internal_error' } };
}

function actorFrom(req) {
  return req.get('x-ebp-actor') || 'unknown-engineering-actor';
}

// Factory: createPassportsRouter(pool) — pool is the existing `pg` Pool
// instance server.js already constructs. This module never creates its own
// connection.
function createPassportsRouter(pool) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const passportId = await service.createPassport(pool, req.body || {}, actorFrom(req));
      const row = await repository.fetchPassportRow(pool, passportId);
      res.status(201).json(toInternalPassportDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/passports] create failed', err);
      res.status(status).json(body);
    }
  });

  router.get('/applicability-matrix', async (req, res) => {
    const { product_category, product_subtype } = req.query;
    if (!product_category || !product_subtype) {
      return res.status(400).json({ error: 'validation_failed', details: ['product_category and product_subtype are required query params'] });
    }
    try {
      const rows = await repository.fetchApplicabilityMatrix(pool, product_category, product_subtype);
      res.json({ product_category, product_subtype, fields: rows });
    } catch (err) {
      console.error('[ebp/passports] applicability-matrix failed', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/:sku', async (req, res) => {
    try {
      const row = (await repository.fetchActivePassport(pool, req.params.sku)) || (await repository.fetchLatestRevision(pool, req.params.sku));
      if (!row) return res.status(404).json({ error: 'not_found' });
      res.json(toInternalPassportDTO(row));
    } catch (err) {
      console.error('[ebp/passports] get failed', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/:sku/revisions', async (req, res) => {
    try {
      const rows = await repository.listRevisions(pool, req.params.sku);
      res.json({ elimfilters_code: req.params.sku, revisions: rows });
    } catch (err) {
      console.error('[ebp/passports] list revisions failed', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.get('/:sku/revisions/:revision', async (req, res) => {
    try {
      const revisionNumber = Number(req.params.revision);
      if (!Number.isInteger(revisionNumber)) {
        return res.status(400).json({ error: 'validation_failed', details: ['revision must be an integer'] });
      }
      const row = await repository.fetchRevision(pool, req.params.sku, revisionNumber);
      if (!row) return res.status(404).json({ error: 'not_found' });
      res.json(toInternalPassportDTO(row));
    } catch (err) {
      console.error('[ebp/passports] get revision failed', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.post('/:sku/revisions', async (req, res) => {
    try {
      const passportId = await service.createRevision(pool, req.params.sku, req.body || {}, actorFrom(req));
      const row = await repository.fetchPassportRow(pool, passportId);
      res.status(201).json(toInternalPassportDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/passports] create revision failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/:id/activate', async (req, res) => {
    try {
      await service.activatePassport(pool, req.params.id, actorFrom(req));
      const row = await repository.fetchPassportRow(pool, req.params.id);
      res.json(toInternalPassportDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/passports] activate failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/:id/retire', async (req, res) => {
    try {
      await service.retirePassport(pool, req.params.id, actorFrom(req), (req.body || {}).reason);
      const row = await repository.fetchPassportRow(pool, req.params.id);
      res.json(toInternalPassportDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/passports] retire failed', err);
      res.status(status).json(body);
    }
  });

  return router;
}

module.exports = createPassportsRouter;
