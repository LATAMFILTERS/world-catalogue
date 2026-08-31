import type { Metadata } from 'next';
import { SyntaporeStablePage } from '@/components/SyntaporeStablePage';

const URL = 'https://elimfilters.com/technologies/syntapore/';

export const metadata: Metadata = {
  title: 'SYNTAPORE™ Fuel Filtration Technology | ELIMFILTERS',
  description: 'SYNTAPORE™ is the ELIMFILTERS architecture for particulate control in primary, secondary and cartridge diesel-fuel filtration stages, balancing efficiency, contaminant capacity, flow and pressure drop for the approved application.',
  keywords: [
    'SYNTAPORE',
    'diesel fuel filtration technology',
    'primary fuel filter',
    'secondary fuel filter',
    'cartridge fuel filter',
    'diesel particulate contamination',
    'fuel filter restriction',
    'fuel starvation',
    'injector contamination',
    'microbial diesel contamination',
    'fuel filter pressure drop',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'SYNTAPORE™ Fuel Filtration Technology | ELIMFILTERS',
    description: 'Diesel-fuel particulate-control architecture for primary, secondary and cartridge filtration positions.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/images/hero-syntapore.avif', width: 1200, height: 630, alt: 'SYNTAPORE fuel filtration technology — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SYNTAPORE™ Fuel Filtration Technology | ELIMFILTERS',
    description: 'Primary, secondary and cartridge diesel-fuel particulate filtration architecture.',
    images: ['https://elimfilters.com/images/hero-syntapore.avif'],
  },
};

export default function SyntaporePage() {
  return <SyntaporeStablePage />;
}
