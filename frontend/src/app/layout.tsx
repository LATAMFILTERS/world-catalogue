import type { Metadata } from 'next';
import Script from 'next/script';
import { Titillium_Web, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import Analytics from '@/components/Analytics';

const titilliumWeb = Titillium_Web({ subsets: ['latin'], variable: '--font-titillium', weight: ['300', '400', '600', '700'] });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', weight: ['400', '500'] });

const GA_ID = 'G-T7STY4TY9C';

const BASE_URL = 'https://elimfilters.com';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ELIMFILTERS® | Industrial Asset Protection & Contamination Control Systems',
    template: '%s | ELIMFILTERS®',
  },
  description:
    'ELIMFILTERS® is an Industrial Asset Protection Technology company. Engineered contamination control systems for equipment reliability, operational continuity, and asset lifecycle extension across mining, agriculture, marine, and heavy industry.',
  keywords: [
    'industrial asset protection', 'contamination control', 'equipment reliability',
    'operational continuity', 'lifecycle extension', 'reliability engineering',
    'downtime reduction', 'industrial reliability', 'asset protection technology',
    'contamination control systems', 'hydraulic contamination control',
    'fuel contamination control', 'air intake protection', 'lube oil cleanliness',
    'ISO 16889', 'ISO 5011', 'ISO 4406', 'ISO 19438',
    'mining equipment protection', 'agriculture filtration', 'marine asset protection',
    'ELIMFILTERS®', 'Kleo Technologies',
  ],
  authors: [{ name: 'ELIMFILTERS® | Kleo Technologies', url: BASE_URL }],
  creator: 'ELIMFILTERS®',
  publisher: 'Kleo Technologies',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'ELIMFILTERS® — Industrial Asset Protection',
    title: 'ELIMFILTERS® | Industrial Asset Protection & Contamination Control Systems',
    description: 'Engineered contamination control systems for equipment reliability, operational continuity, and asset lifecycle extension. Mining, agriculture, marine, oil & gas, and heavy industry.',
    url: BASE_URL,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS® Industrial Asset Protection' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: 'ELIMFILTERS® | Industrial Asset Protection',
    description: 'Engineered contamination control for equipment reliability, uptime, and asset lifecycle extension.',
    images: ['/assets/logo-elimfilters.png'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ELIMFILTERS®',
  alternateName: 'ELIMFILTERS by Kleo Technologies',
  url: BASE_URL,
  logo: `${BASE_URL}/assets/logo-elimfilters.png`,
  description: 'ELIMFILTERS® is an Industrial Asset Protection Technology company engineered by Kleo Technologies. Contamination control systems that improve equipment reliability, operational continuity, and asset lifecycle across mining, agriculture, marine, oil & gas, and heavy industry.',
  foundingLocation: 'Frisco, Texas, USA',
  areaServed: 'Worldwide',
  knowsAbout: [
    'Industrial Asset Protection',
    'Contamination Control',
    'Equipment Reliability Engineering',
    'ISO 16889 Filtration Standards',
    'ISO 4406 Cleanliness Codes',
    'Hydraulic System Protection',
    'Fuel System Contamination Control',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'technical support',
    url: `${BASE_URL}/contact`,
    availableLanguage: ['English', 'Spanish', 'Portuguese', 'French'],
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'Kleo Technologies',
    description: 'Industrial Research & Engineering Division',
  },
  sameAs: ['https://www.linkedin.com/company/elimfilters', 'https://www.instagram.com/elimfilters.global'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'ELIMFILTERS® Asset Protection Systems',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Asset Protection by Industry', url: `${BASE_URL}/industries` },
      { '@type': 'OfferCatalog', name: 'Contamination Control Systems', url: `${BASE_URL}/systems` },
      { '@type': 'OfferCatalog', name: 'Proprietary Protection Technologies', url: `${BASE_URL}/technologies` },
      { '@type': 'OfferCatalog', name: 'Knowledge System', url: `${BASE_URL}/knowledge-system` },
    ],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ELIMFILTERS® World Catalogue',
  url: BASE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://part-search.elimfilters.com?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${titilliumWeb.variable} ${jetBrainsMono.variable}`}>
      <head>
        <meta name="theme-color" content="#000000" />
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
        <Analytics />
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
