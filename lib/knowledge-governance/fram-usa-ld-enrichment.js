'use strict';

const PUBLIC_MEDIA_TYPE = 'Genuine Media';
const DEFAULT_CASE_PACK = 12;

const LINE_PRIORITY = Object.freeze({
  EXTRA_GUARD: 10,
  TOUGH_GUARD: 20,
  SYNTHETIC_ENDURANCE: 30,
  ULTRA_SYNTHETIC: 40,
  TITANIUM: 50,
  FORCE: 60,
  DRIVE: 70,
  PRO: 80,
  CORE: 90,
  FRAM_OTHER: 100
});

const OEM_NAMES = new Set([
  'TOYOTA','LEXUS','SCION','SUZUKI','KAWASAKI','JOHN DEERE','CATERPILLAR','BRIGGS & STRATTON',
  'KUBOTA','HYSTER','BOBCAT','AGCO','ALLIS CHALMERS','GENERAL MOTORS','FORD','GEELY','GENIE',
  'ISEKI','MASSEY FERGUSON','PEUGEOT','CITROEN','TORO','VERMEER','DAIHATSU','NISSAN','INFINITI',
  'MAZDA','CHEVROLET','PONTIAC','ARCTIC CAT','ARIENS','CLUB CAR'
]);

const AFTERMARKET_NAMES = new Set([
  'MANN-FILTER','MANN','BOSCH','WIX','MAHLE','PUROLATOR','BALDWIN','DENSO','FILTRON','HENGST',
  'LUBERFINER','MOTORCRAFT','NAPA','SAKURA','UFI','VALEO','CHAMPION','ACDELCO','AC DELCO'
]);

