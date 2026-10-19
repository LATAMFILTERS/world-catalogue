#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

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

function sourceKey(item) {
  const source = item.source_identity || {};
  const brand = normalizeBrand(source.canonical_source_brand || item.canonical_source_brand);
  const code = normalizePart(source.canonical_source_code || item.canonical_source_code || item.codigo_base);
  return brand && code ? `${brand}::${code}` : null;
}
function referenceKey(ref) {
  if (!ref || typeof ref !== 'object') return null;
  const brand = normalizeBrand(ref.manufacturer || ref.brand || ref.make);
  const code = normalizePart(ref.code || ref.part_number || ref.partNumber);
  return brand && code ? `${brand}::${code}` : null;
}
function evidenceKeys(item) {
  const result = new Set([productKey(item), sourceKey(item)].filter(Boolean));
  for (const field of ['oem_codes','competitor_codes','cross_references']) {
    for (const ref of Array.isArray(item[field]) ? item[field] : []) {
      const key = referenceKey(ref);
      if (key) result.add(key);
    }
  }
  return result;
}
function sameTechnicalProfile(a, b) {
  if (!a?.dimensions || !b?.dimensions) return false;
  const aKeys = Object.keys(a.dimensions).filter(k => a.dimensions[k] != null);
  if (!aKeys.length || aKeys.some(k => b.dimensions[k] == null || JSON.stringify(a.dimensions[k]) !== JSON.stringify(b.dimensions[k]))) return false;
  if (a.product_family && b.product_family && a.product_family !== b.product_family) return false;
  return true;
}
function resolveExisting(candidate, products) {
  const claimed = evidenceKeys(candidate);
  const possible = products.filter(product => {
    const keys = evidenceKeys(product);
    return [...claimed].some(key => keys.has(key)) || sameTechnicalProfile(candidate, product);
  });
  const canonical = possible.filter(product => sourceKey(product) && sourceKey(product) === sourceKey(candidate));
  // An unrelated product sharing the reference or technical profile is a
  // collision, even if precisely one canonical source appears to match.
  // Technical conflicts never clear an identity for reuse.
  if (possible.length === 1 && canonical.length === 1 &&
      candidate.source_identity?.canonical_source_status === 'VERIFIED' &&
      canonical[0].source_identity?.canonical_source_status === 'VERIFIED' &&
      sameTechnicalProfile(candidate, canonical[0]) &&
      !incompatibleTechnicalData(candidate.dimensions, canonical[0].dimensions) &&
      !incompatibleTechnicalData(candidate.technical_specs, canonical[0].technical_specs) &&
      !incompatibleTechnicalData(canonical[0].technical_specs, candidate.technical_specs)) {
    return { state: 'EXISTING_PRODUCT_REVIEW', current: canonical[0], possible };
  }
  if (possible.length) return { state: 'IDENTITY_CONFLICT_OR_CROSS_REVIEW', current: null, possible };
  return { state: 'CATALOGUE_IDENTITY_SEARCH_REQUIRED', current: null, possible: [] };
}

function mergeVerifiedApplications(current, proposed) {
  const merged = [];
  const keys = new Set();
  for (const entry of [...(Array.isArray(current) ? current : []), ...(Array.isArray(proposed) ? proposed : [])]) {
    const key = JSON.stringify(entry && typeof entry === 'object' && !Array.isArray(entry)
      ? Object.fromEntries(Object.entries(entry).sort(([a],[b]) => a.localeCompare(b))) : entry);
    if (!keys.has(key)) { keys.add(key); merged.push(entry); }
  }
  return merged;
}

function incompatibleTechnicalData(proposed, current) {
  if (!proposed || typeof proposed !== 'object' || !current || typeof current !== 'object') return false;
  return Object.entries(proposed).some(([key, value]) =>
    value != null && current[key] != null && JSON.stringify(value) !== JSON.stringify(current[key]));
}


