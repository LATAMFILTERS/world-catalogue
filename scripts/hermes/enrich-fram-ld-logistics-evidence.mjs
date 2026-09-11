#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { extractFramLdLogisticsEvidence } = require('../../lib/knowledge-governance/fram-ld-logistics-evidence');

const root = path.resolve('elimfilters-vault/91-private-evidence/fram-ld-product-pages');
if (!fs.existsSync(root)) {
  console.log('[FRAM LD logistics] no product evidence directory; nothing to enrich');
  process.exit(0);
}

const runs = fs.readdirSync(root, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => path.join(root, d.name))
  .sort();
const runDir = runs.at(-1);
if (!runDir) process.exit(0);

let enriched = 0;
for (const name of fs.readdirSync(runDir).filter(n => /^fram_ld_product_.*\.json$/i.test(n))) {
  const file = path.join(runDir, name);
  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const snapshotPath = payload.source_snapshot_path ? path.resolve(payload.source_snapshot_path) : null;
  if (!snapshotPath || !fs.existsSync(snapshotPath)) continue;
  const html = fs.readFileSync(snapshotPath, 'utf8');
  payload.logistics = extractFramLdLogisticsEvidence(html);
  payload.logistics.source_snapshot_sha256 = payload.source_snapshot_sha256 || null;
  payload.logistics.evidence_layer = 'LD_LOGISTICS_EVIDENCE';
  payload.logistics.knowledge_domain = 'LIGHT_DUTY_KNOWLEDGE_DOMAIN';
  payload.logistics.industry = 'Automotive';
  fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
  enriched += 1;
}

const report = {
  schema_version: '1.0.0',
  run_directory: path.relative(process.cwd(), runDir).replaceAll('\\', '/'),
  enriched_product_records: enriched,
  database_write: false,
  logistics_auto_write: false,
  europe_promotion_allowed: false,
  nomenclature_policy: 'FRAM_LD_NON_EUROPE_ONLY_MANN_FILTER_GOVERNS_EUROPE'
};
fs.writeFileSync(path.join(runDir, 'logistics-enrichment-report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`[FRAM LD logistics] enriched=${enriched} database_write=false europe_promotion_allowed=false`);
