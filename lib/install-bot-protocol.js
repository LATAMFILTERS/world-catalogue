const expressPath = require.resolve('express');
const originalExpress = require(expressPath);
const { registerBotProtocol } = require('./bot-protocol');
const { applyProtocolGuardrails } = require('./bot-protocol-guardrails');
const { installProtocolMemory } = require('./bot-protocol-memory');
const { formatForChannel } = require('./bot-protocol-channel-format');

function wrappedExpress(...args) {
  const app = originalExpress(...args);
  app.use(originalExpress.json({ limit: '1mb' }));
  installProtocolMemory(app);
  app.use((req, res, next) => {
    if (req.path !== '/api/bot/protocol') return next();
    const originalJson = res.json.bind(res);
    res.json = payload => originalJson(formatForChannel(applyProtocolGuardrails(payload, req.body || {}), req.body || {}));
    next();
  });
  registerBotProtocol(app);
  return app;
}

Object.assign(wrappedExpress, originalExpress);
wrappedExpress.application = originalExpress.application;
wrappedExpress.request = originalExpress.request;
wrappedExpress.response = originalExpress.response;

require.cache[expressPath].exports = wrappedExpress;
