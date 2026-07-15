'use strict';

function normalizeText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function expandYear(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (String(value).length === 4) return n;
  return n <= 35 ? 2000 + n : 1900 + n;
}

function normalizeYears(application) {
  const explicit = String(application?.year_range || application?.year || '').trim();
  const modelText = String(application?.model || '');
  const source = explicit || modelText;
  if (!source) return { yearFrom: null, yearTo: null, confidence: 0, evidence: null };

  const monthYears = [...source.matchAll(/\b\d{1,2}\/(\d{2}|\d{4})\b/g)]
    .map((match) => expandYear(match[1]))
    .filter(Boolean);
  const fullYears = [...source.matchAll(/\b(19\d{2}|20\d{2})\b/g)].map((match) => Number(match[1]));
  const values = monthYears.length ? monthYears : fullYears;
  if (!values.length) return { yearFrom: null, yearTo: null, confidence: 0, evidence: null };

  const yearFrom = values[0];
  const openEnded = source.includes('→') || source.includes('->') || /\b(FROM|SINCE)\b/i.test(source);
  const yearTo = values.length > 1 ? values[values.length - 1] : (openEnded ? null : yearFrom);
  return {
    yearFrom,
    yearTo,
    confidence: explicit ? 1 : 0.65,
    evidence: explicit ? 'application.year_range' : 'application.model_text',
  };
}

function normalizeFuel(application) {
  const text = normalizeText([
    application?.fuel,
    application?.model,
    application?.model_type,
    application?.engine,
    application?.engine_code,
    application?.notes,
  ].filter(Boolean).join(' '));
  if (/\b(ELECTRIC|EV|BEV)\b/.test(text)) return { value: 'electric', confidence: 0.9 };
  if (/\b(HYBRID|PHEV|HEV)\b/.test(text)) return { value: 'hybrid', confidence: 0.85 };
  if (/\b(DIESEL|D 4D|TDI|HDI|CDI|DCI|CRDI|TDCI|1ND TV|2AD FHV|2AD FTV)\b/.test(text)) return { value: 'diesel', confidence: 0.85 };
  if (/\b(GASOLINE|PETROL|VVT|VVT I|VALVEMATIC|EFI|2ZR|1ZR|M20A|FI)\b/.test(text)) return { value: 'gasoline', confidence: 0.75 };
  return { value: 'unknown', confidence: 0 };
}

function normalizeMarket(application) {
  const text = normalizeText([
    application?.market,
    application?.region,
    application?.make,
    application?.model,
    application?.notes,
  ].filter(Boolean).join(' '));
  if (/\b(USA|UNITED STATES|NORTH AMERICA|CANADA|MEXICO)\b/.test(text)) return { value: 'US', confidence: 0.85 };
  if (/\b(EUROPE|EUROPEAN|EUROPA)\b/.test(text)) return { value: 'EU', confidence: 0.85 };
  if (/\b(JAPAN|JDM)\b/.test(text)) return { value: 'JP', confidence: 0.85 };
  return { value: 'unknown', confidence: 0 };
}

function classifyProductCategory(row) {
  const text = normalizeText([row.filter_type, row.sub_type, row.technology].filter(Boolean).join(' '));
  const sku = String(row.sku || '').toUpperCase();
  if (/\b(CABIN|POLLEN|HVAC|HABITACLE)\b/.test(text) || sku.startsWith('EC')) return 'cabin_air';
  if (/\b(OIL|LUBE|LUBRICATION)\b/.test(text) || sku.startsWith('EL')) return 'engine_oil';
  if (/\b(FUEL|WATER SEPARATOR)\b/.test(text) || sku.startsWith('EF')) return 'fuel';
  if (/\b(HYDRAULIC)\b/.test(text) || sku.startsWith('EH')) return 'hydraulic';
  if (/\b(COOLANT)\b/.test(text) || sku.startsWith('EW')) return 'coolant';
  if (/\b(AIR|INTAKE)\b/.test(text) || sku.startsWith('EA')) return 'engine_air';
  return 'other';
}

function classifyAsset(application) {
  const text = normalizeText([application?.make, application?.model, application?.model_type, application?.notes].filter(Boolean).join(' '));
  if (/\b(COMPRESSOR|VACUUM|PUMP|GENERATOR|GENSET|STATIONARY|DENTAL SYSTEM|ROTARY VANE)\b/.test(text)) {
    return { assetClass: 'industrial_equipment', segment: 'INDUSTRIAL', confidence: 0.9 };
  }
  if (/\b(TRUCK|BUS|COACH|TRACTOR|EXCAVATOR|LOADER|FORKLIFT|PAVER|COMBINE|HARVESTER|MINING|TERRATRAC|TRANSPORTER)\b/.test(text)) {
    return { assetClass: 'mobile_heavy_equipment', segment: 'HEAVY_DUTY', confidence: 0.82 };
  }
  if (/\b(SEDAN|HATCHBACK|COUPE|SUV|CROSSOVER|WAGON|PICKUP|VAN|COROLLA|CAMRY|CIVIC|ACCORD|RAV4)\b/.test(text) || /\b(19\d{2}|20\d{2})\b/.test(text)) {
    return { assetClass: 'road_vehicle', segment: 'LIGHT_DUTY', confidence: 0.65 };
  }
  return { assetClass: 'unknown', segment: 'UNKNOWN', confidence: 0 };
}

function normalizeApplication(row) {
  const application = row.application || {};
  const years = normalizeYears(application);
  const fuel = normalizeFuel(application);
  const market = normalizeMarket(application);
  const asset = classifyAsset(application);
  return {
    sku: row.sku,
    make: normalizeText(application.make) || null,
    model: normalizeText([application.model, application.model_family, application.model_type].filter(Boolean).join(' ')) || null,
    yearFrom: years.yearFrom,
    yearTo: years.yearTo,
    fuel: fuel.value,
    market: market.value,
    assetClass: asset.assetClass,
    segment: asset.segment,
    category: classifyProductCategory(row),
    confidence: { year: years.confidence, fuel: fuel.confidence, market: market.confidence, segment: asset.confidence },
    evidence: { year: years.evidence },
  };
}

module.exports = { normalizeText, normalizeApplication, classifyProductCategory, classifyAsset };
