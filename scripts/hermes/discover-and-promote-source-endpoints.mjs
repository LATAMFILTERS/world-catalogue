#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { diagnoseEndpoint } from './diagnose-source-endpoint-core.mjs';
import { loadRegistry, validateRegistry } from './source-registry-core.mjs';

const organizationsPath = path.resolve('hermes/config/source-organizations.json');
const endpointsPath = path.resolve('hermes/config/source-endpoints.json');
const reportsDir = path.resolve('hermes/reports');
const apply = process.argv.includes('--apply');
const maxArg = process.argv.find((a) => a.startsWith('--max-organizations='));
const concurrencyArg = process.argv.find((a) => a.startsWith('--concurrency='));
const timeoutArg = process.argv.find((a) => a.startsWith('--timeout-ms='));
const maxOrganizations = Math.max(1, Math.min(156, Number(maxArg?.split('=')[1] || 50)));
const concurrency = Math.max(1, Math.min(8, Number(concurrencyArg?.split('=')[1] || 5)));
const timeoutMs = Math.max(2000, Math.min(15000, Number(timeoutArg?.split('=')[1] || process.env.HERMES_COLLECTION_TIMEOUT_MS || 6000)));

// One canonical spelling per candidate path. Avoid trying both /news and /news/
// because normal redirects already resolve that distinction and doubled discovery time.
const candidatePaths = [
  { path: '/news', type: 'news' },
  { path: '/newsroom', type: 'newsroom' },
  { path: '/press-releases', type: 'press_releases' },
  { path: '/media/press-releases', type: 'press_releases' },
  { path: '/media', type: 'newsroom' },
  { path: '/news-and-media', type: 'newsroom' },
  { path: '/company/news', type: 'news' },
  { path: '/about/news', type: 'news' },
  { path: '/technical-bulletins', type: 'technical_bulletins' },
  { path: '/resources/technical-bulletins', type: 'technical_bulletins' }
];

