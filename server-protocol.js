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

  const { applyAlternateIntegrityAndReferenceQuarantine } = require('./scripts/migrations/run_080_alternate_integrity_and_reference_quarantine');
  const alternateIntegrity = await applyAlternateIntegrityAndReferenceQuarantine();
  console.log('[alternate-integrity-v1]', JSON.stringify(alternateIntegrity));

  const { applyLdCanonicalIdentityPolicyPgFix } = require('./scripts/migrations/run_082_ld_canonical_identity_policy_pgfix');
  const ldCanonicalIdentity = await applyLdCanonicalIdentityPolicyPgFix();
  console.log('[ld-canonical-identity-pgfix]', JSON.stringify(ldCanonicalIdentity));

  const { applyRegionalLdCodigoBasePolicy } = require('./scripts/migrations/run_083_regional_ld_codigo_base_policy');
  const regionalLdPolicy = await applyRegionalLdCodigoBasePolicy();
  console.log('[regional-ld-codigo-base-v32]', JSON.stringify(regionalLdPolicy));

  const { applyLdOriginCandidateBackfill } = require('./scripts/migrations/run_084_ld_origin_candidate_backfill');
  const ldOriginCandidates = await applyLdOriginCandidateBackfill();
  console.log('[ld-origin-candidate-backfill]', JSON.stringify(ldOriginCandidates));

  // First guarded non-European canonical repair. Exact application evidence ties
  // normalized MANN W68/3 to the existing Toyota (USA) 2ZRFXE oil family, while
  // FRAM PH4967 is promoted to codigo_base and MANN remains a cross-reference.
  const { applyPh4967CanonicalRepair } = require('./scripts/migrations/run_085_ph4967_canonical_repair');
  const ph4967Repair = await applyPh4967CanonicalRepair();
  console.log('[ph4967-canonical-repair]', JSON.stringify(ph4967Repair));

  const { applyCuratedOfficialEvidenceBatch1 } = require('./scripts/migrations/run_076_apply_curated_official_evidence_batch1');
  const curatedEvidence = await applyCuratedOfficialEvidenceBatch1();
  console.log('[curated-official-evidence-batch1]', JSON.stringify(curatedEvidence));

  const { applyCuratedOfficialEvidenceBatch2 } = require('./scripts/migrations/run_078_apply_curated_official_evidence_batch2');
  const curatedEvidenceBatch2 = await applyCuratedOfficialEvidenceBatch2();
  console.log('[curated-official-evidence-batch2]', JSON.stringify(curatedEvidenceBatch2));

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