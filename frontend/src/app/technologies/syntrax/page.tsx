import type { Metadata } from 'next';
import { SyntraxStablePage } from '@/components/SyntraxStablePage';

const URL = 'https://elimfilters.com/technologies/syntrax/';

export const metadata: Metadata = {
  title: 'SYNTRAX™ Engine Oil Filtration Technology | ELIMFILTERS',
  description: 'SYNTRAX™ is the ELIMFILTERS architecture for controlling wear debris, soot agglomerates and other lubricant contaminants while balancing efficiency, capacity, oil flow, pressure drop and structural integrity.',
  keywords: [
    'SYNTRAX',
    'engine oil filtration technology',
    'lube oil filter',
    'engine lubrication filtration',
    'wear debris control',
    'soot agglomerate filtration',
    'oil filter pressure drop',
    'oil filter restriction',
    'contaminant holding capacity',
    'heavy duty oil filtration',
    'ELIMFILTERS',
  ],
  alternates: { canonical: URL },
  openGraph: {
    title: 'SYNTRAX™ Engine Oil Filtration Technology | ELIMFILTERS',
    description: 'Lubrication-filtration architecture for wear debris, soot agglomerates, oil flow, restriction and structural integrity.',
    url: URL,
    type: 'article',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/images/syntrax.avif', width: 1200, height: 630, alt: 'SYNTRAX engine lubrication filtration technology — ELIMFILTERS' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SYNTRAX™ Engine Oil Filtration Technology | ELIMFILTERS',
    description: 'Engine lubrication filtration for wear debris, soot agglomerates, oil flow and pressure-drop control.',
    images: ['https://elimfilters.com/images/syntrax.avif'],
  },
};

export default function SyntraxPage() {
  return <SyntraxStablePage />;
}
