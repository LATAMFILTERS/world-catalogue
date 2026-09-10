#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { createRequire } from 'node:module';
import pg from 'pg';
import { normalizeManufacturer } from './catalogue-coverage-audit.mjs';

const require = createRequire(import.meta.url);
const {
  policyFromEnv,
  selectCase,
  requiredPackagingFields,
  isProtectedPackaging,
  round,
} = require('../lib/hd_packaging_policy.js');

const { Pool } = pg;
const POLICY = policyFromEnv();
const OUTPUT_DIR = path.resolve('hermes/hd-packaging');
const ORGANIZATIONS_PATH = path.resolve('hermes/config/source-organizations.json');
const EVIDENCE_DIR = path.resolve(process.env.HERMES_HD_PACKAGING_EVIDENCE_DIR || 'hermes/official-evidence');
const APPLY = process.argv.includes('--apply');
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith('--limit='));
const LIMIT = LIMIT_ARG ? Math.max(1, Number(LIMIT_ARG.slice(8))) : 0;
const FAMILY_ARG = process.argv.find((arg) => arg.startsWith('--family='));
const FAMILY_FILTER = FAMILY_ARG ? FAMILY_ARG.slice(9).trim().toLowerCase() : null;

function safeJson(value) {
  if (value == null) return null;
  if (typeof value === 'object') return value;
  try { return JSON.parse(value); } catch { return value; }
}

