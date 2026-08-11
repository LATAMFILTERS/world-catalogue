#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SOURCE_TYPES = new Set([
  'oem_catalogue', 'aftermarket_catalogue', 'official_api', 'official_pdf',
  'technical_bulletin', 'service_information', 'product_announcement'
]);

const CHANGE_TYPES = new Set([
  'new_product', 'application_update', 'cross_reference', 'supersession',
  'discontinuation', 'technical_change', 'catalogue_correction', 'catalogue_conflict', 'coverage_gap'
]);

function normalizePart(value) { return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function stableId(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24); }

function hostname(value) {
  try { const url = new URL(value); return url.protocol === 'https:' ? url.hostname.toLowerCase().replace(/^www\./, '') : null; } catch { return null; }
}

function domainAllowed(sourceUrl, organization) {
  const sourceHost = hostname(sourceUrl);
  const domains = [organization?.official_domain, ...(organization?.approved_source_domains || [])]
    .map(hostname).filter(Boolean);
  return Boolean(sourceHost && domains.some((domain) => sourceHost === domain || sourceHost.endsWith(`.${domain}`)));
}

function validDate(value) { return Boolean(value && !Number.isNaN(Date.parse(value))); }

function completenessErrors(record) {
  const errors = [];
  const changeType = record.change_type || 'new_product';
  if (changeType === 'new_product' && !record.product_family) errors.push('new_product requires product_family');
  if (changeType === 'cross_reference' && !(record.cross_references || []).length) errors.push('cross_reference requires cross_references');
  if (changeType === 'application_update') {
    if (!(record.applications || []).length) errors.push('application_update requires applications');
    for (const application of record.applications || []) {
      if (!application?.make || !application?.model) errors.push('each application requires make and model');
    }
  }
  if (changeType === 'supersession' && !record.superseded_by) errors.push('supersession requires superseded_by');
  return [...new Set(errors)];
}

export function validateOfficialEvidence(record, organizations) {
  const errors = [];
  const organization = (organizations || []).find((item) => item.id === record?.organization_id);
  if (!organization) errors.push('known organization_id required');
  if (!SOURCE_TYPES.has(record?.source_type)) errors.push('unsupported official source_type');
  if (organization && record?.source_type === 'oem_catalogue' && !String(organization.category || '').startsWith('oem_')) {
    errors.push('oem_catalogue requires an OEM organization category');
  }
  if (organization && record?.source_type === 'aftermarket_catalogue' && organization.category !== 'filtration_competitor') {
    errors.push('aftermarket_catalogue requires a filtration_competitor organization category');
  }
  if (!CHANGE_TYPES.has(record?.change_type || 'new_product')) errors.push('unsupported change_type');
  if (!record?.manufacturer) errors.push('manufacturer required');
  if ((record?.change_type || 'new_product') !== 'coverage_gap' && !record?.part_number) errors.push('part_number required');
  if (!domainAllowed(record?.source_url, organization)) errors.push('source_url must be HTTPS and belong to the registered official organization domain');
  if (!validDate(record?.captured_at)) errors.push('captured_at required');
  if (record?.published_at != null && !validDate(record.published_at)) errors.push('published_at invalid');
  if (!/^[a-f0-9]{64}$/.test(record?.source_hash || '')) errors.push('source_hash must be SHA-256');
  return { errors, organization };
}

export function buildOfficialCatalogueEvidence(records, organizations, generatedAt = new Date().toISOString()) {
  const rejected = [];
  const discoveries = [];
  const seen = new Set();

  for (const record of records || []) {
    const { errors, organization } = validateOfficialEvidence(record, organizations);
    if (errors.length) {
      rejected.push({ organization_id: record?.organization_id || null, part_number: record?.part_number || null, errors });
      continue;
    }
    const key = `${record.organization_id}::${record.change_type || 'new_product'}::${normalizePart(record.part_number)}::${record.source_hash}`;
    if (seen.has(key)) {
      rejected.push({ organization_id: record.organization_id, part_number: record.part_number || null, errors: ['duplicate official evidence'] });
      continue;
    }
    seen.add(key);
    const research = completenessErrors(record);
    discoveries.push({
      evidence_id: `OFFICIAL_${stableId(key)}`,
      schema_version: '1.0.0',
      organization_id: record.organization_id,
      organization_name: organization.name,
      organization_category: organization.category,
      source_type: record.source_type,
      source_url: record.source_url,
      source_hash: record.source_hash,
      source_date: record.published_at || record.captured_at,
      captured_at: record.captured_at,
      evidence_level: 'PRIMARY',
      claim_scope: 'SOURCE_REPORTED',
      change_type: record.change_type || 'new_product',
      manufacturer: record.manufacturer,
      part_number: record.part_number || '',
      product_family: record.product_family || null,
      applications: record.applications || [],
      dimensions: record.dimensions || {},
      technical_specs: record.technical_specs || {},
      cross_references: record.cross_references || [],
      superseded_by: record.superseded_by || null,
      workflow_status: research.length ? 'NEEDS_RESEARCH' : 'PENDING_REVIEW',
      research_reasons: research,
      confidence: research.length ? 'medium' : 'high',
      approval_required: true,
      automatic_publication_allowed: false
    });
  }

  return {
    schema_version: '1.0.0', generated_at: generatedAt, read_only: true,
    publication_enabled: false, authority: 'PRIMARY_SOURCE_REQUIRES_APPROVAL',
    summary: {
      records_checked: (records || []).length,
      official_discoveries: discoveries.length,
      pending_review: discoveries.filter((item) => item.workflow_status === 'PENDING_REVIEW').length,
      needs_research: discoveries.filter((item) => item.workflow_status === 'NEEDS_RESEARCH').length,
      rejected: rejected.length
    },
    discoveries, rejected
  };
}

async function main() {
  const [inputPath, organizationsPath = 'hermes/config/source-organizations.json', outputDir = 'hermes/official-evidence'] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node scripts/hermes/official-catalogue-evidence.mjs <authorized-source-export.json> [source-organizations.json] [output-dir]');
    process.exit(2);
  }
  const input = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const organizationsDoc = JSON.parse(fs.readFileSync(path.resolve(organizationsPath), 'utf8'));
  const report = buildOfficialCatalogueEvidence(Array.isArray(input) ? input : (input.records || []), organizationsDoc.organizations || []);
  fs.mkdirSync(outputDir, { recursive: true });
  const output = path.join(outputDir, `official-evidence-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...report.summary, publication_enabled: false }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES official evidence] ${error.message}`); process.exit(1); });
}
