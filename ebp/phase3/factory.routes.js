'use strict';

// EBP Phase 3 — factory-facing API surface. Mounted behind
// requireFactorySession, never behind requireAdmin, and never sharing a
// route file with ebp/phase3/internal.routes.js (ADR-0029). Every handler
// is scoped to req.factorySession.manufacturer_id — never accepts a
// caller-supplied manufacturer identifier.
//
// Route inventory (keep this list and the router below in sync):
//   1.  POST   /auth/login
//   2.  POST   /auth/logout
//   3.  POST   /auth/accept-invite
//   4.  POST   /auth/request-password-reset
//   5.  POST   /auth/reset-password
//   6.  GET    /batches
//   7.  GET    /batches/:batch_code
//   8.  POST   /batches/:batch_code/items/:item_id/offers
//   9.  GET    /batches/:batch_code/items/:item_id/offers
//   10. POST   /offers/:offer_code/withdraw
//   11. POST   /offers/:offer_code/documents
//   12. GET    /documents/:id/download
//   13. GET    /batches/:batch_code/excel/export
//   14. POST   /batches/:batch_code/excel/stage
//   15. POST   /batches/:batch_code/excel/confirm

const express = require('express');
const multer = require('multer');
const crypto = require('node:crypto');
const service = require('./service');
const dto = require('./dto');
const validation = require('./validation');
const excel = require('./excel');
const staging = require('./staging');
const repository = require('./repository');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: validation.MAX_DOCUMENT_SIZE_BYTES } });

function errorToResponse(err) {
  if (err instanceof service.ValidationError) return { status: 400, body: { error: 'validation_failed', details: err.errors } };
  if (err instanceof service.NotFoundError) return { status: 404, body: { error: 'not_found', message: err.message } };
  if (err instanceof service.ConflictError) return { status: 409, body: { error: 'conflict', message: err.message } };
  if (err instanceof service.UnauthorizedError) return { status: 401, body: { error: 'unauthorized', message: err.message } };
  return { status: 500, body: { error: 'internal_error' } };
}

function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase3/factory] request failed', err);
      res.status(status).json(body);
    }
  };
}

// ADR-0023: resolves the bearer token to a live session and attaches
// { factory_user_id, manufacturer_id, role } — never trusts a
// client-supplied manufacturer_id.
function createFactorySessionMiddleware(pool) {
  return async (req, res, next) => {
    const authHeader = req.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'unauthorized' });
    const session = await service.resolveSession(pool, token);
    if (!session) return res.status(401).json({ error: 'unauthorized' });
    req.factorySession = session;
    req.factorySessionToken = token;
    next();
  };
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.factorySession.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

function actorFromSession(req) {
  return { declared_actor: req.factorySession.factory_user_id, identity_mechanism: 'FACTORY_SESSION', factory_user_id: req.factorySession.factory_user_id };
}

// Confirms a resource (batch/offer/document) resolved by tenant-scoped
// lookup belongs to the session's manufacturer; returns 404 (never a
// tenant-confirming 403) if not (ADR-0023).
async function requireOwnBatch(pool, req, batchCode) {
  return service.getBatchForManufacturer(pool, batchCode, req.factorySession.manufacturer_id);
}

