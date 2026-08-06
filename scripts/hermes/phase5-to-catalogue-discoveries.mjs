#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function isPlaceholder(value) {
  const text = String(value || '').toLowerCase();
  return text.includes('test manufacturer') || text.includes('test-0001') || text.includes('example.com');
}

function readCandidateFiles(inputPaths) {
  const files = [];
  for (const inputPath of inputPaths) {
    if (!fs.existsSync(inputPath)) continue;
    const stat = fs.statSync(inputPath);
    if (stat.isFile() && inputPath.endsWith('.json')) {
      files.push(inputPath);
      continue;
    }
    if (!stat.isDirectory()) continue;
    const stack = [inputPath];
    while (stack.length) {
      const directory = stack.pop();
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) stack.push(fullPath);
        else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
      }
    }
  }
  return files.sort();
}

function unwrapCandidates(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed?.candidates)) return parsed.candidates;
  if (parsed?.entity_type === 'intelligence_candidate') return [parsed];
  return [];
}

export function convertPhase5Candidate(candidate) {
  const structured = candidate?.catalogue_discovery;
  if (!structured || typeof structured !== 'object') {
    return { discovery: null, reason: 'structured_catalogue_discovery_required' };
  }

  const manufacturer = structured.manufacturer || structured.brand || '';
  const partNumber = structured.part_number || structured.partNumber || structured.sku || '';
  const changeType = structured.change_type || 'new_product';
  const sourceUrls = [...new Set([
    ...(Array.isArray(structured.source_urls) ? structured.source_urls : []),
    candidate.source_url
  ].filter(Boolean))];

  if (!manufacturer || (changeType !== 'coverage_gap' && !partNumber)) {
    return { discovery: null, reason: 'manufacturer_and_part_number_required' };
  }
  if (!CHANGE_TYPES.has(changeType)) {
    return { discovery: null, reason: 'invalid_change_type' };
  }
  if (!sourceUrls.length || sourceUrls.some((url) => !isHttpUrl(url))) {
    return { discovery: null, reason: 'valid_source_url_required' };
  }
  if ([manufacturer, partNumber, ...sourceUrls].some(isPlaceholder)) {
    return { discovery: null, reason: 'placeholder_data_rejected' };
  }

  const official = candidate.evidence_level === 'PRIMARY' && candidate.claim_scope === 'SOURCE_REPORTED';
  const sourceDate = structured.source_date || candidate.published_at || candidate.captured_at || null;
  if (!sourceDate) return { discovery: null, reason: 'source_date_required' };

  return {
    discovery: {
      schema_version: '1.0.0',
      change_type: changeType,
      manufacturer,
      part_number: partNumber,
      product_family: structured.product_family || null,
      applications: structured.applications || [],
      dimensions: structured.dimensions || {},
      cross_references: structured.cross_references || [],
      superseded_by: structured.superseded_by || null,
      catalogue_status: structured.catalogue_status || null,
      source_urls: sourceUrls,
      source_date: sourceDate,
      confidence: structured.confidence || (official ? 'high' : 'medium'),
      environmental_impact: structured.environmental_impact || {},
      status: official ? 'VERIFIED_OFFICIAL' : 'REVIEW_REQUIRED',
      approval: null,
      evidence: [
        {
          phase5_entity_code: candidate.entity_code || null,
          publisher: candidate.source_publisher || null,
          title: candidate.source_title || null,
          evidence_level: candidate.evidence_level || null,
          source_hash: candidate.source_hash || null,
          captured_at: candidate.captured_at || null
        }
      ],
      phase5_origin: {
        entity_code: candidate.entity_code || null,
        deduplication_key: candidate.deduplication_key || null,
        workflow_status: candidate.workflow_status || null
      }
    },
    reason: null
  };
}

export function buildDiscoveryEnvelope(candidates) {
  const discoveries = [];
  const skipped = [];
  const seen = new Set();

  for (const candidate of candidates) {
    const { discovery, reason } = convertPhase5Candidate(candidate);
    if (!discovery) {
      skipped.push({ entity_code: candidate?.entity_code || null, reason });
      continue;
    }
    const key = JSON.stringify([
      discovery.change_type,
      discovery.manufacturer.toUpperCase(),
      discovery.part_number.toUpperCase(),
      [...discovery.source_urls].sort()
    ]);
    if (seen.has(key)) {
      skipped.push({ entity_code: candidate?.entity_code || null, reason: 'duplicate_discovery' });
      continue;
    }
    seen.add(key);
    discoveries.push(discovery);
  }

  return {
    schema_version: '1.0.0',
    generated_at: new Date().toISOString(),
    dry_run: true,
    publication_enabled: false,
    source: 'HERMES_PHASE5_GOVERNED_CANDIDATES',
    summary: {
      phase5_candidates_checked: candidates.length,
      discoveries_created: discoveries.length,
      skipped: skipped.length
    },
    discoveries,
    skipped
  };
}

async function main() {
  const args = process.argv.slice(2);
  const outputFile = args.find((arg) => arg.startsWith('--output='))?.slice('--output='.length)
    || 'hermes/catalogue-discoveries/phase5-discoveries.json';
  const explicitInputs = args.filter((arg) => !arg.startsWith('--output='));
  const inputPaths = explicitInputs.length
    ? explicitInputs
    : ['hermes/real-candidates', 'hermes/real-candidates-previews'];

  const files = readCandidateFiles(inputPaths);
  const candidates = [];
  for (const file of files) {
    try {
      candidates.push(...unwrapCandidates(JSON.parse(fs.readFileSync(file, 'utf8'))));
    } catch (error) {
      console.warn(`[HERMES phase5→phase6] skipped invalid JSON ${file}: ${error.message}`);
    }
  }

  const envelope = buildDiscoveryEnvelope(candidates);
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(envelope, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({ output: outputFile, ...envelope.summary, dry_run: true, publication_enabled: false }, null, 2));
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(`[HERMES phase5→phase6] ${error.message}`);
    process.exit(1);
  });
}
