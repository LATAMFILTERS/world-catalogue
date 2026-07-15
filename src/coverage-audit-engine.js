'use strict';

const { registerCoverageRoutes } = require('./audit/coverage/route');

function registerCoverageAuditEngine(app, pool, limiter) {
  return registerCoverageRoutes({ app, pool, limiter });
}

module.exports = { registerCoverageAuditEngine };
