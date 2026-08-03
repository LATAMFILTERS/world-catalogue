#!/usr/bin/env node
// HERMES Phase 5 Lite — writes hermes/reports/source-coverage-report.{md,json}
// describing the governed source registry. Read-only; performs no network
// calls, no writes outside hermes/reports.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { loadRegistry, validateRegistry, buildCoverageReport, renderCoverageReportMarkdown } from './source-registry-core.mjs';

const organizationsPath = process.argv[2] || 'hermes/config/source-organizations.json';
const endpointsPath = process.argv[3] || 'hermes/config/source-endpoints.json';
const outputDir = path.resolve(process.argv[4] || 'hermes/reports');

const registry = loadRegistry(organizationsPath, endpointsPath);
const errors = validateRegistry(registry);
if (errors.length) {
  console.error(`[HERMES coverage report] registry failed validation (${errors.length} issue${errors.length === 1 ? '' : 's'}); fix hermes/config/source-organizations.json or source-endpoints.json before generating a coverage report`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

const report = buildCoverageReport(registry);
const markdown = renderCoverageReportMarkdown(report);

fs.mkdirSync(outputDir, { recursive: true });
const jsonPath = path.join(outputDir, 'source-coverage-report.json');
const mdPath = path.join(outputDir, 'source-coverage-report.md');
fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + '\n', 'utf8');
// renderCoverageReportMarkdown() already ends its output on a newline;
// normalize to exactly one trailing newline instead of appending a second.
fs.writeFileSync(mdPath, markdown.replace(/\n*$/, '\n'), 'utf8');

console.log(`[HERMES coverage report] wrote ${path.relative(process.cwd(), mdPath)} and ${path.relative(process.cwd(), jsonPath)}`);
console.log(`[HERMES coverage report] organizations=${report.totals.organizations} active_endpoints=${report.totals.active_endpoints} discovery_required=${report.totals.discovery_required_organizations}`);
