/**
 * normalizer.ts
 * ELIMFILTERS — Data Ingestion Framework v1.0
 *
 * Normalization Engine.
 * Transforms raw source records into standardized, consistent normalized records
 * before they enter the validation stage.
 */

import type {
  SourceRecord,
  NormalizedRecord,
  NormalizationNote,
} from './ingestion-types';

// ============================================================================
// NORMALIZATION RULES
// ============================================================================

/** Standardized OEM name mappings */
const OEM_NAME_MAP: Record<string, string> = {
  'donaldson co': 'Donaldson',
  'donaldson company': 'Donaldson',
  'donaldson co.': 'Donaldson',
  'fleetguard': 'Fleetguard',
  'fleet guard': 'Fleetguard',
  'mann+hummel': 'MANN-FILTER',
  'mann hummel': 'MANN-FILTER',
  'mann-hummel': 'MANN-FILTER',
  'mann filter': 'MANN-FILTER',
  'baldwin filters': 'Baldwin',
  'baldwin': 'Baldwin',
  'wix filters': 'WIX',
  'wix': 'WIX',
  'parker hannifin': 'Parker',
  'parker': 'Parker',
  'mahle': 'Mahle',
  'mahle gmbh': 'Mahle',
  'bosch': 'Bosch',
  'robert bosch': 'Bosch',
  'hifi filter': 'HIFI',
  'hifi': 'HIFI',
  'sakura': 'Sakura',
  'sakura filter': 'Sakura',
  'hengst': 'Hengst',
  'hengst filtration': 'Hengst',
  'ufi filters': 'UFI',
  'ufi': 'UFI',
  'caterpillar': 'Caterpillar',
  'cat': 'Caterpillar',
  'cummins': 'Cummins',
  'john deere': 'John Deere',
  'deere': 'John Deere',
  'komatsu': 'Komatsu',
  'volvo': 'Volvo',
  'volvo penta': 'Volvo Penta',
  'mercedes-benz': 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  'mercedes': 'Mercedes-Benz',
  'man truck': 'MAN',
  'man': 'MAN',
  'scania': 'Scania',
  'daf': 'DAF',
};

/** Unit normalization map */
const UNIT_MAP: Record<string, string> = {
  'psi': 'PSI',
  'bar': 'BAR',
  'kpa': 'KPA',
  'mpa': 'MPA',
  'mm': 'MM',
  'cm': 'CM',
  'in': 'IN',
  'inch': 'IN',
  'inches': 'IN',
  'micron': 'μm',
  'um': 'μm',
  'μm': 'μm',
  'celsius': '°C',
  '°c': '°C',
  'fahrenheit': '°F',
  '°f': '°F',
  'litre': 'L',
  'liter': 'L',
  'l': 'L',
  'ml': 'mL',
};

/** Country code normalization */
const COUNTRY_MAP: Record<string, string> = {
  'usa': 'US',
  'united states': 'US',
  'u.s.a': 'US',
  'germany': 'DE',
  'deutschland': 'DE',
  'japan': 'JP',
  'china': 'CN',
  'south korea': 'KR',
  'korea': 'KR',
  'france': 'FR',
  'italy': 'IT',
  'uk': 'GB',
  'united kingdom': 'GB',
  'spain': 'ES',
  'brazil': 'BR',
  'brasil': 'BR',
  'mexico': 'MX',
  'colombia': 'CO',
};

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

function normalizeString(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return String(value).trim().replace(/\s+/g, ' ');
}

function normalizeUpper(value: string | number | null | undefined): string | null {
  const s = normalizeString(value);
  return s ? s.toUpperCase() : null;
}

function normalizePartNumber(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  // Remove common spacing/dashes that are just formatting, uppercase
  return s.toUpperCase().replace(/\s+/g, '-').replace(/[^\w\-\.]/g, '');
}

function normalizeOemName(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  const key = s.toLowerCase().trim();
  return OEM_NAME_MAP[key] ?? s;
}

