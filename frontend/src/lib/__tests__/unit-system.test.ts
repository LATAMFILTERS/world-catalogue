import { describe, expect, it } from 'vitest';
import {
  CANONICAL_DATABASE_UNITS,
  convertCanonicalMeasurement,
  formatCanonicalMeasurementRange,
  formatDimensionsCm,
  measurementSystemForCountry,
} from '../unit-system';

describe('ELIMFILTERS canonical measurement system', () => {
  it('uses imperial presentation for the United States', () => {
    expect(measurementSystemForCountry('US')).toBe('imperial');
  });

  it('uses metric presentation for LATAM and other countries by default', () => {
    expect(measurementSystemForCountry('MX')).toBe('metric');
    expect(measurementSystemForCountry('CO')).toBe('metric');
    expect(measurementSystemForCountry('DE')).toBe('metric');
    expect(measurementSystemForCountry('CA')).toBe('metric');
  });

  it('converts canonical kilograms to pounds', () => {
    const result = convertCanonicalMeasurement('weight_kg', 15.862, 'imperial');
    expect(result.unit).toBe('lb');
    expect(result.value).toBeCloseTo(34.97, 2);
  });

  it('converts canonical carton centimeters to inches', () => {
    expect(formatDimensionsCm(44.934, 30.456, 19.026, 'imperial', 'en-US'))
      .toBe('17.69 × 11.99 × 7.49 in');
  });

  it('presents high metric pressure in bar while keeping kPa canonical', () => {
    const result = convertCanonicalMeasurement('pressure_kpa', 3102.6416, 'metric');
    expect(result.unit).toBe('bar');
    expect(result.value).toBeCloseTo(31.03, 2);
  });

  it('formats governed pressure ranges for metric and imperial presentation', () => {
    expect(formatCanonicalMeasurementRange('pressure_kpa', 180000, 250000, 'metric', 'en'))
      .toBe('1,800–2,500 bar');
    expect(formatCanonicalMeasurementRange('pressure_kpa', 20684.2719, 34473.7865, 'imperial', 'en-US'))
      .toBe('3,000–5,000 psi');
  });

  it('keeps database canonical units independent from presentation units', () => {
    expect(CANONICAL_DATABASE_UNITS).toEqual({
      dimensional_product: 'mm',
      dimensional_packaging: 'cm',
      weight: 'kg',
      volume: 'm3',
      pressure: 'kPa',
      temperature: 'C',
      flow: 'L/min',
    });
  });
});
