import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Lube Oil Filtration Systems — ISO 16889, ISO 4406 | ELIMFILTERS®',
  },
  description: 'ISO 16889 beta ratio, ISO 4406 cleanliness codes, particle wear mechanisms, and contamination control targets for engine and bearing protection.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/lube-oil-systems/',
  },
  openGraph: {
    title: 'Lube Oil Filtration Systems — ISO 16889, ISO 4406 | ELIMFILTERS®',
    description: 'ISO 16889 beta ratio, ISO 4406 cleanliness codes, particle wear mechanisms, and contamination control targets for engine and bearing protection.',
    url: 'https://elimfilters.com/knowledge-system/standards/lube-oil-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Lube Oil Filtration Systems — ISO 16889, ISO 4406 | ELIMFILTERS®',
    description: 'ISO 16889 beta ratio, ISO 4406 cleanliness codes, particle wear mechanisms, and contamination control targets for engine and bearing protection.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
