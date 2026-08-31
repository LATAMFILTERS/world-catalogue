import type { Metadata } from 'next';
import { FuelCleanlinessSystemPage } from '@/components/FuelCleanlinessSystemPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/systems/fuel-cleanliness/`;

export const metadata: Metadata = {
  title: 'Fuel Cleanliness Protection | Diesel Fuel Filtration | ELIMFILTERS',
  description: 'Diesel fuel cleanliness protection for particulate filtration, fuel/water separation and applicable turbine-series fuel conditioning. Map the fuel-system function to the correct ELIMFILTERS technology, product family and validated part.',
  keywords: [
    'diesel fuel filtration',
    'fuel cleanliness protection',
    'fuel water separator',
    'diesel fuel contamination',
    'fuel filter system',
    'fuel water separation',
    'stored fuel contamination',
    'SYNTAPORE',
    'HYDROCORE',
    'TURBOCORE',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Fuel Cleanliness Protection | ELIMFILTERS',
    description: 'System-level diesel fuel contamination control across particulate filtration, water separation and applicable turbine-series fuel conditioning.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/turbine-plant.avif`, width: 1200, height: 630, alt: 'Fuel Cleanliness Protection — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuel Cleanliness Protection | ELIMFILTERS',
    description: 'Diesel fuel contamination-control architecture for particulate filtration, water separation and applicable turbine-series fuel conditioning.',
    images: [`${BASE_URL}/images/turbine-plant.avif`],
  },
};

export default function FuelCleanlinessPage() {
  return <FuelCleanlinessSystemPage />;
}
