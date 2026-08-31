import type { Metadata } from 'next';
import { AirIntakeSystemPage } from '@/components/AirIntakeSystemPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/systems/air-intake/`;

export const metadata: Metadata = {
  title: 'Air Intake & Airflow Protection | Industrial Air Filtration | ELIMFILTERS',
  description: 'Air intake and airflow protection for engine intake, air-cleaner housings, cabin air and applicable compressed-air drying. Map the protected airflow path to the correct ELIMFILTERS technology, product family and validated part.',
  keywords: [
    'air intake filtration',
    'industrial air filtration',
    'engine air filter',
    'air cleaner housing',
    'cabin air filtration',
    'air dryer filtration',
    'airflow contamination control',
    'MACROCORE',
    'INTEKCORE',
    'MICROKAPPA',
    'DRYCORE',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Air Intake & Airflow Protection | ELIMFILTERS',
    description: 'System-level airflow contamination control across engine intake, housings, cabin air and applicable compressed-air drying.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/carcasa.jd.avif`, width: 1200, height: 630, alt: 'Air Intake & Airflow Protection — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Air Intake & Airflow Protection | ELIMFILTERS',
    description: 'Airflow contamination-control architecture for engine intake, housings, cabin air and applicable compressed-air drying.',
    images: [`${BASE_URL}/images/carcasa.jd.avif`],
  },
};

export default function AirIntakePage() {
  return <AirIntakeSystemPage />;
}
