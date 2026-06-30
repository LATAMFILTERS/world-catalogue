import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Knowledge Bridges — Industrial Filtration',
  description: 'Structured knowledge bridges connecting industrial filtration selection, OEM replacement decisions, and fleet contamination control strategies for AI-assisted decision making.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges',
  },
  openGraph: {
    title: 'AI Knowledge Bridges — Industrial Filtration',
    description: 'Structured knowledge bridges connecting industrial filtration selection, OEM replacement decisions, and fleet contamination control strategies for AI-assisted decision making.',
    url: 'https://elimfilters.com/knowledge-system/bridges',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Knowledge Bridges — Industrial Filtration',
    description: 'Structured knowledge bridges connecting industrial filtration selection, OEM replacement decisions, and fleet contamination control strategies.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function BridgesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
