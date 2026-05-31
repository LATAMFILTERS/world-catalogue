import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Fleet Filtration Optimization — Downtime, TCO & Fuel Efficiency | ELIMFILTERS®',
  },
  description: 'Industrial fleet optimization through system-level filtration: reducing unplanned downtime, lowering total cost of ownership, and improving fuel efficiency in mining, agriculture, and heavy industry.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet/',
  },
  openGraph: {
    title: 'Fleet Filtration Optimization — Downtime, TCO & Fuel Efficiency | ELIMFILTERS®',
    description: 'Industrial fleet optimization: reducing unplanned downtime, lowering TCO, and improving fuel efficiency through system-level filtration.',
    url: 'https://elimfilters.com/knowledge-system/fleet/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fleet Filtration Optimization — Downtime, TCO & Fuel Efficiency | ELIMFILTERS®',
    description: 'Industrial fleet optimization: reducing downtime, lowering TCO, improving fuel efficiency through filtration.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
