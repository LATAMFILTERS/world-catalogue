'use strict';

// Turns a raw elimfilters_catalog row into the static product-page record published at
// /products/<sku>/. Pure functions only: the exporter feeds rows from the catalogue DB (or from
// config/product-pages/seed-rows.json) and the Next build reads the resulting JSON snapshot.
// Nothing is derived or invented here: a field that is empty in the row is omitted from the page.

const APPROVED_TECHNOLOGIES = ['MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTAPORE', 'HYDROCORE', 'TURBOCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE'];

// Manufacturer codes shown as OEM equivalences (CROSS_REFERENCE_CLASSIFICATION_STANDARD.md).
// Dealer / private-label brands that appear in oem_codes (Big A, Fleetrite, Luberfiner...) are not OEMs.
const OEM_BRANDS = new Set(['CATERPILLAR', 'CUMMINS', 'DEUTZ', 'JOHN DEERE', 'KOMATSU', 'VOLVO', 'SCANIA', 'MERCEDES-BENZ', 'MACK', 'DAF', 'MAN', 'IVECO', 'PERKINS', 'KUBOTA', 'JCB', 'LIEBHERR', 'CLAAS', 'DETROIT DIESEL', 'HINO', 'ISUZU', 'NEW HOLLAND', 'CASE', 'CASE IH', 'FORD', 'GENERAL MOTORS', 'FREIGHTLINER', 'KENWORTH', 'HITACHI', 'CLARK EQUIPMENT', 'KNORR-BREMSE']);
// FRAM is excluded on purpose: scripts/validate-universal-knowledge-governance.mjs forbids it outside the identification-only routes.
const CROSS_BRANDS = ['FLEETGUARD', 'DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MAHLE', 'HENGST', 'BOSCH', 'PUROLATOR', 'LUBER-FINER', 'SAKURA', 'FILTRON'];
const BRAND_LABEL = { WIX: 'WIX', MANN: 'MANN-FILTER', 'MERCEDES-BENZ': 'Mercedes-Benz', 'CASE IH': 'Case IH', 'LUBER-FINER': 'Luber-Finer', 'JOHN-DEERE': 'John Deere', 'CLARK EQUIPMENT': 'Clark Equipment', 'GENERAL MOTORS': 'General Motors', 'NEW HOLLAND': 'New Holland', 'DETROIT DIESEL': 'Detroit Diesel' };
// Media / technology names owned by other manufacturers must never be published as ELIMFILTERS specs.
const THIRD_PARTY_MARKS = /synteq|ultra-?web|stratapore|nanonet|blue\s?fiber|nanocellulose/i;
// Source policy: a SKU whose canonical source is the primary manufacturer (official evidence) publishes directly.
// A fallback source (Fleetguard, MANN-FILTER...) stays on hold until its specs are verified against ELIMFILTERS own data
// (list entry flag `ownDataVerified: true`).
const PRIMARY_SOURCES = new Set(['DONALDSON']);
const OEM_CLASSES = new Set(['OEM']);
const CROSS_CLASSES = new Set(['AFTERMARKET', 'CROSS_REFERENCE']);
const MAX_OEM_PER_BRAND = 4;
const MAX_OEM = 16;
const MAX_CROSS_PER_BRAND = 3;
const MAX_CROSS = 12;
const MAX_APPLICATIONS = 12;

const TYPE_LABEL = { lube: 'Lube Oil', oil: 'Lube Oil', fuel: 'Fuel', hydraulic: 'Hydraulic', air: 'Air', coolant: 'Coolant', cabin: 'Cabin Air' };

const num = (v) => { const n = typeof v === 'string' ? parseFloat(v) : v; return Number.isFinite(n) ? n : null; };
const text = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim());
const json = (v) => { if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } } return v; };
const key = (brand) => { const raw = text(brand).toUpperCase(); if (raw === 'MERCEDES-BENZ (DAIMLER AG)') return 'MERCEDES-BENZ'; return raw.replace(/^JOHN-DEERE$/, 'JOHN DEERE'); };
const label = (brand) => { const k = key(brand); return BRAND_LABEL[k] || BRAND_LABEL[text(brand).toUpperCase()] || k.toLowerCase().replace(/(^|[\s-])\w/g, (c) => c.toUpperCase()); };
const code = (v) => text(v).toUpperCase();

