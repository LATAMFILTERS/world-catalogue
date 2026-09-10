'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { detectGeoLanguage } from '@/lib/geoLanguage';
import {
  formatCanonicalMeasurement,
  formatDimensionsCm,
  measurementSystemForCountry,
  type MeasurementKind,
  type MeasurementSystem,
} from '@/lib/unit-system';

const STORAGE_KEY = 'ef_measurement_system';

interface MeasurementContextValue {
  country: string;
  measurementSystem: MeasurementSystem;
  setMeasurementSystem: (system: MeasurementSystem) => void;
  formatMeasurement: (kind: MeasurementKind, value: number, locale?: string) => string;
  formatDimensions: (lengthCm: number, widthCm: number, heightCm: number, locale?: string) => string;
}

const MeasurementContext = createContext<MeasurementContextValue | null>(null);

export function MeasurementProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState('US');
  const [measurementSystem, setMeasurementSystemState] = useState<MeasurementSystem>('imperial');

  useEffect(() => {
    let active = true;

    void detectGeoLanguage().then((geo) => {
      if (!active) return;
      setCountry(geo.country);

      const stored = localStorage.getItem(STORAGE_KEY);
      const resolved = stored === 'metric' || stored === 'imperial'
        ? stored
        : measurementSystemForCountry(geo.country);

      setMeasurementSystemState(resolved);
      document.documentElement.dataset.measurementSystem = resolved;
      document.documentElement.dataset.country = geo.country;
    });

    return () => {
      active = false;
    };
  }, []);

  const setMeasurementSystem = (system: MeasurementSystem) => {
    localStorage.setItem(STORAGE_KEY, system);
    setMeasurementSystemState(system);
    document.documentElement.dataset.measurementSystem = system;
  };

  const value = useMemo<MeasurementContextValue>(() => ({
    country,
    measurementSystem,
    setMeasurementSystem,
    formatMeasurement: (kind, measurementValue, locale = 'en') =>
      formatCanonicalMeasurement(kind, measurementValue, measurementSystem, locale).text,
    formatDimensions: (lengthCm, widthCm, heightCm, locale = 'en') =>
      formatDimensionsCm(lengthCm, widthCm, heightCm, measurementSystem, locale),
  }), [country, measurementSystem]);

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
}

export function useMeasurementSystem(): MeasurementContextValue {
  const value = useContext(MeasurementContext);
  if (!value) throw new Error('useMeasurementSystem must be used inside MeasurementProvider');
  return value;
}
