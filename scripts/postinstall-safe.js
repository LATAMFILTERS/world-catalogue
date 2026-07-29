#!/usr/bin/env node

/**
 * Safe postinstall script that gracefully handles missing frontend/out directory
 * Runs on both CI/CD (where frontend/out might not be built yet) and development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if frontend/out exists (i.e., frontend has been built)
const frontendOutDir = path.join(__dirname, '..', 'frontend', 'out');
const isFrontendBuilt = fs.existsSync(frontendOutDir);

if (!isFrontendBuilt) {
  console.log('[postinstall] ℹ Frontend not built yet (frontend/out missing). Skipping frontend patches.');
  console.log('[postinstall] ℹ This is normal for CI/CD environments where frontend builds separately.');
  console.log('[postinstall] ℹ Proceeding with syntax checks only.\n');
}

const scripts = [
  { name: 'apply-part-search-ui-fix.js', requiresFrontend: true },
  { name: 'apply-part-search-results-link-fix.js', requiresFrontend: true },
  { name: 'apply-technology-uniformity-source-fix.js', requiresFrontend: true },
  { name: 'apply-about-who-we-are-fix.js', requiresFrontend: true },
  { name: 'apply-navigation-font-uniformity.js', requiresFrontend: true },
  { name: 'apply-vehicle-chat-search-fix.js', requiresFrontend: true },
  { name: 'apply-vehicle-generation-sanity-fix.js', requiresFrontend: true },
  { name: 'apply-vehicle-coverage-audit.js', requiresFrontend: true },
];

const checks = [
  { file: 'src/coverage-audit-engine.js', type: 'syntax' },
  { file: 'scripts/register-coverage-audit-direct.js', type: 'syntax' },
  { file: 'server-original.js', type: 'syntax' },
];

let failed = false;

// Run frontend patch scripts only if frontend is built
if (isFrontendBuilt) {
  for (const script of scripts) {
    try {
      console.log(`[postinstall] ⟳ ${script.name}...`);
      execSync(`node scripts/${script.name}`, { stdio: 'inherit' });
    } catch (error) {
      console.error(`[postinstall] ✗ ${script.name} failed`);
      failed = true;
    }
  }
}

// Run syntax checks (always required)
for (const check of checks) {
  try {
    console.log(`[postinstall] ⟳ Checking ${check.file}...`);
    execSync(`node --check ${check.file}`, { stdio: 'pipe' });
    console.log(`[postinstall] ✓ ${check.file}`);
  } catch (error) {
    console.error(`[postinstall] ✗ Syntax check failed: ${check.file}`);
    failed = true;
  }
}

// Run critical registration script
try {
  console.log('[postinstall] ⟳ Registering coverage audit...');
  execSync('node scripts/register-coverage-audit-direct.js', { stdio: 'inherit' });
} catch (error) {
  console.error('[postinstall] ✗ Coverage audit registration failed');
  failed = true;
}

// Run verification only if everything else succeeded
if (!failed) {
  try {
    console.log('[postinstall] ⟳ Verifying coverage audit...');
    execSync('node scripts/verify-coverage-audit-direct.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('[postinstall] ✗ Verification failed');
    failed = true;
  }
}

if (failed) {
  console.error('\n[postinstall] ✗ Some postinstall steps failed');
  process.exit(1);
} else {
  console.log('\n[postinstall] ✓ All postinstall steps completed');
  process.exit(0);
}