function technologyOf(row) {
  // Letters only: a trademark sign damaged in transit ('DRYCORE?') must not hide a registry name.
  const name = text(row.technology).replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!APPROVED_TECHNOLOGIES.includes(name)) throw new Error(`STOP_REVIEW ${row.sku}: technology "${row.technology}" is not in the canonical registry`);
  return name;
}

// SYNTAPORE / HYDROCORE / TURBOCORE are distinct fuel scopes (CLAUDE.md). A fuel/water separator
// record that still carries SYNTAPORE would publish a merged scope, so it fails closed.
function assertScope(row, technology) {
  const separator = /separator/i.test(`${row.sub_type} ${row.name}`);
  if (separator && technology === 'SYNTAPORE') throw new Error(`STOP_REVIEW ${row.sku}: fuel/water separator carries SYNTAPORE; scope belongs to HYDROCORE/TURBOCORE`);
  if (!separator && (technology === 'HYDROCORE' || technology === 'TURBOCORE') && /fuel/i.test(row.filter_type)) {
    // Non-separator fuel element under a separator technology: also a scope mismatch.
    throw new Error(`STOP_REVIEW ${row.sku}: plain fuel element carries ${technology}`);
  }
}

function descriptor(row) {
  const type = TYPE_LABEL[text(row.filter_type).toLowerCase()] || text(row.filter_type);
  const sub = text(row.sub_type);
  const install = text(row.installation_type);
  if (/separator/i.test(sub)) return `${sub.replace(/\s*\/\s*/g, '/')}${install ? `, ${install}` : ''}`;
  // A descriptive catalogue sub_type (e.g. 'Air Dryer Cartridge') is more accurate than the installation style.
  if (/\b(cartridge|dryer)\b/i.test(sub) && sub.length <= 40) return sub;
  const known = /^(spin-on|cartridge|panel|element|in-line|bowl)$/i.test(install) ? install : '';
  return `${type} ${known} Filter`.replace(/\s+/g, ' ').trim();
}

function refs(list, wanted, perBrand, max, order, classes) {
  const byBrand = new Map();
  for (const item of json(list) || []) {
    const brand = key(item.manufacturer);
    if (!wanted(brand) || !text(item.code)) continue;
    // A relationship classified as anything else (ALTERNATIVE, REVIEW_REQUIRED...) is never shown, and is never promoted to OEM.
    if (item.classification && !classes.has(String(item.classification).toUpperCase())) continue;
    const bucket = byBrand.get(brand) || [];
    if (!bucket.includes(code(item.code))) bucket.push(code(item.code));
    byBrand.set(brand, bucket);
  }
  const brands = [...byBrand.keys()].sort((a, b) => {
    const ia = order.indexOf(a); const ib = order.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
  });
  const out = [];
  for (const brand of brands) for (const c of byBrand.get(brand).slice(0, perBrand)) if (out.length < max) out.push({ brand: label(brand), code: c });
  const total = [...byBrand.values()].reduce((n, v) => n + v.length, 0);
  return { shown: out, total };
}

function specRows(row) {
  const specs = json(row.specs) || {};
  const flow = num(specs.rated_flow_l_min);
  const gpm = num(specs.rated_flow_gpm);
  const burst = num(row.burst_pressure_psi) ?? num(specs.hydrostatic_burst_minimum_psi);
  const micron = text(row.micron_rating);
  const rows = [
    ['Thread', text(row.thread_size)],
    ['Height', num(row.height_mm) != null ? `${num(row.height_mm)} mm` : ''],
    ['Outer diameter', num(row.outer_diameter_mm) != null ? `${num(row.outer_diameter_mm)} mm` : ''],
    ['Gasket outer diameter', num(row.gasket_od_mm) != null ? `${num(row.gasket_od_mm)} mm` : ''],
    ['Gasket inner diameter', num(row.gasket_id_mm) != null ? `${num(row.gasket_id_mm)} mm` : ''],
    ['Filtration rating', micron ? (/micron|absolute|nominal/i.test(micron) ? micron : `${micron} micron`) : ''],
    ['Efficiency', text(row.nominal_efficiency)],
    ['Efficiency test method', text(row.iso_test_method)],
    ['Filter media', text(row.filter_media) || text(specs.media_type)],
    ['Rated flow', flow != null ? `${flow} L/min${gpm != null ? ` (${gpm} gpm)` : ''}` : ''],
    ['Burst pressure', burst != null ? `${burst} psi` : ''],
  ];
  return rows.filter(([, value]) => value).map(([name, value]) => ({ name, value }));
}

