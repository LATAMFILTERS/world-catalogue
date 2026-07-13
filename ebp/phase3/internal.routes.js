'use strict';

// EBP Phase 3 — internal API surface for the Manufacturer Intake Portal.
// Mounted behind requireAdmin in server.js, same as every other internal
// EBP surface. Never shares a route file with the factory-facing surface
// (ADR-0029).
//
// Route inventory (keep this list and the router below in sync):
//   1.  POST   /
//   2.  GET    /
//   3.  GET    /:batch_code
//   4.  POST   /:batch_code/items
//   5.  POST   /:batch_code/send
//   6.  POST   /:batch_code/status
//   7.  GET    /:batch_code/history
//   8.  GET    /:batch_code/offers
//   9.  GET    /offers/:offer_code
//   10. POST   /manufacturer-users
//   11. POST   /manufacturer-users/:id/status
//   12. GET    /documents/:id/download
//   13. POST   /:batch_code/excel/export

const express = require('express');
const service = require('./service');
const dto = require('./dto');
const { resolveDeclaredActor } = require('../phase1/actor');
const excel = require('./excel');
const repository = require('./repository');

function errorToResponse(err) {
  if (err instanceof service.ValidationError) return { status: 400, body: { error: 'validation_failed', details: err.errors } };
  if (err instanceof service.NotFoundError) return { status: 404, body: { error: 'not_found', message: err.message } };
  if (err instanceof service.ConflictError) return { status: 409, body: { error: 'conflict', message: err.message } };
  return { status: 500, body: { error: 'internal_error' } };
}

function actorFrom(req) {
  return resolveDeclaredActor(req.get('x-ebp-actor'));
}

function handle(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const { status, body } = errorToResponse(err);
      if (status === 500) console.error('[ebp/phase3/internal] request failed', err);
      res.status(status).json(body);
    }
  };
}

function createInternalRouter(pool, storageAdapter) {
  const router = express.Router();

  router.post(
    '/',
    handle(async (req, res) => {
      const row = await service.createBatch(pool, req.body || {}, actorFrom(req));
      res.status(201).json(dto.toInternalBatchDTO(row));
    })
  );

  router.get(
    '/',
    handle(async (req, res) => {
      const { manufacturer_id, status, purpose } = req.query;
      const rows = await service.listBatches(pool, { manufacturer_id, status, purpose });
      res.json({ batches: rows.map(dto.toInternalBatchDTO) });
    })
  );

  router.get(
    '/:batch_code',
    handle(async (req, res) => {
      const batch = await service.getBatch(pool, req.params.batch_code);
      const items = await service.listBatchItems(pool, req.params.batch_code);
      res.json(dto.toInternalBatchDTO({ ...batch, items }));
    })
  );

  router.post(
    '/:batch_code/items',
    handle(async (req, res) => {
      const item = await service.addBatchItem(pool, req.params.batch_code, req.body || {});
      res.status(201).json(dto.toInternalBatchItemDTO(item));
    })
  );

  router.post(
    '/:batch_code/send',
    handle(async (req, res) => {
      const row = await service.transitionBatchStatus(pool, req.params.batch_code, 'SENT', actorFrom(req), (req.body || {}).reason);
      res.json(dto.toInternalBatchDTO(row));
    })
  );

  router.post(
    '/:batch_code/status',
    handle(async (req, res) => {
      const { status, reason } = req.body || {};
      const row = await service.transitionBatchStatus(pool, req.params.batch_code, status, actorFrom(req), reason);
      res.json(dto.toInternalBatchDTO(row));
    })
  );

  router.get(
    '/:batch_code/history',
    handle(async (req, res) => {
      const rows = await service.getBatchHistory(pool, req.params.batch_code);
      res.json({ batch_code: req.params.batch_code, history: rows });
    })
  );

  router.get(
    '/:batch_code/offers',
    handle(async (req, res) => {
      const rows = await service.listOffersForBatch(pool, req.params.batch_code);
      res.json({ offers: rows.map(dto.toInternalOfferDTO) });
    })
  );

  router.get(
    '/offers/:offer_code',
    handle(async (req, res) => {
      const offer = await service.getOfferWithDetail(pool, req.params.offer_code);
      res.json(dto.toInternalOfferDTO(offer));
    })
  );

  router.post(
    '/manufacturer-users',
    handle(async (req, res) => {
      const { manufacturer_id, ...payload } = req.body || {};
      const { user, inviteToken } = await service.inviteFactoryUser(pool, manufacturer_id, payload, actorFrom(req));
      // The raw invite token is returned exactly once, to the ELIMFILTERS
      // admin creating the account, who is responsible for delivering it
      // to the Manufacturer out-of-band (email is Phase 3's own future
      // delivery mechanism, not built as a live SMTP integration here).
      res.status(201).json({ ...dto.toFactoryUserDTO(user), invite_token: inviteToken });
    })
  );

  router.post(
    '/manufacturer-users/:id/status',
    handle(async (req, res) => {
      const user = await service.disableFactoryUser(pool, req.params.id, actorFrom(req));
      res.json(dto.toFactoryUserDTO(user));
    })
  );

  router.get(
    '/documents/:id/download',
    handle(async (req, res) => {
      const { document, buffer } = await service.getDocumentForDownload(pool, storageAdapter, req.params.id, null);
      res.set('Content-Type', document.mime_type);
      res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(document.original_filename)}"`);
      res.send(buffer);
    })
  );

  router.post(
    '/:batch_code/excel/export',
    handle(async (req, res) => {
      const batch = await service.getBatch(pool, req.params.batch_code);
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
      const rawBuffer = await excel.buildBatchWorkbook({ batchCode: batch.batch_code, manufacturerId: batch.manufacturer_id, items: rows });
      const buffer = Buffer.from(rawBuffer);
      const crypto = require('node:crypto');
      const { buildStorageKey } = require('./storage');
      const documentId = crypto.randomUUID();
      const storageKey = buildStorageKey(batch.manufacturer_id, documentId);
      await storageAdapter.put(storageKey, buffer);
      await repository.insertDocument(pool, {
        manufacturer_id: batch.manufacturer_id,
        batch_id: batch.id,
        category: 'EXCEL_EXPORT',
        original_filename: `${batch.batch_code}.xlsx`,
        mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size_bytes: buffer.length,
        sha256_hash: crypto.createHash('sha256').update(buffer).digest('hex'),
        storage_key: storageKey,
        identity_mechanism: actorFrom(req).identity_mechanism,
        uploaded_by_declared_actor: actorFrom(req).declared_actor,
      });
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.set('Content-Disposition', `attachment; filename="${batch.batch_code}.xlsx"`);
      res.send(buffer);
    })
  );

  return router;
}

module.exports = createInternalRouter;
