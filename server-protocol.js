require('dotenv').config();
require('./lib/part-search-runtime-hardening');

async function start() {
  const { installPolicyV31 } = require('./scripts/migrations/run_073_catalog_codigo_base_governance_v31');
  const policy = await installPolicyV31({ backfill: true });
  console.log('[catalog-codigo-base-policy-v31]', JSON.stringify(policy));

  const { installHistoricalSanitationQueue } = require('./scripts/migrations/run_074_catalog_historical_sanitation_queue');
  const queue = await installHistoricalSanitationQueue();
  console.log('[catalog-historical-sanitation-queue]', JSON.stringify(queue));

  const { installApplicationEvidenceGovernance } = require('./scripts/migrations/run_077_application_evidence_governance');
  const applicationGovernance = await installApplicationEvidenceGovernance();
  console.log('[catalog-application-governance]', JSON.stringify(applicationGovernance));

  // Apply only the small curated evidence batch whose exact official Donaldson
  // product URLs were independently reviewed. This path exists because Donaldson
  // returns HTTP 403 to Render-origin requests; 403 is never treated as absence.
  const { applyCuratedOfficialEvidenceBatch1 } = require('./scripts/migrations/run_076_apply_curated_official_evidence_batch1');
  const curatedEvidence = await applyCuratedOfficialEvidenceBatch1();
  console.log('[curated-official-evidence-batch1]', JSON.stringify(curatedEvidence));

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
  }, 45000);
}

start().catch((error) => {
  console.error('[catalog-codigo-base-policy-v31] startup enforcement failed', error);
  process.exit(1);
});
