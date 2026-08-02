const expressPath = require.resolve('express');
const originalExpress = require(expressPath);
const { registerBotProtocol } = require('./bot-protocol');

function wrappedExpress(...args) {
  const app = originalExpress(...args);
  app.use(originalExpress.json({ limit: '1mb' }));
  registerBotProtocol(app);
  return app;
}

Object.assign(wrappedExpress, originalExpress);
wrappedExpress.application = originalExpress.application;
wrappedExpress.request = originalExpress.request;
wrappedExpress.response = originalExpress.response;

require.cache[expressPath].exports = wrappedExpress;
