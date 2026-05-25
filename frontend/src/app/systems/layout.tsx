import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Industrial Filtration Systems Catalogue',
  description: 'Explore 12 ELIMFILTERS filtration systems: air, fuel, hydraulic, cabin, coolant, oil, marine, dryer, housing, kits, and water filtration engineered for industry.',
  keywords: ['air filter systems', 'fuel filter systems', 'hydraulic filter systems', 'industrial filtration systems', 'filtration systems catalogue', 'ELIMFILTERS'],
  alternates: {
    canonical: 'https://elimfilters.com/systems/',
  },
  openGraph: {
    title: 'Industrial Filtration Systems Catalogue | ELIMFILTERS',
    description: 'Explore 12 filtration systems for air, fuel, hydraulic, cabin, coolant, oil, marine, and dryer filtration engineered for critical asset protection.',
    url: 'https://elimfilters.com/systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    title: 'Industrial Filtration Systems Catalogue | ELIMFILTERS',
    description: 'Explore 12 filtration systems for air, fuel, hydraulic, cabin, coolant, oil, marine, and dryer filtration engineered for critical asset protection.',
    card: 'summary_large_image',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
