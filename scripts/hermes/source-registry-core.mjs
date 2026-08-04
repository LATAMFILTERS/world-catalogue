// HERMES Phase 5 Lite — source registry core.
// Loads and validates hermes/config/source-organizations.json (the master
// catalog of organizations HERMES may one day watch) and
// hermes/config/source-endpoints.json (the confirmed, reviewable URLs the
// collector is actually allowed to fetch). This module never fetches
// anything over the network; it only reads/validates local JSON.

import fs from 'node:fs';
import path from 'node:path';

export const ALLOWED_CATEGORIES = new Set([
  'oem_light_duty', 'oem_heavy_duty', 'oem_agriculture', 'oem_construction', 'oem_mining',
  'oem_power_generation', 'oem_marine', 'oem_railway', 'oem_bus_coach', 'oem_waste_municipal',
  'filtration_competitor', 'filtration_components', 'filter_media',
  'standards', 'regulation', 'technical_publication', 'strategic_supplier'
]);

export const OEM_CATEGORIES = new Set([...ALLOWED_CATEGORIES].filter((c) => c.startsWith('oem_')));

export const ALLOWED_STATUSES = new Set(['ACTIVE', 'DISCOVERY_REQUIRED', 'PAUSED', 'UNSUPPORTED', 'REVIEW_REQUIRED']);

export const ALLOWED_ENDPOINT_TYPES = new Set([
  'newsroom', 'news', 'press_releases', 'product_announcements', 'technical_bulletins',
  'documentation', 'service_information', 'recalls', 'standards_updates', 'technology_pages'
]);

// Known filtration competitor org ids that must never be filed under an
// oem_* category, and vice versa. This is a targeted cross-check against the
// organizations this registry already knows about — it cannot catch a
// miscategorized organization it has never seen before.
export const KNOWN_FILTRATION_COMPETITOR_IDS = new Set([
  'donaldson', 'cummins_filtration', 'mann_hummel', 'wix_filters', 'purolator', 'mahle',
  'parker_hannifin_filtration', 'baldwin_filters', 'bosch_mobility_filtration', 'sogefi',
  'fram_group', 'hengst', 'ufi_filters', 'k_n_engineering', 'luber_finer', 'sakura_filter'
]);

export const KNOWN_OEM_IDS = new Set([
  'toyota', 'honda', 'ford', 'gm', 'stellantis', 'volkswagen_group', 'nissan', 'hyundai', 'kia',
  'daimler_truck', 'volvo_trucks', 'mack_trucks', 'scania', 'man_truck_bus', 'navistar_international',
  'paccar', 'kenworth', 'peterbilt', 'daf_trucks', 'john_deere', 'caterpillar', 'komatsu'
]);

// URL path fragments that indicate ecommerce/login/search/protected
// resources or full-catalog listings — never appropriate collector targets.
const DISALLOWED_URL_PATTERN = /\/(login|signin|sign-in|account|my-account|cart|checkout|wp-admin|admin|basket)(\/|$|\?)/i;
const CATALOG_URL_PATTERN = /\/(catalog|parts-catalog|product-catalog|shop\/all|products\/all|full-catalog)(\/|$|\?)/i;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(path.resolve(filePath), 'utf8'));
}

export function loadRegistry(organizationsPath, endpointsPath) {
  const organizationsDoc = readJson(organizationsPath);
  const endpointsDoc = readJson(endpointsPath);
  return { organizations: organizationsDoc.organizations || [], endpoints: endpointsDoc.endpoints || [] };
}

function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}

/**
 * A domain shared by more than one organization is only acceptable when
 * every entry in the group resolves to the same corporate family: either it
 * IS the parent (parent_company is null, contributing its own name as the
 * family anchor) or it points AT that same parent. Two independent
 * organizations that merely happen to reuse a domain without a common
 * parent are flagged as unjustified.
 */
function findUnjustifiedDuplicateDomains(organizations) {
  const byDomain = new Map();
  for (const org of organizations) {
    const key = org.official_domain;
    if (!key) continue;
    if (!byDomain.has(key)) byDomain.set(key, []);
    byDomain.get(key).push(org);
  }
  const errors = [];
  for (const [domain, group] of byDomain) {
    if (group.length < 2) continue;
    const anchors = new Set(group.map((org) => org.parent_company || org.name));
    if (anchors.size > 1) {
      errors.push(`domain ${domain} is shared by organizations without a common parent_company: ${group.map((o) => o.id).join(', ')}`);
    }
  }
  return errors;
}

