'use strict';

// EBP Phase 4 — internal-only API surface for Engineering Compliance
// Validation, per docs/ebp/phases/phase-04-validation-engine.md "API
// Surface". Every route here is mounted behind requireAdmin in server.js,
// same as every other EBP admin endpoint — there is no Manufacturer- or
// Distributor-facing route in this phase.
//
// Route inventory (keep this list and the router below in sync):
//   1. POST   /validation/:offer_code/run
//   2. GET    /validation/:offer_code
//   3. GET    /validation/:offer_code/history
//   4. POST   /validation/:offer_code/decisions
//   5. POST   /validation/:offer_code/exceptions
//   6. POST   /validation/exceptions/:id/approve
//   7. POST   /validation/exceptions/:id/reject
//   8. POST   /validation/conditions/:id/status
//   9. POST   /rule-catalog
//   10. POST  /rule-catalog/:rule_id/:rule_version/publish
//   11. POST  /rule-catalog/:rule_id/:rule_version/retire
//   12. GET   /rule-catalog/:rule_id
//   13. POST  /roles
//   14. POST  /roles/revoke

const express = require('express');
const repository = require('./repository');
const service = require('./service');
const { resolveDeclaredActor } = require('../phase1/actor');
const dto = require('./dto');

function actorFrom(req) {
  return resolveDeclaredActor(req.get('x-ebp-actor'));
}

function errorToResponse(err) {
  if (err instanceof service.ValidationError) return { status: 400, body: { error: 'validation_failed', details: err.errors } };
  if (err instanceof service.NotFoundError) return { status: 404, body: { error: 'not_found', message: err.message } };
  if (err instanceof service.ConflictError) return { status: 409, body: { error: 'conflict', message: err.message } };
  if (err instanceof service.UnauthorizedError) return { status: 403, body: { error: 'forbidden', message: err.message } };
  return { status: 500, body: { error: 'internal_error' } };
}

async function resolveOfferId(pool, offerCode) {
  const offer = await repository.fetchOfferByCode(pool, offerCode);
  if (!offer) throw new service.NotFoundError(`offer ${offerCode} not found`);
  return offer.id;
}

// Factory: createValidationRouter(pool) — pool is the existing `pg` Pool
// instance server.js already constructs. This module never creates its
// own connection.
function createValidationRouter(pool) {
  const router = express.Router();

  router.post('/:offer_code/run', async (req, res) => {
    try {
      const offerId = await resolveOfferId(pool, req.params.offer_code);
      const trigger = (req.body || {}).trigger || 'MANUAL_RERUN';
      const runId = await service.runValidation(pool, offerId, trigger, actorFrom(req));
      const summary = await service.getValidationSummary(pool, offerId);
      res.status(201).json(dto.toValidationSummaryDTO(summary));
      void runId;
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] run validation failed', err);
      res.status(status).json(body);
    }
  });

  router.get('/:offer_code', async (req, res) => {
    try {
      const offerId = await resolveOfferId(pool, req.params.offer_code);
      const summary = await service.getValidationSummary(pool, offerId);
      res.json(dto.toValidationSummaryDTO(summary));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] get validation failed', err);
      res.status(status).json(body);
    }
  });

  router.get('/:offer_code/history', async (req, res) => {
    try {
      const offerId = await resolveOfferId(pool, req.params.offer_code);
      const runs = await service.getValidationHistory(pool, offerId);
      res.json({ offer_id: offerId, runs: runs.map(dto.toValidationRunDTO) });
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] get history failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/:offer_code/decisions', async (req, res) => {
    try {
      const offerId = await resolveOfferId(pool, req.params.offer_code);
      const { decision, notes, conditions } = req.body || {};
      const row = await service.recordEngineeringDecision(pool, offerId, decision, notes, conditions, actorFrom(req));
      res.status(201).json(dto.toDecisionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] record decision failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/:offer_code/exceptions', async (req, res) => {
    try {
      const offerId = await resolveOfferId(pool, req.params.offer_code);
      const { rule_id, rule_version, justification } = req.body || {};
      const row = await service.requestException(pool, offerId, rule_id, Number(rule_version), justification, actorFrom(req));
      res.status(201).json(dto.toExceptionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] request exception failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/exceptions/:id/approve', async (req, res) => {
    try {
      const row = await service.decideException(pool, req.params.id, true, actorFrom(req));
      res.json(dto.toExceptionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] approve exception failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/exceptions/:id/reject', async (req, res) => {
    try {
      const row = await service.decideException(pool, req.params.id, false, actorFrom(req));
      res.json(dto.toExceptionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] reject exception failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/conditions/:id/status', async (req, res) => {
    try {
      const { status: newStatus } = req.body || {};
      const row = await service.updateConditionStatus(pool, req.params.id, newStatus, actorFrom(req));
      res.json(dto.toConditionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] update condition status failed', err);
      res.status(status).json(body);
    }
  });

  return router;
}

// Factory: createRuleCatalogRouter(pool)
function createRuleCatalogRouter(pool) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const row = await service.createRuleVersion(pool, req.body || {}, actorFrom(req));
      res.status(201).json(dto.toRuleVersionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] create rule version failed', err);
      res.status(status).json(body);
    }
  });

  router.get('/:rule_id', async (req, res) => {
    try {
      const rows = await repository.fetchRuleVersionsByRuleId(pool, req.params.rule_id);
      res.json({ rule_id: req.params.rule_id, versions: rows.map(dto.toRuleVersionDTO) });
    } catch (err) {
      console.error('[ebp/phase4] list rule versions failed', err);
      res.status(500).json({ error: 'internal_error' });
    }
  });

  router.post('/:rule_id/:rule_version/publish', async (req, res) => {
    try {
      const row = await service.publishRuleVersion(pool, req.params.rule_id, Number(req.params.rule_version), actorFrom(req));
      res.json(dto.toRuleVersionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] publish rule version failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/:rule_id/:rule_version/retire', async (req, res) => {
    try {
      const row = await service.retireRuleVersion(pool, req.params.rule_id, Number(req.params.rule_version), actorFrom(req));
      res.json(dto.toRuleVersionDTO(row));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] retire rule version failed', err);
      res.status(status).json(body);
    }
  });

  return router;
}

// Factory: createRolesRouter(pool)
function createRolesRouter(pool) {
  const router = express.Router();

  router.post('/', async (req, res) => {
    try {
      const { declared_actor, role } = req.body || {};
      const row = await service.assignRole(pool, declared_actor, role, actorFrom(req));
      res.status(201).json(row);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] assign role failed', err);
      res.status(status).json(body);
    }
  });

  router.post('/revoke', async (req, res) => {
    try {
      const { declared_actor, role } = req.body || {};
      await service.revokeRole(pool, declared_actor, role, actorFrom(req));
      res.json({ declared_actor, role, revoked: true });
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase4] revoke role failed', err);
      res.status(status).json(body);
    }
  });

  return router;
}

module.exports = { createValidationRouter, createRuleCatalogRouter, createRolesRouter };
