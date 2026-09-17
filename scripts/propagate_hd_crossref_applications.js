'use strict';

/**
 * Legacy Heavy Duty cross-reference application propagation.
 *
 * This script previously copied equipment applications between catalog rows by
 * shared OEM/competitor references and wrote directly to elimfilters_catalog.
 * That behavior bypasses application evidence governance and is therefore
 * intentionally disabled.
 *
 * Use the evidence-governed catalog application write path instead:
 *   lib/catalog-application-write-service.js
 *   lib/catalog-application-governance.js
 *   lib/catalog-write-gateway.js
 *
 * SECURITY: database credentials must never be embedded in source. Any future
 * governed migration must receive DATABASE_URL from the runtime secret store.
 */

function main() {
  const error = new Error(
    'GOVERNANCE_BLOCKED: legacy cross-reference application inheritance is disabled. ' +
    'Use the evidence-governed catalog application write service.'
  );
  error.code = 'GOVERNANCE_BLOCKED';
  throw error;
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
