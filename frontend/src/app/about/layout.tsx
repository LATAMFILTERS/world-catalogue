import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELIMFILTERS — Global Asset Protection & Filtration Engineering',
  description: 'Discover the ELIMFILTERS engineering and manufacturing model: filtration-media development in Germany, qualified PRC manufacturing, physical validation, mathematical modeling of demanding operating conditions, horizontal operations, and a partner-first B2B architecture.',
  alternates: {
    canonical: 'https://elimfilters.com/about',
  },
  openGraph: {
    title: 'About ELIMFILTERS — Global Asset Protection & Filtration Engineering',
    description: 'German-developed filtration media, qualified PRC manufacturing, physical validation, mathematical and computational engineering analysis, horizontal operations, and an authorized commercial partner network.',
    url: 'https://elimfilters.com/about',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About ELIMFILTERS — Global Asset Protection & Filtration Engineering',
    description: 'A global filtration model combining engineering, qualified manufacturing, physical validation, mathematical modeling, efficient horizontal operations, and authorized commercial partners.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
