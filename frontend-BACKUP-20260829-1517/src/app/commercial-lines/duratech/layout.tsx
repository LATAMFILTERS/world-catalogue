import type { Metadata } from 'next';

const DESC = 'DURATECH™ integrated filter kits coordinate application-specific filtration components and maintenance intervals for approved commercial assets.';

export const metadata: Metadata = {
  title: 'DURATECH™ — Integrated Filter Kit Program | ELIMFILTERS®',
  description: DESC,
  keywords: ['DURATECH filter kit', 'integrated filter kit', 'fleet maintenance kit', 'truck filter kit', 'equipment maintenance kit', 'vehicle filter kit', 'coordinated filtration maintenance', 'ELIMFILTERS specialized solution'],
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://elimfilters.com/commercial-lines/duratech/' },
  openGraph: {
    title: 'DURATECH™ — Integrated Filter Kit Program | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/duratech/',
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DURATECH™ — Integrated Filter Kit Program | ELIMFILTERS®',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
  other: {
    'product:classification': 'Specialized Commercial Solution — Integrated Filter Kit Program',
    'geo.region': 'US-TX',
    'geo.placename': 'Frisco, Texas',
    'geo.position': '33.1507;-96.8236',
    ICBM: '33.1507, -96.8236',
  },
};

export default function DuratechLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
