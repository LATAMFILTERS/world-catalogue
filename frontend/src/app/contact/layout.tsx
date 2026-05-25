import type { Metadata } from 'next';

const CANONICAL = 'https://elimfilters.com/contact/';

export const metadata: Metadata = {
  title: {
    absolute: 'Contact ELIMFILTERS | Industrial Filtration Support',
  },
  description:
    'Contact ELIMFILTERS for filtration support across 12 industrial sectors — mining, agriculture, marine, and more. ISO-compliant OEM cross-references and technical support. We respond within 2 business days.',
  alternates: {
    canonical: CANONICAL,
    languages: {
      'x-default': CANONICAL,
      en: CANONICAL,
    },
  },
  openGraph: {
    title: 'Contact ELIMFILTERS | Industrial Filtration Support',
    description:
      'Contact ELIMFILTERS for industrial filtration solutions, OEM cross-references, and technical support.',
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    images: [
      {
        url: 'https://elimfilters.com/assets/logo-elimfilters.png',
        width: 1200,
        height: 630,
        alt: 'Contact ELIMFILTERS — Industrial Filtration Support',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact ELIMFILTERS | Industrial Filtration Support',
    description:
      'Reach our global filtration team for technical support, OEM cross-references, and distributor inquiries.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
