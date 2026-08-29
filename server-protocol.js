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

  // Structural cleanup only: remove exact codigo_base duplication, build the
  // evidence queues and prevent unresolved HD/LD conflicts from reaching the
  // public selector. No manufacturer or equivalence is inferred.
  const { applyAlternateIntegrityAndReferenceQuarantine } = require('./scripts/migrations/run_080_alternate_integrity_and_reference_quarantine');
  const alternateIntegrity = await applyAlternateIntegrityAndReferenceQuarantine();
  console.log('[alternate-integrity-v1]', JSON.stringify(alternateIntegrity));

  // PostgreSQL-compatible LD canonical identity policy. Migration 081 used
  // COUNT(DISTINCT ...) OVER (...), which PostgreSQL rejects. Migration 082
  // implements the same fail-closed policy using grouped uniqueness checks.
  const { applyLdCanonicalIdentityPolicyPgFix } = require('./scripts/migrations/run_082_ld_canonical_identity_policy_pgfix');
  const ldCanonicalIdentity = await applyLdCanonicalIdentityPolicyPgFix();
  console.log('[ld-canonical-identity-pgfix]', JSON.stringify(ldCanonicalIdentity));

  // Apply only the small curated evidence batch whose exact official Donaldson
  // product URLs were independently reviewed. This path exists because Donaldson
  // returns HTTP 403 to Render-origin requests; 403 is never treated as absence.
  const { applyCuratedOfficialEvidenceBatch1 } = require('./scripts/migrations/run_076_apply_curated_official_evidence_batch1');
  const curatedEvidence = await applyCuratedOfficialEvidenceBatch1();
  console.log('[curated-official-evidence-batch1]', JSON.stringify(curatedEvidence));

  // Post-repair controlled validation: four exact official product pages were
  // independently reviewed before deploy. The migration is idempotent and
  // changes governance/evidence only when exact SKU + codigo_base match.
  const { applyCuratedOfficialEvidenceBatch2 } = require('./scripts/migrations/run_078_apply_curated_official_evidence_batch2');
  const curatedEvidenceBatch2 = await applyCuratedOfficialEvidenceBatch2();
  console.log('[curated-official-evidence-batch2]', JSON.stringify(curatedEvidenceBatch2));

  // Exact Donaldson evidence corrects EF91315 from the historical ST1315
  // placeholder to P551315. Protected alternate/application payloads are
  // audited before and after and the transaction fails closed on any change.
  const { applyP551315CanonicalEvidence } = require('./scripts/migrations/run_079_apply_p551315_canonical_evidence');
  const p551315Evidence = await applyP551315CanonicalEvidence();
  console.log('[p551315-canonical-evidence]', JSON.stringify(p551315Evidence));

  const { loadReferenceQuarantine } = require('./lib/catalog-reference-quarantine');
  const referenceQuarantine = await loadReferenceQuarantine();
  console.log('[reference-quarantine]', JSON.stringify(referenceQuarantine));

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

  // The generic worker is opt-in. Render-origin discovery/fetch failures are not
  // evidence and must not consume queue attempts on every service restart.
  if (process.env.CATALOG_HISTORICAL_SANITATION_LIVE === 'true') {
    const requestedLimit = Number(process.env.CATALOG_HISTORICAL_SANITATION_LIMIT || 5);
    const controlledLimit = Math.max(1, Math.min(5, Number.isFinite(requestedLimit) ? requestedLimit : 5));
    setTimeout(() => {
      try {
        const { runHistoricalSanitationBatch } = require('./scripts/catalog-historical-sanitation');
        runHistoricalSanitationBatch({ apply: true, limit: controlledLimit })
          .then((result) => console.log('[historical-sanitation-batch]', JSON.stringify(result)))
          .catch((error) => console.error('[historical-sanitation-batch] failed', error.message));
      } catch (error) {
        console.error('[historical-sanitation-batch] startup load failed', error.message);
      }
    }, 45000);
  } else {
    console.log('[historical-sanitation-batch] disabled: controlled evidence acquisition required');
  }
}

start().catch((error) => {
  console.error('[catalog-codigo-base-policy-v31] startup enforcement failed', error);
  process.exit(1);
});