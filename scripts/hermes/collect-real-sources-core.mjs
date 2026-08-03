// HERMES Phase 5 Lite — real source collector core.
// Pure/injectable logic (fetch implementation, directories, clock are all
// parameters) so scripts/hermes/collect-real-sources.mjs and the test suite
// share one implementation without ever hitting the real filesystem/network
// from tests. This module never writes to elimfilters-vault canonical
// folders and never talks to PostgreSQL/pgvector/unified-data — its only
// outputs are hermes/real-candidates, hermes/source-cache and an audit
// record in elimfilters-vault/94-sync-log.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDateTime, validateCandidate } from './hermes-core.mjs';

export const USER_AGENT = 'ELIMFILTERS-HERMES/1.0 (+source-monitor; contact: elimfilters@gmail.com)';
export const DEFAULT_TIMEOUT_MS = 15000;
export const DEFAULT_MAX_BYTES = 3_000_000; // hard cap on bytes read from any single source
export const DEFAULT_SNIPPET_CHARS = 4000; // minimal raw evidence retained in source-cache
export const DEFAULT_RSS_ITEM_LIMIT = 10;

// Category -> governed target folder + candidate_type. Kept in sync with the
// allowlists enforced by scripts/hermes/hermes-core.mjs and
// scripts/hermes/publish-approved-candidate.mjs. Covers both the governed
// registry's 17 categories (hermes/config/source-organizations.json) and
// the legacy flat file's 5 categories (hermes/config/real-sources.json) —
// note "technical_publications" (legacy, plural) and "technical_publication"
// (registry, singular) are deliberately both present; they are not typos.
export const CATEGORY_RULES = {
  // Legacy real-sources.json categories.
  OEM: { candidateType: 'oem_update', targetFolder: '12-oems' },
  filtration_manufacturers: { candidateType: 'competitor_technology_update', targetFolder: '17-technology-watch' },
  suppliers: { candidateType: 'supplier_development', targetFolder: '16-suppliers' },
  technical_publications: { candidateType: 'technical_bulletin', targetFolder: '14-intelligence' },
  // Governed registry categories (hermes/config/source-organizations.json).
  oem_light_duty: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_heavy_duty: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_agriculture: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_construction: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_mining: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_power_generation: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_marine: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_railway: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_bus_coach: { candidateType: 'oem_update', targetFolder: '12-oems' },
  oem_waste_municipal: { candidateType: 'oem_update', targetFolder: '12-oems' },
  filtration_competitor: { candidateType: 'competitor_technology_update', targetFolder: '17-technology-watch' },
  filtration_components: { candidateType: 'competitor_product_update', targetFolder: '17-technology-watch' },
  filter_media: { candidateType: 'filter_media_development', targetFolder: '15-filter-media' },
  regulation: { candidateType: 'standard_update', targetFolder: '04-standards' },
  technical_publication: { candidateType: 'technical_bulletin', targetFolder: '14-intelligence' },
  strategic_supplier: { candidateType: 'supplier_development', targetFolder: '16-suppliers' },
  // Shared between both taxonomies (identical spelling in each).
  standards: { candidateType: 'standard_update', targetFolder: '04-standards' }
};

const TRUST_CONFIDENCE = { high: 0.65, medium: 0.5, low: 0.35 };

