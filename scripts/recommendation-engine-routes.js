/**
 * recommendation-engine-routes.js
 * Express route module for Recommendation Engine v2 endpoints.
 *
 * Integration in server.js (add after product-catalog-migration-routes line):
 *   require('./scripts/recommendation-engine-routes')(app, Client, dbConfig);
 *
 * Endpoints:
 *
 *   GET /api/recommendation/alternatives/:elementCode
 *     → Scored + classified alternatives for an element.
 *     → Returns BASELINE, TYPE_A (upgrade), TYPE_B (operational alternative).
 *     → Every result includes traceability chain.
 *
 *   GET /api/recommendation/cross-reference/:partNumber
 *     → Resolves external part number (Racor, OEM, competitor) to ELIMFILTERS.
 *     → Searches product_catalog tables first, falls through to elimfilters_catalog.
 *
 *   GET /api/recommendation/housing/:modelCode
 *     → Housing model + all compatible elements with RE scoring and group data.
 *     → Primary endpoint for housing-based consultation.
 */

'use strict';

const {
  findAlternatives,
  findCrossReferenceRE,
  getHousingWithAlternatives,
} = require('./recommendation-engine-v2');

module.exports = function registerRecommendationEngineRoutes(app, Client, dbConfig) {

  // ── Alternatives ────────────────────────────────────────────────────────────
  // GET /api/recommendation/alternatives/2020SM-OR
  app.get('/api/recommendation/alternatives/:elementCode', async (req, res) => {
    const code = (req.params.elementCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'elementCode required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const result = await findAlternatives(client, code);
      if (result.status === 'NOT_FOUND')       return res.status(404).json(result);
      if (result.status === 'NO_GROUP')         return res.status(404).json(result);
      if (result.status === 'VALIDATION_ERROR') return res.status(500).json(result);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      await client.end();
    }
  });

  // ── Cross-reference ─────────────────────────────────────────────────────────
  // GET /api/recommendation/cross-reference/2040SM-OR
  // GET /api/recommendation/cross-reference/1000FH
  app.get('/api/recommendation/cross-reference/:partNumber', async (req, res) => {
    const part = (req.params.partNumber || '').trim();
    if (!part) return res.status(400).json({ error: 'partNumber required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const result = await findCrossReferenceRE(client, part);
      if (result.status === 'NOT_FOUND') return res.status(404).json(result);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      await client.end();
    }
  });

  // ── Housing with alternatives ────────────────────────────────────────────────
  // GET /api/recommendation/housing/1000FH
  app.get('/api/recommendation/housing/:modelCode', async (req, res) => {
    const code = (req.params.modelCode || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'modelCode required' });
    const client = new Client(dbConfig);
    try {
      await client.connect();
      const result = await getHousingWithAlternatives(client, code);
      if (result.status === 'NOT_FOUND') return res.status(404).json(result);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: e.message });
    } finally {
      await client.end();
    }
  });

};
