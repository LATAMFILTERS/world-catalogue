import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proprietary Filtration Technologies | ELIMFILTERS',
  description: 'Explore 12 proprietary ELIMFILTERS technologies: SYNTRAX™, NANOFORCE™, AQUAGUARD™, MACROCORE™, DRYCORE™, COOLTECH™, DURATECH™, MARINECLEAN™ and more engineered for asset protection.',
  keywords: ['SYNTRAX filter technology', 'NANOFORCE filtration', 'AQUAGUARD fuel filter', 'MACROCORE air filter', 'proprietary filtration technology', 'ELIMFILTERS'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies/',
  },
  openGraph: {
    title: 'Proprietary Filtration Technologies | ELIMFILTERS',
    description: 'Explore 12 proprietary technologies engineered for asset protection and contamination control.',
    url: 'https://elimfilters.com/technologies/',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
