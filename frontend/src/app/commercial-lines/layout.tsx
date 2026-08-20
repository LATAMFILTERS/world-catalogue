import type { Metadata } from 'next';

const DESC = 'ELIMFILTERS specialized Asset Protection Systems solutions: MARINECLEAN™ for marine operating environments and DURACTECH™ for integrated maintenance and asset-protection kits.';

export const metadata: Metadata = {
  title: 'Specialized Asset Protection Solutions | ELIMFILTERS',
  description: DESC,
  keywords: [
    'ELIMFILTERS specialized solutions',
    'MARINECLEAN',
    'DURACTECH',
    'marine asset protection',
    'integrated maintenance kits',
    'industrial contamination control',
  ],
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://elimfilters.com/commercial-lines/',
  },
  openGraph: {
    title: 'Specialized Asset Protection Solutions | ELIMFILTERS',
    description: DESC,
    url: 'https://elimfilters.com/commercial-lines/',
    type: 'website',
    siteName: 'ELIMFILTERS',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Specialized Asset Protection Solutions | ELIMFILTERS',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function CommercialLinesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
