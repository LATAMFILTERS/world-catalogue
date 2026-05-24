import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Systems | ELIMFILTERS World Catalogue',
  description: 'Explore all 12 ELIMFILTERS filtration systems: air, fuel, hydraulic, cabin, coolant, oil, marine, dryer, housing, kits, and water filtration for industrial operations.',
  keywords: ['air filter systems', 'fuel filter systems', 'hydraulic filter systems', 'industrial filtration systems', 'ELIMFILTERS systems catalogue'],
  alternates: {
    canonical: 'https://elimfilters.com/systems',
    languages: {
      en: 'https://elimfilters.com/systems', es: 'https://elimfilters.com/systems',
      fr: 'https://elimfilters.com/systems', it: 'https://elimfilters.com/systems',
      nl: 'https://elimfilters.com/systems', ru: 'https://elimfilters.com/systems',
      zh: 'https://elimfilters.com/systems', ja: 'https://elimfilters.com/systems',
      ar: 'https://elimfilters.com/systems', fa: 'https://elimfilters.com/systems',
      pt: 'https://elimfilters.com/systems',
    },
  },
  openGraph: {
    title: 'Filtration Systems | ELIMFILTERS World Catalogue',
    description: 'Explore all 12 ELIMFILTERS filtration systems for industrial operations.',
    url: 'https://elimfilters.com/systems',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
