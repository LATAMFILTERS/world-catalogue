import type { Metadata } from 'next';

const CANONICAL = 'https://elimfilters.com/distributor-application/';

export const metadata: Metadata = {
  title: 'Become an ELIMFILTERS Distributor | Asset Protection Partner Program',
  description:
    'Join the ELIMFILTERS authorized distributor network. Represent an industrial asset protection platform — 10 proprietary technologies, 12 industrial sectors, contamination control systems for mining, agriculture, marine, oil & gas, and heavy industry.',
  alternates: {
    canonical: CANONICAL,
    languages: {
      'x-default': CANONICAL,
      en: CANONICAL,
    },
  },
  openGraph: {
    title: 'Become an ELIMFILTERS Distributor | Asset Protection Partner Program',
    description:
      'Partner with ELIMFILTERS to deliver industrial asset protection — contamination control systems for 12 sectors. Not a filter supplier. An asset protection platform.',
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [
      {
        url: 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: 'ELIMFILTERS Authorized Distributor Program',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELIMFILTERS Distributor Program | Industrial Asset Protection',
    description:
      'Join the ELIMFILTERS network. Represent proprietary contamination control technologies across 12 heavy industry sectors.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function DistributorApplicationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
