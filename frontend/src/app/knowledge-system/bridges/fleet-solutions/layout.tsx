import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Fleet Filtration Solutions — Mixed Fleet Standardisation | ELIMFILTERS®',
  },
  description: 'Fleet filtration solutions for mixed equipment fleets: standardisation strategies, master kit implementation, procurement consolidation, and contamination control targets across multiple equipment types.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/bridges/fleet-solutions/',
  },
  openGraph: {
    title: 'Fleet Filtration Solutions — Mixed Fleet Standardisation | ELIMFILTERS®',
    description: 'Fleet filtration solutions for mixed equipment fleets: standardisation strategies, master kit implementation, procurement consolidation, and contamination control targets across multiple equipment types.',
    url: 'https://elimfilters.com/knowledge-system/bridges/fleet-solutions/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Filtration Solutions — Mixed Fleet Standardisation | ELIMFILTERS®',
    description: 'Fleet filtration solutions for mixed equipment fleets: standardisation strategies, master kit implementation, procurement consolidation, and contamination control targets across multiple equipment types.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
