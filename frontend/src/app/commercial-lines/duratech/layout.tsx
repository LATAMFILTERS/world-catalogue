import type { Metadata } from 'next';

const DESC = 'DURATECH™ is a fleet maintenance standardisation system consolidating oil, fuel, air, and cabin filtration into OEM-interchangeable master kits. Platform-specific kits for mixed-model fleets in trucks, mining, construction, and agriculture — one kit per vehicle per service cycle.';

export const metadata: Metadata = {
  title: 'DURATECH™ — Fleet Master Kit System | ELIMFILTERS®',
  description: DESC,
  keywords: ['DURATECH fleet filter kit', 'fleet maintenance kit', 'OEM interchangeable filter', 'mixed fleet filtration', 'fleet filter standardisation', 'truck filter kit', 'mining equipment filtration kit', 'construction fleet filters', 'agriculture fleet maintenance', 'ELIMFILTERS fleet'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://elimfilters.com/commercial-lines/duratech/',
  },
  openGraph: {
    title: 'DURATECH™ — Fleet Master Kit System | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/duratech/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'DURATECH™ — Fleet Master Kit System | ELIMFILTERS®',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
  other: {
    'geo.region': 'US-TX',
    'geo.placename': 'Frisco, Texas',
    'geo.position': '33.1507;-96.8236',
    ICBM: '33.1507, -96.8236',
  },
};

export default function DuratechLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
