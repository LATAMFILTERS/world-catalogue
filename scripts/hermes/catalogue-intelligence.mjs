#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const STATUSES = new Set([
  'VERIFIED_OFFICIAL',
  'VERIFIED_MULTI_SOURCE',
  'REVIEW_REQUIRED',
  'CONFLICTING_DATA',
  'INSUFFICIENT_DATA',
  'REJECTED',
  'APPROVED_FOR_PUBLICATION',
  'PUBLISHED'
]);

const CHANGE_TYPES = new Set([
  'new_product',
  'application_update',
  'cross_reference',
  'supersession',
  'discontinuation',
  'technical_change',
  'catalogue_correction',
  'catalogue_conflict',
  'coverage_gap',
  'environmental_improvement'
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizePart(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeBrand(value) {
  return String(value || '').trim().toUpperCase();
}

function productKey(item) {
  return `${normalizeBrand(item.brand || item.manufacturer)}::${normalizePart(item.part_number || item.partNumber || item.sku)}`;
}

function stableId(candidate) {
  return crypto.createHash('sha256').update(JSON.stringify({
    change_type: candidate.change_type,
    manufacturer: normalizeBrand(candidate.manufacturer),
    part_number: normalizePart(candidate.part_number),
    source_urls: [...(candidate.source_urls || [])].sort()
  })).digest('hex').slice(0, 20);
}

function validateCandidate(candidate) {
  const errors = [];
  if (!CHANGE_TYPES.has(candidate.change_type)) errors.push('invalid change_type');
  if (!candidate.manufacturer) errors.push('manufacturer required');
  if (!candidate.part_number && candidate.change_type !== 'coverage_gap') errors.push('part_number required');
  if (!Array.isArray(candidate.source_urls) || candidate.source_urls.length === 0) errors.push('at least one source_url required');
  if (!candidate.source_date) errors.push('source_date required');
  if (!STATUSES.has(candidate.status || 'REVIEW_REQUIRED')) errors.push('invalid status');
  if (candidate.status === 'APPROVED_FOR_PUBLICATION' && !candidate.approval?.approved_by) errors.push('approval metadata required');
  return errors;
}

function hasOwn(object, field) {
  return Object.prototype.hasOwnProperty.call(object, field);
}

function compareCandidate(candidate, catalogIndex, raw) {
  const key = productKey(candidate);
  const current = catalogIndex.get(key) || null;
  const result = { exists: Boolean(current), differences: [], current };
  if (!current) return result;

  // Candidate `status` is workflow governance metadata, not catalogue product data.
  // Compare only catalogue fields explicitly supplied by the discovery so defaults
  // such as [] or {} cannot create false-positive changes.
  const comparableFields = [
    'product_family',
    'applications',
    'cross_references',
    'dimensions',
    'superseded_by',
    'catalogue_status',
    'environmental_impact'
  ];

  for (const field of comparableFields) {
    if (!hasOwn(raw, field)) continue;

    const currentField = field === 'catalogue_status' ? 'status' : field;
    const proposed = candidate[field];
    const existing = current[currentField];

    if (JSON.stringify(proposed) !== JSON.stringify(existing)) {
      result.differences.push({
        field: currentField,
        current: existing ?? null,
        proposed
      });
    }
  }

  return result;
}

export function buildCatalogueCandidates({ discoveries, catalog }) {
  const catalogItems = Array.isArray(catalog) ? catalog : (catalog.products || catalog.items || []);
  const catalogIndex = new Map(catalogItems.map((item) => [productKey(item), item]));
  const output = [];

  for (const raw of discoveries) {
    const candidate = {
      schema_version: '1.0.0',
      candidate_id: raw.candidate_id || null,
      change_type: raw.change_type || 'new_product',
      manufacturer: raw.manufacturer || raw.brand || '',
      part_number: raw.part_number || raw.partNumber || raw.sku || '',
      product_family: raw.product_family || null,
      applications: raw.applications || [],
      dimensions: raw.dimensions || {},
      cross_references: raw.cross_references || [],
      superseded_by: raw.superseded_by || null,
      catalogue_status: raw.catalogue_status || null,
      source_urls: raw.source_urls || [],
      source_date: raw.source_date || null,
      confidence: raw.confidence || 'medium',
      environmental_impact: raw.environmental_impact || {},
      status: raw.status || 'REVIEW_REQUIRED',
      approval: raw.approval || null,
      evidence: raw.evidence || [],
      created_at: raw.created_at || new Date().toISOString()
    };

    candidate.candidate_id = candidate.candidate_id || stableId(candidate);
    candidate.validation_errors = validateCandidate(candidate);
    candidate.catalogue_comparison = compareCandidate(candidate, catalogIndex, raw);

    if (candidate.validation_errors.length) {
      candidate.status = 'INSUFFICIENT_DATA';
    } else if (!candidate.catalogue_comparison.exists && candidate.change_type === 'new_product') {
      candidate.status = candidate.status === 'VERIFIED_OFFICIAL' || candidate.status === 'VERIFIED_MULTI_SOURCE'
        ? candidate.status
        : 'REVIEW_REQUIRED';
    } else if (candidate.catalogue_comparison.exists && candidate.catalogue_comparison.differences.length === 0) {
      candidate.status = 'REJECTED';
      candidate.rejection_reason = 'No catalogue change detected';
    } else if (candidate.catalogue_comparison.exists && candidate.catalogue_comparison.differences.length > 0) {
      candidate.status = candidate.status === 'VERIFIED_OFFICIAL' || candidate.status === 'VERIFIED_MULTI_SOURCE'
        ? candidate.status
        : 'REVIEW_REQUIRED';
    }

    output.push(candidate);
  }

  return {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    dry_run: true,
    publication_enabled: false,
    summary: {
      discoveries_checked: discoveries.length,
      candidates_created: output.filter((x) => x.status !== 'REJECTED').length,
      rejected_no_change: output.filter((x) => x.rejection_reason === 'No catalogue change detected').length,
      insufficient_data: output.filter((x) => x.status === 'INSUFFICIENT_DATA').length,
      requires_review: output.filter((x) => x.status === 'REVIEW_REQUIRED').length
    },
    candidates: output
  };
}

function main() {
  const [discoveriesPath, catalogPath, outputDir = 'hermes/catalogue-candidates'] = process.argv.slice(2);
  if (!discoveriesPath || !catalogPath) {
    console.error('Usage: node scripts/hermes/catalogue-intelligence.mjs <discoveries.json> <catalog.json> [output-dir]');
    process.exit(2);
  }
  const discoveriesRaw = readJson(discoveriesPath);
  const discoveries = Array.isArray(discoveriesRaw) ? discoveriesRaw : (discoveriesRaw.discoveries || discoveriesRaw.candidates || []);
  const catalog = readJson(catalogPath);
  const report = buildCatalogueCandidates({ discoveries, catalog });
  fs.mkdirSync(outputDir, { recursive: true });
  const file = path.join(outputDir, `catalogue-candidates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: file, ...report.summary }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
