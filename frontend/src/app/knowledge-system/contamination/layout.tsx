import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Contamination & Failure Modes in Industrial Filtration | ELIMFILTERS®',
  },
  description: 'Root cause analysis of contamination-driven equipment failure: particle wear in engines, diesel water contamination, and hydraulic system failure modes — with engineering solutions.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/',
  },
  openGraph: {
    title: 'Contamination & Failure Modes in Industrial Filtration | ELIMFILTERS®',
    description: 'Root cause analysis of contamination-driven equipment failure: particle wear, diesel water contamination, and hydraulic failure modes.',
    url: 'https://elimfilters.com/knowledge-system/contamination/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contamination & Failure Modes in Industrial Filtration | ELIMFILTERS®',
    description: 'Root cause analysis: particle wear, diesel water contamination, and hydraulic system failure modes.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ContaminationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
