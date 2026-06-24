import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'ELIMFILTERS® Proprietary Filtration Technologies — 12 Engineered Systems',
  },
  description: "ELIMFILTERS®' 12 proprietary technologies achieve up to 99.98% contamination interception across fuel, air, hydraulic, coolant, and cabin systems for mining, marine, and heavy industry.",
  keywords: ['SYNTRAX filter technology', 'NANOFORCE filtration', 'HYDROCORE fuel filter', 'MACROCORE air filter', 'proprietary filtration technology', 'ELIMFILTERS®'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies/',
  },
  openGraph: {
    title: 'ELIMFILTERS® Proprietary Filtration Technologies — 12 Engineered Systems',
    description: "12 engineered systems achieving up to 99.98% contamination interception across fuel, air, hydraulic, coolant, and cabin systems for mining, marine, and heavy industry.",
    url: 'https://elimfilters.com/technologies/',
    type: 'website',
    siteName: 'ELIMFILTERS® World Catalogue',
    images: [{ url: 'https://elimfilters.com/assets/logo-elimfilters.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELIMFILTERS® Proprietary Filtration Technologies — 12 Engineered Systems',
    description: "12 engineered systems achieving up to 99.98% contamination interception across fuel, air, hydraulic, coolant, and cabin systems for mining, marine, and heavy industry.",
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
