import type { Metadata } from 'next';

const DESC = 'MARINECLEAN™ is the ELIMFILTERS specialized marine filtration solution for coordinated asset protection across marine fuel, lubrication, hydraulic, and related filtration applications. MARINECLEAN is a specialized commercial solution, not a filtration technology.';

export const metadata: Metadata = {
  title: 'MARINECLEAN™ — Specialized Marine Filtration Solution | ELIMFILTERS®',
  description: DESC,
  keywords: ['MARINECLEAN marine filtration', 'marine filtration solution', 'marine fuel filtration', 'marine hydraulic filtration', 'marine lube filtration', 'vessel filtration support', 'marine asset protection', 'ELIMFILTERS specialized solution'],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://elimfilters.com/commercial-lines/marineclean/',
  },
  openGraph: {
    title: 'MARINECLEAN™ — Specialized Marine Filtration Solution | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/marineclean/',
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MARINECLEAN™ — Specialized Marine Filtration Solution | ELIMFILTERS®',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
  other: {
    'product:classification': 'Specialized Commercial Solution — Marine Filtration',
    'geo.region': 'US-TX',
    'geo.placename': 'Frisco, Texas',
    'geo.position': '33.1507;-96.8236',
    ICBM: '33.1507, -96.8236',
  },
};

export default function MarinecleanLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