const DONALDSON_DB_PREFIX = /^(DBA|DBH|DBL|DBF)[A-Z0-9]+$/;
const DONALDSON_SPEC_FIELDS = new Set([
  'micron_rating', 'iso_test_method', 'nominal_efficiency',
  'burst_pressure_psi', 'collapse_pressure_psi', 'bypass_valve_psi',
  'anti_drainback_valve', 'installation_type', 'attachment_type', 'is_primary'
]);
const DONALDSON_DIMENSION_FIELDS = new Set([
  'height_mm', 'outer_diameter_mm', 'inner_diameter_mm',
  'gasket_od_mm', 'gasket_id_mm', 'thread_size'
]);
function missing(value) { return value === null || value === undefined || value === ''; }

// Donaldson DB variants have independent ELIMFILTERS SKUs. Source media names
// (e.g. Ultra-Web) are evidence metadata, NEVER an ELIMFILTERS technology.
export function buildDonaldsonDbEnrichment({ product, official }) {
  const source = product?.source_identity || {};
  const code = normalizePart(source.canonical_source_code || product?.codigo_base);
  if (normalizeBrand(source.canonical_source_brand) !== 'DONALDSON' ||
      !DONALDSON_DB_PREFIX.test(code) || !product?.sku) {
    throw new Error('Verified Donaldson DB product with an existing SKU required');
  }
  if (source.canonical_source_status !== 'VERIFIED' ||
      normalizeBrand(official?.manufacturer) !== 'DONALDSON' ||
      normalizePart(official?.part_number) !== code ||
      !/^https:\/\//i.test(official?.source_url || '') ||
      !official?.source_date) {
    throw new Error('Matching official Donaldson evidence required');
  }
  const differences = [];
  const conflicts = [];
  for (const [field, allowed] of [
    ['dimensions', DONALDSON_DIMENSION_FIELDS],
    ['technical_specs', DONALDSON_SPEC_FIELDS]
  ]) {
    const existing = product[field] || {};
    const incoming = official[field] || {};
    const after = { ...existing };
    for (const [key, value] of Object.entries(incoming)) {
      if (!allowed.has(key) || missing(value)) continue;
      if (missing(existing[key])) after[key] = value;
      else if (JSON.stringify(existing[key]) !== JSON.stringify(value)) conflicts.push(field + '.' + key);
    }
    if (JSON.stringify(existing) !== JSON.stringify(after)) {
      differences.push({ field, before: existing, after });
    }
  }
  const currentApps = Array.isArray(product.equipment_applications) ? product.equipment_applications : [];
  const verifiedApps = Array.isArray(official.equipment_applications) ? official.equipment_applications : [];
  const apps = mergeVerifiedApplications(currentApps, verifiedApps);
  if (apps.length > currentApps.length) {
    differences.push({ field: 'equipment_applications', before: currentApps, after: apps });
  }
  return {
    existing_sku: product.sku,
    codigo_base: product.codigo_base,
    technology: product.technology, // MACROCORE remains untouched
    identity_resolution: conflicts.length ? 'TECHNICAL_CONFLICT_REVIEW' : 'EXISTING_PRODUCT_REVIEW',
    change_type: 'catalogue_correction',
    status: 'REVIEW_REQUIRED',
    conflicts,
    differences,
    source_urls: [official.source_url],
    source_date: official.source_date,
    source_metadata: {
      manufacturer: 'DONALDSON', part_number: code,
      supplier_media: official.media_type || null,
      alternative_part_numbers: official.alternative_part_numbers || []
    },
    dry_run: true,
    publication_enabled: false
  };
}


function officialMm(value) {
  if (typeof value !== 'string') return null;
  const mm = value.match(/\\(([0-9]+(?:\\.[0-9]+)?)\\s*mm\\)/i) ||
    value.match(/([0-9]+(?:\\.[0-9]+)?)\\s*mm\\b/i);
  if (mm) return Number(mm[1]);
  const inches = value.match(/([0-9]+(?:\\.[0-9]+)?)\\s*(?:inch|inches)\\b/i);
  return inches ? Math.round(Number(inches[1]) * 25.4 * 100) / 100 : null;
}