function normalizePart(value) {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function looksSpinOn(row) {
  const haystack = [row.style,row.filter_style,row.product_style,row.form_factor,row.packaging_type,row.description,row.product_name]
    .filter(Boolean).map(normalizeText).join(' | ');
  if (/spin[- ]?on/.test(haystack)) return true;
  const family = normalizeText(row.filter_type);
  const known = new Set(['oil','oil_filter','lube','lube_filter','fuel','fuel_filter','fuel_water_separator','separator','coolant','coolant_filter','hydraulic','hydraulic_filter','air_dryer']);
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

function extractReferencePairs(value, source, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const item of value) extractReferencePairs(item, source, out);
    return out;
  }
  if (typeof value !== 'object') return out;

  const manufacturer = value.manufacturer || value.brand || value.make || value.oem || value.name || null;
  const code = value.code || value.part_number || value.partNumber || value.part || value.number || value.reference || value.ref || value.value || null;
  if (manufacturer && code) {
    out.push({ manufacturer: String(manufacturer).trim(), part_number: String(code).trim(), source });
  }

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

function organizationKeys(org) {
  return [org.id?.replace(/_/g, ' '), org.name, org.parent_company]
    .map(normalizeManufacturer).filter(Boolean);
}

function buildOrganizationIndex(organizations) {
  const index = new Map();
  for (const org of organizations) {
    for (const key of organizationKeys(org)) {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(org);
    }
  }
  return index;
}

function resolveOrganization(manufacturer, orgIndex) {
  const key = normalizeManufacturer(manufacturer);
  const exact = orgIndex.get(key) || [];
  if (exact.length === 1) return exact[0];
  return null;
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

function collectEvidenceRecords() {
  const records = [];
  for (const file of walkJsonFiles(EVIDENCE_DIR)) {
    try {
      const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
      const list = Array.isArray(doc) ? doc : (doc.discoveries || doc.records || doc.candidates || []);
      for (const item of list) records.push({ ...item, _file: path.relative(process.cwd(), file) });
    } catch {
      // Ignore malformed unrelated JSON; report only normalized official records.
    }
  }
  return records;
}

function evidenceIndex(records) {
  const index = new Map();
  for (const record of records) {
    const manufacturer = normalizeManufacturer(record.manufacturer || record.organization_name || '');
    const part = normalizePart(record.part_number || record.partNumber || '');
    if (!manufacturer || !part) continue;
    const key = `${manufacturer}::${part}`;
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(record);
  }
  return index;
}

function finitePositive(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function cmFromValue(value, unitHint) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = String(unitHint || '').toLowerCase();
  if (unit.includes('mm')) return n / 10;
  if (unit.includes('inch') || unit === 'in' || unit === '"') return n * 2.54;
  if (unit.includes('meter') || unit === 'm') return n * 100;
  return n;
}

function kgFromValue(value, unitHint) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  const unit = String(unitHint || '').toLowerCase();
  if (unit === 'g' || unit.includes('gram')) return n / 1000;
  if (unit.includes('lb') || unit.includes('pound')) return n / 2.2046226218;
  return n;
}

function pickPackaging(record) {
  const d = record.dimensions || {};
  const t = record.technical_specs || {};
  const p = record.packaging || record.package || record.packaged_dimensions || {};
  const unitHint = p.unit || p.units || d.unit || d.units || t.dimension_unit || 'cm';
  const weightUnit = p.weight_unit || t.weight_unit || 'kg';

  const length = cmFromValue(finitePositive(p.length_cm,p.length,p.packaged_length_cm,p.package_length_cm,t.unit_packaged_length_cm,t.packaged_length_cm,d.packaged_length_cm), unitHint);
  const width = cmFromValue(finitePositive(p.width_cm,p.width,p.packaged_width_cm,p.package_width_cm,t.unit_packaged_width_cm,t.packaged_width_cm,d.packaged_width_cm), unitHint);
  const height = cmFromValue(finitePositive(p.height_cm,p.height,p.packaged_height_cm,p.package_height_cm,t.unit_packaged_height_cm,t.packaged_height_cm,d.packaged_height_cm), unitHint);
  const weight = kgFromValue(finitePositive(p.weight_kg,p.weight,p.packaged_weight_kg,p.package_weight_kg,t.unit_packaged_weight_kg,t.packaged_weight_kg), weightUnit);
  const volume = finitePositive(p.volume_m3,p.packaged_volume_m3,t.unit_packaged_volume_m3,t.packaged_volume_m3);

  if (![length,width,height,weight].every(Boolean)) return null;
  return {
    unit_packaged_length_cm: round(length, 3),
    unit_packaged_width_cm: round(width, 3),
    unit_packaged_height_cm: round(height, 3),
    unit_packaged_weight_kg: round(weight, 3),
    unit_packaged_volume_m3: volume ? round(volume, 6) : null,
  };
}

function cartonGrossWeight(box, netWeightKg) {
  const gsm = Number(process.env.HD_CORRUGATED_BOARD_GSM || 650);
  const shrink = Number(process.env.HD_SHRINK_WRAP_WEIGHT_KG || 0.05);
  const allowance = Number(process.env.HD_PACKING_ALLOWANCE_WEIGHT_KG || 0.10);
  const l = box.master_carton_length_cm / 100;
  const w = box.master_carton_width_cm / 100;
  const h = box.master_carton_height_cm / 100;
  const surface = 2 * ((l*w)+(l*h)+(w*h));
  const board = surface * gsm / 1000;
  return round(netWeightKg + board + shrink + allowance, 3);
}

function chooseEvidence(row, refs, index) {
  const candidates = [];
  for (const ref of refs) {
    const key = `${normalizeManufacturer(ref.manufacturer)}::${normalizePart(ref.part_number)}`;
    for (const record of index.get(key) || []) {
      const packaging = pickPackaging(record);
      if (!packaging) continue;
      const sourceUrl = String(record.source_url || (record.source_urls || [])[0] || '').trim();
      if (!/^https:\/\//i.test(sourceUrl)) continue;
      const primary = record.evidence_level === 'PRIMARY' || String(record.source_type || '').startsWith('official') || ['oem_catalogue','aftermarket_catalogue','official_pdf','technical_bulletin'].includes(record.source_type);
      if (!primary) continue;
      candidates.push({ ref, record, packaging, source_url: sourceUrl });
    }
  }

  if (!candidates.length) return { status: 'UNRESOLVED', candidates: [] };
  const signatures = new Map();
  for (const item of candidates) {
    const signature = JSON.stringify(item.packaging);
    if (!signatures.has(signature)) signatures.set(signature, []);
    signatures.get(signature).push(item);
  }
  if (signatures.size > 1) return { status: 'CONFLICT', candidates };
  return { status: 'RESOLVED', candidate: candidates[0], candidates };
}

async function loadCandidates(pool) {
  const columnRows = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='elimfilters_catalog'`);
  const columns = new Set(columnRows.rows.map((r) => r.column_name));
  const wanted = [
    'sku','codigo_base','duty','filter_type','technology','style','filter_style','product_style','form_factor','description','product_name','thread_size','thread','thread_spec',
    'oem_codes','competitor_codes','brand_crossrefs','unit_packaged_length_cm','unit_packaged_width_cm','unit_packaged_height_cm','unit_packaged_weight_kg','unit_packaged_volume_m3',
    'units_per_case','packaging_type','packaging_source','packaging_source_url','packaging_validation_status','packaging_notes'
  ].filter((c) => columns.has(c));
  const result = await pool.query(`SELECT ${wanted.map((c) => `"${c}"`).join(', ')} FROM elimfilters_catalog WHERE duty='HEAVY_DUTY' ORDER BY sku`);
  let rows = result.rows.filter(looksSpinOn).filter((row) => classifyFamily(row) !== 'air-dryer').filter((row) => !isProtectedPackaging(row)).filter((row) => requiredPackagingFields(row).length > 0);
  if (FAMILY_FILTER) rows = rows.filter((row) => classifyFamily(row) === FAMILY_FILTER);
  if (LIMIT) rows = rows.slice(0, LIMIT);
  return rows;
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const organizations = JSON.parse(fs.readFileSync(ORGANIZATIONS_PATH, 'utf8')).organizations || [];
  const orgIndex = buildOrganizationIndex(organizations);
  const evidenceRecords = collectEvidenceRecords();
  const eIndex = evidenceIndex(evidenceRecords);
  const pool = new Pool({ connectionString: process.env.CATALOG_DATABASE_URL || process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  const report = { generated_at: new Date().toISOString(), dry_run: !APPLY, policy: POLICY, evidence_files_dir: path.relative(process.cwd(), EVIDENCE_DIR), evidence_records_loaded: evidenceRecords.length, resolved: [], unresolved: [], conflicts: [], no_valid_case: [], protected: [], manufacturer_plan: {} };

  try {
    const rows = await loadCandidates(pool);
    if (APPLY) await pool.query('BEGIN');

    for (const row of rows) {
      const family = classifyFamily(row);
      const refs = uniqueReferences(row);
      for (const ref of refs) {
        const org = resolveOrganization(ref.manufacturer, orgIndex);
        const key = org?.id || normalizeManufacturer(ref.manufacturer) || 'UNMAPPED';
        if (!report.manufacturer_plan[key]) report.manufacturer_plan[key] = { organization_id: org?.id || null, organization_name: org?.name || ref.manufacturer, official_domain: org?.official_domain || null, skus: new Set(), references: new Set() };
        report.manufacturer_plan[key].skus.add(row.sku);
        report.manufacturer_plan[key].references.add(`${ref.manufacturer}:${ref.part_number}`);
      }

      const evidence = chooseEvidence(row, refs, eIndex);
      if (evidence.status === 'UNRESOLVED') {
        report.unresolved.push({ sku: row.sku, family, missing_fields: requiredPackagingFields(row), references: refs });
        continue;
      }
      if (evidence.status === 'CONFLICT') {
        report.conflicts.push({ sku: row.sku, family, references: refs, evidence: evidence.candidates.map((c) => ({ source_url: c.source_url, packaging: c.packaging, evidence_id: c.record.evidence_id || null })) });
        continue;
      }

      const candidateRow = { ...row, ...evidence.candidate.packaging };
      const calc = selectCase(candidateRow, POLICY);
      if (!calc.selected) {
        report.no_valid_case.push({ sku: row.sku, family, reason: calc.reason, evaluations: calc.evaluations });
        continue;
      }

      const selected = calc.selected;
      const box = selected.selected_arrangement;
      const proposal = {
        sku: row.sku,
        family,
        matched_reference: evidence.candidate.ref,
        evidence_id: evidence.candidate.record.evidence_id || null,
        source_url: evidence.candidate.source_url,
        source_type: evidence.candidate.record.source_type || null,
        unit_packaging: evidence.candidate.packaging,
        units_per_case: selected.qty,
        master_carton_length_cm: box.master_carton_length_cm,
        master_carton_width_cm: box.master_carton_width_cm,
        master_carton_height_cm: box.master_carton_height_cm,
        master_carton_net_weight_kg: selected.estimated_net_weight_kg,
        master_carton_gross_weight_kg: cartonGrossWeight(box, selected.estimated_net_weight_kg),
        master_carton_volume_m3: box.master_carton_volume_m3,
        selected_grid: box.grid,
      };
      report.resolved.push(proposal);

      if (APPLY) {
        const note = `HERMES HD packaging enrichment; family=${family}; evidence_id=${proposal.evidence_id || 'n/a'}; source=${proposal.source_url}; selected_grid=${proposal.selected_grid.join('x')}; factory confirmation required before production release`;
        await pool.query(`UPDATE elimfilters_catalog SET
          unit_packaged_length_cm=COALESCE(unit_packaged_length_cm,$1),
          unit_packaged_width_cm=COALESCE(unit_packaged_width_cm,$2),
          unit_packaged_height_cm=COALESCE(unit_packaged_height_cm,$3),
          unit_packaged_weight_kg=COALESCE(unit_packaged_weight_kg,$4),
          unit_packaged_volume_m3=COALESCE(unit_packaged_volume_m3,$5),
          units_per_case=$6,
          master_carton_length_cm=$7,
          master_carton_width_cm=$8,
          master_carton_height_cm=$9,
          master_carton_net_weight_kg=$10,
          master_carton_gross_weight_kg=$11,
          master_carton_volume_m3=$12,
          packaging_type='HD_SHRINK_WRAPPED_MASTER_CARTON',
          packaging_source='OFFICIAL_SOURCE_SCRAPE',
          packaging_source_url=$13,
          packaging_validation_status='CALCULATED_PENDING_FACTORY_CONFIRMATION',
          packaging_validated_at=NOW(),
          packaging_notes=CASE WHEN COALESCE(packaging_notes,'')='' THEN $14 WHEN packaging_notes LIKE '%'||$13||'%' THEN packaging_notes ELSE packaging_notes||' | '||$14 END
          WHERE sku=$15 AND COALESCE(packaging_source,'') NOT IN ('PLANT_CONFIRMED','MANUFACTURER_DOCUMENTATION')`, [
          proposal.unit_packaging.unit_packaged_length_cm,
          proposal.unit_packaging.unit_packaged_width_cm,
          proposal.unit_packaging.unit_packaged_height_cm,
          proposal.unit_packaging.unit_packaged_weight_kg,
          proposal.unit_packaging.unit_packaged_volume_m3,
          proposal.units_per_case,
          proposal.master_carton_length_cm,
          proposal.master_carton_width_cm,
          proposal.master_carton_height_cm,
          proposal.master_carton_net_weight_kg,
          proposal.master_carton_gross_weight_kg,
          proposal.master_carton_volume_m3,
          proposal.source_url,
          note,
          proposal.sku,
        ]);
      }
    }

    if (APPLY) await pool.query('COMMIT');
  } catch (error) {
    if (APPLY) await pool.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await pool.end();
  }

  report.manufacturer_plan = Object.fromEntries(Object.entries(report.manufacturer_plan).map(([key, value]) => [key, {
    ...value,
    sku_count: value.skus.size,
    reference_count: value.references.size,
    skus: [...value.skus].sort(),
    references: [...value.references].sort(),
  }]));
  report.summary = {
    candidates_scanned: report.resolved.length + report.unresolved.length + report.conflicts.length + report.no_valid_case.length,
    resolved_from_official_evidence: report.resolved.length,
    unresolved_research_required: report.unresolved.length,
    conflicts: report.conflicts.length,
    no_valid_case: report.no_valid_case.length,
    manufacturers_in_plan: Object.keys(report.manufacturer_plan).length,
    database_updates: APPLY ? report.resolved.length : 0,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const output = path.join(OUTPUT_DIR, `hd-packaging-enrichment-${stamp}.json`);
  fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ output, ...report.summary, dry_run: !APPLY }, null, 2));
}

main().catch((error) => {
  console.error(`[HERMES HD packaging] ${error.stack || error.message}`);
  process.exit(1);
});
