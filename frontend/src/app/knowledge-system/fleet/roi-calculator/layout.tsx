import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Filtration ROI Calculator — Fleet Economic Analysis | ELIMFILTERS',
  },
  description: 'Calculate return on investment for system-level filtration programs versus commodity filter approaches in industrial fleet operations.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/fleet/roi-calculator/',
  },
  openGraph: {
    title: 'Filtration ROI Calculator — Fleet Economic Analysis | ELIMFILTERS',
    description: 'Calculate return on investment for system-level filtration programs versus commodity filter approaches in industrial fleet operations.',
    url: 'https://elimfilters.com/knowledge-system/fleet/roi-calculator/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Filtration ROI Calculator — Fleet Economic Analysis | ELIMFILTERS',
    description: 'Calculate return on investment for system-level filtration programs versus commodity filter approaches in industrial fleet operations.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
