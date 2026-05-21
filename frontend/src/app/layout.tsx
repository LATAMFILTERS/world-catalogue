import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';

const GA_ID = 'G-T7STY4TY9C';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ELIMFILTERS — World Catalogue | Industrial Filtration Systems',
    template: '%s | ELIMFILTERS',
  },
  description:
    'ELIMFILTERS World Catalogue: 12 industries, 12 products, 12 proprietary technologies. Asset protection filtration engineered for maximum performance in mining, agriculture, marine, and heavy industry.',
  keywords: [
    'industrial filtration', 'asset protection filters', 'air filters industrial',
    'fuel filters heavy duty', 'hydraulic filters', 'oil filters industrial',
    'mining filtration', 'agriculture filtration', 'marine filtration',
    'SYNTRAX filter', 'NANOFORCE filter', 'AQUAGUARD filter', 'ELIMFILTERS',
  ],
  authors: [{ name: 'ELIMFILTERS', url: BASE_URL }],
  creator: 'ELIMFILTERS',
  publisher: 'ELIMFILTERS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'ELIMFILTERS World Catalogue',
    title: 'ELIMFILTERS — World Catalogue | Industrial Filtration Systems',
    description: 'Asset protection filtration for mining, agriculture, marine and heavy industry. 12 industries · 12 systems · 12 proprietary technologies.',
    url: BASE_URL,
    images: [{ url: '/assets/logo-elimfilters.png', width: 800, height: 400, alt: 'ELIMFILTERS World Catalogue' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ELIMFILTERS — World Catalogue',
    description: 'Asset protection filtration for mining, agriculture, marine and heavy industry.',
    images: ['/assets/logo-elimfilters.png'],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      'en': BASE_URL,
      'es': BASE_URL,
      'fr': BASE_URL,
      'it': BASE_URL,
      'nl': BASE_URL,
      'ru': BASE_URL,
      'zh': BASE_URL,
      'ja': BASE_URL,
      'ar': BASE_URL,
      'fa': BASE_URL,
      'pt': BASE_URL,
    },
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ELIMFILTERS',
  url: BASE_URL,
  logo: `${BASE_URL}/assets/logo-elimfilters.png`,
  description: 'Industrial asset protection filtration systems engineered for mining, agriculture, marine, power generation, and heavy industry.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    url: `${BASE_URL}/contact`,
    availableLanguage: ['English', 'Spanish'],
  },
  sameAs: [],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'ELIMFILTERS World Catalogue',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Industrial Filtration by Industry', url: `${BASE_URL}/industries` },
      { '@type': 'OfferCatalog', name: 'Filtration Systems', url: `${BASE_URL}/systems` },
      { '@type': 'OfferCatalog', name: 'Proprietary Technologies', url: `${BASE_URL}/technologies` },
    ],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ELIMFILTERS World Catalogue',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://part-search.elimfilters.com?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { page_path: window.location.pathname });
          `}
        </Script>
      </body>
    </html>
  );
}
