import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELIMFILTERS® — Industrial Asset Protection Company',
  description: 'ELIMFILTERS does not sell filters. It protects industrial assets through contamination control, proprietary filtration technologies, and system-level engineering across mining, agriculture, marine, construction, oil & gas, and 8 additional heavy industry sectors.',
  alternates: {
    canonical: 'https://elimfilters.com/about',
  },
  openGraph: {
    title: 'About ELIMFILTERS® — Industrial Asset Protection Company',
    description: 'ELIMFILTERS protects industrial assets through contamination control and system-level filtration engineering. 10 proprietary technologies. 12 industrial sectors. One objective: asset protection.',
    url: 'https://elimfilters.com/about',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ELIMFILTERS® — Industrial Asset Protection Company',
    description: 'We don\'t sell filters. We protect assets. Contamination control, proprietary technologies, and engineering frameworks for 12 industrial sectors.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