export function validateRegistry({ organizations, endpoints }) {
  const errors = [];
  const seenIds = new Map();

  for (const org of organizations) {
    if (!org.id) { errors.push('organization missing id'); continue; }
    seenIds.set(org.id, (seenIds.get(org.id) || 0) + 1);
    if (!org.official_domain) errors.push(`${org.id}: missing official_domain`);
    else if (!/^https:\/\//i.test(org.official_domain)) errors.push(`${org.id}: official_domain must be HTTPS`);
    if (!ALLOWED_CATEGORIES.has(org.category)) errors.push(`${org.id}: invalid category "${org.category}"`);
    if (!ALLOWED_STATUSES.has(org.status)) errors.push(`${org.id}: invalid status "${org.status}"`);
    if (org.status === 'DISCOVERY_REQUIRED' && org.discovery_required !== true) {
      errors.push(`${org.id}: status DISCOVERY_REQUIRED requires discovery_required=true`);
    }
    if (OEM_CATEGORIES.has(org.category) && KNOWN_FILTRATION_COMPETITOR_IDS.has(org.id)) {
      errors.push(`${org.id}: known filtration competitor classified under OEM category "${org.category}"`);
    }
    if (org.category === 'filtration_competitor' && KNOWN_OEM_IDS.has(org.id)) {
      errors.push(`${org.id}: known OEM classified under filtration_competitor`);
    }
  }
  for (const [id, count] of seenIds) if (count > 1) errors.push(`duplicate organization id: ${id}`);

  errors.push(...findUnjustifiedDuplicateDomains(organizations));

  const orgById = new Map(organizations.map((o) => [o.id, o]));
  const seenEndpointIds = new Map();
  for (const endpoint of endpoints) {
    if (!endpoint.id) { errors.push('endpoint missing id'); continue; }
    seenEndpointIds.set(endpoint.id, (seenEndpointIds.get(endpoint.id) || 0) + 1);
    if (!endpoint.url || !/^https:\/\//i.test(endpoint.url)) errors.push(`${endpoint.id}: url must be HTTPS`);
    if (!ALLOWED_ENDPOINT_TYPES.has(endpoint.endpoint_type)) errors.push(`${endpoint.id}: invalid endpoint_type "${endpoint.endpoint_type}"`);
    if (!ALLOWED_STATUSES.has(endpoint.status)) errors.push(`${endpoint.id}: invalid status "${endpoint.status}"`);
    if (endpoint.url && DISALLOWED_URL_PATTERN.test(endpoint.url)) errors.push(`${endpoint.id}: url targets a login/account/cart/admin path, which is not an allowed collector target`);
    if (endpoint.url && CATALOG_URL_PATTERN.test(endpoint.url)) errors.push(`${endpoint.id}: url targets a full product catalog listing, which is not an allowed collector target`);
    if (endpoint.fallback_url) {
      if (!/^https:\/\//i.test(endpoint.fallback_url)) errors.push(`${endpoint.id}: fallback_url must be HTTPS`);
      if (DISALLOWED_URL_PATTERN.test(endpoint.fallback_url)) errors.push(`${endpoint.id}: fallback_url targets a login/account/cart/admin path, which is not an allowed collector target`);
      if (CATALOG_URL_PATTERN.test(endpoint.fallback_url)) errors.push(`${endpoint.id}: fallback_url targets a full product catalog listing, which is not an allowed collector target`);
    }

    const org = orgById.get(endpoint.organization_id);
    if (!org) {
      errors.push(`${endpoint.id}: references unknown organization_id "${endpoint.organization_id}" (invented endpoint)`);
      continue;
    }
    const endpointHost = hostnameOf(endpoint.url);
    const orgHost = hostnameOf(org.official_domain);
    if (endpointHost && orgHost && !endpointHost.endsWith(orgHost) && !orgHost.endsWith(endpointHost)) {
      errors.push(`${endpoint.id}: url host "${endpointHost}" does not match organization "${org.id}" official domain host "${orgHost}"`);
    }
    if (endpoint.fallback_url) {
      const fallbackHost = hostnameOf(endpoint.fallback_url);
      if (fallbackHost && orgHost && !fallbackHost.endsWith(orgHost) && !orgHost.endsWith(fallbackHost)) {
        errors.push(`${endpoint.id}: fallback_url host "${fallbackHost}" does not match organization "${org.id}" official domain host "${orgHost}"`);
      }
    }
    if (endpoint.enabled === true && endpoint.status !== 'ACTIVE') {
      errors.push(`${endpoint.id}: enabled=true requires status=ACTIVE`);
    }
    if (endpoint.enabled === false && endpoint.status === 'ACTIVE') {
      errors.push(`${endpoint.id}: status=ACTIVE requires enabled=true`);
    }
  }
  for (const [id, count] of seenEndpointIds) if (count > 1) errors.push(`duplicate endpoint id: ${id}`);

  return errors;
}

/** Endpoints the collector is actually permitted to fetch: status=ACTIVE only. */
export function activeEndpoints(endpoints) {
  return endpoints.filter((e) => e.status === 'ACTIVE');
}

export function buildCoverageReport({ organizations, endpoints }, generatedAt = new Date().toISOString()) {
  const byCategory = {};
  const byRegion = {};
  const discoveryRequired = [];
  const withoutEndpoint = [];
  const endpointOrgIds = new Set(endpoints.map((e) => e.organization_id));

  for (const org of organizations) {
    byCategory[org.category] = (byCategory[org.category] || 0) + 1;
    byRegion[org.region] = (byRegion[org.region] || 0) + 1;
    if (org.status === 'DISCOVERY_REQUIRED') discoveryRequired.push(org.id);
    if (!endpointOrgIds.has(org.id)) withoutEndpoint.push(org.id);
  }

  const offHighwayCategories = ['oem_agriculture', 'oem_construction', 'oem_mining', 'oem_power_generation', 'oem_marine', 'oem_railway', 'oem_bus_coach', 'oem_waste_municipal'];
  const countByCategories = (cats) => organizations.filter((o) => cats.includes(o.category)).length;
  const activeByCategories = (cats) => organizations.filter((o) => cats.includes(o.category) && o.status === 'ACTIVE').length;

  const activeEndpointCount = activeEndpoints(endpoints).length;
  const reviewRequiredEndpointCount = endpoints.filter((e) => e.status === 'REVIEW_REQUIRED').length;

  const gaps = [];
  for (const category of ALLOWED_CATEGORIES) {
    const total = byCategory[category] || 0;
    const active = organizations.filter((o) => o.category === category && o.status === 'ACTIVE').length;
    if (total > 0 && active === 0) gaps.push(`${category}: ${total} organizations tracked, none with an ACTIVE endpoint yet`);
  }
  const highPriorityGaps = organizations
    .filter((o) => o.status === 'DISCOVERY_REQUIRED' && Number(o.priority) === 1)
    .map((o) => o.id);
  if (highPriorityGaps.length) gaps.push(`priority-1 organizations still awaiting endpoint discovery: ${highPriorityGaps.join(', ')}`);

  return {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    totals: {
      organizations: organizations.length,
      endpoints: endpoints.length,
      active_endpoints: activeEndpointCount,
      review_required_endpoints: reviewRequiredEndpointCount,
      discovery_required_organizations: discoveryRequired.length,
      organizations_without_endpoint: withoutEndpoint.length
    },
    by_category: byCategory,
    by_region: byRegion,
    coverage: {
      light_duty: { total: countByCategories(['oem_light_duty']), active: activeByCategories(['oem_light_duty']) },
      heavy_duty: { total: countByCategories(['oem_heavy_duty']), active: activeByCategories(['oem_heavy_duty']) },
      off_highway: { total: countByCategories(offHighwayCategories), active: activeByCategories(offHighwayCategories) },
      filtration_competitors: { total: countByCategories(['filtration_competitor']), active: activeByCategories(['filtration_competitor']) }
    },
    discovery_required_ids: discoveryRequired,
    organizations_without_endpoint_ids: withoutEndpoint,
    gaps,
    approval_required: true,
    database_write: false,
    pgvector_write: false,
    unified_data_write: false
  };
}

export function renderCoverageReportMarkdown(report) {
  const lines = [
    '# HERMES Source Coverage Report', '',
    `Generated: ${report.generated_at}`, '',
    '## Totals', '',
    `- Organizations tracked: ${report.totals.organizations}`,
    `- Confirmed endpoints: ${report.totals.endpoints}`,
    `- ACTIVE endpoints (collector will fetch these): ${report.totals.active_endpoints}`,
    `- REVIEW_REQUIRED endpoints: ${report.totals.review_required_endpoints}`,
    `- Organizations awaiting endpoint discovery: ${report.totals.discovery_required_organizations}`,
    `- Organizations with no endpoint record at all: ${report.totals.organizations_without_endpoint}`, '',
    '## By category', ''
  ];
  for (const [category, count] of Object.entries(report.by_category).sort()) lines.push(`- ${category}: ${count}`);
  lines.push('', '## By region', '');
  for (const [region, count] of Object.entries(report.by_region).sort()) lines.push(`- ${region}: ${count}`);
  lines.push(
    '', '## Segment coverage', '',
    `- Light duty OEM: ${report.coverage.light_duty.active}/${report.coverage.light_duty.total} ACTIVE`,
    `- Heavy duty OEM: ${report.coverage.heavy_duty.active}/${report.coverage.heavy_duty.total} ACTIVE`,
    `- Off-highway OEM (agriculture/construction/mining/power-gen/marine/railway/bus-coach/waste): ${report.coverage.off_highway.active}/${report.coverage.off_highway.total} ACTIVE`,
    `- Filtration competitors: ${report.coverage.filtration_competitors.active}/${report.coverage.filtration_competitors.total} ACTIVE`, ''
  );
  if (report.gaps.length) {
    lines.push('## Gaps identified', '');
    for (const gap of report.gaps) lines.push(`- ${gap}`);
    lines.push('');
  }
  lines.push(
    '## Governance', '',
    '> This report is descriptive only. It performs no writes to canonical Obsidian folders, PostgreSQL, pgvector, or unified-data.ts. The collector only ever fetches endpoints with status=ACTIVE; DISCOVERY_REQUIRED organizations are tracked here as a backlog, not fetched.', ''
  );
  return lines.join('\n');
}
