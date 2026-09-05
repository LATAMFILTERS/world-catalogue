'use strict';

const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { runUnifiedBotProtocol } = require('./bot-protocol-unified-orchestrator');
const { applyCatalogNotFoundGuard } = require('./bot-protocol-guardrails');

async function handleGovernedProtocolRequest(req, res) {
  const startedAt = Date.now();
  try {
    const requestBody = req.body || {};
    const rawPayload = await runUnifiedBotProtocol(requestBody);
    const payload = applyCatalogNotFoundGuard(rawPayload, requestBody);

    console.info('[bot-protocol-governed-api]', {
      request_id: payload.request_id,
      intent: payload.intent,
      lookup_status: payload.evidence?.lookup_status || null,
      evidence_count: payload.evidence?.count || 0,
      catalog_not_found_blocked: Boolean(payload.governance?.catalog_not_found_blocked),
      duration_ms: Date.now() - startedAt
    });

    return res.json(payload);
  } catch (error) {
    console.error('[bot-protocol-governed-api]', {
      error: error.message,
      stack: error.stack,
      duration_ms: Date.now() - startedAt
    });
    return res.status(503).json({ error: 'protocol_temporarily_unavailable' });
  }
}

function registerBotProtocol(app) {
  app.post(
    '/api/bot/protocol',
    createProtocolSecurityMiddleware({ image: false }),
    handleGovernedProtocolRequest
  );
}

module.exports = { registerBotProtocol, handleGovernedProtocolRequest };
