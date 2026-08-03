const expressPath = require.resolve('express');
const originalExpress = require(expressPath);
const { registerBotProtocol, processQuery } = require('./bot-protocol');
const { registerBotProtocolImage } = require('./bot-protocol-image');
const { applyProtocolGuardrails } = require('./bot-protocol-guardrails');
const { installProtocolMemory } = require('./bot-protocol-memory');
const { formatForChannel } = require('./bot-protocol-channel-format');
const { installProtocolSecurity } = require('./bot-protocol-security');
const { installDiagnosticOverride } = require('./bot-protocol-diagnostic-override');
const { installInstalledFilterStep } = require('./bot-protocol-installed-filter-step');

function wrappedExpress(...args) {
  const app = originalExpress(...args);
  app.disable('x-powered-by');
  app.use(originalExpress.json({ limit: '5mb', strict: true }));
  installProtocolSecurity(app);
  installProtocolMemory(app);
  installInstalledFilterStep(app);
  installDiagnosticOverride(app);
  app.use((req, res, next) => {
    if (req.path !== '/api/bot/protocol' && req.path !== '/api/bot/protocol/image') return next();
    const originalJson = res.json.bind(res);
    res.json = payload => originalJson(formatForChannel(applyProtocolGuardrails(payload, req.body || {}), req.body || {}));
    next();
  });
  registerBotProtocolImage(app, processQuery);
  registerBotProtocol(app);
  return app;
}

Object.assign(wrappedExpress, originalExpress);
wrappedExpress.application = originalExpress.application;
wrappedExpress.request = originalExpress.request;
wrappedExpress.response = originalExpress.response;

require.cache[expressPath].exports = wrappedExpress;
