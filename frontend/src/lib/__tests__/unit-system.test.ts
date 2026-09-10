import { describe, expect, it } from 'vitest';
import {
  CANONICAL_DATABASE_UNITS,
  convertCanonicalMeasurement,
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
