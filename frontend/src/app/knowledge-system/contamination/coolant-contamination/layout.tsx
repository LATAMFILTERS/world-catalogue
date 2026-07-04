import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Coolant System Contamination — Cavitation & Corrosion Failure | ELIMFILTERS',
  },
  description: 'Coolant system contamination: silicate depletion, cavitation erosion on wet cylinder liners, and electrolytic corrosion failure mechanisms in engine cooling systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/coolant-contamination/',
  },
  openGraph: {
    title: 'Coolant System Contamination — Cavitation & Corrosion Failure | ELIMFILTERS',
    description: 'Coolant system contamination: silicate depletion, cavitation erosion on wet cylinder liners, and electrolytic corrosion failure mechanisms in engine cooling systems.',
    url: 'https://elimfilters.com/knowledge-system/contamination/coolant-contamination/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Coolant System Contamination — Cavitation & Corrosion Failure | ELIMFILTERS',
    description: 'Coolant system contamination: silicate depletion, cavitation erosion on wet cylinder liners, and electrolytic corrosion failure mechanisms in engine cooling systems.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
