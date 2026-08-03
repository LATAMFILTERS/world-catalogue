'use strict';

const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { handleBotProtocolRequest } = require('./bot-conversation-orchestrator');

// Mounts the single deterministic /api/bot/protocol route: one security
// middleware, one orchestrator call, one res.json response. No nested
// res.json wrapping, no middleware chain reordering surprises.
function registerBotProtocol(app) {
  app.post('/api/bot/protocol', createProtocolSecurityMiddleware({ image: false }), handleBotProtocolRequest);
}

module.exports = { registerBotProtocol };
