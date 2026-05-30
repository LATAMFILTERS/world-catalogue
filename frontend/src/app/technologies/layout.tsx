import type { Metadata } from 'next';

const DESC = 'ELIMFILTERS® 12 proprietary technologies — MACROCORE™, NANOFORCE™, AQUAGUARD™, SYNTRAX™, MICROKAPPA™ — achieve up to 99.98% interception across air, fuel, hydraulic, and cabin systems.';

export const metadata: Metadata = {
  title: 'Proprietary Industrial Filtration Technologies | ELIMFILTERS®',
  description: DESC,
  keywords: ['SYNTRAX filter technology', 'NANOFORCE filtration', 'AQUAGUARD fuel filter', 'MACROCORE air filter', 'proprietary filtration technology', 'ELIMFILTERS®'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies/',
  },
  openGraph: {
    title: 'Proprietary Industrial Filtration Technologies | ELIMFILTERS®',
    description: DESC,
    url: 'https://elimfilters.com/technologies/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'Proprietary Industrial Filtration Technologies | ELIMFILTERS®',
    description: DESC,
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
