/**
 * validate-foundation.ts
 * ELIMFILTERS Engineering Intelligence Platform — Phase 1: Engineering Foundation
 *
 * Thin CLI runner for the Foundation Compliance validation engine.
 *
 * This file contains NO validation logic.
 * All rules are implemented in: src/lib/registry/validation.ts
 *
 * Usage:
 *   npx tsx scripts/validate-foundation.ts
 *
 * Exit code 0 — all checks pass.
 * Exit code 1 — one or more checks fail.
 */

import { runAllValidations } from '../src/lib/registry/validation';
import type { ValidationReport } from '../src/lib/registry/validation';

function printReport(report: ValidationReport): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(' ELIMFILTERS Engineering Intelligence Platform');
  console.log(' Phase 1 Foundation Compliance Report');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  ${report.timestamp}`);
  console.log('');

  for (const result of report.results) {
    const icon = result.passed ? '✓' : '✗';
    console.log(`  ${icon}  ${result.checkName}`);
    for (const e of result.errors)   console.log(`       ERROR:  ${e}`);
    for (const w of result.warnings) console.log(`       INFO:   ${w}`);
  }

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(
    `  Checks: ${report.summary.totalChecks}` +
    `  |  Passed: ${report.summary.passed}` +
    `  |  Failed: ${report.summary.failed}` +
    `  |  Errors: ${report.summary.totalErrors}` +
    `  |  Warnings: ${report.summary.totalWarnings}`
  );
  console.log(`  Overall: ${report.overallPassed ? 'PASS ✓' : 'FAIL ✗'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

const report = runAllValidations();
printReport(report);
process.exit(report.overallPassed ? 0 : 1);
