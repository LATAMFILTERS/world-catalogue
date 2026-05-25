import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Total Cost of Ownership — Filtration Investment Analysis | ELIMFILTERS',
  },
  description: 'Filtration investment TCO analysis: upfront filter cost vs downtime prevention value, component replacement avoidance, fleet standardisation economics, and long-term asset protection returns.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/compare/total-cost-ownership/',
  },
  openGraph: {
    title: 'Total Cost of Ownership — Filtration Investment Analysis | ELIMFILTERS',
    description: 'Filtration investment TCO analysis: upfront filter cost vs downtime prevention value, component replacement avoidance, fleet standardisation economics, and long-term asset protection returns.',
    url: 'https://elimfilters.com/knowledge-system/compare/total-cost-ownership/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Total Cost of Ownership — Filtration Investment Analysis | ELIMFILTERS',
    description: 'Filtration investment TCO analysis: upfront filter cost vs downtime prevention value, component replacement avoidance, fleet standardisation economics, and long-term asset protection returns.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
