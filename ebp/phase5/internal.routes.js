'use strict';

// EBP Phase 5 — internal-only API surface, per docs/ebp/phases/phase-05-
// manufacturer-selection.md "API Surface". Every route is mounted behind
// requireAdmin in server.js, mirroring Phase 4's internal-only pattern —
// there is no Manufacturer- or Distributor-facing route in this phase.

const express = require('express');
const service = require('./service');
const repository = require('./repository');
const dto = require('./dto');
const { resolveDeclaredActor } = require('../phase1/actor');
const phase1Repository = require('../phase1/repository');
const phase4Repository = require('../phase4/repository');
const ranking = require('./ranking');

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

async function resolvePassportId(pool, sku) {
  const passport = await phase1Repository.fetchActivePassport(pool, sku);
  if (!passport) throw new service.NotFoundError(`passport ${sku} not found`);
  return passport.id;
}

async function resolveOfferId(pool, offerCode) {
  const offer = await phase4Repository.fetchOfferByCode(pool, offerCode);
  if (!offer) throw new service.NotFoundError(`offer ${offerCode} not found`);
  return { id: offer.id, revision: offer.offer_revision };
}

async function buildRunResponse(pool, run) {
  const candidates = await repository.fetchCandidatesForRun(pool, run.id);
  const withScores = [];
  for (const c of candidates) {
    const scores = await repository.fetchFactorScoresForCandidate(pool, c.id);
    withScores.push(dto.toCandidateDTO(c, scores));
  }
  const decision = await repository.fetchSelectionDecisionByRun(pool, run.id);
  return { run: dto.toSelectionRunDTO(run), candidates: withScores, decision: dto.toSelectionDecisionDTO(decision) };
}

function createSelectionRouter(pool) {
  const router = express.Router();

  router.post('/:sku/run', async (req, res) => {
    try {
      const passportId = await resolvePassportId(pool, req.params.sku);
      const actor = actorFrom(req);
      await service.ensureDefaultPolicy(pool, actor);
      const { run } = await service.runSelection(pool, passportId, req.body.trigger || 'MANUAL_TRIGGER', actor);
      res.status(201).json(await buildRunResponse(pool, run));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.get('/:sku', async (req, res) => {
    try {
      const passportId = await resolvePassportId(pool, req.params.sku);
      const run = await repository.fetchCurrentSelectionRun(pool, passportId);
      if (!run) return res.status(404).json({ error: 'not_found', message: 'no Selection Run for this passport' });
      res.json(await buildRunResponse(pool, run));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.get('/:sku/history', async (req, res) => {
    try {
      const passportId = await resolvePassportId(pool, req.params.sku);
      const runs = await repository.fetchSelectionRunHistory(pool, passportId);
      res.json({ runs: runs.map(dto.toSelectionRunDTO) });
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.post('/:sku/decision', async (req, res) => {
    try {
      const passportId = await resolvePassportId(pool, req.params.sku);
      const run = await repository.fetchCurrentSelectionRun(pool, passportId);
      if (!run) return res.status(404).json({ error: 'not_found', message: 'no Selection Run for this passport' });
      const actor = actorFrom(req);
      const decision = await service.recordSelectionDecision(pool, run.id, req.body.decision, req.body.notes, actor);
      res.json(dto.toSelectionDecisionDTO(decision));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.post('/:sku/override', async (req, res) => {
    try {
      const passportId = await resolvePassportId(pool, req.params.sku);
      const run = await repository.fetchCurrentSelectionRun(pool, passportId);
      if (!run) return res.status(404).json({ error: 'not_found', message: 'no Selection Run for this passport' });
      const { id: requestedOfferId } = await resolveOfferId(pool, req.body.requested_offer_code);
      const actor = actorFrom(req);
      const override = await service.requestOverride(pool, run.id, req.body.tier, requestedOfferId, req.body.reason, actor);
      res.status(201).json(dto.toOverrideDTO(override));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.post('/overrides/:id/approve', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const override = await service.decideOverride(pool, req.params.id, 'APPROVED', req.body.notes, actor);
      res.json(dto.toOverrideDTO(override));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  router.post('/overrides/:id/reject', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const override = await service.decideOverride(pool, req.params.id, 'REJECTED', req.body.notes, actor);
      res.json(dto.toOverrideDTO(override));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });

  return router;
}

function createCommercialApprovalRouter(pool) {
  const router = express.Router();
  router.post('/:offer_code', async (req, res) => {
    try {
      const { id: offerId, revision } = await resolveOfferId(pool, req.params.offer_code);
      const actor = actorFrom(req);
      const approval = await service.recordCommercialApproval(pool, offerId, req.body.offer_revision || revision, req.body.status, req.body.reason, req.body.notes, req.body, actor);
      res.status(201).json(approval);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  return router;
}

function createSelectionPolicyRouter(pool) {
  const router = express.Router();
  router.post('/', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const policy = await service.createSelectionPolicy(pool, req.body, actor);
      res.status(201).json(dto.toPolicyDTO(policy));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  router.post('/:id/publish', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const policy = await service.publishSelectionPolicy(pool, req.params.id, actor);
      res.json(dto.toPolicyDTO(policy));
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  return router;
}

function createPreferredManufacturersRouter(pool) {
  const router = express.Router();
  router.post('/', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const pref = await service.createPreferredManufacturer(pool, req.body, actor);
      res.status(201).json(pref);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  return router;
}

function createDemandSignalsRouter(pool) {
  const router = express.Router();
  router.post('/', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const demand = await service.declareDemandSignal(pool, req.body, actor);
      res.status(201).json(demand);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  return router;
}

function createRolesRouter(pool) {
  const router = express.Router();
  router.post('/', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const row = await service.assignRole(pool, req.body.declared_actor, req.body.role, actor);
      res.status(201).json(row);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  router.post('/revoke', async (req, res) => {
    try {
      const actor = actorFrom(req);
      const row = await service.revokeRole(pool, req.body.declared_actor, req.body.role, actor);
      res.json(row);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      res.status(status).json(body);
    }
  });
  return router;
}

function createAnalyticsRouter(pool) {
  const router = express.Router();
  router.get('/selection/overview', async (req, res) => {
    const rows = await repository.fetchSelectionOverview(pool);
    res.json({ overview: rows });
  });
  router.get('/selection/concentration', async (req, res) => {
    const mfrShares = await repository.fetchManufacturerShareForConcentration(pool);
    const countryShares = await repository.fetchCountryShareForConcentration(pool);
    const totalSku = mfrShares.reduce((acc, r) => acc + Number(r.sku_count), 0) || 1;
    const totalCountrySku = countryShares.reduce((acc, r) => acc + Number(r.sku_count), 0) || 1;
    const mfrHhi = ranking.computeHHI(mfrShares.map((r) => Number(r.sku_count) / totalSku));
    const countryHhi = ranking.computeHHI(countryShares.map((r) => Number(r.sku_count) / totalCountrySku));
    res.json({
      sku_concentration_hhi: mfrHhi,
      country_concentration_hhi: countryHhi,
      manufacturer_shares: mfrShares,
      country_shares: countryShares,
    });
  });
  return router;
}

module.exports = {
  createSelectionRouter,
  createCommercialApprovalRouter,
  createSelectionPolicyRouter,
  createPreferredManufacturersRouter,
  createDemandSignalsRouter,
  createRolesRouter,
  createAnalyticsRouter,
};