function applications(row) {
  const seen = new Set();
  const out = [];
  for (const a of json(row.equipment_applications) || []) {
    const line = text(a.equipment) + (text(a.engine) && !/^-/.test(text(a.engine)) ? ` · ${text(a.engine)}` : '');
    if (line && !seen.has(line)) { seen.add(line); out.push(line); }
  }
  for (const v of json(row.vehicle_applications) || []) {
    const model = /^UNSPECIFIED$/i.test(text(v.model)) ? '' : text(v.model);
    const line = [label(v.make), model].filter(Boolean).join(' ') + (text(v.engine) ? ` · ${text(v.engine)}` : '');
    if (text(v.make) && !seen.has(line)) { seen.add(line); out.push(line); }
  }
  for (const f of (json(row.enrichment_data) || {}).compatible_engine_families || []) {
    const line = text(f);
    if (line && !seen.has(line)) { seen.add(line); out.push(line); }
  }
  return out.slice(0, MAX_APPLICATIONS);
}

// Physical plausibility of the displayed dimensions (mm). Impossible geometry blocks publication;
// merely suspicious values are reported as warnings.
function physicalIssues(dims) {
  const { height, outerDiameter, gasketOuter, gasketInner } = dims;
  const errors = [];
  const warnings = [];
  const given = Object.entries({ height, outerDiameter, gasketOuter, gasketInner }).filter(([, v]) => v != null);
  for (const [name, v] of given) {
    if (!Number.isFinite(v) || v <= 0) errors.push(`${name} must be a positive number (got ${v})`);
    else if (v < 10) warnings.push(`${name} is ${v} mm (< 10 mm)`);
    else if (v > 2000) warnings.push(`${name} is ${v} mm (> 2000 mm)`);
  }
  if (gasketInner != null && gasketOuter != null && gasketInner >= gasketOuter) errors.push(`gasket inner diameter (${gasketInner}) >= gasket outer diameter (${gasketOuter})`);
  if (gasketOuter != null && outerDiameter != null && gasketOuter > outerDiameter) errors.push(`gasket outer diameter (${gasketOuter}) > body outer diameter (${outerDiameter})`);
  if (gasketInner != null && outerDiameter != null && gasketInner >= outerDiameter) errors.push(`gasket inner diameter (${gasketInner}) >= body outer diameter (${outerDiameter})`);
  if (height != null && outerDiameter != null) {
    const ratio = height / outerDiameter;
    if (ratio > 8 || ratio < 0.15) warnings.push(`height/outer-diameter ratio ${ratio.toFixed(2)} is unusual`);
  }
  if (gasketOuter != null && outerDiameter != null && gasketOuter < 0.3 * outerDiameter) warnings.push(`gasket outer diameter is under 30% of the body outer diameter`);
  return { errors, warnings };
}

// Same check on the published spec rows (values like "136.1 mm").
function physicalIssuesFromSpecs(specs) {
  const mm = (name) => { const row = specs.find((s) => s.name === name); const m = row && /^([\d.]+) mm$/.exec(row.value); return m ? parseFloat(m[1]) : null; };
  return physicalIssues({ height: mm('Height'), outerDiameter: mm('Outer diameter'), gasketOuter: mm('Gasket outer diameter'), gasketInner: mm('Gasket inner diameter') });
}

