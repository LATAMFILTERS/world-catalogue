import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Systems by Sector',
  description: 'ELIMFILTERS protects critical assets across 12 industries — from mining and agriculture to marine and power generation. Purpose-built filtration for your sector.',
  keywords: ['industrial filtration industries', 'mining filtration', 'agriculture filtration', 'marine filtration', 'ELIMFILTERS industries', 'filtration by industry'],
  alternates: {
    canonical: 'https://elimfilters.com/industries/',
  },
  openGraph: {
    title: 'Industrial Filtration Systems by Sector | ELIMFILTERS',
    description: 'Asset protection filtration systems for 12 key industrial sectors.',
    url: 'https://elimfilters.com/industries/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
