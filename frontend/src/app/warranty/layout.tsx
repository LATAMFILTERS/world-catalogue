import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warranty & Quality Guarantee | ELIMFILTERS',
  description: 'ELIMFILTERS warranty program and quality guarantee for all industrial filtration systems. ISO-certified manufacturing with zero-bypass performance standards.',
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
    title: 'Warranty & Quality Guarantee | ELIMFILTERS',
    description: 'ELIMFILTERS warranty program and quality guarantee for all industrial filtration systems.',
    url: 'https://elimfilters.com/warranty',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function WarrantyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
