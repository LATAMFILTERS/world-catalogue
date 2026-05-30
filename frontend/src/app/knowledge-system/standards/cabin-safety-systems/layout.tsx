import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Cabin Air Filtration — ISO 11155, DIN 71220 | ELIMFILTERS®',
  },
  description: 'ISO 11155 test standard, DIN 71220 classification, PM10/PM2.5 exposure limits, and electrostatic filtration for mining and agricultural vehicle cabins.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/cabin-safety-systems/',
  },
  openGraph: {
    title: 'Cabin Air Filtration — ISO 11155, DIN 71220 | ELIMFILTERS®',
    description: 'ISO 11155 test standard, DIN 71220 classification, PM10/PM2.5 exposure limits, and electrostatic filtration for mining and agricultural vehicle cabins.',
    url: 'https://elimfilters.com/knowledge-system/standards/cabin-safety-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Cabin Air Filtration — ISO 11155, DIN 71220 | ELIMFILTERS®',
    description: 'ISO 11155 test standard, DIN 71220 classification, PM10/PM2.5 exposure limits, and electrostatic filtration for mining and agricultural vehicle cabins.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