export function sha256Hex(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export function loadSourcesConfig(configPath) {
  const raw = fs.readFileSync(path.resolve(configPath), 'utf8');
  const parsed = JSON.parse(raw);
  const sources = [];
  for (const [category, list] of Object.entries(parsed.sources || {})) {
    if (!Array.isArray(list)) continue;
    for (const source of list) sources.push({ ...source, category: source.category || category });
  }
  return { config: parsed, sources };
}

/**
 * Builds the collector's source list from the governed registry
 * (hermes/config/source-organizations.json + source-endpoints.json).
 * Only endpoints with status "ACTIVE" AND enabled=true are ever included —
 * DISCOVERY_REQUIRED, REVIEW_REQUIRED, PAUSED and UNSUPPORTED organizations
 * are never fetched, and an organization's official_domain is never used
 * as a fetch target on its own when it has no ACTIVE endpoint.
 */
export function sourcesFromRegistry({ organizations, endpoints }) {
  const orgById = new Map(organizations.map((org) => [org.id, org]));
  const sources = [];
  for (const endpoint of endpoints) {
    if (endpoint.status !== 'ACTIVE' || endpoint.enabled !== true) continue;
    const org = orgById.get(endpoint.organization_id);
    if (!org) continue; // invented/unknown endpoint — rejected by validateRegistry() before this ever runs
    sources.push({
      id: endpoint.id,
      name: org.name,
      category: org.category,
      url: endpoint.url,
      source_type: endpoint.source_type,
      enabled: true,
      official: org.official,
      trust_level: org.trust_level,
      organization_id: org.id,
      endpoint_id: endpoint.id,
      region: org.region
    });
  }
  return sources;
}

// Strips scripts/styles/comments/tags and collapses whitespace so change
// detection reflects visible page content rather than volatile fragments
// (inline nonces, embedded timestamps, tracking snippets) that mutate on
// every request without any real editorial change.
export function normalizeHtmlToText(html) {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractTitle(html) {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(String(html));
  if (!match) return null;
  const title = match[1].replace(/\s+/g, ' ').trim().slice(0, 200);
  return title || null;
}

export function parseRssItems(xml, limit = DEFAULT_RSS_ITEM_LIMIT) {
  const items = [];
  const itemRe = /<(item|entry)[\s\S]*?>([\s\S]*?)<\/\1>/gi;
  let match;
  while ((match = itemRe.exec(String(xml))) && items.length < limit) {
    const block = match[2];
    const title = (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(block)?.[1] || '')
      .replace(/<!\[CDATA\[|\]\]>/g, '')
      .trim();
    const linkTag = /<link[^>]*>([\s\S]*?)<\/link>/i.exec(block);
    const linkHref = /<link[^>]*href="([^"]+)"/i.exec(block);
    const link = (linkTag?.[1] || linkHref?.[1] || '').trim();
    const guid = (/<guid[^>]*>([\s\S]*?)<\/guid>/i.exec(block)?.[1] || link || title).trim();
    const pubDate = (/<(pubDate|updated|published)[^>]*>([\s\S]*?)<\/\1>/i.exec(block)?.[2] || '').trim();
    if (title || link) items.push({ title, link, guid, pubDate });
  }
  return items;
}

export async function fetchWithLimits({ url, timeoutMs = DEFAULT_TIMEOUT_MS, maxBytes = DEFAULT_MAX_BYTES, userAgent = USER_AGENT, fetchImpl }) {
  const impl = fetchImpl || globalThis.fetch;
  if (typeof impl !== 'function') {
    return { ok: false, status: null, error: 'no fetch implementation available', text: '', truncated: false };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await impl(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,*/*;q=0.5'
      }
    });
    const status = response.status;
    if (!response.ok) {
      return { ok: false, status, error: `HTTP ${status}`, text: '', truncated: false };
    }
    let text = '';
    let truncated = false;
    if (response.body && typeof response.body.getReader === 'function') {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let received = 0;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        if (received > maxBytes) {
          const allowed = Math.max(0, maxBytes - (received - value.byteLength));
          text += decoder.decode(value.slice(0, allowed));
          truncated = true;
          try { await reader.cancel(); } catch { /* stream already closing */ }
          break;
        }
        text += decoder.decode(value, { stream: true });
      }
    } else if (typeof response.text === 'function') {
      text = await response.text();
      if (text.length > maxBytes) { text = text.slice(0, maxBytes); truncated = true; }
    }
    return { ok: true, status, error: null, text, truncated };
  } catch (error) {
    const timedOut = error?.name === 'AbortError' || error?.name === 'TimeoutError';
    return { ok: false, status: null, error: timedOut ? `timeout after ${timeoutMs}ms` : String(error?.message || error), text: '', truncated: false };
  } finally {
    clearTimeout(timer);
  }
}

