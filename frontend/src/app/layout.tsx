import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './hero-responsive.css';
import './home-emergency-restore.css';
import './systems-cleanup.css';
import './air-intake-hero-restore.css';
import './air-intake-visible-cleanup.css';
import './core-systems-editorial.css';
import './air-intake-narrative-section-fix.css';
import './industries-risk-title-tweak.css';
import './commercial-knowledge-visibility-guard.css';
import './mobile-aesthetic-polish.css';
import './mobile-critical-fix.css';
import './mobile-critical-layout-fixes.css';
import { ClientProviders } from '@/components/ClientProviders';
import { MiningHeroCleanup } from '@/components/MiningHeroCleanup';
import { MobileInternalLayoutFix } from '@/components/MobileInternalLayoutFix';
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
  applicationName: 'ELIMFILTERS',
  keywords: [
    'industrial filtration',
    'asset protection systems',
    'contamination control',
    'heavy duty filters',
    'hydraulic filtration',
    'fuel filtration',
    'air intake filtration',
    'ELIMFILTERS',
  ],
  authors: [{ name: 'ELIMFILTERS' }],
  creator: 'ELIMFILTERS',
  publisher: 'ELIMFILTERS',
  category: 'Industrial Filtration',
  alternates: { canonical: BASE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'ELIMFILTERS',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    images: ['/assets/logo-elimfilters.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`}
        </Script>
        <ClientProviders>
          {children}
          <MiningHeroCleanup />
          <MobileInternalLayoutFix />
          <Analytics />
          <ConsentBanner />
          <ChatBot />
        </ClientProviders>
      </body>
    </html>
  );
}
