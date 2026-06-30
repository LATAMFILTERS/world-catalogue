import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filter Evaluation Framework',
  description: 'System vs commodity filtration analysis. OEM vs aftermarket comparison. Total cost of ownership for industrial filtration decisions based on ISO contamination targets, not brand loyalty.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare',
  },
  openGraph: {
    title: 'Filter Evaluation Framework',
    description: 'System vs commodity filtration analysis. OEM vs aftermarket comparison. Total cost of ownership for industrial filtration decisions based on ISO contamination targets, not brand loyalty.',
    url: 'https://elimfilters.com/knowledge-system/compare',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filter Evaluation Framework',
    description: 'System vs commodity filtration analysis. OEM vs aftermarket comparison. Total cost of ownership based on ISO contamination targets.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
