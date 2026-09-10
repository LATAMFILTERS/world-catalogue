export type MeasurementSystem = 'metric' | 'imperial';

export type MeasurementKind =
  | 'length_mm'
  | 'length_cm'
  | 'weight_kg'
  | 'volume_m3'
  | 'pressure_kpa'
  | 'temperature_c'
  | 'flow_lpm';

export interface FormattedMeasurement {
  value: number;
  unit: string;
  text: string;
}

const COUNTRY_MEASUREMENT_SYSTEM: Record<string, MeasurementSystem> = {
  US: 'imperial',
};

export function measurementSystemForCountry(country: string | null | undefined): MeasurementSystem {
  const code = String(country || '').trim().toUpperCase();
  return COUNTRY_MEASUREMENT_SYSTEM[code] || 'metric';
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function formatNumber(value: number, locale: string, decimals: number): string {
  return new Intl.NumberFormat(locale || 'en', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(value);
}

export function convertCanonicalMeasurement(
  kind: MeasurementKind,
  canonicalValue: number,
  system: MeasurementSystem,
): { value: number; unit: string; decimals: number } {
  const value = Number(canonicalValue);
  if (!Number.isFinite(value)) throw new Error(`Invalid canonical measurement for ${kind}`);

  if (system === 'metric') {
    switch (kind) {
      case 'length_mm': return { value, unit: 'mm', decimals: 2 };
      case 'length_cm': return { value, unit: 'cm', decimals: 2 };
      case 'weight_kg': return { value, unit: 'kg', decimals: 2 };
      case 'volume_m3': return { value, unit: 'm³', decimals: 3 };
      case 'pressure_kpa': return { value, unit: 'kPa', decimals: 1 };
      case 'temperature_c': return { value, unit: '°C', decimals: 1 };
      case 'flow_lpm': return { value, unit: 'L/min', decimals: 1 };
    }
  }

  switch (kind) {
    case 'length_mm': return { value: value / 25.4, unit: 'in', decimals: 2 };
    case 'length_cm': return { value: value / 2.54, unit: 'in', decimals: 2 };
    case 'weight_kg': return { value: value * 2.2046226218, unit: 'lb', decimals: 2 };
    case 'volume_m3': return { value: value * 35.3146667215, unit: 'ft³', decimals: 3 };
    case 'pressure_kpa': return { value: value * 0.1450377377, unit: 'psi', decimals: 1 };
    case 'temperature_c': return { value: (value * 9) / 5 + 32, unit: '°F', decimals: 1 };
    case 'flow_lpm': return { value: value * 0.2641720524, unit: 'US gal/min', decimals: 1 };
  }
}

export function formatCanonicalMeasurement(
  kind: MeasurementKind,
  canonicalValue: number,
  system: MeasurementSystem,
  locale = 'en',
): FormattedMeasurement {
  const converted = convertCanonicalMeasurement(kind, canonicalValue, system);
  const normalized = round(converted.value, converted.decimals);
  return {
    value: normalized,
    unit: converted.unit,
    text: `${formatNumber(normalized, locale, converted.decimals)} ${converted.unit}`,
  };
}

export function formatDimensionsCm(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
  system: MeasurementSystem,
  locale = 'en',
): string {
  const values = [lengthCm, widthCm, heightCm].map((value) =>
    convertCanonicalMeasurement('length_cm', value, system),
  );
  const decimals = values[0]?.decimals ?? 2;
  const unit = values[0]?.unit ?? (system === 'imperial' ? 'in' : 'cm');
  const formatted = values.map((item) => formatNumber(round(item.value, decimals), locale, decimals));
  return `${formatted.join(' × ')} ${unit}`;
}

export const CANONICAL_DATABASE_UNITS = Object.freeze({
  dimensional_product: 'mm',
  dimensional_packaging: 'cm',
  weight: 'kg',
  volume: 'm3',
  pressure: 'kPa',
  temperature: 'C',
  flow: 'L/min',
} as const);

export { COUNTRY_MEASUREMENT_SYSTEM };
