import type { Metadata } from 'next';
import { NanoforceStablePage } from '@/components/NanoforceStablePage';

const URL = 'https://elimfilters.com/technologies/nanoforce/';

export const metadata: Metadata = {
  title: 'NANOFORCE™ Hydraulic Filtration Technology | ELIMFILTERS',
  description: 'NANOFORCE™ is the ELIMFILTERS hydraulic-filtration architecture for maintaining fluid cleanliness around the tolerance requirements of pumps, valves, actuators and precision hydraulic components.',
  keywords: [
    'NANOFORCE',
    'hydraulic filtration technology',
    'hydraulic fluid cleanliness',
    'hydraulic filter Beta ratio',
    'pressure line filter',
    'return line filter',
    'offline hydraulic filtration',
    'hydraulic filter pressure drop',
    'hydraulic contaminant capacity',
    'critical particle size hydraulic',
    'hydraulic cleanliness target',
    'ELIMFILTERS'
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'NANOFORCE™ Hydraulic Filtration Technology | ELIMFILTERS',
    description: 'Hydraulic fluid-cleanliness architecture for pressure-line, return-line and approved offline applications.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/images/nanoforce-mecanico.avif', width: 1200, height: 630, alt: 'NANOFORCE hydraulic filtration technology — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NANOFORCE™ Hydraulic Filtration Technology | ELIMFILTERS',
    description: 'Hydraulic filtration architecture for cleanliness control around precision fluid-power components.',
    images: ['https://elimfilters.com/images/nanoforce-mecanico.avif'],
  },
};

export default function NanoforcePage() {
  return <NanoforceStablePage />;
}
