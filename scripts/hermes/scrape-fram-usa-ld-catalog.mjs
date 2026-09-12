#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import { loadPublicCatalogConfig, queryCatalog, parsePartList, parseTotalRecords, fetchFramPartBundle } from './lib/fram-usa-smtp-client.mjs';

const require = createRequire(import.meta.url);
const { classifyFramLdFamily, isAllowedFramLdFamily } = require('../../lib/knowledge-governance/fram-ld-catalog-scope');
const { buildFramLdEnrichment, preferredPrimaryPartNumber } = require('../../lib/knowledge-governance/fram-usa-ld-enrichment');
const { createJobNotifier } = require('../../lib/job-notifications');

const SEARCH_PLAN = Object.freeze({
  LUBE: [
    ['PH', 2, 'AUTHORITY'], ['CH', 2, 'AUTHORITY'],
    ['TG', 2, 'FALLBACK'], ['FE', 2, 'FALLBACK'], ['XG', 2, 'FALLBACK'], ['FS', 2, 'FALLBACK'],
    ['FF', 2, 'FALLBACK'], ['FD', 2, 'FALLBACK'], ['FP', 2, 'FALLBACK'], ['COR', 1, 'FALLBACK']
  ],
  AIR: [['CA', 2, 'AUTHORITY'], ['FDA', 1, 'FALLBACK']],
  CABIN: [['CF', 2, 'AUTHORITY'], ['FDC', 1, 'FALLBACK'], ['FSC', 1, 'FALLBACK']],
  FUEL: [['G', 3, 'AUTHORITY']]
});

const args = process.argv.slice(2);
const arg = name => { const index = args.indexOf(name); return index >= 0 ? args[index + 1] : null; };
const has = name => args.includes(name);
const requestedPart = arg('--part');
const requestedPattern = arg('--pattern');
const requestedFamily = String(arg('--family') || '').toUpperCase() || null;
const includeFallback = !has('--authority-only');
const limit = Number.parseInt(arg('--limit') || '0', 10) || 0;
const delayMs = Number.parseInt(arg('--delay-ms') || '150', 10) || 0;
const casePack = Number.parseInt(arg('--case-pack') || '12', 10) || 12;
const baseOut = path.resolve(arg('--out-dir') || 'elimfilters-vault/91-private-evidence/fram-usa-ld-catalog');
const runId = arg('--run-id') || `fram-usa-ld-${new Date().toISOString().replace(/[:.]/g, '-')}`;
const runDir = path.join(baseOut, runId);
const productDir = path.join(runDir, 'products');

if (requestedFamily && !isAllowedFramLdFamily(requestedFamily)) {
  throw new Error(`Unsupported FRAM LD family ${requestedFamily}; allowed: LUBE, AIR, CABIN, FUEL`);
}
if (!requestedPart && !requestedPattern && !requestedFamily && !has('--all')) {
  throw new Error('Specify --part <PN>, --pattern <prefix*>, --family <LUBE|AIR|CABIN|FUEL>, or --all');
}

fs.mkdirSync(productDir, { recursive: true });
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const normalizePart = value => String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const safeName = value => normalizePart(value) || 'UNKNOWN';

function numericPatterns(prefix, digits) {
  const count = 10 ** digits;
  return Array.from({ length: count }, (_, index) => `${prefix}${String(index).padStart(digits, '0')}*`);
}

function familyPatterns(family) {
  return (SEARCH_PLAN[family] || [])
    .filter(([, , tier]) => includeFallback || tier === 'AUTHORITY')
    .flatMap(([prefix, digits]) => numericPatterns(prefix, digits));
}

function legacySeedCandidates() {
  const root = path.resolve('elimfilters-vault/91-private-evidence/fram-ld-indexed-harvest');
  if (!fs.existsSync(root)) return [];
  const out = [];
  for (const name of fs.readdirSync(root).filter(name => /^batch-\d+\.json$/i.test(name)).sort()) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
      for (const record of data.records || []) {
        const family = String(record.family || '').toUpperCase();
        if (!isAllowedFramLdFamily(family)) continue;
        if (requestedFamily && family !== requestedFamily) continue;
        if (record.sku) out.push({ part_number: record.sku, family, enumeration: 'LEGACY_INDEXED_SEED' });
      }
    } catch {}
  }
  return out;
}

