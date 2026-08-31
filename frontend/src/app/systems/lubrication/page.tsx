import type { Metadata } from 'next';
import { LubricationSystemPage } from '@/components/LubricationSystemPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/systems/lubrication/`;

export const metadata: Metadata = {
  title: 'Lubrication Protection | Engine Oil Filtration | ELIMFILTERS',
  description: 'Lubrication protection for engine oil contamination control across soot, wear debris, oxidation products and service ingress. Connect the engine and duty profile to SYNTRAX™ technology, the oil-filter family and validated application evidence.',
  keywords: [
    'engine oil filtration',
    'lubrication protection',
    'oil filter',
    'lubricant contamination control',
    'soot contamination',
    'wear debris',
    'engine bearing protection',
    'SYNTRAX',
    'industrial filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Lubrication Protection | ELIMFILTERS',
    description: 'System-level engine oil contamination control connecting engine duty, SYNTRAX™ filtration technology, oil-filter families and validated application evidence.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/oil-hand.avif`, width: 1200, height: 630, alt: 'Lubrication Protection — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lubrication Protection | ELIMFILTERS',
    description: 'Engine oil contamination-control architecture for soot, wear debris, oxidation products and validated oil-filter application identification.',
    images: [`${BASE_URL}/images/oil-hand.avif`],
  },
};

export default function LubricationPage() {
  return <LubricationSystemPage />;
}
