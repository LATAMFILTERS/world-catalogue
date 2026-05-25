import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELIMFILTERS® | Asset Protection Filtration Technology',
  description: 'ELIMFILTERS® engineers multi-layer asset protection filtration technologies for mining, agriculture, marine, and heavy industry. Discover our mission and proprietary technology portfolio.',
  alternates: {
    canonical: 'https://elimfilters.com/about/',
  },
  openGraph: {
    title: 'About ELIMFILTERS® | Asset Protection Filtration Technology',
    description: 'ELIMFILTERS® engineers multi-layer asset protection filtration technologies for mining, agriculture, marine, and heavy industry.',
    url: 'https://elimfilters.com/about/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
