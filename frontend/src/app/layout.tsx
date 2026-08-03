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
import './technologies-mobile-fix.css';
import { ClientProviders } from '@/components/ClientProviders';
import { MiningHeroCleanup } from '@/components/MiningHeroCleanup';
import { MobileInternalLayoutFix } from '@/components/MobileInternalLayoutFix';
import Analytics from '@/components/analytics';
import CommercialAnalytics from '@/components/CommercialAnalytics';
import ConsentBanner from '@/components/ConsentBanner';
import ChatBotRouteGuard from '@/components/ui/ChatBotRouteGuard';
import WebVitalsTracker from '@/components/WebVitalsTracker';
import VideoAnalytics from '@/components/VideoAnalytics';
import AggregateRatingSchema from '@/components/AggregateRatingSchema';

const BASE_URL = 'https://elimfilters.com';
const GA_ID = 'G-0XJP6FLV55';
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
  alternates: {
    canonical: '/',
  },
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
      <head>
        <Script id="ga4-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500
            });
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              send_page_view: false,
              anonymize_ip: true
            });
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
      </head>
      <body>
        <ClientProviders>
          <AggregateRatingSchema />
          {children}
          <WebVitalsTracker />
          <VideoAnalytics />
          <MiningHeroCleanup />
          <MobileInternalLayoutFix />
          <Analytics />
          <CommercialAnalytics />
          <ConsentBanner />
          <ChatBotRouteGuard />
        </ClientProviders>
      </body>
    </html>
  );
}
