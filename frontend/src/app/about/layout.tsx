import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ELIMFILTERS | Asset Protection Filtration Technology',
  description: 'ELIMFILTERS engineers multi-layer asset protection filtration technologies for mining, agriculture, marine, and heavy industry. Discover our mission and proprietary technology portfolio.',
  alternates: {
    canonical: 'https://elimfilters.com/about',
    languages: {
      en: 'https://elimfilters.com/about', es: 'https://elimfilters.com/about',
      fr: 'https://elimfilters.com/about', it: 'https://elimfilters.com/about',
      nl: 'https://elimfilters.com/about', ru: 'https://elimfilters.com/about',
      zh: 'https://elimfilters.com/about', ja: 'https://elimfilters.com/about',
      ar: 'https://elimfilters.com/about', fa: 'https://elimfilters.com/about',
      pt: 'https://elimfilters.com/about',
    },
  },
  openGraph: {
    title: 'About ELIMFILTERS | Asset Protection Filtration Technology',
    description: 'ELIMFILTERS engineers multi-layer asset protection filtration technologies for mining, agriculture, marine, and heavy industry.',
    url: 'https://elimfilters.com/about',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