function createFactoryRouter(pool, storageAdapter) {
  const router = express.Router();

  // ── Auth (unauthenticated routes — mounted before the session middleware
  // applies to the rest of this router) ──────────────────────────────────
  const authRouter = express.Router();

  authRouter.post(
    '/login',
    handle(async (req, res) => {
      const { email, password } = req.body || {};
      const { user, sessionToken } = await service.login(pool, email, password, { ip: req.ip, userAgent: req.get('user-agent') });
      res.json({ session_token: sessionToken, user: dto.toFactoryUserDTO(user) });
    })
  );

  authRouter.post(
    '/accept-invite',
    handle(async (req, res) => {
      const { token, password } = req.body || {};
      if (!token) return res.status(400).json({ error: 'validation_failed', details: ['token is required'] });
      const user = await service.acceptInvite(pool, token, password);
      res.json(dto.toFactoryUserDTO(user));
    })
  );

  authRouter.post(
    '/request-password-reset',
    handle(async (req, res) => {
      const { email } = req.body || {};
      await service.requestPasswordReset(pool, email || '');
      // Always 200, regardless of whether the account exists — never
      // discloses account existence via response shape.
      res.json({ status: 'ok' });
    })
  );

  authRouter.post(
    '/reset-password',
    handle(async (req, res) => {
      const { token, password } = req.body || {};
      if (!token) return res.status(400).json({ error: 'validation_failed', details: ['token is required'] });
      const user = await service.resetPassword(pool, token, password);
      res.json(dto.toFactoryUserDTO(user));
    })
  );

  router.use('/auth', authRouter);

  // ── Everything below requires a live session ────────────────────────────
  const sessionMiddleware = createFactorySessionMiddleware(pool);

  router.post(
    '/auth/logout',
    sessionMiddleware,
    handle(async (req, res) => {
      await service.logout(pool, req.factorySessionToken, req.factorySession.factory_user_id);
      res.json({ status: 'ok' });
    })
  );

  router.get(
    '/batches',
    sessionMiddleware,
    handle(async (req, res) => {
      const rows = await service.listBatches(pool, { manufacturer_id: req.factorySession.manufacturer_id });
      res.json({ batches: rows.map(dto.toFactoryBatchDTO) });
    })
  );

  router.get(
    '/batches/:batch_code',
    sessionMiddleware,
    handle(async (req, res) => {
      const batch = await requireOwnBatch(pool, req, req.params.batch_code);
      const items = await service.listBatchItems(pool, req.params.batch_code);
      res.json(dto.toFactoryBatchDTO({ ...batch, items }));
    })
  );

  router.post(
    '/batches/:batch_code/items/:item_id/offers',
    sessionMiddleware,
    requireRole('MANUFACTURER_ADMIN', 'MANUFACTURER_ENGINEERING', 'MANUFACTURER_COMMERCIAL'),
    handle(async (req, res) => {
      await requireOwnBatch(pool, req, req.params.batch_code);
      const offer = await service.createOfferRevision(pool, req.params.batch_code, req.params.item_id, req.body || {}, actorFromSession(req));
      res.status(201).json(dto.toFactoryOfferDTO(offer));
    })
  );

  router.get(
    '/batches/:batch_code/items/:item_id/offers',
    sessionMiddleware,
    handle(async (req, res) => {
      await requireOwnBatch(pool, req, req.params.batch_code);
      const rows = await service.listOffersForItem(pool, req.params.batch_code, req.params.item_id);
      res.json({ offers: rows.map(dto.toFactoryOfferDTO) });
    })
  );

  router.post(
    '/offers/:offer_code/withdraw',
    sessionMiddleware,
    requireRole('MANUFACTURER_ADMIN', 'MANUFACTURER_ENGINEERING', 'MANUFACTURER_COMMERCIAL'),
    handle(async (req, res) => {
      const offer = await repository.fetchOfferByCodeForManufacturer(pool, req.params.offer_code, req.factorySession.manufacturer_id);
      if (!offer) return res.status(404).json({ error: 'not_found' });
      const updated = await service.transitionOfferStatus(pool, req.params.offer_code, 'WITHDRAWN', actorFromSession(req), 'withdrawn by manufacturer');
      res.json(dto.toFactoryOfferDTO(updated));
    })
  );

  router.post(
    '/offers/:offer_code/documents',
    sessionMiddleware,
    requireRole('MANUFACTURER_ADMIN', 'MANUFACTURER_ENGINEERING', 'MANUFACTURER_COMMERCIAL'),
    upload.single('file'),
    handle(async (req, res) => {
      const offer = await repository.fetchOfferByCodeForManufacturer(pool, req.params.offer_code, req.factorySession.manufacturer_id);
      if (!offer) return res.status(404).json({ error: 'not_found' });
      if (!req.file) return res.status(400).json({ error: 'validation_failed', details: ['file is required'] });
      const document = await service.uploadDocument(pool, storageAdapter, {
        manufacturerId: req.factorySession.manufacturer_id,
        offerId: offer.id,
        category: (req.body || {}).category || 'TECHNICAL_EVIDENCE',
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        buffer: req.file.buffer,
        actor: actorFromSession(req),
      });
      res.status(201).json(dto.toDocumentDTO(document));
    })
  );

  router.get(
    '/documents/:id/download',
    sessionMiddleware,
    handle(async (req, res) => {
      const { document, buffer } = await service.getDocumentForDownload(pool, storageAdapter, req.params.id, req.factorySession.manufacturer_id);
      res.set('Content-Type', document.mime_type);
      res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.original_filename)}"`);
      res.send(buffer);
    })
  );

  router.get(
    '/batches/:batch_code/excel/export',
    sessionMiddleware,
    handle(async (req, res) => {
      const batch = await requireOwnBatch(pool, req, req.params.batch_code);
      const items = await service.listBatchItems(pool, req.params.batch_code);
      const rows = items.map((item) => ({
        batch_item_id: item.id,
        elimfilters_code: item.elimfilters_code,
        field_name: '',
        required_value: '',
        unit: '',
        instructions: item.manufacturer_visible_snapshot?.engineering?.manufacturer_instruction_notes || '',
        offered_value: '',
        completeness_status: '',
        manufacturer_note: '',
        fob_price: '',
        currency: '',
        moq: '',
        lead_time_days: '',
      }));
      const buffer = await excel.buildBatchWorkbook({ batchCode: batch.batch_code, manufacturerId: batch.manufacturer_id, items: rows });
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', `attachment; filename="${batch.batch_code}.xlsx"`);
      res.send(Buffer.from(buffer));
    })
  );

  router.post(
    '/batches/:batch_code/excel/stage',
    sessionMiddleware,
    requireRole('MANUFACTURER_ADMIN', 'MANUFACTURER_ENGINEERING', 'MANUFACTURER_COMMERCIAL'),
    upload.single('file'),
    handle(async (req, res) => {
      const batch = await requireOwnBatch(pool, req, req.params.batch_code);
      if (!req.file) return res.status(400).json({ error: 'validation_failed', details: ['file is required'] });
      const { errors, preview } = await excel.parseAndValidateWorkbook(req.file.buffer, batch.batch_code, batch.manufacturer_id);
      if (errors.length) return res.status(422).json({ error: 'excel_validation_failed', details: errors });
      const stagingToken = staging.put(batch.batch_code, batch.manufacturer_id, preview);
      res.json({ staging_token: stagingToken, preview });
    })
  );

  router.post(
    '/batches/:batch_code/excel/confirm',
    sessionMiddleware,
    requireRole('MANUFACTURER_ADMIN', 'MANUFACTURER_ENGINEERING', 'MANUFACTURER_COMMERCIAL'),
    handle(async (req, res) => {
      const batch = await requireOwnBatch(pool, req, req.params.batch_code);
      const { staging_token: stagingToken } = req.body || {};
      const preview = staging.take(stagingToken, batch.batch_code, batch.manufacturer_id);
      if (!preview) {
        return res.status(409).json({ error: 'conflict', message: 'staging token is invalid, expired, or already used — re-stage the file' });
      }
      const results = [];
      for (const row of preview) {
        // eslint-disable-next-line no-await-in-loop
        const offer = await service.createOfferRevision(
          pool,
          batch.batch_code,
          row.batch_item_id,
          {
            submit: true,
            fob_price: row.fob_price ? String(row.fob_price) : '0.01',
            currency: row.currency || batch.requested_currency || 'USD',
            moq: row.moq ? Number(row.moq) : undefined,
            lead_time_days: row.lead_time_days ? Number(row.lead_time_days) : undefined,
            technical_fields: [
              {
                field_name: row.field_name || 'imported_field',
                offered_value: row.offered_value,
                completeness_status: row.completeness_status,
                manufacturer_note: row.manufacturer_note || null,
              },
            ],
          },
          actorFromSession(req)
        );
        results.push(dto.toFactoryOfferDTO(offer));
      }
      res.status(201).json({ offers: results });
    })
  );

  return router;
}

module.exports = { createFactoryRouter, createFactorySessionMiddleware, requireRole };
