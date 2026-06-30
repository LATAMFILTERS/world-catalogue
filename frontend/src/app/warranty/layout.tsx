import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warranty & Support',
  description: 'ELIMFILTERS warranty covers equipment protection with comprehensive support and immediate replacement guarantee. 10K km / 1000 hr minimum coverage, 100% non-prorated, 24H response.',
  alternates: {
    canonical: 'https://elimfilters.com/warranty',
    languages: {
      en: 'https://elimfilters.com/warranty', es: 'https://elimfilters.com/warranty',
      fr: 'https://elimfilters.com/warranty', it: 'https://elimfilters.com/warranty',
      nl: 'https://elimfilters.com/warranty', ru: 'https://elimfilters.com/warranty',
      zh: 'https://elimfilters.com/warranty', ja: 'https://elimfilters.com/warranty',
      ar: 'https://elimfilters.com/warranty', fa: 'https://elimfilters.com/warranty',
      pt: 'https://elimfilters.com/warranty',
    },
  },
  openGraph: {
    title: 'Warranty & Support',
    description: 'ELIMFILTERS warranty covers equipment protection with comprehensive support and immediate replacement guarantee. 10K km / 1000 hr minimum coverage, 100% non-prorated, 24H response.',
    url: 'https://elimfilters.com/warranty',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
