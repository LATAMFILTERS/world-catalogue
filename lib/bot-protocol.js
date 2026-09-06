'use strict';

const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { runUnifiedBotProtocol } = require('./bot-protocol-unified-orchestrator');
const { applyCatalogNotFoundGuard } = require('./bot-protocol-guardrails');
const { applyTechnicalProductPresentation } = require('./bot-protocol-technical-product-presentation');
const { preflightReferenceLookup } = require('./bot-protocol-reference-preflight');

async function handleGovernedProtocolRequest(req, res) {
  const startedAt = Date.now();
  try {
    const requestBody = req.body || {};
    const preflightPayload = await preflightReferenceLookup(requestBody);
    const rawPayload = preflightPayload || await runUnifiedBotProtocol(requestBody);
    const notFoundGuarded = applyCatalogNotFoundGuard(rawPayload, requestBody);
    const payload = applyTechnicalProductPresentation(notFoundGuarded, requestBody);

    console.info('[bot-protocol-governed-api]', {
      request_id: payload.request_id,
      intent: payload.intent,
      lookup_status: payload.evidence?.lookup_status || null,
      evidence_count: payload.evidence?.count || 0,
      catalog_not_found_blocked: Boolean(payload.governance?.catalog_not_found_blocked),
      reference_response_policy: payload.governance?.reference_response_policy || null,
      reference_preflight: Boolean(payload.governance?.reference_preflight),
      llm_bypassed: Boolean(payload.governance?.llm_bypassed),
      source_brand: payload.governance?.source_brand || null,
      applications_published: Number(payload.governance?.applications_published || 0),
      equivalent_references_published: Number(payload.governance?.equivalent_references_published || 0),
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
