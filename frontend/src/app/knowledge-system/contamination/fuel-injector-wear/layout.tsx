import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Fuel Injector Wear from Contamination — HPCR Failure Modes | ELIMFILTERS',
  },
  description: 'Fuel injector wear from contamination: HPCR injector stiction, abrasive seat wear, and water emulsification failure mechanisms in high-pressure common rail diesel fuel systems.',
  alternates: {
    canonical: 'https://elimfilters.com/knowledge-system/contamination/fuel-injector-wear/',
  },
  openGraph: {
    title: 'Fuel Injector Wear from Contamination — HPCR Failure Modes | ELIMFILTERS',
    description: 'Fuel injector wear from contamination: HPCR injector stiction, abrasive seat wear, and water emulsification failure mechanisms in high-pressure common rail diesel fuel systems.',
    url: 'https://elimfilters.com/knowledge-system/contamination/fuel-injector-wear/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fuel Injector Wear from Contamination — HPCR Failure Modes | ELIMFILTERS',
    description: 'Fuel injector wear from contamination: HPCR injector stiction, abrasive seat wear, and water emulsification failure mechanisms in high-pressure common rail diesel fuel systems.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
