import type { Metadata } from 'next';
import { MacrocoreTechnologyPage } from '@/components/MacrocoreTechnologyPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/technologies/macrocore/`;

export const metadata: Metadata = {
  title: 'MACROCORE Engine Air Filtration | ELIMFILTERS',
  description: 'MACROCORE™ is the ELIMFILTERS engine-air filtration architecture for primary and secondary intake protection, connecting airflow demand, restriction, sealing integrity, dust loading and validated application evidence.',
  keywords: [
    'MACROCORE',
    'engine air filtration technology',
    'engine air filter',
    'primary air filter',
    'secondary air filter',
    'safety air element',
    'air intake contamination control',
    'ISO 5011',
    'heavy duty air filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'MACROCORE™ Engine Air Filtration Technology | ELIMFILTERS',
    description: 'Engine-air contamination-control architecture for primary and secondary intake protection, with selection tied to airflow, restriction, housing, sealing and duty environment.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/mecanica-air.avif`, width: 1200, height: 630, alt: 'MACROCORE engine air filtration technology — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MACROCORE™ Engine Air Filtration Technology | ELIMFILTERS',
    description: 'Primary and secondary engine-air filtration architecture for controlled intake contamination and validated application selection.',
    images: [`${BASE_URL}/images/mecanica-air.avif`],
  },
};

export default function MacrocorePage() {
  return <MacrocoreTechnologyPage />;
}