function buildRecord(row, entry, source) {
  const sku = code(row.sku);
  const sourceBrand = key(row.canonical_source_brand);
  if (sourceBrand && !PRIMARY_SOURCES.has(sourceBrand) && !(entry && (entry.ownDataVerified === true || (sourceBrand === 'FLEETGUARD' && entry.verifiedFleetguardFallback === true)))) {
    throw new Error(`STOP_REVIEW ${sku}: canonical source is a fallback manufacturer (${sourceBrand}); publish only after own-data verification or an explicit verified Fleetguard manufacturer fallback approval`);
  }
  // Publication policy: VERIFIED-only. Anything else (UNVERIFIED, empty, inactive) is blocked, never published.
  const status = text(row.canonical_source_status).toUpperCase();
  if (status !== 'VERIFIED') throw new Error(`STOP_REVIEW ${sku}: canonical_source_status is ${status || 'empty'}, publication requires VERIFIED`);
  if (row.catalog_active === false) throw new Error(`STOP_REVIEW ${sku}: catalogue row is not active`);
  const technology = technologyOf(row);
  assertScope(row, technology);
  const oemClasses = entry && entry.verifiedOemReferences === true ? new Set([...OEM_CLASSES, 'REVIEW_REQUIRED']) : OEM_CLASSES;
  const oem = refs(row.oem_codes, (b) => OEM_BRANDS.has(b), MAX_OEM_PER_BRAND, MAX_OEM, [...OEM_BRANDS], oemClasses);
  const cross = refs(row.competitor_codes, (b) => CROSS_BRANDS.includes(b), MAX_CROSS_PER_BRAND, MAX_CROSS, CROSS_BRANDS, CROSS_CLASSES);
  if (sourceBrand && text(row.canonical_source_code) && !cross.shown.some((r) => r.code === code(row.canonical_source_code))) {
    cross.shown.unshift({ brand: label(sourceBrand), code: code(row.canonical_source_code) });
    cross.total += 1;
  }
  const specs = specRows(row);
  if (row.third_party_mark === true) throw new Error(`STOP_REVIEW ${sku}: catalogue flags a third-party media/technology mark`);
  const marked = specs.find((s) => THIRD_PARTY_MARKS.test(s.value));
  if (marked) throw new Error(`STOP_REVIEW ${sku}: "${marked.name}" carries a third-party media/technology mark (${marked.value})`);
  const physical = physicalIssuesFromSpecs(specs);
  if (physical.errors.length) throw new Error(`STOP_REVIEW ${sku}: physically impossible dimensions: ${physical.errors.join('; ')}`);
  const minVerifiedSpecs = entry && sourceBrand === 'FLEETGUARD' && entry.verifiedFleetguardFallback === true ? 3 : 4;
  if (specs.length < minVerifiedSpecs) throw new Error(`STOP_REVIEW ${sku}: fewer than ${minVerifiedSpecs} verified spec fields`);
  if (!oem.shown.length && !cross.shown.length) throw new Error(`STOP_REVIEW ${sku}: no equivalence data`);
  const title = descriptor(row);
  // Verified manufacturer supersession (enrichment_data.supersession): name the discontinued predecessor.
  const supersession = (json(row.enrichment_data) || {}).supersession || {};
  const predecessors = supersession.status === 'VERIFIED' ? (supersession.predecessors || []).filter((p) => p.status === 'VERIFIED').map((p) => code(p.part_number)) : [];
  const supersededNote = predecessors.length ? ` ${label(supersession.manufacturer)} ${code(supersession.current_part)} supersedes discontinued ${predecessors.join(', ')}.` : '';
  return {
    sku,
    slug: sku.toLowerCase(),
    family: entry.family,
    duty: /light/i.test(row.duty) ? 'Light Duty' : 'Heavy Duty',
    title,
    technology,
    description: `${sku} is an ELIMFILTERS ${title.toLowerCase()} protected by ${technology}™ technology.${supersededNote}`,
    specs,
    oem: oem.shown,
    oemTotal: oem.total,
    crossRefs: cross.shown,
    crossRefsTotal: cross.total,
    applications: applications(row),
    physicalWarnings: physical.warnings,
    governance: { canonicalSourceBrand: sourceBrand || null, ownDataVerified: Boolean(entry && entry.ownDataVerified === true), fleetguardFallbackVerified: Boolean(sourceBrand === 'FLEETGUARD' && entry && entry.verifiedFleetguardFallback === true), verifiedOemReferences: Boolean(entry && entry.verifiedOemReferences === true), canonicalStatus: text(row.canonical_source_status) || null, dutyStatus: text(row.duty_validation_status) || null, active: row.catalog_active !== false },
    source,
  };
}

module.exports = { PRIMARY_SOURCES, APPROVED_TECHNOLOGIES, OEM_BRANDS, CROSS_BRANDS, buildRecord, physicalIssues, physicalIssuesFromSpecs };
