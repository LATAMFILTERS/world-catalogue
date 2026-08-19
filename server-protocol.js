require('dotenv').config();
require('./lib/part-search-runtime-hardening');
require('./server');

// Run the catalog-wide reference-family audit automatically after startup.
// READ ONLY: this never mutates catalog rows. It removes the need to run the
// audit manually from a Render shell and writes a compact V2 summary to logs.
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
