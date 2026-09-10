#!/usr/bin/env node
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import pg from 'pg';
import { createRequire } from 'node:module';
import { normalizeManufacturer } from './catalogue-coverage-audit.mjs';

const require = createRequire(import.meta.url);
const {
  requiredPackagingFields,
  isProtectedPackaging,
} = require('../lib/hd_packaging_policy.js');

const { Pool } = pg;
const OUTPUT_DIR = path.resolve('hermes/hd-packaging');
const ORGANIZATIONS_PATH = path.resolve('hermes/config/source-organizations.json');
const EVIDENCE_DIR = path.resolve(process.env.HERMES_HD_PACKAGING_EVIDENCE_DIR || 'hermes/official-evidence');

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizePart(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function looksSpinOn(row) {
  const haystack = [row.style,row.filter_style,row.product_style,row.form_factor,row.packaging_type,row.description,row.product_name]
    .filter(Boolean).map(normalizeText).join(' | ');
  if (/spin[- ]?on/.test(haystack)) return true;
  const family = normalizeText(row.filter_type);
  const known = new Set([
    'oil','oil_filter','lube','lube_filter','fuel','fuel_filter',
    'fuel_water_separator','separator','coolant','coolant_filter',
    'hydraulic','hydraulic_filter','air_dryer'
  ]);
  const hasThread = [row.thread_size,row.thread,row.thread_spec].some((v) => String(v || '').trim());
  return known.has(family) && hasThread;
}

function classifyFamily(row) {
  const type = normalizeText(row.filter_type).replace(/_/g, '-');
  const tech = String(row.technology || '').toUpperCase();
  if (type.includes('air-dryer') || tech.includes('DRYCORE')) return 'air-dryer';
  if (type.includes('coolant') || type.includes('cooling') || tech.includes('THERMACORE')) return 'cooling';
  if (type.includes('hydraulic') || tech.includes('NANOFORCE')) return 'hydraulic';
  if (type.includes('separator') || tech.includes('HYDROCORE')) return 'fuel-water-separator';
  if (type.includes('fuel')) return 'fuel';
  if (type.includes('oil') || type.includes('lube') || tech.includes('SYNTRAX')) return 'lube-oil';
  return 'unknown';
}

function safeJson(value) {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function extractReferencePairs(value, source, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const item of value) extractReferencePairs(item, source, out);
    return out;
  }
  if (typeof value !== 'object') return out;
  const manufacturer = value.manufacturer || value.brand || value.make || value.oem || value.name || null;
  const code = value.code || value.part_number || value.partNumber || value.part || value.number || value.reference || value.ref || value.value || null;
  if (manufacturer && code) out.push({ manufacturer: String(manufacturer).trim(), part_number: String(code).trim(), source });
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') extractReferencePairs(child, source, out);
  }
  return out;
}

