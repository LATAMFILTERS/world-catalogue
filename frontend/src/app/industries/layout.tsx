import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industries Served | ELIMFILTERS World Catalogue',
  description: 'ELIMFILTERS serves 12 key industries: agriculture, mining, marine, construction, automotive, power generation, oil & gas, railway, trucks & fleets, manufacturing, bus coach, and waste municipal.',
  keywords: ['industrial filtration industries', 'mining filtration', 'agriculture filtration', 'marine filtration', 'ELIMFILTERS industries'],
  alternates: {
    canonical: 'https://elimfilters.com/industries',
    languages: {
      en: 'https://elimfilters.com/industries', es: 'https://elimfilters.com/industries',
      fr: 'https://elimfilters.com/industries', it: 'https://elimfilters.com/industries',
      nl: 'https://elimfilters.com/industries', ru: 'https://elimfilters.com/industries',
      zh: 'https://elimfilters.com/industries', ja: 'https://elimfilters.com/industries',
      ar: 'https://elimfilters.com/industries', fa: 'https://elimfilters.com/industries',
      pt: 'https://elimfilters.com/industries',
    },
  },
  openGraph: {
    title: 'Industries Served | ELIMFILTERS World Catalogue',
    description: 'ELIMFILTERS asset protection filtration for 12 key industrial sectors.',
    url: 'https://elimfilters.com/industries',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function IndustriesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