async function enumeratePattern(pattern, config) {
  const pageSize = 1000;
  const records = [];
  let start = 0;
  let expected = null;
  while (true) {
    const response = await queryCatalog(`lookup=partlist&partno=${encodeURIComponent(pattern)}`, { config, start, limit: pageSize });
    expected ??= parseTotalRecords(response.xml);
    const page = parsePartList(response.xml).filter(record => /^Fram Filters$/i.test(record.supplier || ''));
    records.push(...page);
    if (!expected || page.length === 0 || records.length >= expected || page.length < pageSize) break;
    start += pageSize;
  }
  return { pattern, expected: expected || 0, records };
}

async function enumerateCandidates(config) {
  if (requestedPart) return [{ part_number: requestedPart, enumeration: 'EXACT_PART' }];
  const patterns = requestedPattern
    ? [requestedPattern]
    : (requestedFamily ? familyPatterns(requestedFamily) : Object.keys(SEARCH_PLAN).flatMap(familyPatterns));
  const dedupe = new Map();
  const enumeration = [];
  for (const [index, pattern] of patterns.entries()) {
    const result = await enumeratePattern(pattern, config);
    enumeration.push({ pattern, total_records: result.expected, fram_records: result.records.length });
    for (const record of result.records) {
      const family = classifyFramLdFamily(record.part_type);
      if (!isAllowedFramLdFamily(family)) continue;
      if (requestedFamily && family !== requestedFamily) continue;
      const key = normalizePart(record.part_number);
      if (!dedupe.has(key)) dedupe.set(key, { ...record, family, enumeration: pattern });
    }
    if ((index + 1) % 50 === 0) console.log(`[FRAM ENUM] ${index + 1}/${patterns.length} patterns; unique=${dedupe.size}`);
    if (delayMs) await sleep(delayMs);
  }
  for (const seed of legacySeedCandidates()) {
    const key = normalizePart(seed.part_number);
    if (key && !dedupe.has(key)) dedupe.set(key, seed);
  }
  fs.writeFileSync(path.join(runDir, 'enumeration.json'), JSON.stringify({ patterns: enumeration, unique_candidates: dedupe.size, legacy_seed_count: legacySeedCandidates().length }, null, 2) + '\n');
  return [...dedupe.values()];
}

const bundleCache = new Map();
async function bundleFor(partNumber, config) {
  const key = normalizePart(partNumber);
  if (!bundleCache.has(key)) bundleCache.set(key, fetchFramPartBundle(partNumber, { config }));
  return bundleCache.get(key);
}

async function normalizeCandidate(candidate, config) {
  const discoveredBundle = await bundleFor(candidate.part_number, config);
  if (!discoveredBundle.found) return { status: 'NOT_FOUND', part_number: candidate.part_number };
  const discoveredFamily = classifyFramLdFamily(discoveredBundle.part.part_type);
  if (!isAllowedFramLdFamily(discoveredFamily)) return { status: 'OUT_OF_SCOPE', part_number: candidate.part_number, part_type: discoveredBundle.part.part_type };
  if (requestedFamily && discoveredFamily !== requestedFamily) return { status: 'OUT_OF_REQUESTED_FAMILY', part_number: candidate.part_number, family: discoveredFamily };

  let authorityBundle = discoveredBundle;
  const preferredPart = preferredPrimaryPartNumber({
    part_number: discoveredBundle.part.part_number,
    family: discoveredFamily,
    part_type: discoveredBundle.part.part_type,
    attributes: discoveredBundle.attributes
  });
  if (preferredPart && normalizePart(preferredPart) !== normalizePart(discoveredBundle.part.part_number)) {
    const preferredBundle = await bundleFor(preferredPart, config);
    if (preferredBundle.found && classifyFramLdFamily(preferredBundle.part.part_type) === discoveredFamily) authorityBundle = preferredBundle;
  }
  let enrichment = buildFramLdEnrichment(authorityBundle, { family: discoveredFamily, casePack });
  const crossAuthority = enrichment.authority?.part_number;
  if (crossAuthority && normalizePart(crossAuthority) !== normalizePart(authorityBundle.part.part_number)) {
    const fetchedAuthority = await bundleFor(crossAuthority, config);
    if (fetchedAuthority.found && classifyFramLdFamily(fetchedAuthority.part.part_type) === discoveredFamily) {
      authorityBundle = fetchedAuthority;
      enrichment = buildFramLdEnrichment(authorityBundle, { family: discoveredFamily, casePack });
    }
  }

  const payload = {
    ...enrichment,
    harvested_at: new Date().toISOString(),
    discovered_from: candidate.part_number,
    evidence_only: true,
    database_write: false,
    public_catalog_auto_write: false,
    private_source_records: {
      applications: authorityBundle.applications,
      cross_references: authorityBundle.cross_references,
      source: authorityBundle.source
    }
  };
  return { status: 'OK', authority_part_number: authorityBundle.part.part_number, family: discoveredFamily, payload };
}

