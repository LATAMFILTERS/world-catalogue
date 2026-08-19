// HERMES Phase 5 Lite — real source collector core.
// Pure/injectable logic (fetch implementation, directories, clock are all
// parameters) so scripts/hermes/collect-real-sources.mjs and the test suite
// share one implementation without ever hitting the real filesystem/network
// from tests. This module never writes to elimfilters-vault canonical
// folders and never talks to PostgreSQL/pgvector/legacy catalogue layer — its only
// outputs are hermes/real-candidates, hermes/source-cache and an audit
// record in elimfilters-vault/94-sync-log.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isDateTime, validateCandidate } from './hermes-core.mjs';
import {
  DEFAULT_MIN_CONTENT_LENGTH,
  classifyContentSufficiency,
  loadBaseline,
  saveBaseline,
  buildBaselineEntry,
  withUpdatedEntry,
  compareAgainstBaseline
} from './source-baseline-core.mjs';
import { hasBeenHarvested, recordHarvest, saveHarvestState } from './semantic-harvest-state-core.mjs';

export const USER_AGENT = 'ELIMFILTERS-HERMES/1.0 (+source-monitor; contact: elimfilters@gmail.com)';
export const DEFAULT_TIMEOUT_MS = 15000;
export const DEFAULT_MAX_BYTES = 3_000_000; // hard cap on bytes read from any single source
export const DEFAULT_SNIPPET_CHARS = 4000; // minimal raw evidence retained in source-cache
export const DEFAULT_RSS_ITEM_LIMIT = 10;
export const EVIDENCE_SNIPPET_CHARS = 220; // short excerpt carried onto a CHANGED candidate as evidence
export { DEFAULT_MIN_CONTENT_LENGTH };

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

// Weekly-capacity source prioritization (task: "prioritize high-value
// technical sources... do not prioritize marketing pages over technical
// documentation when both exist"). Lower number = processed first when the
// per-run cap trims the source list. Categories not listed fall back to the
// lowest tier rather than erroring, so a newly-added registry category
// never breaks collection.
export const DEFAULT_SOURCE_PRIORITY_TIER = 9;
export const SOURCE_PRIORITY = {
  standards: 1,
  regulation: 1,
  technical_publication: 1,
  technical_publications: 1,
  oem_heavy_duty: 2,
  oem_construction: 2,
  oem_mining: 2,
  oem_agriculture: 2,
  oem_power_generation: 2,
  oem_marine: 2,
  oem_railway: 2,
  oem_bus_coach: 2,
  oem_waste_municipal: 2,
  oem_light_duty: 2,
  OEM: 2,
  filter_media: 3,
  filtration_components: 3,
  strategic_supplier: 3,
  filtration_competitor: 4,
  suppliers: 5,
  filtration_manufacturers: 5
};

export const DEFAULT_MAX_SOURCES_PER_RUN = 35;

/**
 * Trims `sources` to at most `maxSources`, keeping the highest-priority
 * (lowest tier number) sources first and preserving registry order within a
 * tier. `maxSources` of 0 or a non-finite value disables the cap entirely
 * (returns `sources` unchanged) — a run must opt into a cap, never have one
 * silently applied at 0.
 */
export function applySourceCap(sources, maxSources = DEFAULT_MAX_SOURCES_PER_RUN) {
  if (!Number.isFinite(maxSources) || maxSources <= 0 || sources.length <= maxSources) return sources;
  const withIndex = sources.map((source, index) => ({ source, index, tier: SOURCE_PRIORITY[source.category] ?? DEFAULT_SOURCE_PRIORITY_TIER }));
  withIndex.sort((a, b) => (a.tier - b.tier) || (a.index - b.index));
  return withIndex.slice(0, maxSources).sort((a, b) => a.index - b.index).map((entry) => entry.source);
}

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
      region: org.region,
      // Only ever tried when the primary url returns successfully but with
      // empty/insufficient content — never on a network failure. Optional;
      // absent for the vast majority of endpoints.
      fallback_url: endpoint.fallback_url || null
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

