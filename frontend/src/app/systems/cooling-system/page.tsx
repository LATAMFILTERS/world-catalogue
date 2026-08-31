import type { Metadata } from 'next';
import { CoolingSystemPage } from '@/components/CoolingSystemPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/systems/cooling-system/`;

export const metadata: Metadata = {
  title: 'Cooling System Protection | Coolant Filtration | ELIMFILTERS',
  description: 'Cooling-system protection for heavy-duty engines using THERMACORE™ coolant filtration. Control corrosion products, scale and coolant contamination while keeping part selection tied to validated application evidence.',
  keywords: [
    'cooling system protection',
    'coolant filtration',
    'coolant filter',
    'heavy duty cooling system',
    'coolant contamination control',
    'THERMACORE',
    'ASTM D6210',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Cooling System Protection | ELIMFILTERS',
    description: 'Cooling-system contamination control and THERMACORE™ coolant filtration for validated heavy-duty applications.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/thermacore_mecnico.jpg`, width: 1200, height: 630, alt: 'Cooling System Protection — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cooling System Protection | ELIMFILTERS',
    description: 'THERMACORE™ cooling-system protection and coolant filtration for validated heavy-duty applications.',
    images: [`${BASE_URL}/images/thermacore_mecnico.jpg`],
  },
};

export default function CoolingSystemRoute() {
  return <CoolingSystemPage />;
}
