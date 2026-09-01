import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './phase4-site.css';
import { ClientProviders } from '@/components/ClientProviders';
import { MiningHeroCleanup } from '@/components/MiningHeroCleanup';
import { MobileInternalLayoutFix } from '@/components/MobileInternalLayoutFix';
import Analytics from '@/components/Analytics';
import CommercialAnalytics from '@/components/CommercialAnalytics';
import ConsentBanner from '@/components/ConsentBanner';
import ChatBotRouteGuard from '@/components/ui/ChatBotRouteGuard';
import WebVitalsTracker from '@/components/WebVitalsTracker';
import VideoAnalytics from '@/components/VideoAnalytics';
import PostHogAnalytics from '@/components/PostHogAnalytics';
import UserRegistrationTracker from '@/components/UserRegistrationTracker';
import SchemaMarkup from '@/components/SchemaMarkup';
import SkipNavigation from '@/components/SkipNavigation';
import { Navigation } from '@/components/Navigation';

const BASE_URL = 'https://elimfilters.com';
const GA_ID = 'G-0XJP6FLV55';
const BRAND_TITLE = 'ELIMFILTERS | Total Asset Protection Systems';
const BRAND_DESCRIPTION = 'ELIMFILTERS engineers Total Asset Protection Systems that control contamination, reduce equipment wear, minimize downtime, improve reliability, and extend the operational life of critical industrial assets across mining, construction, agriculture, power generation, marine, and heavy-duty transportation.';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: BRAND_TITLE,
    // Child routes already carry their approved ELIMFILTERS suffix. Do not append it twice.
    template: '%s',
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
    url: `${BASE_URL}/`,
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
        <SchemaMarkup />
        {/*
          Motion (framer-motion) SSR-renders each animated element's
          `initial` state directly as an inline style, e.g.
          style="opacity:0;transform:translateY(28px)" — including the
          homepage H1 and 50+ other elements. Motion's own script then
          animates it to visible once it hydrates. If that script is slow
          (throttled connection), blocked, or errors out anywhere else on
          the page and hydration never completes, the element stays at
          opacity:0 forever — real content becomes permanently invisible
          with no failure indication.
          This is a pure-CSS fail-safe, independent of Motion ever
          running: if an element is still sitting at inline opacity:0
          after 4s, force it visible. Once Motion does hydrate (the
          normal case), it re-renders those elements with animate/style
          and this rule simply never has anything left to do.
          No !important on the keyframe target: it is invalid inside
          @keyframes and browsers silently drop the whole declaration
          rather than just ignoring the !important flag (confirmed via
          the live CSSOM: the rule serialized as `100% { }`, completely
          empty, so this fail-safe never actually applied anywhere since
          it first shipped). A plain (non-important) CSS animation
          already sits above normal-priority author styles -- including
          a plain inline style="opacity:0" with no !important of its
          own -- so no !important is needed here for the override to win.
        */}
        <style>{`
          [style*="opacity:0;"],[style$="opacity:0"]{animation:elim-force-visible 0s 4s forwards}
          @keyframes elim-force-visible{to{opacity:1;transform:none}}
        `}</style>
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
          <SkipNavigation />
          <Navigation />
          {children}
          <WebVitalsTracker />
          <VideoAnalytics />
          <MiningHeroCleanup />
          <MobileInternalLayoutFix />
          <Analytics />
          <CommercialAnalytics />
          <PostHogAnalytics />
          <UserRegistrationTracker />
          <ConsentBanner />
          <ChatBotRouteGuard />
        </ClientProviders>
      </body>
    </html>
  );
}
