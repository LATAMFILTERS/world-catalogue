import type { Metadata } from 'next';

const DESC = 'ELIMFILTERS® asset protection filtration for mining, agriculture, marine, and heavy industry — engineered to eliminate contamination before it damages.';

export const metadata: Metadata = {
  title: {
    absolute: 'About ELIMFILTERS® — Asset Protection Engineering Company',
  },
  description: DESC,
  alternates: {
    canonical: 'https://elimfilters.com/about/',
  },
  openGraph: {
    title: 'About ELIMFILTERS® — Asset Protection Engineering Company',
    description: DESC,
    url: 'https://elimfilters.com/about/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'About ELIMFILTERS® — Asset Protection Engineering Company',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
