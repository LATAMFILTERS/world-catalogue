import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Sectors We Protect',
  description: 'ELIMFILTERS asset protection systems for 12 industrial sectors: agriculture, mining, marine, construction, oil & gas, power generation, transportation, forestry, and more.',
  keywords: ['industrial filtration industries', 'mining filtration', 'agriculture filtration', 'marine filtration', 'ELIMFILTERS industries', 'filtration by industry'],
  alternates: {
    canonical: 'https://elimfilters.com/industries/',
  },
  openGraph: {
    title: 'Industrial Sectors We Protect',
    description: 'ELIMFILTERS asset protection systems for 12 industrial sectors: agriculture, mining, marine, construction, oil & gas, power generation, transportation, forestry, and more.',
    url: 'https://elimfilters.com/industries',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
