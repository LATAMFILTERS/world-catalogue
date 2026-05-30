import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'ISO 4406 Fluid Cleanliness Code — Particle Contamination | ELIMFILTERS®',
  },
  description: 'ISO 4406 particle cleanliness code system: three-number code structure, particle count targets per system, measurement methods, and correlation to equipment component sensitivity.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/iso-4406/',
  },
  openGraph: {
    title: 'ISO 4406 Fluid Cleanliness Code — Particle Contamination | ELIMFILTERS®',
    description: 'ISO 4406 particle cleanliness code system: three-number code structure, particle count targets per system, measurement methods, and correlation to equipment component sensitivity.',
    url: 'https://elimfilters.com/knowledge-system/standards/iso-4406/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'ISO 4406 Fluid Cleanliness Code — Particle Contamination | ELIMFILTERS®',
    description: 'ISO 4406 particle cleanliness code system: three-number code structure, particle count targets per system, measurement methods, and correlation to equipment component sensitivity.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
