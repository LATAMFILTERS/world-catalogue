#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function hash(value) { return crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex'); }

function targetFor(changeType) {
  if (['application_update', 'coverage_gap'].includes(changeType)) return '13-equipment';
  if (changeType === 'technical_change') return '01-technologies';
  if (['catalogue_correction', 'catalogue_conflict'].includes(changeType)) return '14-intelligence';
  return '09-products';
}

function candidateTypeFor(changeType) {
  if (changeType === 'application_update') return 'application_update';
  if (changeType === 'coverage_gap') return 'coverage_gap';
  if (changeType === 'cross_reference' || changeType === 'supersession') return 'oem_reference_update';
  if (changeType === 'technical_change') return 'technical_bulletin';
  return 'competitor_product_update';
}

function unique(values) { return [...new Set(values.filter(Boolean).map(String))]; }

function officialEvidenceItems(report) {
  return (report?.discoveries || []).map((item) => ({
    origin: 'official', evidence_id: item.evidence_id, evidence_level: 'PRIMARY',
    workflow_status: item.workflow_status, source_type: item.source_type,
    source_url: item.source_url, source_hash: item.source_hash,
    source_publisher: item.organization_name, captured_at: item.captured_at,
    change_type: item.change_type, manufacturer: item.manufacturer, part_number: item.part_number,
    product_family: item.product_family, applications: item.applications || [], dimensions: item.dimensions || {},
    technical_specs: item.technical_specs || {}, cross_references: item.cross_references || [],
    superseded_by: item.superseded_by || null, confidence: item.confidence
  }));
}

function marketplaceEvidenceItems(report) {
  return (report?.evidence_bundles || []).map((bundle) => {
    const first = bundle.listings?.[0] || {};
    const applications = bundle.listings?.flatMap((item) => item.applications || []) || [];
    const crossReferences = unique(bundle.listings?.flatMap((item) => item.cross_references || []) || []);
    const changeType = crossReferences.length ? 'cross_reference' : (applications.length ? 'application_update' : 'coverage_gap');
    return {
      origin: 'marketplace', evidence_id: bundle.evidence_id, evidence_level: bundle.evidence_level,
      workflow_status: bundle.workflow_status, source_type: 'marketplace_listing',
      source_url: first.url, source_hash: hash(bundle), source_publisher: 'Amazon/eBay seller evidence',
      captured_at: first.captured_at, change_type: changeType, manufacturer: bundle.manufacturer,
      part_number: bundle.part_number, product_family: null, applications, dimensions: first.dimensions || {},
      technical_specs: {}, cross_references: crossReferences, superseded_by: null,
      confidence: bundle.evidence_level === 'SECONDARY_VERIFIED' ? 'medium' : 'low'
    };
  });
}

export function buildDualTrackCandidates({ officialEvidence = null, marketplaceEvidence = null, generatedAt = new Date().toISOString() } = {}) {
  const items = [...officialEvidenceItems(officialEvidence), ...marketplaceEvidenceItems(marketplaceEvidence)];
  const bundles = items.map((item) => {
    const bundleSeed = [item.origin, item.evidence_id, item.manufacturer, item.part_number, item.source_hash];
    const researchBundleId = `HERMES_BUNDLE_${hash(bundleSeed).slice(0, 24).toUpperCase()}`;
    const needsResearch = item.workflow_status === 'NEEDS_RESEARCH' || item.evidence_level === 'SECONDARY_UNVERIFIED';
    const affected = unique([item.manufacturer, item.part_number, ...item.applications.map((app) => [app.make, app.model].filter(Boolean).join(' '))]);
    const target = targetFor(item.change_type);

    const knowledgeCandidate = {
      entity_type: 'intelligence_candidate', entity_code: researchBundleId,
      research_bundle_id: researchBundleId,
      workflow_status: needsResearch ? 'NEEDS_RESEARCH' : 'PENDING_REVIEW',
      candidate_type: candidateTypeFor(item.change_type), source_type: item.source_type,
      source_url: item.source_url, source_publisher: item.source_publisher,
      published_at: null, captured_at: item.captured_at, last_verified_at: item.captured_at,
      confidence: item.evidence_level === 'PRIMARY' ? 0.95 : (item.evidence_level === 'SECONDARY_VERIFIED' ? 0.7 : 0.4),
      evidence_level: item.evidence_level, claim_scope: 'SOURCE_REPORTED',
      affected_entities: affected.length ? affected : [item.manufacturer || 'UNKNOWN'],
      proposed_action: `Review ${item.change_type} for ${item.manufacturer} ${item.part_number || ''}`.trim(),
      proposed_target_folder: target, proposed_target_entity: item.part_number || item.manufacturer,
      deduplication_key: hash(bundleSeed), approval_required: true, approved_by: null, approved_at: null,
      rejection_reason: null, sync_status: 'NOT_READY', sync_target: [], source_hash: item.source_hash
    };

    const catalogueCandidate = {
      research_bundle_id: researchBundleId, change_type: item.change_type,
      manufacturer: item.manufacturer, part_number: item.part_number || '', product_family: item.product_family,
      applications: item.applications, dimensions: item.dimensions, technical_specs: item.technical_specs,
      cross_references: item.cross_references, superseded_by: item.superseded_by,
      source_urls: [item.source_url], source_date: item.captured_at, confidence: item.confidence,
      evidence_level: item.evidence_level,
      status: needsResearch ? 'INSUFFICIENT_DATA' : (item.evidence_level === 'PRIMARY' ? 'VERIFIED_OFFICIAL' : 'REVIEW_REQUIRED'),
      approval: null, publication_enabled: false,
      evidence: [{ evidence_id: item.evidence_id, source_hash: item.source_hash, origin: item.origin }]
    };
    return { research_bundle_id: researchBundleId, knowledge_candidate: knowledgeCandidate, catalogue_candidate: catalogueCandidate };
  });

  return {
    schema_version: '1.0.0', generated_at: generatedAt, dry_run: true, publication_enabled: false,
    summary: { evidence_items: items.length, linked_bundles: bundles.length, needs_research: bundles.filter((b) => b.knowledge_candidate.workflow_status === 'NEEDS_RESEARCH').length },
    bundles
  };
}

async function main() {
  const args = process.argv.slice(2);
  const officialPath = args.find((arg) => arg.startsWith('--official='))?.slice(11);
  const marketplacePath = args.find((arg) => arg.startsWith('--marketplace='))?.slice(14);
  const outputPath = args.find((arg) => arg.startsWith('--output='))?.slice(9) || 'hermes/linked-candidates/dual-track-candidates.json';
  if (!officialPath && !marketplacePath) {
    console.error('Usage: node scripts/hermes/dual-track-candidates.mjs [--official=file] [--marketplace=file] [--output=file]');
    process.exit(2);
  }
  const read = (file) => file ? JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')) : null;
  const report = buildDualTrackCandidates({ officialEvidence: read(officialPath), marketplaceEvidence: read(marketplacePath) });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output: outputPath, ...report.summary, publication_enabled: false }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES dual track] ${error.message}`); process.exit(1); });
}
