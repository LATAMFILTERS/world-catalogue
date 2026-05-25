import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Filtration Systems Catalogue | ELIMFILTERS',
  description: 'Explore 12 ELIMFILTERS filtration systems: air, fuel, hydraulic, cabin, coolant, oil, marine, dryer, housing, kits, and water filtration for industrial operations.',
  keywords: ['air filter systems', 'fuel filter systems', 'hydraulic filter systems', 'industrial filtration systems', 'ELIMFILTERS systems catalogue'],
  alternates: {
    canonical: 'https://elimfilters.com/systems/',
  },
  openGraph: {
    title: 'Filtration Systems Catalogue | ELIMFILTERS',
    description: 'Explore 12 filtration systems for air, fuel, hydraulic, cabin, coolant, oil, marine, and dryer filtration.',
    url: 'https://elimfilters.com/systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
