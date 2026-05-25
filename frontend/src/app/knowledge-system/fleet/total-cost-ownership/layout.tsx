import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Total Cost of Ownership — Filtration System Economics | ELIMFILTERS',
  },
  description: 'Total cost of ownership analysis for industrial filtration: filter cost vs downtime cost, component lifespan extension, maintenance interval optimization, and fleet TCO calculation methodology.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet/total-cost-ownership/',
  },
  openGraph: {
    title: 'Total Cost of Ownership — Filtration System Economics | ELIMFILTERS',
    description: 'Total cost of ownership analysis for industrial filtration: filter cost vs downtime cost, component lifespan extension, maintenance interval optimization, and fleet TCO calculation methodology.',
    url: 'https://elimfilters.com/knowledge-system/fleet/total-cost-ownership/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Total Cost of Ownership — Filtration System Economics | ELIMFILTERS',
    description: 'Total cost of ownership analysis for industrial filtration: filter cost vs downtime cost, component lifespan extension, maintenance interval optimization, and fleet TCO calculation methodology.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