function uniqueReferences(row) {
  const refs = [
    ...extractReferencePairs(safeJson(row.oem_codes), 'oem_codes'),
    ...extractReferencePairs(safeJson(row.competitor_codes), 'competitor_codes'),
    ...extractReferencePairs(safeJson(row.brand_crossrefs), 'brand_crossrefs'),
  ];
  const seen = new Set();
  return refs.filter((ref) => {
    const key = `${normalizeManufacturer(ref.manufacturer)}::${normalizePart(ref.part_number)}`;
    if (!normalizeManufacturer(ref.manufacturer) || !normalizePart(ref.part_number) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function walkJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.json')) files.push(full);
  }
  return files;
}

function loadEvidenceIndex() {
  const index = new Map();
  for (const file of walkJsonFiles(EVIDENCE_DIR)) {
    try {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      const list = Array.isArray(doc) ? doc : (doc.discoveries || doc.records || doc.candidates || []);
      for (const item of list) {
        const manufacturer = normalizeManufacturer(item.manufacturer || item.organization_name || '');
        const part = normalizePart(item.part_number || item.partNumber || '');
        if (!manufacturer || !part) continue;
        const key = `${manufacturer}::${part}`;
        if (!index.has(key)) index.set(key, []);
        index.get(key).push(item);
      }
    } catch {}
  }
  return index;
}

function buildOrgIndex() {
  const organizations = JSON.parse(fs.readFileSync(ORGANIZATIONS_PATH, 'utf8')).organizations || [];
  const index = new Map();
  for (const org of organizations) {
    const keys = [org.id?.replace(/_/g, ' '), org.name, org.parent_company].map(normalizeManufacturer).filter(Boolean);
    for (const key of keys) {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(org);
    }
  }
  return index;
}

function resolveOrg(manufacturer, index) {
  const matches = index.get(normalizeManufacturer(manufacturer)) || [];
  return matches.length === 1 ? matches[0] : null;
}

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function getSslConfig(connectionString) {
  const raw = String(process.env.PGSSL || process.env.PGSSLMODE || '').toLowerCase();
  if (raw === 'disable' || raw === 'false' || raw === '0') return false;
  if (raw === 'require' || raw === 'true' || raw === '1') return { rejectUnauthorized: false };
  try {
    const url = new URL(connectionString);
    const host = url.hostname.toLowerCase();
    const sslmode = String(url.searchParams.get('sslmode') || '').toLowerCase();
    if (sslmode === 'disable') return false;
    if (['require','prefer','verify-ca','verify-full'].includes(sslmode)) return { rejectUnauthorized: false };
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') return false;
    return { rejectUnauthorized: false };
  } catch {
    return { rejectUnauthorized: false };
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const connectionString = process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error('CATALOG_DATABASE_URL or DATABASE_URL is required');

  const pool = new Pool({ connectionString, ssl: getSslConfig(connectionString) });
  const orgIndex = buildOrgIndex();
  const evidenceIndex = loadEvidenceIndex();

  try {
    const cols = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`);
    const columns = new Set(cols.rows.map((r) => r.column_name));
    const wanted = [
      'sku','codigo_base','duty','filter_type','technology','style','filter_style','product_style','form_factor','description','product_name','thread_size','thread','thread_spec',
      'oem_codes','competitor_codes','brand_crossrefs','unit_packaged_length_cm','unit_packaged_width_cm','unit_packaged_height_cm','unit_packaged_weight_kg','unit_packaged_volume_m3',
      'units_per_case','packaging_type','packaging_source','packaging_source_url','packaging_validation_status','packaging_notes'
    ].filter((c) => columns.has(c));

    const result = await pool.query(`SELECT ${wanted.map((c) => `"${c}"`).join(', ')} FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' ORDER BY sku`);
    const spinOnRows = result.rows.filter(looksSpinOn);

    const detail = [];
    const byFamily = new Map();
    const byManufacturer = new Map();

    for (const row of spinOnRows) {
      const family = classifyFamily(row);
      const missing = requiredPackagingFields(row);
      const protectedRow = isProtectedPackaging(row);
      const refs = uniqueReferences(row);
      let evidenceMatches = 0;
      let governedRefs = 0;

      for (const ref of refs) {
        const key = `${normalizeManufacturer(ref.manufacturer)}::${normalizePart(ref.part_number)}`;
        evidenceMatches += (evidenceIndex.get(key) || []).length;
        const org = resolveOrg(ref.manufacturer, orgIndex);
        if (org) governedRefs += 1;

        const mKey = normalizeManufacturer(ref.manufacturer) || 'UNMAPPED';
        if (!byManufacturer.has(mKey)) byManufacturer.set(mKey, {
          manufacturer: ref.manufacturer,
          organization_id: org?.id || null,
          official_domain: org?.official_domain || null,
          sku_set: new Set(),
          ref_set: new Set(),
          evidence_matches: 0,
        });
        const m = byManufacturer.get(mKey);
        m.sku_set.add(row.sku);
        m.ref_set.add(normalizePart(ref.part_number));
        m.evidence_matches += (evidenceIndex.get(key) || []).length;
      }

      const status = protectedRow
        ? 'PROTECTED'
        : missing.length === 0
          ? 'READY_FOR_PACKAGING_CALC'
          : evidenceMatches > 0
            ? 'EVIDENCE_AVAILABLE_REVIEW'
            : refs.length === 0
              ? 'NO_REFERENCE'
              : governedRefs === 0
                ? 'UNMAPPED_MANUFACTURER'
                : 'RESEARCH_REQUIRED';

      detail.push({
        sku: row.sku,
        codigo_base: row.codigo_base || null,
        family,
        filter_type: row.filter_type || null,
        technology: row.technology || null,
        protected: protectedRow,
        status,
        missing_fields: missing,
        references_count: refs.length,
        governed_references_count: governedRefs,
        evidence_matches: evidenceMatches,
        references: refs,
      });

      if (!byFamily.has(family)) byFamily.set(family, {
        family,
        total: 0,
        protected: 0,
        ready_for_packaging_calc: 0,
        evidence_available_review: 0,
        research_required: 0,
        unmapped_manufacturer: 0,
        no_reference: 0,
        incomplete: 0,
      });
      const f = byFamily.get(family);
      f.total += 1;
      if (protectedRow) f.protected += 1;
      if (missing.length) f.incomplete += 1;
      if (status === 'READY_FOR_PACKAGING_CALC') f.ready_for_packaging_calc += 1;
      if (status === 'EVIDENCE_AVAILABLE_REVIEW') f.evidence_available_review += 1;
      if (status === 'RESEARCH_REQUIRED') f.research_required += 1;
      if (status === 'UNMAPPED_MANUFACTURER') f.unmapped_manufacturer += 1;
      if (status === 'NO_REFERENCE') f.no_reference += 1;
    }

    const manufacturerMatrix = [...byManufacturer.values()].map((m) => ({
      manufacturer: m.manufacturer,
      organization_id: m.organization_id,
      official_domain: m.official_domain,
      sku_count: m.sku_set.size,
      distinct_reference_count: m.ref_set.size,
      evidence_matches: m.evidence_matches,
    })).sort((a,b) => b.sku_count - a.sku_count || a.manufacturer.localeCompare(b.manufacturer));

    const familyMatrix = [...byFamily.values()].sort((a,b) => b.total - a.total || a.family.localeCompare(b.family));

    const report = {
      generated_at: new Date().toISOString(),
      read_only: true,
      database_write: false,
      summary: {
        total_heavy_duty_rows: result.rowCount,
        spin_on_candidates: spinOnRows.length,
        protected: detail.filter((x) => x.status === 'PROTECTED').length,
        ready_for_packaging_calc: detail.filter((x) => x.status === 'READY_FOR_PACKAGING_CALC').length,
        evidence_available_review: detail.filter((x) => x.status === 'EVIDENCE_AVAILABLE_REVIEW').length,
        research_required: detail.filter((x) => x.status === 'RESEARCH_REQUIRED').length,
        unmapped_manufacturer: detail.filter((x) => x.status === 'UNMAPPED_MANUFACTURER').length,
        no_reference: detail.filter((x) => x.status === 'NO_REFERENCE').length,
      },
      family_matrix: familyMatrix,
      manufacturer_matrix: manufacturerMatrix,
      rows: detail,
    };

    const jsonPath = path.join(OUTPUT_DIR, 'hd-packaging-matrix.json');
    const csvPath = path.join(OUTPUT_DIR, 'hd-packaging-matrix.csv');
    fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

    const headers = ['sku','codigo_base','family','filter_type','technology','status','protected','missing_fields','references_count','governed_references_count','evidence_matches'];
    const csv = [headers.join(',')];
    for (const row of detail) {
      csv.push(headers.map((h) => csvEscape(h === 'missing_fields' ? row.missing_fields.join('|') : row[h])).join(','));
    }
    fs.writeFileSync(csvPath, `${csv.join('\n')}\n`, 'utf8');

    console.log(JSON.stringify({
      ...report.summary,
      family_matrix: familyMatrix,
      top_manufacturers: manufacturerMatrix.slice(0, 20),
      output_json: path.relative(process.cwd(), jsonPath),
      output_csv: path.relative(process.cwd(), csvPath),
      database_write: false,
    }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`[HERMES HD packaging matrix] ${error.stack || error.message}`);
  process.exit(1);
});
