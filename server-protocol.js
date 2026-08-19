require('dotenv').config();
require('./lib/part-search-runtime-hardening');

async function start() {
  const { installPolicyV31 } = require('./scripts/migrations/run_073_catalog_codigo_base_governance_v31');
  const policy = await installPolicyV31({ backfill: true });
  console.log('[catalog-codigo-base-policy-v31]', JSON.stringify(policy));

  const { installHistoricalSanitationQueue } = require('./scripts/migrations/run_074_catalog_historical_sanitation_queue');
  const queue = await installHistoricalSanitationQueue();
  console.log('[catalog-historical-sanitation-queue]', JSON.stringify(queue));

  require('./server');

  setTimeout(() => {
    try {
      const { runStartupReferenceAudit } = require('./lib/part-search-startup-reference-audit');
      runStartupReferenceAudit().catch((error) => {
        console.error('[reference-family-audit-v2] failed', error.message);
      });
    } catch (error) {
      console.error('[reference-family-audit-v2] startup load failed', error.message);
    }
  }, 15000);

  // Process a deliberately small evidence-backed batch after startup. The worker
  // never infers manufacturer absence, never changes alternate-code arrays, and
  // only writes a codigo_base when official Donaldson evidence resolves exactly
  // one authority path under V3.1.
  setTimeout(() => {
    try {
      const { runHistoricalSanitationBatch } = require('./scripts/catalog-historical-sanitation');
      runHistoricalSanitationBatch({ apply: true, limit: 25 })
        .then((result) => console.log('[historical-sanitation-batch]', JSON.stringify(result)))
        .catch((error) => console.error('[historical-sanitation-batch] failed', error.message));
    } catch (error) {
      console.error('[historical-sanitation-batch] startup load failed', error.message);
    }
  }, 45000);
}

start().catch((error) => {
  console.error('[catalog-codigo-base-policy-v31] startup enforcement failed', error);
  process.exit(1);
});
