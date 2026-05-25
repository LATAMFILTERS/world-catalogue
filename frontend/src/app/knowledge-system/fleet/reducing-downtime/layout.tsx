import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Reducing Fleet Downtime Through Filtration | ELIMFILTERS®',
  },
  description: 'Reducing unplanned downtime in industrial fleets: contamination-driven failure prevention, predictive maintenance intervals, filter change optimization, and contamination monitoring strategies.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet/reducing-downtime/',
  },
  openGraph: {
    title: 'Reducing Fleet Downtime Through Filtration | ELIMFILTERS®',
    description: 'Reducing unplanned downtime in industrial fleets: contamination-driven failure prevention, predictive maintenance intervals, filter change optimization, and contamination monitoring strategies.',
    url: 'https://elimfilters.com/knowledge-system/fleet/reducing-downtime/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reducing Fleet Downtime Through Filtration | ELIMFILTERS®',
    description: 'Reducing unplanned downtime in industrial fleets: contamination-driven failure prevention, predictive maintenance intervals, filter change optimization, and contamination monitoring strategies.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
