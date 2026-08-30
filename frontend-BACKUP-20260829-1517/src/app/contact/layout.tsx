import type { Metadata } from 'next';

const CANONICAL = 'https://elimfilters.com/contact/';

export const metadata: Metadata = {
  title: 'Contact & Technical Support',
  description:
    'Contact ELIMFILTERS for technical validation, authorized distributor inquiries, and asset protection consultations. Available globally for mining, agriculture, marine, and heavy industry.',
  alternates: {
    canonical: CANONICAL,
    languages: {
      'x-default': CANONICAL,
      en: CANONICAL,
    },
  },
  openGraph: {
    title: 'Contact & Technical Support',
    description:
      'Contact ELIMFILTERS for technical validation, authorized distributor inquiries, and asset protection consultations. Available globally for mining, agriculture, marine, and heavy industry.',
    url: CANONICAL,
    type: 'website',
    siteName: 'ELIMFILTERS',
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
      'Reach ELIMFILTERS for technical support, OEM cross-reference intake, and authorized distributor inquiries.',
    images: ['https://elimfilters.com/assets/logo-elimfilters.png'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
