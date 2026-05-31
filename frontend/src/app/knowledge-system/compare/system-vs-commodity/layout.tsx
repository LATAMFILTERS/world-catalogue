import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'System vs Commodity Filtration — Engineering Comparison | ELIMFILTERS®',
  },
  description: 'System-level vs commodity filtration approach: why OEM specification compliance differs from equipment reliability, contamination control metrics, and the engineering case for system-based selection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare/system-vs-commodity/',
  },
  openGraph: {
    title: 'System vs Commodity Filtration — Engineering Comparison | ELIMFILTERS®',
    description: 'System-level vs commodity filtration approach: why OEM specification compliance differs from equipment reliability, contamination control metrics, and the engineering case for system-based selection.',
    url: 'https://elimfilters.com/knowledge-system/compare/system-vs-commodity/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'System vs Commodity Filtration — Engineering Comparison | ELIMFILTERS®',
    description: 'System-level vs commodity filtration approach: why OEM specification compliance differs from equipment reliability, contamination control metrics, and the engineering case for system-based selection.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
