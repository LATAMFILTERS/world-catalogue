'use strict';

// EBP Phase 3 — shared error-sanitization helpers (ADR-0034). Both
// factory.routes.js, internal.routes.js, and portal.routes.js route every
// caught error through here before it can reach a response body or an
// HTML page. The rule: service.js's own error classes
// (ValidationError/NotFoundError/ConflictError/UnauthorizedError) carry
// curated, pre-written business messages that are always safe to show —
// anything else (a raw Postgres error, a programming bug, a library
// exception) is NEVER shown verbatim. Its full detail (message, stack,
// code) is logged server-side only, tagged with a request id the caller
// can hand back to the Manufacturer/admin as a support reference; the
// response gets a generic message plus that same id, nothing else.

const crypto = require('node:crypto');
const service = require('./service');

function generateRequestId() {
  return crypto.randomUUID();
}

function isKnownServiceError(err) {
  return (
    err instanceof service.ValidationError ||
    err instanceof service.NotFoundError ||
    err instanceof service.ConflictError ||
    err instanceof service.UnauthorizedError
  );
}

// Returns a string always safe to send to the browser/API caller. Known
// service errors carry their own curated message (ValidationError joins
// its `errors` array); anything else is logged (never returned as-is)
// and replaced with a generic message carrying the request id.
function safeMessage(err, requestId, logContext) {
  if (err instanceof service.ValidationError) return err.errors.join('; ');
  if (isKnownServiceError(err)) return err.message;
  // eslint-disable-next-line no-console
  console.error(`[ebp/phase3]${logContext ? ` ${logContext}` : ''} request_id=${requestId}`, err);
  return `Something went wrong on our side. Reference: ${requestId}`;
}

module.exports = { generateRequestId, isKnownServiceError, safeMessage };