function normalizeUnit(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  const key = s.toLowerCase().trim();
  return UNIT_MAP[key] ?? s;
}

function normalizeCountry(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  const key = s.toLowerCase().trim();
  return COUNTRY_MAP[key] ?? s.toUpperCase();
}

function normalizeDutyClass(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  const upper = s.toUpperCase();
  if (upper === 'HD' || upper === 'HEAVY DUTY' || upper === 'HEAVY-DUTY') return 'HD';
  if (upper === 'LD' || upper === 'LIGHT DUTY' || upper === 'LIGHT-DUTY') return 'LD';
  return s;
}

function normalizeBoolean(raw: string | number | null | undefined): string | null {
  const s = normalizeString(raw);
  if (!s) return null;
  const lower = s.toLowerCase();
  if (['true', 'yes', '1', 'si', 'sí', 'oui'].includes(lower)) return 'true';
  if (['false', 'no', '0', 'non'].includes(lower)) return 'false';
  return s;
}

// ============================================================================
// FIELD DISPATCH TABLE
// Maps field name patterns to normalization functions
// ============================================================================

interface FieldNormalizer {
  test: (field: string) => boolean;
  fn: (value: string | number | null | undefined) => string | number | null;
  rule: string;
}

const FIELD_NORMALIZERS: FieldNormalizer[] = [
  {
    test: (f) => /part.?number|part.?num|sku|pn/i.test(f),
    fn: normalizePartNumber,
    rule: 'NORMALIZE_PART_NUMBER',
  },
  {
    test: (f) => /oem.?name|manufacturer|brand|make|^name$/i.test(f),
    fn: normalizeOemName,
    rule: 'NORMALIZE_OEM_NAME',
  },
  {
    test: (f) => /unit|uom/i.test(f),
    fn: normalizeUnit,
    rule: 'NORMALIZE_UNIT',
  },
  {
    test: (f) => /country/i.test(f),
    fn: normalizeCountry,
    rule: 'NORMALIZE_COUNTRY',
  },
  {
    test: (f) => /duty.?class|duty|hd.?ld/i.test(f),
    fn: normalizeDutyClass,
    rule: 'NORMALIZE_DUTY_CLASS',
  },
  {
    test: (f) => /active|enabled|status/i.test(f),
    fn: normalizeBoolean,
    rule: 'NORMALIZE_BOOLEAN',
  },
  {
    test: (f) => /prefix|suffix|category|type|class/i.test(f),
    fn: normalizeUpper,
    rule: 'NORMALIZE_UPPER',
  },
];

// ============================================================================
// MAIN NORMALIZER
// ============================================================================

export function normalizeRecord(source: SourceRecord): NormalizedRecord {
  const normalizedFields: Record<string, string | number | null> = {};
  const normalizations: NormalizationNote[] = [];

  for (const [field, rawValue] of Object.entries(source.rawFields)) {
    let normalized: string | number | null = null;
    let rule = 'PASS_THROUGH';

    const matchedNormalizer = FIELD_NORMALIZERS.find((n) => n.test(field));
    if (matchedNormalizer) {
      const result = matchedNormalizer.fn(rawValue);
      normalized = result;
      rule = matchedNormalizer.rule;
    } else {
      // Default: clean whitespace, pass through
      normalized = normalizeString(rawValue);
    }

    normalizedFields[field] = normalized;

    // Record normalization only if value actually changed
    if (normalized !== rawValue) {
      normalizations.push({
        field,
        original: rawValue ?? null,
        normalized,
        rule,
      });
    }
  }

  return {
    sourceId: source.sourceId,
    domain: source.domain,
    source: source.source,
    ingestedAt: source.ingestedAt,
    fields: normalizedFields,
    normalizations,
  };
}

export function normalizeRecords(sources: SourceRecord[]): NormalizedRecord[] {
  return sources.map(normalizeRecord);
}