// Conservative, non-inventive publish-date extraction: only recognizes the
// two well-established markup conventions for it (the OpenGraph/article
// meta tag, and an HTML5 <time datetime> attribute). If neither is present
// or the value doesn't parse as a real date, returns null rather than
// guessing.
export function extractPublishedAt(html) {
  const text = String(html);
  const metaMatch =
    /<meta[^>]+property=["']article:published_time["'][^>]*content=["']([^"']+)["']/i.exec(text) ||
    /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']article:published_time["']/i.exec(text);
  const timeMatch = /<time[^>]+datetime=["']([^"']+)["']/i.exec(text);
  const candidate = metaMatch?.[1] || timeMatch?.[1];
  if (!candidate || !isDateTime(candidate)) return null;
  return new Date(candidate).toISOString();
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

export function buildCandidate({ source, contentHash, title, capturedAt, publishedAt = null, snippet = null, changeClassification = null }) {
  const rule = CATEGORY_RULES[source.category];
  if (!rule) return { candidate: null, error: `no candidate_type/target mapping for category: ${source.category}` };

  const idFragment = safeEntityFragment(source.id);
  const hashFragment = contentHash.slice(0, 8).toUpperCase();
  const baseTrust = TRUST_CONFIDENCE[source.trust_level] ?? 0.5;
  // A whole-page hash diff proves the page changed, but not WHAT changed —
  // HERMES cannot point at a specific new article from that alone, so
  // confidence is capped lower and the proposed_action says so explicitly.
  // This never applies to RSS items, which already carry a real title/link.
  // FIRST_SEMANTIC_HARVEST gets the same conservative cap: it is HERMES's
  // first-ever look at this source, not a structured item-level finding.
  const trust = changeClassification ? Math.min(baseTrust, 0.4) : baseTrust;
  const evidenceLevel = source.official ? 'PRIMARY' : 'SECONDARY_VERIFIED';

  let proposedAction;
  if (changeClassification === 'FIRST_SEMANTIC_HARVEST') {
    proposedAction = `This is HERMES's first-ever observation of ${source.name} (${source.url}). No prior baseline exists to compare against, so this is not a "change" — a human should review it for baseline technical intelligence (${source.category.replaceAll('_', ' ')}) worth capturing now that the source is known.`;
  } else {
    proposedAction = `Review recently detected content change on ${source.name} (${source.url}) for potential ${source.category.replaceAll('_', ' ')} updates. HERMES only flags that content changed; a human must confirm what changed and whether canonical notes require an update.`;
    if (changeClassification === 'CHANGE_DETECTED_REQUIRES_RESEARCH') {
      proposedAction += ' HERMES could not identify the specific item that changed on this page — do not treat this as a confirmed new product, technology, or standard until a human researches and verifies the actual change.';
    }
  }

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
    proposed_action: proposedAction,
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
  if (snippet) candidate.extracted_snippet = snippet;
  if (changeClassification) candidate.change_classification = changeClassification;
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
    now = () => new Date(),
    // Governed baseline (see source-baseline-core.mjs). BASELINE_MODE
    // bootstraps/refreshes the baseline for ACTIVE endpoints without ever
    // producing a candidate. Outside baseline mode, a source with no
    // baseline entry yet is BASELINE_REQUIRED — never silently seeded —
    // and only a hash that differs from the stored baseline is CHANGED.
    baselineMode = false,
    minContentLength = DEFAULT_MIN_CONTENT_LENGTH,
    baselinePath = path.join(path.dirname(sourceCacheDir), 'baselines', 'source-baseline.json'),
    baselinePreviewPath = path.join(path.dirname(sourceCacheDir), 'baselines', 'source-baseline.preview.json'),
    // Semantic-harvest state (see semantic-harvest-state-core.mjs): tracks
    // "has HERMES ever extracted intelligence from this source", separate
    // from the hash baseline above. Defaults to an empty state, so a caller
    // that never wires this in simply treats every source as never-harvested
    // — the same conservative default as an absent baseline.
    harvestState: initialHarvestState = { schema_version: '1.0.0', updated_at: null, sources: {} },
    harvestStatePath = path.join(path.dirname(sourceCacheDir), 'baselines', 'source-observations.json'),
    // 0/non-finite disables the cap. Callers that care about weekly
    // capacity apply it via applySourceCap() themselves (or pass maxSources
    // and let this function do it) so tests exercising the full source list
    // are unaffected unless they opt in.
    maxSources = 0
  } = options;

  const allSources = providedSources ?? loadSourcesConfig(configPath).sources;
  const sources = maxSources > 0 ? applySourceCap(allSources, maxSources) : allSources;

  fs.mkdirSync(realCandidatesDir, { recursive: true });
  fs.mkdirSync(sourceCacheDir, { recursive: true });
  fs.mkdirSync(previewDir, { recursive: true });
  fs.mkdirSync(auditDir, { recursive: true });

  const existingSignatures = loadExistingSignatures(realCandidatesDir);
  const results = [];
  // A fresh in-memory copy is compared/updated during this run; it is only
  // ever persisted (to the real file or, in DRY RUN, the preview file) at
  // the very end, and only for sources that produced sufficient content —
  // a down or empty source can never overwrite a previously valid entry.
  let workingBaseline = loadBaseline(baselinePath);
  let baselineDirty = false;
  let changedCount = 0;
  let workingHarvestState = initialHarvestState;
  let harvestStateDirty = false;
  let firstHarvestCount = 0;

  function applyBaselineUpdate(source, entry) {
    workingBaseline = withUpdatedEntry(workingBaseline, source.id, entry);
    baselineDirty = true;
  }

  function applyHarvestUpdate(source, capturedAt, contentHash) {
    workingHarvestState = recordHarvest(workingHarvestState, source.id, { harvestedAt: capturedAt, contentHash });
    harvestStateDirty = true;
  }

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

      if (items.length === 0) {
        // An empty/unparseable feed is not "nothing new" — it's no usable
        // evidence at all, same family as EMPTY_CONTENT for HTML sources.
        results.push({ id: source.id, status: 'EMPTY_CONTENT' });
        continue;
      }
      if (!newItems.length) {
        results.push({ id: source.id, status: 'UNCHANGED' });
        continue;
      }
      for (const item of newItems) {
        const contentHash = itemHash(item);
        const publishedAt = item.pubDate && !Number.isNaN(Date.parse(item.pubDate)) ? new Date(item.pubDate).toISOString() : null;
        // RSS items already carry real, structured evidence (title + link)
        // — unlike a whole-page HTML hash diff, so no change_classification
        // downgrade is applied here.
        const { candidate, error: buildError } = buildCandidate({ source, contentHash, title: item.title, capturedAt, publishedAt });
        if (buildError) { results.push({ id: source.id, status: 'BUILD_ERROR', error: buildError }); continue; }
        recordCandidate(candidate, source.id);
      }
      continue;
    }

    // Default path: whole-page HTML fetch, hashed after normalization.
    let effectiveFetchResult = fetchResult;
    let effectiveUrl = source.url;
    let usedFallback = false;
    let normalized = normalizeHtmlToText(effectiveFetchResult.text);
    let contentHash = sha256Hex(normalized);
    let sufficiency = classifyContentSufficiency(normalized, contentHash, minContentLength);

    // A configured fallback_url is only ever tried when the PRIMARY url
    // returned successfully but with empty/insufficient content — never on
    // a network failure (that stays FETCH_ERROR), and never when the
    // primary already has sufficient content.
    if (sufficiency !== 'SUFFICIENT' && source.fallback_url) {
      const fallbackFetchResult = await fetchWithLimits({ url: source.fallback_url, timeoutMs, maxBytes, userAgent, fetchImpl });
      if (fallbackFetchResult.ok) {
        const fallbackNormalized = normalizeHtmlToText(fallbackFetchResult.text);
        const fallbackHash = sha256Hex(fallbackNormalized);
        const fallbackSufficiency = classifyContentSufficiency(fallbackNormalized, fallbackHash, minContentLength);
        if (fallbackSufficiency === 'SUFFICIENT') {
          effectiveFetchResult = fallbackFetchResult;
          effectiveUrl = source.fallback_url;
          usedFallback = true;
          normalized = fallbackNormalized;
          contentHash = fallbackHash;
          sufficiency = fallbackSufficiency;
        }
      }
    }

    const title = extractTitle(effectiveFetchResult.text);
    const rawSnippet = normalized.slice(0, DEFAULT_SNIPPET_CHARS);

    // hermes/source-cache/ is unconditional, informational raw-evidence
    // bookkeeping (debugging aid) — it is no longer what gates candidate
    // creation; the governed baseline below is.
    writeJson(cachePath, {
      source_id: source.id,
      source_url: effectiveUrl,
      primary_url: source.url,
      used_fallback: usedFallback,
      fetched_at: capturedAt,
      http_status: effectiveFetchResult.status,
      ok: true,
      truncated: effectiveFetchResult.truncated,
      content_length: effectiveFetchResult.text.length,
      content_hash: contentHash,
      title,
      raw_snippet: rawSnippet
    });

    if (sufficiency === 'EMPTY_CONTENT' || sufficiency === 'INSUFFICIENT_CONTENT') {
      // Never invalid, never fatal, never allowed to overwrite a baseline —
      // this is "the source gave us no usable evidence this run", not "the
      // source changed" and not "HERMES produced a broken candidate".
      results.push({
        id: source.id, status: sufficiency, content_length: normalized.length,
        fallback_configured: Boolean(source.fallback_url), fallback_attempted: Boolean(source.fallback_url), used_fallback: usedFallback
      });
      continue;
    }

    // Everything downstream (baseline entries, the candidate itself) refers
    // to whichever URL actually produced the content being evaluated.
    const effectiveSource = usedFallback ? { ...source, url: effectiveUrl } : source;

    const baselineEntryNow = () => buildBaselineEntry({
      organizationId: source.organization_id ?? null,
      endpointId: source.id,
      sourceUrl: effectiveUrl,
      normalizedHash: contentHash,
      observedAt: capturedAt,
      contentLength: normalized.length,
      responseStatus: effectiveFetchResult.status
    });

    if (baselineMode) {
      // Bootstrapping/refreshing the baseline is the entire point of this
      // mode — it never produces a candidate, by design.
      applyBaselineUpdate(source, baselineEntryNow());
      results.push({ id: source.id, status: 'BASELINE_RECORDED', used_fallback: usedFallback });
      continue;
    }

    const comparison = compareAgainstBaseline(workingBaseline, source.id, contentHash);
    if (comparison.status === 'BASELINE_REQUIRED') {
      // No prior baseline exists for this endpoint. That used to mean
      // "nothing to compare against, so report the gap and produce zero
      // intelligence" — an avoidable zero for a source HERMES has genuinely
      // never looked at. Now: if the durable semantic-harvest state also
      // has no record of this source, treat this as a legitimate first
      // observation and extract from it (capped confidence, human review
      // required, same as a whole-page CHANGED diff). If harvest state
      // *does* have a record — the governed baseline just hasn't caught up
      // with a promotion yet — stay conservative and do not re-harvest.
      if (!hasBeenHarvested(workingHarvestState, source.id)) {
        firstHarvestCount += 1;
        const publishedAt = extractPublishedAt(effectiveFetchResult.text);
        const evidenceSnippet = normalized.slice(0, EVIDENCE_SNIPPET_CHARS);
        const { candidate, error: buildError } = buildCandidate({
          source: effectiveSource,
          contentHash,
          title,
          capturedAt,
          publishedAt,
          snippet: evidenceSnippet,
          changeClassification: 'FIRST_SEMANTIC_HARVEST'
        });
        if (buildError) { results.push({ id: source.id, status: 'BUILD_ERROR', error: buildError }); continue; }
        recordCandidate(candidate, source.id);
        applyBaselineUpdate(source, baselineEntryNow());
        applyHarvestUpdate(source, capturedAt, contentHash);
        continue;
      }
      results.push({ id: source.id, status: 'BASELINE_REQUIRED', used_fallback: usedFallback, previously_harvested: true });
      continue;
    }
    if (comparison.status === 'UNCHANGED') {
      // Refresh observed_at/content_length/response_status so the baseline
      // reflects the latest confirmed-unchanged observation, without
      // altering the hash itself.
      applyBaselineUpdate(source, baselineEntryNow());
      results.push({ id: source.id, status: 'UNCHANGED', used_fallback: usedFallback });
      continue;
    }

    // CHANGED: a real, prior baseline exists and the hash differs.
    changedCount += 1;
    const publishedAt = extractPublishedAt(effectiveFetchResult.text);
    const evidenceSnippet = normalized.slice(0, EVIDENCE_SNIPPET_CHARS);
    const { candidate, error: buildError } = buildCandidate({
      source: effectiveSource,
      contentHash,
      title,
      capturedAt,
      publishedAt,
      snippet: evidenceSnippet,
      changeClassification: 'CHANGE_DETECTED_REQUIRES_RESEARCH'
    });
    if (buildError) { results.push({ id: source.id, status: 'BUILD_ERROR', error: buildError }); continue; }
    recordCandidate(candidate, source.id);
    applyBaselineUpdate(source, baselineEntryNow());
  }

  const baselineOutputPath = dryRun ? baselinePreviewPath : baselinePath;
  if (baselineDirty) saveBaseline(baselineOutputPath, workingBaseline);
  // Harvest state is written on every real (non-dry-run) run regardless of
  // baseline_mode/dry_run distinctions that gate the hash baseline — it is
  // never approval-gated, and a dry run must not silently lose first-harvest
  // bookkeeping just because it wouldn't have persisted real candidates.
  if (harvestStateDirty && !dryRun) saveHarvestState(harvestStatePath, workingHarvestState);

  const createdCount = results.filter((r) => r.status === 'CREATED').length;
  const previewedCount = results.filter((r) => r.status === 'PREVIEWED').length;

  // Zero-result diagnostics (task requirement: "do not allow an unexplained
  // 0"). Only meaningful when this collection pass produced nothing at all
  // — checked in priority order from most to least specific cause.
  let zeroResultReason = null;
  if (createdCount === 0 && previewedCount === 0) {
    const disabledCount = results.filter((r) => r.status === 'SKIPPED_DISABLED').length;
    const fetchErrorCount = results.filter((r) => r.status === 'FETCH_ERROR').length;
    const baselineRequiredCount = results.filter((r) => r.status === 'BASELINE_REQUIRED').length;
    const unchangedCount = results.filter((r) => r.status === 'UNCHANGED').length;
    const emptyOrInsufficientCount = results.filter((r) => r.status === 'EMPTY_CONTENT' || r.status === 'INSUFFICIENT_CONTENT').length;
    if (sources.length === 0) {
      zeroResultReason = 'ZERO — no sources were configured/enabled for this run';
    } else if (disabledCount === sources.length) {
      zeroResultReason = 'ZERO — all sources skipped due to configuration (disabled)';
    } else if (baselineMode) {
      zeroResultReason = 'ZERO — run was in baseline-only mode by design (no candidates are ever produced in baseline mode)';
    } else if (unchangedCount > 0 && unchangedCount + baselineRequiredCount + emptyOrInsufficientCount + fetchErrorCount + disabledCount >= sources.length) {
      zeroResultReason = 'ZERO — no sources changed and all previously-harvested sources were unchanged';
    } else if (baselineRequiredCount > 0) {
      zeroResultReason = 'ZERO — sources awaiting baseline but already semantically harvested; no new evidence this run';
    } else if (fetchErrorCount === sources.length) {
      zeroResultReason = 'ZERO — all sources failed to fetch';
    } else if (emptyOrInsufficientCount === sources.length) {
      zeroResultReason = 'ZERO — sources fetched but contained no eligible technical content';
    } else {
      zeroResultReason = 'ZERO — sources processed but produced no eligible candidates (see per-source results for detail)';
    }
  }

  const summary = {
    schema_version: '1.1.0',
    run_type: 'hermes_real_source_collection',
    actor: 'HERMES_AUTOMATION',
    approval_authority: 'Victor Abreu',
    generated_at: now().toISOString(),
    mode: dryRun ? 'DRY_RUN' : 'LIVE',
    baseline_mode: baselineMode,
    sources_available: allSources.length,
    sources_total: sources.length,
    sources_capped: allSources.length - sources.length,
    sources_enabled: sources.filter((s) => s.enabled === true).length,
    sources_checked: sources.filter((s) => s.enabled === true).length,
    created: createdCount,
    previewed: previewedCount,
    unchanged: results.filter((r) => r.status === 'UNCHANGED').length,
    changed: changedCount,
    first_harvest: firstHarvestCount,
    empty_content: results.filter((r) => r.status === 'EMPTY_CONTENT').length,
    insufficient_content: results.filter((r) => r.status === 'INSUFFICIENT_CONTENT').length,
    baseline_required: results.filter((r) => r.status === 'BASELINE_REQUIRED').length,
    baseline_recorded: results.filter((r) => r.status === 'BASELINE_RECORDED').length,
    duplicates: results.filter((r) => r.status === 'DUPLICATE').length,
    fetch_errors: results.filter((r) => r.status === 'FETCH_ERROR').length,
    failed: results.filter((r) => r.status === 'FETCH_ERROR').length,
    invalid: results.filter((r) => r.status === 'INVALID_CANDIDATE').length,
    disabled: results.filter((r) => r.status === 'SKIPPED_DISABLED').length,
    candidates_created: createdCount,
    candidates_previewed: previewedCount,
    candidates_suppressed: results.filter((r) => r.status === 'DUPLICATE').length,
    baseline_updated: baselineDirty,
    baseline_output_path: baselineDirty ? baselineOutputPath : null,
    harvest_state_updated: harvestStateDirty,
    harvest_state: workingHarvestState,
    zero_result_reason: zeroResultReason,
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