const notifier = createJobNotifier({
  jobKey: 'fram-usa-ld-catalog-harvest',
  title: 'HERMES — FRAM USA LD',
  module: 'HERMES',
  metadata: { market_scope: 'USA_NORTH_AMERICA', families: ['LUBE','AIR','CABIN','FUEL'] }
});

async function notify(method, ...values) {
  try { await notifier[method](...values); } catch (error) { console.warn(`[FRAM NOTIFY] ${method} skipped: ${error.message}`); }
}

async function main() {
  const config = await loadPublicCatalogConfig();
  await notify('started', 'Cosecha estructurada FRAM USA LD iniciada; catálogo público sin escrituras automáticas.');
  let candidates = await enumerateCandidates(config);
  if (limit > 0) candidates = candidates.slice(0, limit);
  const results = [];
  const authoritySeen = new Set();
  const candidateSeen = new Set(candidates.map(item => normalizePart(item.part_number)));
  const milestones = new Set();

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      const normalized = await normalizeCandidate(candidate, config);
      if (normalized.status !== 'OK') { results.push(normalized); continue; }
      const authorityKey = normalizePart(normalized.authority_part_number);
      const outputPath = path.join(productDir, `${safeName(normalized.authority_part_number)}.json`);
      if (!authoritySeen.has(authorityKey)) {
        fs.writeFileSync(outputPath, JSON.stringify(normalized.payload, null, 2) + '\n');
        authoritySeen.add(authorityKey);
      }
      results.push({ status: 'OK', discovered_from: candidate.part_number, authority_part_number: normalized.authority_part_number, family: normalized.family, output: path.relative(process.cwd(), outputPath).replaceAll('\\', '/') });
      if (!(limit > 0)) {
        for (const alternative of normalized.payload.alternatives || []) {
          const key = normalizePart(alternative);
          if (!key || candidateSeen.has(key)) continue;
          candidateSeen.add(key);
          candidates.push({ part_number: alternative, family: normalized.family, enumeration: 'DISCOVERED_ALTERNATIVE' });
        }
      }
      console.log(`[FRAM ${index + 1}/${candidates.length}] ${candidate.part_number} -> ${normalized.authority_part_number} ${normalized.family}`);
    } catch (error) {
      results.push({ status: 'ERROR', part_number: candidate.part_number, error: error.message });
      console.error(`[FRAM ${index + 1}/${candidates.length}] ERROR ${candidate.part_number}: ${error.message}`);
    }
    const percent = candidates.length ? Math.floor(((index + 1) / candidates.length) * 100) : 100;
    for (const milestone of [25, 50, 75]) {
      if (percent >= milestone && !milestones.has(milestone)) {
        milestones.add(milestone);
        await notify('progress', milestone, `${index + 1}/${candidates.length} candidatos procesados.`, { metadata: { processed: index + 1, total: candidates.length } });
      }
    }
    if (delayMs) await sleep(delayMs);
  }

  const manifest = {
    schema_version: '1.0.0', run_id: runId, harvested_at: new Date().toISOString(),
    market_scope: 'USA_NORTH_AMERICA', allowed_families: ['LUBE','AIR','CABIN','FUEL'],
    case_pack_policy: casePack, public_media_policy: 'Genuine Media', gtin_promoted: false,
    evidence_only: true, database_write: false, public_catalog_auto_write: false,
    candidates: candidates.length,
    unique_authorities: authoritySeen.size,
    ok: results.filter(item => item.status === 'OK').length,
    errors: results.filter(item => item.status === 'ERROR').length,
    skipped: results.filter(item => !['OK','ERROR'].includes(item.status)).length,
    by_family: Object.fromEntries(['LUBE','AIR','CABIN','FUEL'].map(family => [family, results.filter(item => item.status === 'OK' && item.family === family).length])),
    results
  };
  fs.writeFileSync(path.join(runDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  await notify('completed', `FRAM USA LD: ${manifest.unique_authorities} autoridades; OK=${manifest.ok}; errores=${manifest.errors}.`, { metadata: manifest });
  console.log(JSON.stringify({ run_id: runId, run_dir: path.relative(process.cwd(), runDir).replaceAll('\\','/'), ...manifest }, null, 2));
  if (manifest.errors) process.exitCode = 1;
}

main().catch(async error => {
  console.error(`[HERMES FRAM USA LD] ${error.stack || error.message}`);
  await notify('failed', error.message, { metadata: { run_id: runId } });
  process.exit(1);
});
