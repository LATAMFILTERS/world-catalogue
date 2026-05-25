import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Systems by Sector | ELIMFILTERS',
  description: 'ELIMFILTERS serves 12 key industries: agriculture, mining, marine, construction, automotive, power generation, oil & gas, railway, trucks & fleets, manufacturing, bus coach, and waste management.',
  keywords: ['industrial filtration industries', 'mining filtration', 'agriculture filtration', 'marine filtration', 'ELIMFILTERS industries'],
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
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
