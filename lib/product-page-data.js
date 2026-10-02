'use strict';

// Turns a raw elimfilters_catalog row into the static product-page record published at
// /products/<sku>/. Pure functions only: the exporter feeds rows from the catalogue DB (or from
// config/product-pages/seed-rows.json) and the Next build reads the resulting JSON snapshot.
// Nothing is derived or invented here: a field that is empty in the row is omitted from the page.

const APPROVED_TECHNOLOGIES = ['MACROCORE', 'MICROKAPPA', 'DRYCORE', 'INTEKCORE', 'SYNTAPORE', 'HYDROCORE', 'TURBOCORE', 'SYNTRAX', 'NANOFORCE', 'THERMACORE'];

// Manufacturer codes shown as OEM equivalences (CROSS_REFERENCE_CLASSIFICATION_STANDARD.md).
// Dealer / private-label brands that appear in oem_codes (Big A, Fleetrite, Luberfiner...) are not OEMs.
const OEM_BRANDS = new Set(['CATERPILLAR', 'CUMMINS', 'DEUTZ', 'JOHN DEERE', 'KOMATSU', 'VOLVO', 'SCANIA', 'MERCEDES-BENZ', 'MACK', 'DAF', 'MAN', 'IVECO', 'PERKINS', 'KUBOTA', 'JCB', 'LIEBHERR', 'CLAAS', 'DETROIT DIESEL', 'HINO', 'ISUZU', 'NEW HOLLAND', 'CASE', 'CASE IH', 'FORD', 'GENERAL MOTORS', 'FREIGHTLINER', 'KENWORTH', 'HITACHI', 'CLARK EQUIPMENT']);
const CROSS_BRANDS = ['FLEETGUARD', 'DONALDSON', 'BALDWIN', 'WIX', 'MANN', 'MAHLE', 'HENGST', 'BOSCH', 'FRAM', 'PUROLATOR', 'LUBER-FINER', 'SAKURA', 'FILTRON'];
const BRAND_LABEL = { WIX: 'WIX', MANN: 'MANN-FILTER', 'MERCEDES-BENZ': 'Mercedes-Benz', 'CASE IH': 'Case IH', 'LUBER-FINER': 'Luber-Finer', 'JOHN-DEERE': 'John Deere', 'CLARK EQUIPMENT': 'Clark Equipment', 'GENERAL MOTORS': 'General Motors', 'NEW HOLLAND': 'New Holland', 'DETROIT DIESEL': 'Detroit Diesel' };
// Media / technology names owned by other manufacturers must never be published as ELIMFILTERS specs.
const THIRD_PARTY_MARKS = /synteq|ultra-?web|stratapore|nanonet|blue\s?fiber|nanocellulose/i;
const MAX_OEM_PER_BRAND = 4;
const MAX_OEM = 16;
const MAX_CROSS_PER_BRAND = 3;
const MAX_CROSS = 12;
const MAX_APPLICATIONS = 12;

const TYPE_LABEL = { lube: 'Lube Oil', oil: 'Lube Oil', fuel: 'Fuel', hydraulic: 'Hydraulic', air: 'Air', coolant: 'Coolant', cabin: 'Cabin Air' };

const num = (v) => { const n = typeof v === 'string' ? parseFloat(v) : v; return Number.isFinite(n) ? n : null; };
const text = (v) => (v == null ? '' : String(v).replace(/\s+/g, ' ').trim());
const json = (v) => { if (typeof v === 'string') { try { return JSON.parse(v); } catch { return null; } } return v; };
const key = (brand) => text(brand).toUpperCase().replace(/^JOHN-DEERE$/, 'JOHN DEERE');
const label = (brand) => { const k = key(brand); return BRAND_LABEL[k] || BRAND_LABEL[text(brand).toUpperCase()] || k.toLowerCase().replace(/(^|[\s-])\w/g, (c) => c.toUpperCase()); };
const code = (v) => text(v).toUpperCase();

function technologyOf(row) {
  const name = text(row.technology).replace(/[™®]/g, '').toUpperCase();
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
  return `${type} ${install} Filter`.replace(/\s+/g, ' ').trim();
}

function refs(list, wanted, perBrand, max, order) {
  const byBrand = new Map();
  for (const item of json(list) || []) {
    const brand = key(item.manufacturer);
    if (!wanted(brand) || !text(item.code)) continue;
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

function buildRecord(row, entry, source) {
  const sku = code(row.sku);
  const technology = technologyOf(row);
  assertScope(row, technology);
  const oem = refs(row.oem_codes, (b) => OEM_BRANDS.has(b), MAX_OEM_PER_BRAND, MAX_OEM, [...OEM_BRANDS]);
  const cross = refs(row.competitor_codes, (b) => CROSS_BRANDS.includes(b), MAX_CROSS_PER_BRAND, MAX_CROSS, CROSS_BRANDS);
  const sourceBrand = key(row.canonical_source_brand);
  if (sourceBrand && text(row.canonical_source_code) && !cross.shown.some((r) => r.code === code(row.canonical_source_code))) {
    cross.shown.unshift({ brand: label(sourceBrand), code: code(row.canonical_source_code) });
    cross.total += 1;
  }
  const specs = specRows(row);
  const marked = specs.find((s) => THIRD_PARTY_MARKS.test(s.value));
  if (marked) throw new Error(`STOP_REVIEW ${sku}: "${marked.name}" carries a third-party media/technology mark (${marked.value})`);
  if (specs.length < 4) throw new Error(`STOP_REVIEW ${sku}: fewer than 4 verified spec fields`);
  if (!oem.shown.length && !cross.shown.length) throw new Error(`STOP_REVIEW ${sku}: no equivalence data`);
  const title = descriptor(row);
  return {
    sku,
    slug: sku.toLowerCase(),
    family: entry.family,
    duty: /light/i.test(row.duty) ? 'Light Duty' : 'Heavy Duty',
    title,
    technology,
    description: `${sku} is an ELIMFILTERS ${title.toLowerCase()} protected by ${technology}™ technology.`,
    specs,
    oem: oem.shown,
    oemTotal: oem.total,
    crossRefs: cross.shown,
    crossRefsTotal: cross.total,
    applications: applications(row),
    source,
  };
}

module.exports = { APPROVED_TECHNOLOGIES, buildRecord };
