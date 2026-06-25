import type { Metadata } from 'next';

const DESC = 'ELIMFILTERS® Commercial Lines — MARINECLEAN™ salt-resistant marine filtration and DURATECH™ fleet master kit system. Integrated product lines for marine, offshore, fleet, mining, construction, and agriculture operations.';

export const metadata: Metadata = {
  title: 'Commercial Lines — MARINECLEAN™ & DURATECH™ | ELIMFILTERS®',
  description: DESC,
  keywords: ['MARINECLEAN marine filtration', 'DURATECH fleet kits', 'commercial filtration lines', 'marine filter IMO certified', 'fleet maintenance kits', 'mixed fleet filter standardisation', 'salt resistant filtration', 'ELIMFILTERS commercial lines'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://elimfilters.com/commercial-lines/',
  },
  openGraph: {
    title: 'Commercial Lines — MARINECLEAN™ & DURATECH™ | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Commercial Lines — MARINECLEAN™ & DURATECH™ | ELIMFILTERS®',
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

export default function CommercialLinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
