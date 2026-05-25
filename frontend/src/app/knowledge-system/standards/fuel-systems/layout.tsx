import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Fuel Filtration Systems — ASTM D6304, ISO 12937 | ELIMFILTERS',
  },
  description: 'Fuel filtration engineering: ASTM D6304 water content testing, ISO 12937 Karl Fischer method, Common Rail injection protection, and diesel contamination control standards.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/fuel-systems/',
  },
  openGraph: {
    title: 'Fuel Filtration Systems — ASTM D6304, ISO 12937 | ELIMFILTERS',
    description: 'Fuel filtration engineering: ASTM D6304 water content testing, ISO 12937 Karl Fischer method, Common Rail injection protection, and diesel contamination control standards.',
    url: 'https://elimfilters.com/knowledge-system/standards/fuel-systems/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuel Filtration Systems — ASTM D6304, ISO 12937 | ELIMFILTERS',
    description: 'Fuel filtration engineering: ASTM D6304 water content testing, ISO 12937 Karl Fischer method, Common Rail injection protection, and diesel contamination control standards.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
