import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proprietary Technologies | ELIMFILTERS World Catalogue',
  description: 'Explore 12 ELIMFILTERS proprietary filtration technologies: SYNTRAX™, NANOFORCE™, AQUAGUARD™, MACROCORE™, DRYCORE™, COOLTECH™, DURATECH™, MARINECLEAN™ and more.',
  keywords: ['SYNTRAX filter technology', 'NANOFORCE filtration', 'AQUAGUARD fuel filter', 'MACROCORE air filter', 'proprietary filtration technology', 'ELIMFILTERS'],
  alternates: {
    canonical: 'https://elimfilters.com/technologies',
    languages: {
      en: 'https://elimfilters.com/technologies', es: 'https://elimfilters.com/technologies',
      fr: 'https://elimfilters.com/technologies', it: 'https://elimfilters.com/technologies',
      nl: 'https://elimfilters.com/technologies', ru: 'https://elimfilters.com/technologies',
      zh: 'https://elimfilters.com/technologies', ja: 'https://elimfilters.com/technologies',
      ar: 'https://elimfilters.com/technologies', fa: 'https://elimfilters.com/technologies',
      pt: 'https://elimfilters.com/technologies',
    },
  },
  openGraph: {
    title: 'Proprietary Technologies | ELIMFILTERS World Catalogue',
    description: 'Explore 12 ELIMFILTERS proprietary filtration technologies engineered for maximum asset protection.',
    url: 'https://elimfilters.com/technologies',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function TechnologiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