// Adapter for the EXISTING read-only Donaldson scraper JSONL output.
// Unverified equipment_raw is deliberately never promoted into applications.
export function buildDonaldsonDbScraperCandidates({ rows, catalog }) {
  const products = Array.isArray(catalog) ? catalog : (catalog?.products || []);
  return rows.map(row => {
    const code = normalizePart(row?.codigo_base || row?.official?.part_number);
    const matches = products.filter(p =>
      normalizeBrand(p?.source_identity?.canonical_source_brand) === 'DONALDSON' &&
      normalizePart(p?.source_identity?.canonical_source_code || p.codigo_base) === code);
    const url = row?.source_url || '';
    let officialHost = false;
    try { officialHost = new URL(url).hostname === 'shop.donaldson.com'; } catch {}
    if (row?.status !== 'OK' || !row?.audit?.expansion_complete ||
        !officialHost || normalizePart(row?.official?.part_number) !== code) {
      return { source_code: code, status: 'REVIEW_REQUIRED', reason: 'INCOMPLETE_OR_UNVERIFIED_OFFICIAL_EXTRACTION', database_write: false };
    }
    if (matches.length !== 1) {
      return { source_code: code, status: 'REVIEW_REQUIRED', reason: 'AMBIGUOUS_OR_MISSING_CANONICAL_SKU', possible_skus: matches.map(p=>p.sku), database_write: false };
    }
    const a = row.official.attributes || {};
    const dimensions = Object.fromEntries([
      ['outer_diameter_mm', officialMm(a['Outer Diameter'])],
      ['inner_diameter_mm', officialMm(a['Inner Diameter'])],
      ['height_mm', officialMm(a['Length'])]
    ].filter(([,v]) => v !== null));
    const technical_specs = {};
    if (a['Efficiency Test Std']) technical_specs.iso_test_method = a['Efficiency Test Std'];
    if (a['Efficiency']) technical_specs.nominal_efficiency = a['Efficiency'];
    const report = buildDonaldsonDbEnrichment({
      product: matches[0],
      official: {
        manufacturer: 'DONALDSON', part_number: code,
        source_url: url, source_date: String(row.scraped_at || '').slice(0, 10),
        dimensions, technical_specs,
        media_type: a['Media Type'] || a['Media Brand'] || null,
        alternative_part_numbers: row.official.alternatives || [],
        equipment_applications: [] // requires separate application authority verification
      }
    });
    return { ...report, requires_application_evidence: true, database_write: false };
  });
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

export async function readRelevantCatalogueProducts(file, wantedKeys) {
  const matches = [];
  const stream = fs.createReadStream(file, { encoding: 'utf8', highWaterMark: 1024 * 1024 });

  let header = '';
  let productsStarted = false;
  let collecting = false;
  let objectText = '';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for await (const chunk of stream) {
    for (let index = 0; index < chunk.length; index += 1) {
      const character = chunk[index];

      if (!productsStarted) {
        header += character;
        const markerIndex = header.indexOf('"products"');
        if (markerIndex === -1) {
          if (header.length > 64) header = header.slice(-64);
          continue;
        }

        const arrayIndex = header.indexOf('[', markerIndex);
        if (arrayIndex === -1) {
          if (header.length > 256) header = header.slice(markerIndex);
          continue;
        }

        productsStarted = true;
        header = '';
        continue;
      }

      if (!collecting) {
        if (character === ']') return matches;
        if (character !== '{') continue;
        collecting = true;
        objectText = '{';
        depth = 1;
        inString = false;
        escaped = false;
        continue;
      }

      objectText += character;

      if (inString) {
        if (escaped) {
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === '"') {
          inString = false;
        }
        continue;
      }

      if (character === '"') {
        inString = true;
      } else if (character === '{') {
        depth += 1;
      } else if (character === '}') {
        depth -= 1;
        if (depth === 0) {
          const product = JSON.parse(objectText);
          if (wantedKeys === null || wantedKeys.has(productKey(product))) matches.push(product);
          collecting = false;
          objectText = '';
        }
      }
    }
  }

  if (!productsStarted) throw new Error('Catalogue snapshot does not contain a products array');
  if (collecting) throw new Error('Catalogue snapshot ended inside a product object');
  return matches;
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
      technical_specs: raw.technical_specs || {},
      source_identity: raw.source_identity || null,
      oem_codes: raw.oem_codes || [],
      competitor_codes: raw.competitor_codes || [],
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

    // Fail closed: reuse only an identified existing product, and stage any
    // enrichment as a governed review candidate, never a canonical DB write.
    const resolution = resolveExisting(candidate, catalogItems);
    const matched = resolution.current;
    candidate.possible_existing_skus = resolution.possible.map(item => item.sku).filter(Boolean);
    if (matched) {
      candidate.existing_sku = matched.sku || null;
      candidate.identity_resolution = 'EXISTING_PRODUCT_REVIEW';
      if (incompatibleTechnicalData(raw.dimensions, matched.dimensions) ||
          incompatibleTechnicalData(raw.technical_specs, matched.technical_specs) ||
          (raw.product_family && matched.product_family && raw.product_family !== matched.product_family)) {
        candidate.identity_resolution = 'TECHNICAL_CONFLICT_REVIEW';
      } else if (Array.isArray(raw.applications) && raw.applications.length) {
        candidate.change_type = 'application_update';
        candidate.applications = mergeVerifiedApplications(matched.applications, raw.applications);
      }
    } else if (candidate.change_type === 'new_product') {
      candidate.identity_resolution = resolution.state;
    }

    candidate.candidate_id = candidate.candidate_id || stableId(candidate);
    candidate.validation_errors = validateCandidate(candidate);
    const comparisonIndex = matched ? new Map([[productKey(candidate), matched]]) : catalogIndex;
    candidate.catalogue_comparison = compareCandidate(candidate, comparisonIndex, {
      ...raw,
      ...(candidate.identity_resolution === 'EXISTING_PRODUCT_REVIEW' && Array.isArray(raw.applications)
        ? { applications: candidate.applications } : {}),
    });

    if (candidate.identity_resolution === 'TECHNICAL_CONFLICT_REVIEW') {
      candidate.status = 'CONFLICTING_DATA';
    } else if (candidate.validation_errors.length) {
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

    if (candidate.identity_resolution === 'IDENTITY_CONFLICT_OR_CROSS_REVIEW' && candidate.status !== 'INSUFFICIENT_DATA') {
      candidate.status = 'REVIEW_REQUIRED';
    }
    if (candidate.identity_resolution === 'EXISTING_PRODUCT_REVIEW' &&
        candidate.status !== 'REJECTED' && candidate.status !== 'INSUFFICIENT_DATA') {
      candidate.status = 'REVIEW_REQUIRED';
    }
    if (candidate.identity_resolution === 'CATALOGUE_IDENTITY_SEARCH_REQUIRED' &&
        candidate.status !== 'INSUFFICIENT_DATA') {
      candidate.status = 'REVIEW_REQUIRED';
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

async function main() {
  const [discoveriesPath, catalogPath, outputDir = 'hermes/catalogue-candidates'] = process.argv.slice(2);
  if (!discoveriesPath || !catalogPath) {
    console.error('Usage: node scripts/hermes/catalogue-intelligence.mjs <discoveries.json> <catalog.json> [output-dir]');
    process.exit(2);
  }

  const discoveriesRaw = readJson(discoveriesPath);
  const discoveries = Array.isArray(discoveriesRaw) ? discoveriesRaw : (discoveriesRaw.discoveries || discoveriesRaw.candidates || []);
  // Identity searches must consider canonical codes and every recorded OEM/competitor
  // alias; loading only matching display-brand keys would silently miss duplicates.
  const catalog = await readRelevantCatalogueProducts(catalogPath, null);
  const report = buildCatalogueCandidates({ discoveries, catalog });

  fs.mkdirSync(outputDir, { recursive: true });
  const file = path.join(outputDir, `catalogue-candidates-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  fs.writeFileSync(file, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify({
    output: file,
    catalogue_matches_loaded: catalog.length,
    ...report.summary,
    dry_run: report.dry_run,
    publication_enabled: report.publication_enabled
  }, null, 2));
}

const isDirectRun = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (isDirectRun) {
  main().catch((error) => {
    console.error(`[HERMES catalogue intelligence] ${error.message}`);
    process.exit(1);
  });
}
