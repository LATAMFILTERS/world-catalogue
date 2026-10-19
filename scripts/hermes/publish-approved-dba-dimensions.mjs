#!/usr/bin/env node
// Controlled, dimensions-only publication of a verified Donaldson DB candidate.
// Two explicit local approval switches are required; the main publisher enforces
// immutable plan hash, live gate, snapshot match, backup, rollback, and post-write checks.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { buildCataloguePublicationPlan } from './catalogue-publication-plan.mjs';
import { executeCataloguePublicationPlan } from './publish-catalogue-plan.mjs';

const [reportFile, snapshotFile, evidenceFile, ...flags] = process.argv.slice(2);
if (!reportFile || !snapshotFile || !evidenceFile) {
  console.error('Usage: node scripts/hermes/publish-approved-dba-dimensions.mjs <review.json> <snapshot.json> <official-evidence.jsonl> [--approve-knowledge --approve-catalogue --apply]');
  process.exit(2);
}
const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(snapshotFile, 'utf8'));
const evidence = fs.readFileSync(evidenceFile, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const rows = report.candidates || [];
if (rows.length !== 1 || rows[0].existing_sku !== 'EA10005') throw new Error('Exactly one EA10005 candidate required');
const row = rows[0];
if ((row.dimension_conflicts || []).length) throw new Error('Conflicting dimensions; publication refused');
const patch = row.proposed_additive_updates || {};
if (!patch.dimensions || Object.keys(patch).some(k => k !== 'dimensions')) {
  throw new Error('Dimensions-only update required; applications and all other fields must be excluded');
}
const source = evidence.find(x => x.codigo_base === 'DBA5000' && x.status === 'OK' &&
  x.audit?.expansion_complete && x.official?.part_number === 'DBA5000' &&
  /^https:\/\/shop\.donaldson\.com\//.test(x.source_url || ''));
if (!source) throw new Error('Verified official DBA5000 extraction required');
const products = Array.isArray(snapshot) ? snapshot : snapshot.products;
if (!Array.isArray(products)) throw new Error('Snapshot products missing');
const current = products.find(p => p.sku === 'EA10005');
if (!current) throw new Error('EA10005 missing from snapshot');
const canonical = obj => JSON.stringify(obj, Object.keys(obj || {}).sort());
if (canonical(current.dimensions || {}) !== canonical(patch.dimensions.before || {})) {
  throw new Error('Dimensions before-state does not match snapshot');
}
const approvedKnowledge = flags.includes('--approve-knowledge');
const approvedCatalogue = flags.includes('--approve-catalogue');
const apply = flags.includes('--apply');
if (apply && !(approvedKnowledge && approvedCatalogue)) {
  throw new Error('Live publication requires both --approve-knowledge and --approve-catalogue');
}
if (apply && String(process.env.HERMES_CATALOGUE_PUBLISH_LIVE).toLowerCase() !== 'true') {
  throw new Error('HERMES_CATALOGUE_PUBLISH_LIVE=true required');
}
const now = new Date().toISOString();
const bundleId = 'DBA5000-DIMENSIONS-' + createHash('sha256')
  .update(JSON.stringify([source.source_url, current.sku, patch.dimensions])).digest('hex').slice(0,16);
const candidate = {
  research_bundle_id: bundleId, status: 'APPROVED_FOR_PUBLICATION',
  change_type: 'technical_change', source_urls: [source.source_url],
  evidence: [{ source_url: source.source_url, source_code: 'DBA5000', evidence_type: 'official_dimensions' }],
  approval: { approved_by: 'Victor Abreu', approved_at: now, approved_fields: ['dimensions'] },
  publication: {
    target_sku: 'EA10005', approved_fields: ['dimensions'],
    proposed_values: { dimensions: patch.dimensions.after }
  }
};
const knowledge = {
  research_bundle_id: bundleId, workflow_status: 'APPROVED',
  approval_required: true, approved_by: 'Victor Abreu', approved_at: now
};
const bundle = { research_bundle_id: bundleId, knowledge_candidate: knowledge, catalogue_candidate: candidate };
if (!apply) {
  console.log(JSON.stringify({ outcome:'PREVIEW_ONLY', sku:'EA10005',
    proposed_fields:['dimensions'], before:patch.dimensions.before, after:patch.dimensions.after,
    required_approval_flags:['--approve-knowledge','--approve-catalogue','--apply'],
    database_write:false },null,2));
  process.exit(0);
}
const plan = buildCataloguePublicationPlan({ bundle, catalog:snapshot });
if (plan.operations.length !== 1 || plan.operations[0].field !== 'dimensions') {
  throw new Error('Unexpected publication operation');
}
const connectionString = process.env.CATALOG_DATABASE_URL || process.env.ELIMFILTERS_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('A writable catalogue database URL is required');
const { Pool } = await import('pg');
const pool = new Pool({ connectionString, ssl: new URL(connectionString).hostname === '127.0.0.1' || new URL(connectionString).hostname === 'localhost' ? false : { rejectUnauthorized:false },
  application_name:'hermes-approved-dba-dimensions', max:1 });
try {
  const outcome = await executeCataloguePublicationPlan({ plan, pool, apply:true });
  console.log(JSON.stringify({ ...outcome, published_fields:['dimensions'],
    applications_published:0 },null,2));
} finally { await pool.end(); }
