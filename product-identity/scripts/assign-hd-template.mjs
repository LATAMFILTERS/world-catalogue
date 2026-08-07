#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DEFAULT_REGISTRY = path.join(ROOT, 'hd-standard', 'templates', 'template-registry.v1.json');
const DEFAULT_MASTER_DIR = path.join(ROOT, 'production-master');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeConstruction(value) {
  const v = String(value || '').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (!v) return 'unknown';
  if (v.includes('spin')) return 'spin_on';
  if (v.includes('panel')) return 'panel';
  if (v.includes('radial')) return 'radial';
  if (v.includes('cartridge')) return 'cartridge';
  if (v.includes('element')) return 'element';
  if (v.includes('bowl')) return 'bowl';
  if (v.includes('housing')) return 'housing';
  return v;
}

function dimensionMetric(master, surface) {
  const tech = master.technical_source || {};
  const printable = master.production?.printable_area || {};
  const h = Number(tech.height_mm);
  const od = Number(tech.outer_diameter_mm);
  const ph = Number(printable.height_mm);
  const pc = Number(printable.circumference_mm);

  if (surface === 'cylinder' && Number.isFinite(ph) && Number.isFinite(pc)) {
    return { kind: 'printable_area_mm2', value: ph * pc };
  }
  if (Number.isFinite(h) && Number.isFinite(od)) {
    return { kind: 'envelope_proxy_mm2', value: h * od };
  }
  return null;
}

function assignSizeClass(metric, thresholds) {
  if (!metric || !thresholds || !Array.isArray(thresholds.bands)) return null;
  const band = thresholds.bands.find((b) => metric.value >= b.min && metric.value < b.max);
  return band?.class || null;
}

export function assignTemplate(master, registry) {
  if (master.segment !== 'HD') {
    return {
      template_family: null,
      template_id: null,
      size_class: null,
      status: 'not_hd',
      review_required: false
    };
  }

  const construction = normalizeConstruction(master.construction);
  const entry = registry.template_families[construction] || registry.template_families.unknown;
  const metric = dimensionMetric(master, entry.surface);
  const sizeClass = assignSizeClass(metric, entry.thresholds);

  if (!entry.thresholds) {
    return {
      template_family: entry.template_family,
      template_id: null,
      size_class: null,
      status: 'family_assigned_size_pending_pilot_calibration',
      review_required: construction === 'unknown' || entry.template_family === 'HD_SPECIAL',
      classification_metric: metric
    };
  }

  if (!sizeClass) {
    return {
      template_family: entry.template_family,
      template_id: null,
      size_class: null,
      status: 'outside_approved_thresholds',
      review_required: true,
      classification_metric: metric
    };
  }

  return {
    template_family: entry.template_family,
    template_id: `${entry.template_family}_${sizeClass}_V1`,
    size_class: sizeClass,
    status: 'assigned',
    review_required: false,
    classification_metric: metric
  };
}

export function applyAssignment(master, assignment) {
  const next = structuredClone(master);
  next.production = next.production || {};
  next.production.template_family = assignment.template_family;
  next.production.template_id = assignment.template_id;
  next.production.size_class = assignment.size_class;
  next.production.template_assignment = {
    status: assignment.status,
    review_required: assignment.review_required,
    classification_metric: assignment.classification_metric || null
  };

  const missing = new Set(next.gate?.missing_for_factory_release || []);
  if (!assignment.template_id) missing.add('production.template_id');
  else missing.delete('production.template_id');
  next.gate = next.gate || {};
  next.gate.missing_for_factory_release = [...missing];
  next.production.factory_ready = next.gate.missing_for_factory_release.length === 0;
  return next;
}

export function run({ sku = null, dryRun = false, masterDir = DEFAULT_MASTER_DIR, registryFile = DEFAULT_REGISTRY } = {}) {
  const registry = readJson(registryFile);
  const files = fs.readdirSync(masterDir)
    .filter((name) => name.endsWith('.json'))
    .filter((name) => !sku || name === `${sku}.json`);

  const report = { processed: 0, written: 0, dry_run: dryRun, results: [] };

  for (const name of files) {
    const file = path.join(masterDir, name);
    const master = readJson(file);
    const assignment = assignTemplate(master, registry);
    const next = applyAssignment(master, assignment);
    report.processed += 1;
    report.results.push({ sku: master.sku, ...assignment });
    if (!dryRun) {
      fs.writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);
      report.written += 1;
    }
  }

  return report;
}

function main() {
  const args = process.argv.slice(2);
  const skuArg = args.find((arg) => arg.startsWith('--sku='));
  const sku = skuArg ? skuArg.slice('--sku='.length) : null;
  const dryRun = args.includes('--dry-run');
  console.log(JSON.stringify(run({ sku, dryRun }), null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
