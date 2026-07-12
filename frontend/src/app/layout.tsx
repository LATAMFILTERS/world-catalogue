import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './hero-responsive.css';
import './home-emergency-restore.css';
import './systems-cleanup.css';
import './air-intake-hero-restore.css';
import './air-intake-visible-cleanup.css';
import './core-systems-editorial.css';
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
    'construction equipment filters', 'fleet maintenance filters', 'industrial air filtration',
    'engine protection systems', 'equipment reliability', 'downtime reduction',
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
          <ChatBot />
          <ConsentBanner />
          <Analytics />
        </ClientProviders>
      </body>
    </html>
  );
}
