import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Filtration & Fuel Efficiency — Industrial Fleet Optimization | ELIMFILTERS®',
  },
  description: 'How filtration affects fuel efficiency in industrial fleets: dirty injectors, intake restriction, oil viscosity degradation, and system-level filtration strategies to reduce fuel consumption.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet/fuel-efficiency/',
  },
  openGraph: {
    title: 'Filtration & Fuel Efficiency — Industrial Fleet Optimization | ELIMFILTERS®',
    description: 'How filtration affects fuel efficiency in industrial fleets: dirty injectors, intake restriction, oil viscosity degradation, and system-level filtration strategies to reduce fuel consumption.',
    url: 'https://elimfilters.com/knowledge-system/fleet/fuel-efficiency/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filtration & Fuel Efficiency — Industrial Fleet Optimization | ELIMFILTERS®',
    description: 'How filtration affects fuel efficiency in industrial fleets: dirty injectors, intake restriction, oil viscosity degradation, and system-level filtration strategies to reduce fuel consumption.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
