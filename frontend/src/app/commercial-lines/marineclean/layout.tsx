import type { Metadata } from 'next';

const DESC = 'MARINECLEAN™ is a salt-resistant filtration line for commercial marine, offshore, and coastal operations. Epoxy barrier coating, brine rejection geometry, and corrosion-shield internals. IMO certified for diesel fuel, hydraulic, and lube oil systems aboard commercial vessels and offshore platforms.';

export const metadata: Metadata = {
  title: 'MARINECLEAN™ — Marine Filtration Line | ELIMFILTERS®',
  description: DESC,
  keywords: ['MARINECLEAN marine filter', 'IMO certified filtration', 'marine fuel filter', 'offshore hydraulic filter', 'salt resistant filtration', 'marine corrosion protection', 'epoxy barrier filter coating', 'brine rejection filtration', 'commercial vessel filtration', 'ELIMFILTERS marine'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://elimfilters.com/commercial-lines/marineclean/',
  },
  openGraph: {
    title: 'MARINECLEAN™ — Marine Filtration Line | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/marineclean/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'MARINECLEAN™ — Marine Filtration Line | ELIMFILTERS®',
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

export default function MarinecleanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
