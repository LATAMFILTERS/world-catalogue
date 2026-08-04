'use strict';

const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { tryDeterministicCatalogRoute } = require('./bot-protocol-deterministic-router');
const { handleBotProtocolRequest } = require('./bot-conversation-orchestrator');

// Mounts one secured protocol route with an additive deterministic catalog
// resolver in front of the canonical orchestrator. Messages without catalog
// references continue through the existing flow unchanged.
function registerBotProtocol(app) {
  app.post(
    '/api/bot/protocol',
    createProtocolSecurityMiddleware({ image: false }),
    tryDeterministicCatalogRoute,
    handleBotProtocolRequest
  );
}

module.exports = { registerBotProtocol };
