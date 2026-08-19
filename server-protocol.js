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

  // Controlled evidence bridge: exact official Donaldson product URLs already
  // independently resolved outside the Render runtime. The script re-fetches
  // and validates each official page before marking anything verified.
  setTimeout(() => {
    try {
      const { seedVerifiedPrimaryEvidenceBatch1 } = require('./scripts/migrations/run_075_seed_verified_primary_evidence_batch1');
      seedVerifiedPrimaryEvidenceBatch1()
        .then((result) => console.log('[verified-primary-evidence-batch1]', JSON.stringify(result)))
        .catch((error) => console.error('[verified-primary-evidence-batch1] failed', error.message));
    } catch (error) {
      console.error('[verified-primary-evidence-batch1] startup load failed', error.message);
    }
  }, 30000);

  // Generic worker remains conservative: no inferred absence, no alternate-code
  // mutation, no SKU mutation, and no codigo_base change without official evidence.
  setTimeout(() => {
    try {
      const { runHistoricalSanitationBatch } = require('./scripts/catalog-historical-sanitation');
      runHistoricalSanitationBatch({ apply: true, limit: 25 })
        .then((result) => console.log('[historical-sanitation-batch]', JSON.stringify(result)))
        .catch((error) => console.error('[historical-sanitation-batch] failed', error.message));
    } catch (error) {
      console.error('[historical-sanitation-batch] startup load failed', error.message);
    }
  }, 60000);
}

start().catch((error) => {
  console.error('[catalog-codigo-base-policy-v31] startup enforcement failed', error);
  process.exit(1);
});
