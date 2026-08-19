require('dotenv').config();
require('./lib/part-search-runtime-hardening');

async function start() {
  const { installPolicyV3 } = require('./scripts/migrations/run_072_catalog_codigo_base_governance_v3');
  const policy = await installPolicyV3({ backfill: true });
  console.log('[catalog-codigo-base-policy-v3]', JSON.stringify(policy));

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
}

start().catch((error) => {
  console.error('[catalog-codigo-base-policy-v3] startup enforcement failed', error);
  process.exit(1);
});
