'use strict';

const { createProtocolSecurityMiddleware } = require('./bot-protocol-security');
const { handleUnifiedBotProtocolRequest } = require('./bot-protocol-unified-orchestrator');

function registerBotProtocol(app) {
  app.post(
    '/api/bot/protocol',
    createProtocolSecurityMiddleware({ image: false }),
    handleUnifiedBotProtocolRequest
  );
}

module.exports = { registerBotProtocol };
