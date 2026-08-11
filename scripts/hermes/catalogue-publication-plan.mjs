#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const PUBLISHABLE_CATALOGUE_FIELDS = new Set([
  'filter_type', 'duty', 'technology', 'dimensions', 'technical_specs',
  'equipment_applications', 'oem_codes', 'competitor_codes',
  'brand_crossrefs', 'superseded_by', 'catalogue_status'
]);

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  }
  return value;
}

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}

function validDate(value) {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function normalizeSku(value) {
  return String(value || '').trim().toUpperCase();
}

export function buildCataloguePublicationPlan({ bundle, catalog, generatedAt = new Date().toISOString() }) {
  const knowledge = bundle?.knowledge_candidate;
  const candidate = bundle?.catalogue_candidate;
  assert(knowledge && candidate, 'Linked knowledge and catalogue candidates are required');
  assert(bundle.research_bundle_id && bundle.research_bundle_id === knowledge.research_bundle_id && bundle.research_bundle_id === candidate.research_bundle_id,
    'research_bundle_id must match across the linked bundle');
  assert(knowledge.workflow_status === 'APPROVED', 'Knowledge candidate must be APPROVED');
  assert(knowledge.approval_required === true, 'Knowledge candidate must preserve approval_required=true');
  assert(knowledge.approved_by === 'Victor Abreu' && validDate(knowledge.approved_at), 'Victor approval is required for the knowledge candidate');
  assert(candidate.status === 'APPROVED_FOR_PUBLICATION', 'Catalogue candidate must be APPROVED_FOR_PUBLICATION');
  assert(candidate.approval?.approved_by === 'Victor Abreu' && validDate(candidate.approval?.approved_at), 'Victor approval is required for the catalogue candidate');

  const publication = candidate.publication;
  assert(publication && typeof publication === 'object', 'Explicit publication instructions are required');
  const targetSku = normalizeSku(publication.target_sku);
  assert(targetSku, 'target_sku is required; Hermes cannot assign or invent SKUs');
  const catalogItems = Array.isArray(catalog) ? catalog : (catalog?.products || []);
  const current = catalogItems.find((item) => normalizeSku(item.sku) === targetSku);
  assert(current, `target_sku ${targetSku} does not exist; new SKU creation requires a separate manual process`);

  const approvedFields = publication.approved_fields;
  const proposedValues = publication.proposed_values;
  assert(Array.isArray(approvedFields) && approvedFields.length > 0, 'approved_fields must contain at least one field');
  assert(new Set(approvedFields).size === approvedFields.length, 'approved_fields cannot contain duplicates');
  assert(proposedValues && typeof proposedValues === 'object' && !Array.isArray(proposedValues), 'proposed_values must be an object');
  assert(approvedFields.every((field) => PUBLISHABLE_CATALOGUE_FIELDS.has(field)), 'approved_fields contains a non-publishable field');
  assert(Object.keys(proposedValues).every((field) => approvedFields.includes(field)), 'proposed_values contains a field that was not approved');
  assert(approvedFields.every((field) => Object.hasOwn(proposedValues, field)), 'Every approved field must have an explicit proposed value');
  if (candidate.approval.approved_fields) {
    assert(hash([...candidate.approval.approved_fields].sort()) === hash([...approvedFields].sort()), 'Publication fields do not match the approved field list');
  }

  const operations = approvedFields.map((field) => ({
    field,
    before: Object.hasOwn(current, field) ? current[field] : null,
    after: proposedValues[field]
  })).filter((operation) => hash(operation.before) !== hash(operation.after));
  assert(operations.length > 0, 'No catalogue change remains after comparison with the current snapshot');

  const snapshotIdentity = { sku: targetSku, values: Object.fromEntries(approvedFields.map((field) => [field, Object.hasOwn(current, field) ? current[field] : null])) };
  const planCore = {
    schema_version: '1.0.0', research_bundle_id: bundle.research_bundle_id,
    target_sku: targetSku, change_type: candidate.change_type,
    approval: { approved_by: candidate.approval.approved_by, approved_at: candidate.approval.approved_at, approved_fields: approvedFields },
    knowledge_approval: { approved_by: knowledge.approved_by, approved_at: knowledge.approved_at },
    snapshot_sha256: hash(snapshotIdentity), operations,
    evidence: candidate.evidence || [], source_urls: candidate.source_urls || []
  };
  return {
    ...planCore, generated_at: generatedAt,
    plan_sha256: hash(planCore), dry_run: true, database_write: false,
    transaction_required: true, backup_required: true, rollback_required: true
  };
}

async function main() {
  const [bundlePath, catalogPath, outputPath = 'hermes/catalogue-publication-plans/catalogue-publication-plan.json'] = process.argv.slice(2);
  if (!bundlePath || !catalogPath) {
    console.error('Usage: node scripts/hermes/catalogue-publication-plan.mjs <linked-bundle.json> <catalog-snapshot.json> [output.json]');
    process.exit(2);
  }
  const read = (file) => JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  const input = read(bundlePath);
  const bundle = input.knowledge_candidate ? input : (input.bundles?.[0]);
  assert(bundle, 'Input does not contain a linked bundle');
  const plan = buildCataloguePublicationPlan({ bundle, catalog: read(catalogPath) });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(plan, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, target_sku: plan.target_sku, operations: plan.operations.length, dry_run: true }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES catalogue publication plan] ${error.message}`); process.exit(1); });
}