function safeEntityFragment(value) {
  return String(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'UNKNOWN';
}

export function buildCandidate({ source, contentHash, title, capturedAt, publishedAt = null }) {
  const rule = CATEGORY_RULES[source.category];
  if (!rule) return { candidate: null, error: `no candidate_type/target mapping for category: ${source.category}` };

  const idFragment = safeEntityFragment(source.id);
  const hashFragment = contentHash.slice(0, 8).toUpperCase();
  const trust = TRUST_CONFIDENCE[source.trust_level] ?? 0.5;
  const evidenceLevel = source.official ? 'PRIMARY' : 'SECONDARY_VERIFIED';

  const candidate = {
    entity_type: 'intelligence_candidate',
    entity_code: `HERMES_REAL_${idFragment}_${hashFragment}`,
    workflow_status: 'PENDING_REVIEW',
    candidate_type: rule.candidateType,
    source_type: source.source_type,
    source_url: source.url,
    source_publisher: source.name,
    source_title: title || source.name,
    published_at: publishedAt && isDateTime(publishedAt) ? publishedAt : null,
    captured_at: capturedAt,
    last_verified_at: capturedAt,
    confidence: trust,
    evidence_level: evidenceLevel,
    claim_scope: 'SOURCE_REPORTED',
    affected_entities: [idFragment, safeEntityFragment(source.category)],
    proposed_action: `Review recently detected content change on ${source.name} (${source.url}) for potential ${source.category.replaceAll('_', ' ')} updates. HERMES only flags that content changed; a human must confirm what changed and whether canonical notes require an update.`,
    proposed_target_folder: rule.targetFolder,
    proposed_target_entity: null,
    deduplication_key: `real-${source.id}-${contentHash.slice(0, 32)}`,
    approval_required: true,
    approved_by: null,
    approved_at: null,
    rejection_reason: null,
    sync_status: 'NOT_READY',
    sync_target: [],
    source_hash: contentHash,
    category: source.category
  };
  if (source.trust_level) candidate.trust_level = source.trust_level;
  // organization_id/endpoint_id/region only exist when the source came from
  // the governed registry (sourcesFromRegistry), not the legacy flat file.
  if (source.organization_id) candidate.organization_id = source.organization_id;
  if (source.endpoint_id) candidate.endpoint_id = source.endpoint_id;
  if (source.region) candidate.region = source.region;
  return { candidate, error: null };
}

function readJsonSafe(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch { return null; }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function loadExistingSignatures(realCandidatesDir) {
  const entityCodes = new Set();
  const sourceHashes = new Set();
  if (fs.existsSync(realCandidatesDir)) {
    for (const file of fs.readdirSync(realCandidatesDir)) {
      if (!file.endsWith('.json')) continue;
      const data = readJsonSafe(path.join(realCandidatesDir, file));
      if (data?.entity_code) entityCodes.add(data.entity_code);
      if (data?.source_hash) sourceHashes.add(data.source_hash);
    }
  }
  return { entityCodes, sourceHashes };
}

/**
 * Runs one collection pass over the given sources.
 * All directories and the fetch implementation are injected so this function
 * never touches the real repository filesystem or network unless the caller
 * (scripts/hermes/collect-real-sources.mjs) explicitly wires those in.
 */
export async function runCollection(options) {
  const {
    configPath,
    sources: providedSources,
    realCandidatesDir,
    sourceCacheDir,
    previewDir,
    auditDir,
    dryRun = true,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxBytes = DEFAULT_MAX_BYTES,
    userAgent = USER_AGENT,
    fetchImpl,
    now = () => new Date()
  } = options;

  const sources = providedSources ?? loadSourcesConfig(configPath).sources;

  fs.mkdirSync(realCandidatesDir, { recursive: true });
  fs.mkdirSync(sourceCacheDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  fs.mkdirSync(auditDir, { recursive: true });

  const existingSignatures = loadExistingSignatures(realCandidatesDir);
  const results = [];

  function recordCandidate(candidate, sourceId) {
    const validationErrors = validateCandidate(candidate);
    if (validationErrors.length) {
      results.push({ id: sourceId, status: 'INVALID_CANDIDATE', entity_code: candidate.entity_code, errors: validationErrors });
      return;
    }
    if (existingSignatures.entityCodes.has(candidate.entity_code) || existingSignatures.sourceHashes.has(candidate.source_hash)) {
      results.push({ id: sourceId, status: 'DUPLICATE', entity_code: candidate.entity_code });
      return;
    }
    const targetDir = dryRun ? previewDir : realCandidatesDir;
    const suffix = dryRun ? '.preview.json' : '.json';
    const outputPath = path.join(targetDir, `${candidate.entity_code}${suffix}`);
    writeJson(outputPath, candidate);
    if (!dryRun) {
      existingSignatures.entityCodes.add(candidate.entity_code);
      existingSignatures.sourceHashes.add(candidate.source_hash);
    }
    results.push({ id: sourceId, status: dryRun ? 'PREVIEWED' : 'CREATED', entity_code: candidate.entity_code, output_path: outputPath });
  }

  for (const source of sources) {
    if (source.enabled !== true) {
      results.push({ id: source.id, status: 'SKIPPED_DISABLED' });
      continue;
    }

    const cachePath = path.join(sourceCacheDir, `${source.id}.json`);
    const previousCache = readJsonSafe(cachePath);
    const fetchResult = await fetchWithLimits({ url: source.url, timeoutMs, maxBytes, userAgent, fetchImpl });
    const capturedAt = now().toISOString();

    if (!fetchResult.ok) {
      writeJson(cachePath, {
        source_id: source.id,
        source_url: source.url,
        fetched_at: capturedAt,
        http_status: fetchResult.status,
        ok: false,
        error: fetchResult.error,
        // Preserve the last known-good hash/guids so a transient outage
        // does not wipe change-detection state for this source.
        content_hash: previousCache?.content_hash ?? null,
        seen_guids: previousCache?.seen_guids ?? undefined
      });
      results.push({ id: source.id, status: 'FETCH_ERROR', error: fetchResult.error });
      continue;
    }

    if (source.source_type === 'rss') {
      const items = parseRssItems(fetchResult.text);
      const itemHash = (item) => sha256Hex(`${item.guid}|${item.title}|${item.link}`);
      const previouslySeen = new Set(previousCache?.seen_guids || []);
      const newItems = items.filter((item) => !previouslySeen.has(itemHash(item)));
      const mergedGuids = Array.from(new Set([...(previousCache?.seen_guids || []), ...items.map(itemHash)])).slice(-300);

      writeJson(cachePath, {
        source_id: source.id,
        source_url: source.url,
        fetched_at: capturedAt,
        http_status: fetchResult.status,
        ok: true,
        truncated: fetchResult.truncated,
        content_length: fetchResult.text.length,
        item_count: items.length,
        seen_guids: mergedGuids
      });

      if (!newItems.length) {
        results.push({ id: source.id, status: 'UNCHANGED' });
        continue;
      }
      for (const item of newItems) {
        const contentHash = itemHash(item);
        const publishedAt = item.pubDate && !Number.isNaN(Date.parse(item.pubDate)) ? new Date(item.pubDate).toISOString() : null;
        const { candidate, error: buildError } = buildCandidate({ source, contentHash, title: item.title, capturedAt, publishedAt });
        if (buildError) { results.push({ id: source.id, status: 'BUILD_ERROR', error: buildError }); continue; }
        recordCandidate(candidate, source.id);
      }
      continue;
    }

    // Default path: whole-page HTML fetch, hashed after normalization.
    const normalized = normalizeHtmlToText(fetchResult.text);
    const contentHash = sha256Hex(normalized);
    const title = extractTitle(fetchResult.text);
    const snippet = normalized.slice(0, DEFAULT_SNIPPET_CHARS);

    writeJson(cachePath, {
      source_id: source.id,
      source_url: source.url,
      fetched_at: capturedAt,
      http_status: fetchResult.status,
      ok: true,
      truncated: fetchResult.truncated,
      content_length: fetchResult.text.length,
      content_hash: contentHash,
      title,
      raw_snippet: snippet
    });

    if (previousCache?.content_hash === contentHash) {
      results.push({ id: source.id, status: 'UNCHANGED' });
      continue;
    }

    const { candidate, error: buildError } = buildCandidate({ source, contentHash, title, capturedAt });
    if (buildError) { results.push({ id: source.id, status: 'BUILD_ERROR', error: buildError }); continue; }
    recordCandidate(candidate, source.id);
  }

  const summary = {
    schema_version: '1.0.0',
    run_type: 'hermes_real_source_collection',
    actor: 'HERMES_AUTOMATION',
    approval_authority: 'Victor Abreu',
    generated_at: now().toISOString(),
    mode: dryRun ? 'DRY_RUN' : 'LIVE',
    sources_total: sources.length,
    sources_enabled: sources.filter((s) => s.enabled === true).length,
    created: results.filter((r) => r.status === 'CREATED').length,
    previewed: results.filter((r) => r.status === 'PREVIEWED').length,
    unchanged: results.filter((r) => r.status === 'UNCHANGED').length,
    duplicates: results.filter((r) => r.status === 'DUPLICATE').length,
    fetch_errors: results.filter((r) => r.status === 'FETCH_ERROR').length,
    invalid: results.filter((r) => r.status === 'INVALID_CANDIDATE').length,
    disabled: results.filter((r) => r.status === 'SKIPPED_DISABLED').length,
    approval_required: true,
    database_write: false,
    pgvector_write: false,
    unified_data_write: false,
    results
  };

  const auditPath = path.join(auditDir, `collection-${Date.now()}.collection.json`);
  writeJson(auditPath, summary);
  return { ...summary, audit_path: auditPath };
}
