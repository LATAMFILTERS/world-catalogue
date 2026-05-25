import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Filtration System Evaluation — OEM vs Aftermarket Comparison | ELIMFILTERS®',
  },
  description: 'System-level evaluation framework for industrial filtration: OEM vs aftermarket comparison, total cost of ownership analysis, and filter performance criteria based on contamination control targets.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare/',
  },
  openGraph: {
    title: 'Filtration System Evaluation — OEM vs Aftermarket Comparison | ELIMFILTERS®',
    description: 'OEM vs aftermarket comparison, TCO analysis, and filter evaluation based on contamination control — not brand or price.',
    url: 'https://elimfilters.com/knowledge-system/compare/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filtration System Evaluation — OEM vs Aftermarket Comparison | ELIMFILTERS®',
    description: 'OEM vs aftermarket, TCO analysis, filter evaluation by contamination control targets.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
