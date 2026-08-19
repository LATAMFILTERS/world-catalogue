'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function changedFiles() {
  const base = process.env.GITHUB_BASE_REF;
  const commands = base
    ? [`git diff --name-only origin/${base}...HEAD`]
    : ['git diff --name-only HEAD^ HEAD'];
  for (const cmd of commands) {
    try {
      return execSync(cmd, { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
    } catch (_) {}
  }
  return [];
}

const exempt = [
  /^scripts\/migrations\/run_07\d+_catalog_.*\.js$/,
  /^scripts\/migrations\/run_077_application_evidence_governance\.js$/,
  /^scripts\/catalog-historical-sanitation\.js$/,
  /^scripts\/migrations\/run_076_apply_curated_official_evidence_batch1\.js$/,
  /^lib\/catalog-write-gateway\.js$/,
  /^lib\/catalog-application-governance\.js$/,
  /^lib\/catalog-application-write-service\.js$/,
];

const canonicalWriteRisk = [
  /UPDATE\s+elimfilters_catalog[\s\S]{0,800}codigo_base/i,
  /INSERT\s+INTO\s+elimfilters_catalog/i,
  /api\/import\/donaldson/i,
  /api\/import\/fleetguard/i,
];

const applicationWriteRisk = [
  /UPDATE\s+elimfilters_catalog[\s\S]{0,1200}equipment_applications/i,
  /UPDATE\s+elimfilters_catalog[\s\S]{0,1200}vehicle_applications/i,
  /SET[\s\S]{0,800}equipment_applications\s*=/i,
  /SET[\s\S]{0,800}vehicle_applications\s*=/i,
  /equipment_applications\s*[:=]/i,
  /vehicle_applications\s*[:=]/i,
];

const violations = [];
for (const file of changedFiles()) {
  if (!/\.(js|mjs|cjs|ts|py)$/.test(file) || !fs.existsSync(file)) continue;
  if (exempt.some((re) => re.test(file))) continue;
  const text = fs.readFileSync(file, 'utf8');

  if (canonicalWriteRisk.some((re) => re.test(text))) {
    const gatewayAware = /catalog-write-gateway|CATALOG_WRITE_GATEWAY|catalog_codigo_base_governance/i.test(text);
    if (!gatewayAware) violations.push(`${file}:CANONICAL_WRITE`);
  }

  if (applicationWriteRisk.some((re) => re.test(text))) {
    const applicationGatewayAware = /catalog-application-write-service|applyVerifiedApplications|catalog-application-governance|APPLICATION_POLICY_V1/i.test(text);
    if (!applicationGatewayAware) violations.push(`${file}:APPLICATION_WRITE`);
  }
}

if (violations.length) {
  console.error('CATALOG_WRITE_BOUNDARY_VIOLATION');
  for (const file of [...new Set(violations)]) console.error(` - ${file}`);
  console.error('Catalog and application writes must pass the canonical evidence-governed gateway path.');
  process.exit(1);
}

console.log('[catalog-write-boundaries] PASS');
