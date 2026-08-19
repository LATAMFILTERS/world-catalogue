#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const MAKE_FIELDS = ['make', 'manufacturer', 'brand', 'vehicle_make', 'equipment_make', 'oem'];
const CODE_MANUFACTURER_FIELDS = ['manufacturer', 'brand', 'make', 'oem'];
const CORPORATE_WORDS = new Set(['AG', 'CO', 'COMPANY', 'CORP', 'CORPORATION', 'GROUP', 'INC', 'LTD', 'LIMITED', 'MOTOR', 'MOTORS']);

export function normalizeManufacturer(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter((token) => token && !CORPORATE_WORDS.has(token))
    .join(' ');
}

function addEvidence(index, rawName, sku, source) {
  const normalized = normalizeManufacturer(rawName);
  if (!normalized || normalized.length < 2) return;
  if (!index.has(normalized)) index.set(normalized, { normalized, names: new Set(), skus: new Set(), sources: new Set() });
  const entry = index.get(normalized);
  entry.names.add(String(rawName).trim());
  if (sku) entry.skus.add(String(sku));
  entry.sources.add(source);
}

function visitApplication(value, sku, index) {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) visitApplication(item, sku, index);
    return;
  }
  if (typeof value !== 'object') return;
  for (const field of MAKE_FIELDS) addEvidence(index, value[field], sku, `application.${field}`);
}

function visitCodes(value, sku, index) {
  if (!Array.isArray(value)) return;
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    for (const field of CODE_MANUFACTURER_FIELDS) addEvidence(index, item[field], sku, `cross_reference.${field}`);
  }
}

export function extractCatalogueManufacturers(products) {
  const index = new Map();
  for (const product of products || []) {
    const sku = product?.sku || product?.part_number || null;
    visitApplication(product?.applications, sku, index);
    visitApplication(product?.vehicle_applications, sku, index);
    visitApplication(product?.equipment_applications, sku, index);
    visitCodes(product?.oem_codes, sku, index);
    visitCodes(product?.competitor_codes, sku, index);
    visitCodes(product?.brand_crossrefs, sku, index);
  }
  return [...index.values()].map((entry) => ({
    normalized: entry.normalized,
    names: [...entry.names].sort(),
    sku_count: entry.skus.size,
    sample_skus: [...entry.skus].sort().slice(0, 10),
    evidence_sources: [...entry.sources].sort()
  })).sort((a, b) => a.normalized.localeCompare(b.normalized));
}

function organizationKeys(org) {
  const values = [org.id?.replace(/_/g, ' '), org.name, org.parent_company];
  return new Set(values.map(normalizeManufacturer).filter(Boolean));
}

function possibleOrganizations(manufacturer, organizations) {
  const words = new Set(manufacturer.normalized.split(' ').filter((word) => word.length >= 4));
  if (!words.size) return [];
  return organizations.filter((org) => {
    const haystack = normalizeManufacturer([org.name, org.parent_company, org.notes].filter(Boolean).join(' '));
    return [...words].some((word) => haystack.split(' ').includes(word));
  }).map((org) => org.id).slice(0, 10);
}

export function buildCatalogueCoverageAudit({ products, organizations, generatedAt = new Date().toISOString() }) {
  const manufacturers = extractCatalogueManufacturers(products);
  const registryKeyToOrg = new Map();
  for (const org of organizations || []) {
    for (const key of organizationKeys(org)) {
      if (!registryKeyToOrg.has(key)) registryKeyToOrg.set(key, []);
      registryKeyToOrg.get(key).push(org.id);
    }
  }

  const exact = [];
  const possible = [];
  const missing = [];
  for (const manufacturer of manufacturers) {
    const exactIds = registryKeyToOrg.get(manufacturer.normalized) || [];
    if (exactIds.length) {
      exact.push({ ...manufacturer, organization_ids: exactIds });
      continue;
    }
    const candidates = possibleOrganizations(manufacturer, organizations || []);
    if (candidates.length) possible.push({ ...manufacturer, possible_organization_ids: candidates });
    else missing.push(manufacturer);
  }

  return {
    schema_version: '1.0.0',
    generated_at: generatedAt,
    read_only: true,
    approval_required: true,
    database_write: false,
    summary: {
      catalogue_products_scanned: (products || []).length,
      distinct_manufacturers_found: manufacturers.length,
      exact_registry_matches: exact.length,
      possible_parent_or_alias_matches: possible.length,
      missing_from_registry: missing.length
    },
    exact_matches: exact,
    possible_matches: possible,
    missing_manufacturers: missing
  };
}

export function renderCatalogueCoverageMarkdown(report) {
  const lines = [
    '# HERMES Catalogue Manufacturer Coverage', '',
    `Generated: ${report.generated_at}`, '',
    `- Products scanned: ${report.summary.catalogue_products_scanned}`,
    `- Manufacturers found: ${report.summary.distinct_manufacturers_found}`,
    `- Exact registry matches: ${report.summary.exact_registry_matches}`,
    `- Possible parent/alias matches: ${report.summary.possible_parent_or_alias_matches}`,
    `- Missing from registry: ${report.summary.missing_from_registry}`, '',
    '## Missing manufacturers', ''
  ];
  for (const item of report.missing_manufacturers) lines.push(`- ${item.names.join(' / ')} (${item.sku_count} SKU)`);
  lines.push('', '## Possible parent or alias matches', '');
  for (const item of report.possible_matches) lines.push(`- ${item.names.join(' / ')} -> review: ${item.possible_organization_ids.join(', ')}`);
  lines.push('', '> Read-only report. No organization, source, Obsidian note, catalogue row, pgvector record, or production system was modified.', '');
  return lines.join('\n');
}

function readJson(file) { return JSON.parse(fs.readFileSync(path.resolve(file), 'utf8')); }

async function main() {
  const [snapshotPath, organizationsPath = 'hermes/config/source-organizations.json', outputDir = 'hermes/reports'] = process.argv.slice(2);
  if (!snapshotPath) {
    console.error('Usage: node scripts/hermes/catalogue-coverage-audit.mjs <catalogue-snapshot.json> [source-organizations.json] [output-dir]');
    process.exit(2);
  }
  const snapshot = readJson(snapshotPath);
  const organizationsDoc = readJson(organizationsPath);
  const report = buildCatalogueCoverageAudit({ products: snapshot.products || [], organizations: organizationsDoc.organizations || [] });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'catalogue-manufacturer-coverage.json'), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, 'catalogue-manufacturer-coverage.md'), renderCatalogueCoverageMarkdown(report).replace(/\n*$/, '\n'));
  console.log(JSON.stringify(report.summary, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(`[HERMES catalogue coverage] ${error.message}`); process.exit(1); });
}
