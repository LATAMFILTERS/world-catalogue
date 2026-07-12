import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './hero-responsive.css';
import './home-emergency-restore.css';
import './systems-cleanup.css';
import './air-intake-hero-restore.css';
import { ClientProviders } from '@/components/ClientProviders';
import Analytics from '@/components/Analytics';
import ConsentBanner from '@/components/ConsentBanner';
import ChatBot from '@/components/ui/ChatBot';

const GA_ID = 'G-T7STY4TY9C';

const BASE_URL = 'https://elimfilters.com';
const BRAND_TITLE = 'ELIMFILTERS | Total Asset Protection Systems';
const BRAND_DESCRIPTION = 'ELIMFILTERS engineers Total Asset Protection Systems that control contamination, reduce equipment wear, minimize downtime, improve reliability, and extend the operational life of critical industrial assets across mining, construction, agriculture, power generation, marine, and heavy-duty transportation.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: BRAND_TITLE,
    template: '%s | ELIMFILTERS',
  },
  description: BRAND_DESCRIPTION,
  keywords: [
    'total asset protection systems', 'industrial asset protection', 'industrial filtration',
    'contamination control systems', 'air filters industrial', 'fuel filters heavy duty',
    'hydraulic filters', 'oil filters industrial', 'mining filtration',
    'agriculture filtration', 'marine filtration', 'SYNTRAX filter',
    'NANOFORCE filter', 'INTEKCORE', 'ELIMFILTERS',
  ],
  authors: [{ name: 'ELIMFILTERS', url: BASE_URL }],
  creator: 'ELIMFILTERS',
  publisher: 'ELIMFILTERS',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/images/logo.svg',
    shortcut: '/images/logo.svg',
    apple: '/images/logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'ELIMFILTERS World Catalogue',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    images: [
      {
        url: `${BASE_URL}/images/logo.svg`,
        width: 1200,
        height: 630,
        alt: 'ELIMFILTERS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    images: [`${BASE_URL}/images/logo.svg`],
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-T7STY4TY9C" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </head>
      <body>
        <ClientProviders>
          {children}
          <ConsentBanner />
          <Analytics />
          <ChatBot />
        </ClientProviders>
      </body>
    </html>
  );
}
