import type { Metadata } from 'next';
import { HydraulicSystemPage } from '@/components/HydraulicSystemPage';

const BASE_URL = 'https://elimfilters.com';
const URL = `${BASE_URL}/systems/hydraulic/`;

export const metadata: Metadata = {
  title: 'Hydraulic Protection | Hydraulic Filtration Systems | ELIMFILTERS',
  description: 'Hydraulic filtration and contamination-control architecture for pumps, valves, actuators and precision hydraulic systems. Map fluid cleanliness, flow, pressure and application evidence to NANOFORCE™ and the correct ELIMFILTERS hydraulic filter.',
  keywords: [
    'hydraulic filtration',
    'hydraulic filter',
    'hydraulic contamination control',
    'hydraulic fluid cleanliness',
    'ISO 4406',
    'ISO 16889',
    'NANOFORCE',
    'hydraulic protection',
    'industrial filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'Hydraulic Protection | ELIMFILTERS',
    description: 'System-level hydraulic contamination control for pumps, valves, actuators and precision fluid-power components.',
    url: URL,
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: `${BASE_URL}/images/hidraulico-trabajador.jpg`, width: 1200, height: 630, alt: 'Hydraulic Protection — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hydraulic Protection | ELIMFILTERS',
    description: 'Hydraulic filtration architecture for fluid cleanliness, component protection and validated application selection.',
    images: [`${BASE_URL}/images/hidraulico-trabajador.jpg`],
  },
};

export default function HydraulicPage() {
  return <HydraulicSystemPage />;
}
