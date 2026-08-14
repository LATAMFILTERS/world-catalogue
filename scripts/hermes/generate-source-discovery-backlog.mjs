#!/usr/bin/env node
// HERMES Phase 5 Lite — source discovery backlog.
// Lists every DISCOVERY_REQUIRED organization from
// hermes/config/source-organizations.json, grouped for a future research
// session. Read-only: performs no network calls, invents no URLs, and never
// promotes any organization to ACTIVE. It only reads the registry that
// already exists.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';

const organizationsPath = process.argv[2] || 'hermes/config/source-organizations.json';
const endpointsPath = process.argv[3] || 'hermes/config/source-endpoints.json';
const outputDir = path.resolve(process.argv[4] || 'hermes/reports');

const registry = loadRegistry(organizationsPath, endpointsPath);
const errors = validateRegistry(registry);
if (errors.length) {
  console.error(`[HERMES discovery backlog] registry failed validation (${errors.length} issue${errors.length === 1 ? '' : 's'}); fix the registry before generating a backlog`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

// Suggested endpoint_type values to look for per category in a future
// research session — a starting checklist for a human, never a guess at an
// actual URL.
const SUGGESTED_ENDPOINT_TYPES = {
  oem_light_duty: ['newsroom', 'news', 'press_releases', 'recalls'],
  oem_heavy_duty: ['newsroom', 'news', 'press_releases', 'technical_bulletins', 'recalls'],
  oem_agriculture: ['newsroom', 'news', 'press_releases', 'product_announcements'],
  oem_construction: ['newsroom', 'news', 'press_releases', 'product_announcements'],
  oem_mining: ['newsroom', 'news', 'press_releases'],
  oem_power_generation: ['newsroom', 'news', 'press_releases', 'product_announcements'],
  oem_marine: ['newsroom', 'news', 'press_releases'],
  oem_railway: ['newsroom', 'news', 'press_releases'],
  oem_bus_coach: ['newsroom', 'news', 'press_releases'],
  oem_waste_municipal: ['newsroom', 'news', 'press_releases'],
  filtration_competitor: ['newsroom', 'news', 'press_releases', 'product_announcements', 'technical_bulletins'],
  filtration_components: ['newsroom', 'news', 'documentation', 'technical_bulletins'],
  filter_media: ['newsroom', 'news', 'press_releases', 'documentation'],
  standards: ['standards_updates', 'news', 'documentation'],
  regulation: ['standards_updates', 'news', 'documentation'],
  technical_publication: ['news', 'technology_pages'],
  strategic_supplier: ['newsroom', 'news', 'press_releases']
};

const backlog = registry.organizations.filter((org) => org.status === 'DISCOVERY_REQUIRED');

const byCategory = {};
const byRegion = {};
const byPriority = {};
const byTrustLevel = {};
for (const org of backlog) {
  (byCategory[org.category] ||= []).push(org.id);
  (byRegion[org.region] ||= []).push(org.id);
  (byPriority[String(org.priority)] ||= []).push(org.id);
  (byTrustLevel[org.trust_level] ||= []).push(org.id);
}

const entries = backlog.map((org) => ({
  organization_id: org.id,
  name: org.name,
  category: org.category,
  region: org.region,
  official_domain: org.official_domain,
  priority: org.priority,
  trust_level: org.trust_level,
  discovery_reason: org.notes && org.notes.trim().length > 0
    ? `No confirmed ACTIVE endpoint yet. ${org.notes.trim()}`
    : 'No confirmed ACTIVE endpoint yet — only official_domain is known.',
  suggested_endpoint_types: SUGGESTED_ENDPOINT_TYPES[org.category] || ['news'],
  status: org.status
}));

const report = {
  schema_version: '1.0.0',
  generated_at: new Date().toISOString(),
  description: 'DISCOVERY_REQUIRED organizations awaiting a confirmed, human-reviewed endpoint. No URLs are invented here and none of these organizations are fetched by the collector.',
  totals: {
    discovery_required: backlog.length,
    by_category: Object.fromEntries(Object.entries(byCategory).map(([k, v]) => [k, v.length])),
    by_region: Object.fromEntries(Object.entries(byRegion).map(([k, v]) => [k, v.length])),
    by_priority: Object.fromEntries(Object.entries(byPriority).map(([k, v]) => [k, v.length])),
    by_trust_level: Object.fromEntries(Object.entries(byTrustLevel).map(([k, v]) => [k, v.length]))
  },
  entries,
  approval_required: true,
  database_write: false,
  pgvector_write: false,
  unified_data_write: false,
  network_calls_made: false,
  urls_invented: false,
  organizations_promoted_to_active: 0
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, 'source-discovery-backlog.json'), JSON.stringify(report, null, 2) + '\n', 'utf8');

const lines = [
  '# HERMES Source Discovery Backlog', '',
  `Generated: ${report.generated_at}`, '',
  `Total organizations awaiting a confirmed endpoint: **${backlog.length}**`, '',
  '> No URLs are invented in this document, no network requests were made to produce it, and no organization listed here has been promoted to ACTIVE. This is a research checklist for a future session, not an action taken.', '',
  '## By category', ''
];
for (const [category, ids] of Object.entries(byCategory).sort()) lines.push(`- ${category}: ${ids.length}`);
lines.push('', '## By region', '');
for (const [region, ids] of Object.entries(byRegion).sort()) lines.push(`- ${region}: ${ids.length}`);
lines.push('', '## By priority', '');
for (const [priority, ids] of Object.entries(byPriority).sort()) lines.push(`- priority ${priority}: ${ids.length}`);
lines.push('', '## By trust level', '');
for (const [trust, ids] of Object.entries(byTrustLevel).sort()) lines.push(`- ${trust}: ${ids.length}`);

lines.push('', '## Organizations', '');
for (const [category, ids] of Object.entries(byCategory).sort()) {
  lines.push(`### ${category}`, '');
  for (const id of ids.sort()) {
    const entry = entries.find((e) => e.organization_id === id);
    lines.push(
      `#### ${entry.name} (\`${entry.organization_id}\`)`, '',
      `- Region: ${entry.region}`,
      `- Priority: ${entry.priority}`,
      `- Trust level: ${entry.trust_level ?? 'n/a'}`,
      `- Official domain: ${entry.official_domain}`,
      `- Discovery reason: ${entry.discovery_reason}`,
      `- Suggested endpoint types to research: ${entry.suggested_endpoint_types.join(', ')}`,
      `- Status: ${entry.status}`, ''
    );
  }
}
lines.push('## Governance', '', '> This backlog performs no writes to PostgreSQL, pgvector, legacy catalogue layer, or any canonical Obsidian note. Promoting an organization out of DISCOVERY_REQUIRED requires a human to manually confirm a specific, reachable, non-catalog/login/cart URL and add it to hermes/config/source-endpoints.json.', '');

fs.writeFileSync(path.join(outputDir, 'source-discovery-backlog.md'), lines.join('\n') + '\n', 'utf8');

console.log(`[HERMES discovery backlog] wrote ${path.relative(process.cwd(), path.join(outputDir, 'source-discovery-backlog.md'))} and .json`);
console.log(`[HERMES discovery backlog] discovery_required=${backlog.length}`);
