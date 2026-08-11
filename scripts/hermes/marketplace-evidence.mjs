#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MARKETPLACES = new Set(['amazon', 'ebay']);

function normalize(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function stableId(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 24);
}

function validHttpUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:'; } catch { return false; }
}

export function validateMarketplaceListing(listing) {
  const errors = [];
  if (!MARKETPLACES.has(String(listing?.marketplace || '').toLowerCase())) errors.push('marketplace must be amazon or ebay');
  if (!listing?.listing_id) errors.push('listing_id required');
  if (!listing?.seller_id && !listing?.seller_name) errors.push('seller identity required');
  if (!validHttpUrl(listing?.url)) errors.push('valid listing url required');
  if (!listing?.manufacturer && !listing?.brand) errors.push('manufacturer required');
  if (!listing?.part_number) errors.push('part_number required');
  if (!listing?.captured_at || Number.isNaN(Date.parse(listing.captured_at))) errors.push('captured_at required');
  return errors;
}

function listingIdentity(listing) {
  return `${String(listing.marketplace).toLowerCase()}:${normalize(listing.seller_id || listing.seller_name)}`;
}

function claimSignature(listing) {
  return JSON.stringify({
    manufacturer: normalize(listing.manufacturer || listing.brand),
    part_number: normalize(listing.part_number),
    dimensions: listing.dimensions || {},
    applications: [...(listing.applications || [])].map((item) => JSON.stringify(item)).sort(),
    cross_references: [...(listing.cross_references || [])].map(normalize).filter(Boolean).sort()
  });
}

export function buildMarketplaceEvidence(listings, generatedAt = new Date().toISOString()) {
  const rejected = [];
  const groups = new Map();
  for (const listing of listings || []) {
    const errors = validateMarketplaceListing(listing);
    if (errors.length) {
      rejected.push({ listing_id: listing?.listing_id || null, errors });
      continue;
    }
    const key = `${normalize(listing.manufacturer || listing.brand)}::${normalize(listing.part_number)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(listing);
  }

  const evidence_bundles = [];
  for (const [key, members] of groups) {
    const sellers = new Set(members.map(listingIdentity));
    const signatures = new Set(members.map(claimSignature));
    const independent = sellers.size;
    const conflicting = signatures.size > 1;
    const verified = independent >= 2 && !conflicting;
    evidence_bundles.push({
      evidence_id: `MKT_${stableId([key, ...[...sellers].sort()])}`,
      manufacturer: members[0].manufacturer || members[0].brand,
      part_number: members[0].part_number,
      evidence_level: verified ? 'SECONDARY_VERIFIED' : 'SECONDARY_UNVERIFIED',
      workflow_status: verified ? 'PENDING_REVIEW' : 'NEEDS_RESEARCH',
      claim_scope: 'SOURCE_REPORTED',
      independent_sellers: independent,
      conflicting_claims: conflicting,
      approval_required: true,
      automatic_publication_allowed: false,
      source_type: 'marketplace_listing',
      listings: members.map((item) => ({
        marketplace: String(item.marketplace).toLowerCase(),
        listing_id: item.listing_id,
        seller_id: item.seller_id || null,
        seller_name: item.seller_name || null,
        url: item.url,
        title: item.title || null,
        captured_at: item.captured_at,
        applications: item.applications || [],
        dimensions: item.dimensions || {},
        cross_references: item.cross_references || []
      }))
    });
  }

  return {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    read_only: true,
    publication_enabled: false,
    authority: 'SECONDARY_ONLY',
    summary: {
      listings_checked: (listings || []).length,
      rejected_listings: rejected.length,
      evidence_bundles: evidence_bundles.length,
      secondary_verified: evidence_bundles.filter((item) => item.evidence_level === 'SECONDARY_VERIFIED').length,
      needs_research: evidence_bundles.filter((item) => item.workflow_status === 'NEEDS_RESEARCH').length
    },
    evidence_bundles,
    rejected
  };
}

async function main() {
  const [inputPath, outputDir = 'hermes/marketplace-evidence'] = process.argv.slice(2);
  if (!inputPath) {
    console.error('Usage: node scripts/hermes/marketplace-evidence.mjs <authorized-api-export.json> [output-dir]');
    process.exit(2);
  }
  const parsed = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
  const report = buildMarketplaceEvidence(Array.isArray(parsed) ? parsed : (parsed.listings || []));
  fs.mkdirSync(outputDir, { recursive: true });
  const output = path.join(outputDir, `marketplace-evidence-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...report.summary, publication_enabled: false }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES marketplace evidence] ${error.message}`); process.exit(1); });
}
