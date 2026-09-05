#!/usr/bin/env node

/**
 * Safe postinstall for CI/CD and local development.
 * Legacy server mutation is intentionally not part of install-time behavior.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const frontendOutDir = path.join(root, 'frontend', 'out');
const isFrontendBuilt = fs.existsSync(frontendOutDir);

if (!isFrontendBuilt) {
  console.log('[postinstall] ℹ Frontend not built yet (frontend/out missing). Skipping frontend patches.');
  console.log('[postinstall] ℹ This is normal for CI/CD environments where frontend builds separately.');
  console.log('[postinstall] ℹ Proceeding with source checks only.\n');
}

const scripts = [
  'apply-part-search-ui-fix.js',
  'apply-part-search-results-link-fix.js',
  'apply-technology-uniformity-source-fix.js',
  'apply-about-who-we-are-fix.js',
  'apply-navigation-font-uniformity.js',
  'apply-vehicle-chat-search-fix.js',
  'apply-vehicle-generation-sanity-fix.js',
  'apply-vehicle-coverage-audit.js',
];

const checks = [
  'src/coverage-audit-engine.js',
  'scripts/verify-coverage-audit-direct.js',
  'lib/catalog-write-gateway.js',
  'lib/catalog-application-governance.js',
  'lib/catalog-application-write-service.js',
  'scripts/migrations/run_077_application_evidence_governance.js',
  'lib/bot-protocol-reference-response-policy.js',
  'lib/bot-protocol-reference-preflight.js',
  'lib/bot-protocol-guardrails.js',
  'lib/bot-protocol.js',
  'lib/bot-protocol-web-adapter.js',
];

let failed = false;

if (isFrontendBuilt) {
  for (const script of scripts) {
    try {
      console.log(`[postinstall] ⟳ ${script}...`);
      execFileSync(process.execPath, [path.join('scripts', script)], { stdio: 'inherit', cwd: root });
    } catch {
      console.error(`[postinstall] ✗ ${script} failed`);
      failed = true;
    }
  }
}

for (const file of checks) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    console.error(`[postinstall] ✗ Missing required file: ${file}`);
    failed = true;
    continue;
  }
  try {
    console.log(`[postinstall] ⟳ Checking ${file}...`);
    execFileSync(process.execPath, ['--check', absolute], { stdio: 'pipe' });
    console.log(`[postinstall] ✓ ${file}`);
  } catch {
    console.error(`[postinstall] ✗ Syntax check failed: ${file}`);
    failed = true;
  }
}

if (!failed) {
  try {
    console.log('[postinstall] ⟳ Verifying coverage audit modules...');
    execFileSync(process.execPath, [path.join('scripts', 'verify-coverage-audit-direct.js')], { stdio: 'inherit', cwd: root });
  } catch {
    console.error('[postinstall] ✗ Coverage audit verification failed');
    failed = true;
  }
}

if (!failed) {
  try {
    console.log('[postinstall] ⟳ Running catalog governance regressions...');
    execFileSync(process.execPath, [
      '--test',
      'tests/catalog-write-gateway.test.js',
      'tests/catalog-codigo-base-governance.test.js',
      'tests/catalog-historical-sanitation.test.js',
      'tests/catalog-application-governance.test.js',
    ], { stdio: 'inherit', cwd: root });
    console.log('[postinstall] ✓ Catalog governance regressions');
  } catch {
    console.error('[postinstall] ✗ Catalog governance regressions failed');
    failed = true;
  }
}

if (!failed) {
  try {
    console.log('[postinstall] ⟳ Running mandatory chatbot reference certification gate...');
    execFileSync(process.execPath, [
      '--test',
      'tests/bot-protocol-guardrails.test.js',
      'tests/bot-protocol-reference-response-policy.test.js',
      'tests/bot-protocol-reference-preflight.test.js',
      'tests/bot-protocol-reference-certification.test.js',
      'tests/bot-protocol-e2e.test.js',
    ], { stdio: 'inherit', cwd: root });
    console.log('[postinstall] ✓ Chatbot reference certification gate');
  } catch {
    console.error('[postinstall] ✗ Chatbot reference certification gate failed');
    failed = true;
  }
}

if (failed) {
  console.error('\n[postinstall] ✗ Some postinstall steps failed');
  process.exit(1);
}

console.log('\n[postinstall] ✓ All postinstall steps completed');
process.exit(0);
