import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'ISO 5011 Air Filter Test Standard — Intake Air Filtration | ELIMFILTERS',
  },
  description: 'ISO 5011 air filter test standard: filtration efficiency measurement, pressure drop testing, dust capacity evaluation, and certification criteria for intake air filtration in combustion engines.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/standards/iso-5011/',
  },
  openGraph: {
    title: 'ISO 5011 Air Filter Test Standard — Intake Air Filtration | ELIMFILTERS',
    description: 'ISO 5011 air filter test standard: filtration efficiency measurement, pressure drop testing, dust capacity evaluation, and certification criteria for intake air filtration in combustion engines.',
    url: 'https://elimfilters.com/knowledge-system/standards/iso-5011/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ISO 5011 Air Filter Test Standard — Intake Air Filtration | ELIMFILTERS',
    description: 'ISO 5011 air filter test standard: filtration efficiency measurement, pressure drop testing, dust capacity evaluation, and certification criteria for intake air filtration in combustion engines.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
