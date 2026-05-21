import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact ELIMFILTERS | Industrial Filtration Experts',
  description: 'Contact ELIMFILTERS for industrial filtration solutions, OEM cross-references, distributor inquiries, and technical support for your fleet or operation.',
  alternates: {
    canonical: 'https://elimfilters.com/contact',
    languages: {
      en: 'https://elimfilters.com/contact', es: 'https://elimfilters.com/contact',
      fr: 'https://elimfilters.com/contact', it: 'https://elimfilters.com/contact',
      nl: 'https://elimfilters.com/contact', ru: 'https://elimfilters.com/contact',
      zh: 'https://elimfilters.com/contact', ja: 'https://elimfilters.com/contact',
      ar: 'https://elimfilters.com/contact', fa: 'https://elimfilters.com/contact',
      pt: 'https://elimfilters.com/contact',
    },
  },
  openGraph: {
    title: 'Contact ELIMFILTERS | Industrial Filtration Experts',
    description: 'Contact ELIMFILTERS for industrial filtration solutions, OEM cross-references, and technical support.',
    url: 'https://elimfilters.com/contact',
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
