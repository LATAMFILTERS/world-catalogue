import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Filter Evaluation Framework — Performance-Based Selection | ELIMFILTERS',
  },
  description: 'Performance-based filter evaluation framework: ISO 16889 beta ratio, ISO 4406 cleanliness targets, bypass valve thresholds, and contamination control criteria for industrial filtration selection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare/evaluation-framework/',
  },
  openGraph: {
    title: 'Filter Evaluation Framework — Performance-Based Selection | ELIMFILTERS',
    description: 'Performance-based filter evaluation framework: ISO 16889 beta ratio, ISO 4406 cleanliness targets, bypass valve thresholds, and contamination control criteria for industrial filtration selection.',
    url: 'https://elimfilters.com/knowledge-system/compare/evaluation-framework/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filter Evaluation Framework — Performance-Based Selection | ELIMFILTERS',
    description: 'Performance-based filter evaluation framework: ISO 16889 beta ratio, ISO 4406 cleanliness targets, bypass valve thresholds, and contamination control criteria for industrial filtration selection.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
