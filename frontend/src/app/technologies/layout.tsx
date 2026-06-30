import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proprietary Filtration Technologies',
  description: 'ELIMFILTERS 12 proprietary filtration technologies: MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, HYDROCORE, TURBOCORE, THERMACORE, DRYCORE, INTEKCORE, DURATECH, MARINECLEAN, MICROKAPPA.',
  keywords: ['SYNTRAX filter technology', 'NANOFORCE filtration', 'INTEKCORE fuel filter', 'MACROCORE air filter', 'proprietary filtration technology', 'ELIMFILTERS'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies/',
  },
  openGraph: {
    title: 'Proprietary Filtration Technologies',
    description: 'ELIMFILTERS 12 proprietary filtration technologies: MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, HYDROCORE, TURBOCORE, THERMACORE, DRYCORE, INTEKCORE, DURATECH, MARINECLEAN, MICROKAPPA.',
    url: 'https://elimfilters.com/technologies',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Proprietary Filtration Technologies',
    description: 'ELIMFILTERS 12 proprietary filtration technologies: MACROCORE, NANOFORCE, SYNTRAX, SYNTEPORE, HYDROCORE, TURBOCORE, THERMACORE, DRYCORE, INTEKCORE, DURATECH, MARINECLEAN, MICROKAPPA.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