function host(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return null; }
}
function sameCorporateHost(a, b) {
  const x = host(a); const y = host(b);
  return Boolean(x && y && (x === y || x.endsWith(`.${y}`) || y.endsWith(`.${x}`)));
}
function endpointId(orgId, type) {
  return `${orgId}__${type}`.replace(/[^a-z0-9_]+/gi, '_').toLowerCase();
}
function readDoc(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function writeDoc(p, doc) { fs.writeFileSync(p, JSON.stringify(doc, null, 2) + '\n', 'utf8'); }

const registry = loadRegistry(organizationsPath, endpointsPath);
const initialErrors = validateRegistry(registry);
if (initialErrors.length) {
  console.error(`[HERMES discovery] registry invalid before discovery (${initialErrors.length})`);
  for (const error of initialErrors) console.error(`  - ${error}`);
  process.exit(2);
}

const existingOrgIds = new Set(registry.endpoints.map((e) => e.organization_id));
const backlog = registry.organizations
  .filter((o) => o.status === 'DISCOVERY_REQUIRED' && !existingOrgIds.has(o.id))
  .sort((a, b) => (Number(a.priority || 9) - Number(b.priority || 9)) || String(a.category).localeCompare(String(b.category)) || String(a.id).localeCompare(String(b.id)))
  .slice(0, maxOrganizations);

const report = {
  generated_at: new Date().toISOString(),
  mode: apply ? 'APPLY' : 'DRY_RUN',
  organizations_considered: backlog.length,
  organizations_total: registry.organizations.length,
  endpoints_before: registry.endpoints.length,
  active_before: registry.endpoints.filter((e) => e.status === 'ACTIVE' && e.enabled === true).length,
  concurrency,
  timeout_ms: timeoutMs,
  promoted: [],
  unresolved: [],
  rejected_candidates: []
};

async function discoverOrganization(org) {
  const base = String(org.official_domain || '').replace(/\/$/, '');
  if (!base.startsWith('https://')) {
    return { unresolved: { organization_id: org.id, reason: 'invalid official_domain' }, rejected: [] };
  }

  const rejected = [];
  for (const candidate of candidatePaths) {
    const url = `${base}${candidate.path}`;
    const diag = await diagnoseEndpoint({ url, timeoutMs });
    const valid = diag.result === 'VALID' && diag.http_status === 200 && sameCorporateHost(org.official_domain, diag.final_url);
    if (valid) {
      const promoted = {
        id: endpointId(org.id, candidate.type),
        organization_id: org.id,
        url: diag.final_url,
        endpoint_type: candidate.type,
        source_type: 'html',
        status: 'ACTIVE',
        enabled: true,
        verified_at: new Date().toISOString(),
        http_status_observed: diag.http_status,
        notes: `Auto-discovered on Lenovo using governed same-domain endpoint validation. normalized_length=${diag.normalized_length}; redirect_count=${diag.redirect_count}.`
      };
      return { promoted: { organization_id: org.id, name: org.name, category: org.category, endpoint: promoted }, rejected };
    }
    rejected.push({
      organization_id: org.id,
      url,
      result: diag.result,
      http_status: diag.http_status,
      normalized_length: diag.normalized_length,
      reason: diag.reason,
      final_url: diag.final_url
    });
  }

  return {
    unresolved: { organization_id: org.id, name: org.name, category: org.category, official_domain: org.official_domain, reason: 'no governed candidate endpoint passed validation' },
    rejected
  };
}

console.log(`[HERMES discovery] starting mode=${report.mode} organizations=${backlog.length} concurrency=${concurrency} timeout_ms=${timeoutMs} candidate_paths=${candidatePaths.length}`);
console.log('[HERMES discovery] Safe to stop with Ctrl+C during DRY_RUN; registry files are not modified.');

let cursor = 0;
let completed = 0;
async function worker(workerId) {
  while (true) {
    const index = cursor++;
    if (index >= backlog.length) return;
    const org = backlog[index];
    console.log(`[HERMES discovery] worker=${workerId} START ${index + 1}/${backlog.length} ${org.id}`);
    const result = await discoverOrganization(org);
    if (result.promoted) {
      report.promoted.push(result.promoted);
      console.log(`[HERMES discovery] worker=${workerId} VALID ${org.id} -> ${result.promoted.endpoint.url}`);
    } else {
      report.unresolved.push(result.unresolved);
      console.log(`[HERMES discovery] worker=${workerId} UNRESOLVED ${org.id}`);
    }
    report.rejected_candidates.push(...(result.rejected || []));
    completed += 1;
    console.log(`[HERMES discovery] progress=${completed}/${backlog.length} promoted=${report.promoted.length} unresolved=${report.unresolved.length}`);
  }
}

await Promise.all(Array.from({ length: Math.min(concurrency, backlog.length || 1) }, (_, i) => worker(i + 1)));

fs.mkdirSync(reportsDir, { recursive: true });
const reportPath = path.join(reportsDir, 'source-auto-discovery.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n', 'utf8');

if (apply && report.promoted.length) {
  const organizationsDoc = readDoc(organizationsPath);
  const endpointsDoc = readDoc(endpointsPath);
  const existingEndpointIds = new Set(endpointsDoc.endpoints.map((e) => e.id));

  for (const item of report.promoted) {
    if (!existingEndpointIds.has(item.endpoint.id)) {
      endpointsDoc.endpoints.push(item.endpoint);
      existingEndpointIds.add(item.endpoint.id);
    }
    const org = organizationsDoc.organizations.find((o) => o.id === item.organization_id);
    if (org) {
      org.status = 'ACTIVE';
      org.enabled = true;
      org.discovery_required = false;
      org.monitored_urls = Array.from(new Set([...(org.monitored_urls || []), item.endpoint.url]));
    }
  }

  const candidateRegistry = { organizations: organizationsDoc.organizations, endpoints: endpointsDoc.endpoints };
  const errors = validateRegistry(candidateRegistry);
  if (errors.length) {
    console.error(`[HERMES discovery] refusing to write invalid registry (${errors.length})`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exit(3);
  }

  writeDoc(organizationsPath, organizationsDoc);
  writeDoc(endpointsPath, endpointsDoc);
}

console.log(`[HERMES discovery] mode=${report.mode} considered=${report.organizations_considered} promoted=${report.promoted.length} unresolved=${report.unresolved.length}`);
console.log(`[HERMES discovery] active_before=${report.active_before} projected_active=${report.active_before + report.promoted.length}`);
for (const item of report.promoted) console.log(`[HERMES discovery] PROMOTED ${item.organization_id} -> ${item.endpoint.url}`);
console.log(`[HERMES discovery] report=${path.relative(process.cwd(), reportPath)}`);
if (!apply) console.log('[HERMES discovery] DRY RUN only. Re-run with --apply after reviewing results.');
