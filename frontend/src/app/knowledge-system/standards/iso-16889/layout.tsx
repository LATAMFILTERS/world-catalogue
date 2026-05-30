import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'ISO 16889 Beta Ratio Filter Test Standard | ELIMFILTERS®',
  },
  description: 'ISO 16889 multi-pass filter test: Beta ratio calculation, particle counting, filter efficiency classification for hydraulic and lube oil filtration systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/iso-16889/',
  },
  openGraph: {
    title: 'ISO 16889 Beta Ratio Filter Test Standard | ELIMFILTERS®',
    description: 'ISO 16889 multi-pass filter test: Beta ratio calculation, particle counting, filter efficiency classification for hydraulic and lube oil filtration systems.',
    url: 'https://elimfilters.com/knowledge-system/standards/iso-16889/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'ISO 16889 Beta Ratio Filter Test Standard | ELIMFILTERS®',
    description: 'ISO 16889 multi-pass filter test: Beta ratio calculation, particle counting, filter efficiency classification for hydraulic and lube oil filtration systems.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