function normalizePart(value = '') {
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizeMaker(value = '') {
  return String(value).replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();
}

function attributeValues(attributes = [], name) {
  return attributes.filter(item => item?.attribute === name).map(item => item.value).filter(Boolean);
}

function attributeValue(attributes = [], ...names) {
  for (const name of names) {
    const value = attributeValues(attributes, name)[0];
    if (value != null && value !== '') return value;
  }
  return null;
}

function numberValue(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function inchesToMm(value) {
  const number = numberValue(value);
  return number == null ? null : Number((number * 25.4).toFixed(2));
}

function uniqueByPart(rows = []) {
  const seen = new Set();
  return rows.filter(row => {
    const key = normalizePart(row.part_number);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classifyFramLine({ part_number = '', manufacturer = '', attributes = [] } = {}) {
  const text = `${manufacturer} ${attributeValues(attributes, 'Features and Benefits').join(' ')}`.toUpperCase();
  const code = normalizePart(part_number);
  if (/EXTRA GUARD/.test(text) || /^(PH|CH|CA)/.test(code)) return 'EXTRA_GUARD';
  if (/TOUGH GUARD/.test(text) || /^TG/.test(code)) return 'TOUGH_GUARD';
  if (/SYNTHETIC ENDURANCE/.test(text) || /^FE/.test(code)) return 'SYNTHETIC_ENDURANCE';
  if (/ULTRA SYNTHETIC/.test(text) || /^XG/.test(code)) return 'ULTRA_SYNTHETIC';
  if (/TITANIUM/.test(text) || /^FS/.test(code)) return 'TITANIUM';
  if (/FORCE/.test(text) || /^FF/.test(code)) return 'FORCE';
  if (/DRIVE/.test(text) || /^FD/.test(code)) return 'DRIVE';
  if (/\bPRO\b/.test(text) || /^FP/.test(code)) return 'PRO';
  if (/\bCORE\b/.test(text) || /^COR/.test(code)) return 'CORE';
  return 'FRAM_OTHER';
}

function selectFramAuthority(candidates = []) {
  return [...candidates]
    .filter(candidate => candidate?.part_number)
    .map(candidate => ({
      ...candidate,
      line: candidate.line || classifyFramLine(candidate),
    }))
    .sort((a, b) => (LINE_PRIORITY[a.line] ?? 999) - (LINE_PRIORITY[b.line] ?? 999)
      || normalizePart(a.part_number).localeCompare(normalizePart(b.part_number)))[0] || null;
}

function splitCrossReferences(crosses = [], sourcePartNumber = '') {
  const source = normalizePart(sourcePartNumber);
  const fram = [], oem = [], competitor = [], unresolved = [];
  for (const cross of crosses) {
    const maker = normalizeMaker(cross.manufacturer);
    const item = { manufacturer: maker, part_number: cross.part_number };
    if (/^FRAM\b/i.test(maker)) {
      if (normalizePart(cross.part_number) !== source) fram.push({ ...item, line: classifyFramLine(item) });
      continue;
    }
    const key = maker.toUpperCase();
    if (OEM_NAMES.has(key)) oem.push(item);
    else if (AFTERMARKET_NAMES.has(key)) competitor.push(item);
    else unresolved.push(item);
  }
  return { alternatives: uniqueByPart(fram), oem_candidates: oem, competitor_candidates: competitor, unresolved_cross_candidates: unresolved };
}

function buildPublicTechnicalSpecs(attributes = []) {
  const outer = attributeValue(attributes, 'Outside Diameter (Inch)');
  const height = attributeValue(attributes, 'Height (Inch)');
  const gasketOd = attributeValue(attributes, 'Gasket Outside Diameter (Inch)');
  const gasketId = attributeValue(attributes, 'Gasket Inside Diameter (Inch)');
  const gasketThickness = attributeValue(attributes, 'Gasket Thickness (Inch)');
  return {
    outer_diameter_in: numberValue(outer),
    outer_diameter_mm: inchesToMm(outer),
    height_in: numberValue(height),
    height_mm: inchesToMm(height),
    thread_size: attributeValue(attributes, 'Inner Thread Diameter (Inch)', 'Thread Size'),
    gasket_od_in: numberValue(gasketOd),
    gasket_od_mm: inchesToMm(gasketOd),
    gasket_id_in: numberValue(gasketId),
    gasket_id_mm: inchesToMm(gasketId),
    gasket_thickness_in: numberValue(gasketThickness),
    gasket_thickness_mm: inchesToMm(gasketThickness),
    media_type: PUBLIC_MEDIA_TYPE,
    style: attributeValue(attributes, 'Filter Type', 'Associated Comment'),
    anti_drainback_valve: attributeValue(attributes, 'Anti-Drain Back Valve'),
    bypass_relief_valve: attributeValue(attributes, 'Bypass Relief Valve'),
    bypass_setting_psi: numberValue(attributeValue(attributes, 'Bypass Relief Valve Setting (Pounds per Square Inch)')),
    burst_pressure_psi: numberValue(attributeValue(attributes, 'Burst Pressure (Pounds per Square Inch)')),
  };
}

function inferSourceCaseQty(eachWeight, caseWeight) {
  if (!(eachWeight > 0) || !(caseWeight > 0)) return null;
  const ratio = caseWeight / eachWeight;
  const rounded = Math.round(ratio);
  return rounded > 0 && Math.abs(ratio - rounded) <= 0.05 ? rounded : null;
}

function estimateTwelvePackDimensions(source, sourceQty) {
  if (sourceQty !== 6 || !(source.case_length_in > 0) || !(source.case_width_in > 0) || !(source.case_height_in > 0)) return null;
  const targetLayout = { length_slots: 4, width_slots: 3, height_slots: 1 };
  return {
    length_in: Number(((source.case_length_in / 3) * targetLayout.length_slots).toFixed(3)),
    width_in: Number(((source.case_width_in / 2) * targetLayout.width_slots).toFixed(3)),
    height_in: Number(source.case_height_in.toFixed(3)),
    layout: '4x3x1',
    status: 'ESTIMATED_FROM_SOURCE_6_PACK__FACTORY_VALIDATION_REQUIRED'
  };
}

function buildInternalLogistics(attributes = [], { casePack = DEFAULT_CASE_PACK } = {}) {
  const source = {
    unit_weight_lb: numberValue(attributeValue(attributes, 'Weight - Each (Gross Pounds)')),
    case_weight_lb: numberValue(attributeValue(attributes, 'Weight - Case (Gross Pounds)')),
    unit_height_in: numberValue(attributeValue(attributes, 'Height - Each (Inch)')),
    unit_length_in: numberValue(attributeValue(attributes, 'Length - Each (Inch)')),
    unit_width_in: numberValue(attributeValue(attributes, 'Width - Each (Inch)')),
    case_height_in: numberValue(attributeValue(attributes, 'Height - Case (Inch)')),
    case_length_in: numberValue(attributeValue(attributes, 'Length - Case (Inch)')),
    case_width_in: numberValue(attributeValue(attributes, 'Width - Case (Inch)')),
  };
  const sourceCaseQty = inferSourceCaseQty(source.unit_weight_lb, source.case_weight_lb);
  const estimatedWeight = source.unit_weight_lb == null ? null : Number((source.unit_weight_lb * casePack).toFixed(3));
  return {
    visibility: 'INTERNAL_EXECUTIVE_AGENTS_ONLY',
    source_packaging: { ...source, inferred_case_qty: sourceCaseQty },
    elimfilters_packaging: {
      case_pack: casePack,
      estimated_product_weight_lb: estimatedWeight,
      estimated_case_dimensions: estimateTwelvePackDimensions(source, sourceCaseQty),
      status: 'PROVISIONAL__FACTORY_VALIDATION_REQUIRED'
    }
  };
}

const ROAD_VEHICLE_MAKES = new Set([
  'ACURA','AUDI','BMW','BUICK','CADILLAC','CHEVROLET','CHRYSLER','DODGE','FIAT','FORD','GENESIS','GEO',
  'GMC','HONDA','HYUNDAI','INFINITI','ISUZU','JAGUAR','JEEP','KIA','LAND ROVER','LEXUS','LINCOLN','LOTUS',
  'MAZDA','MERCEDES-BENZ','MERCURY','MINI','MITSUBISHI','NISSAN','OLDSMOBILE','PLYMOUTH','PONTIAC',
  'PORSCHE','RAM','SAAB','SATURN','SCION','SUBARU','SUZUKI','TOYOTA','VOLKSWAGEN','VOLVO'
]);

function selectAutomotiveApplications(applications = []) {
  const seen = new Set();
  const result = [];
  for (const app of applications) {
    const make = normalizeMaker(app.make).toUpperCase();
    if (!ROAD_VEHICLE_MAKES.has(make)) continue;
    const item = { year: app.year || null, make: normalizeMaker(app.make), model: app.model || null, engine: app.engine || null, quantity: app.quantity || 1 };
    const key = JSON.stringify(item).toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function technologyFor(family, partType = '') {
  if (family === 'LUBE') return 'SYNTRAX™';
  if (family === 'AIR') return 'MACROCORE™';
  if (family === 'CABIN') return 'MICROKAPPA™';
  if (family === 'FUEL') return /water|separator/i.test(partType) ? 'HYDROCORE™' : 'SYNTRAX™';
  return null;
}

function buildFramLdEnrichment(bundle = {}, { family = null, casePack = DEFAULT_CASE_PACK } = {}) {
  if (!bundle?.found || !bundle?.part) throw new Error('FRAM_USA_LD_ENRICHMENT: valid part bundle required');
  const split = splitCrossReferences(bundle.cross_references, bundle.part.part_number);
  const sourceCandidate = {
    part_number: bundle.part.part_number,
    manufacturer: 'FRAM',
    attributes: bundle.attributes,
    line: classifyFramLine({ part_number: bundle.part.part_number, attributes: bundle.attributes })
  };
  const authority = selectFramAuthority([sourceCandidate, ...split.alternatives]);
  const publicSpecs = buildPublicTechnicalSpecs(bundle.attributes);
  const publicApplications = selectAutomotiveApplications(bundle.applications);

  return {
    schema_version: '1.0.0',
    market_scope: 'MULTI_REGION',
    source_catalog_scope: 'FRAM_LD_MULTI_REGION',
    duty: 'LIGHT_DUTY',
    family,
    authority: authority ? { part_number: authority.part_number, line: authority.line } : null,
    public_catalog_proposal: {
      lookup_reference: bundle.part.part_number,
      product_type: bundle.part.part_type,
      duty: 'LIGHT_DUTY',
      technology: technologyFor(family, bundle.part.part_type),
      technical_specifications: publicSpecs,
      alternatives: split.alternatives.map(item => item.part_number),
      oem_cross_reference_candidates: split.oem_candidates,
      competitor_cross_reference_candidates: split.competitor_candidates,
      unresolved_cross_reference_candidates: split.unresolved_cross_candidates,
      vehicle_application_candidates: publicApplications
    },
    internal_evidence: {
      source_part_number: bundle.part.part_number,
      source_part_key: bundle.part.part_key,
      source_totals: bundle.totals,
      raw_attributes: bundle.attributes,
      logistics: buildInternalLogistics(bundle.attributes, { casePack }),
      all_applications_observed: bundle.applications.length,
      all_cross_references_observed: bundle.cross_references.length,
      publication_rule: 'LOGISTICS_INTERNAL_ONLY__SOURCE_MEDIA_AND_GTIN_NOT_PUBLIC'
    }
  };
}

module.exports = {
  PUBLIC_MEDIA_TYPE,
  DEFAULT_CASE_PACK,
  LINE_PRIORITY,
  classifyFramLine,
  selectFramAuthority,
  splitCrossReferences,
  buildPublicTechnicalSpecs,
  buildInternalLogistics,
  selectAutomotiveApplications,
  buildFramLdEnrichment,
};

function functionalStem(partNumber = '') {
  let code = normalizePart(partNumber);
  const prefixes = ['COR','FDC','FSC','FDA','PH','CH','TG','FE','XG','FS','FF','FD','FP','CA','CF','G'];
  const prefix = prefixes.find(value => code.startsWith(value));
  if (prefix) code = code.slice(prefix.length);
  code = code.replace(/(?:ACC|BP|FP|P)$/i, '');
  return code || null;
}

function preferredPrimaryPartNumber({ part_number = '', family = null, part_type = '', attributes = [] } = {}) {
  const stem = functionalStem(part_number);
  if (!stem) return null;
  if (family === 'LUBE') {
    const style = `${part_type} ${attributeValue(attributes, 'Filter Type', 'Associated Comment') || ''}`;
    return `${/cartridge/i.test(style) ? 'CH' : 'PH'}${stem}`;
  }
  if (family === 'AIR') return `CA${stem}`;
  if (family === 'CABIN') return `CF${stem}`;
  if (family === 'FUEL') return normalizePart(part_number).startsWith('G') ? normalizePart(part_number) : `G${stem}`;
  return null;
}

module.exports.functionalStem = functionalStem;
module.exports.preferredPrimaryPartNumber = preferredPrimaryPartNumber;
