import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import './hero-responsive.css';
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
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    siteName: 'ELIMFILTERS',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    url: BASE_URL,
    images: [{ url: '/assets/logo-elimfilters.png', width: 1200, height: 630, alt: 'ELIMFILTERS Total Asset Protection Systems' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@elimfilters',
    title: BRAND_TITLE,
    description: BRAND_DESCRIPTION,
    images: ['/assets/logo-elimfilters.png'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'ELIMFILTERS',
  alternateName: 'ELIMFILTERS Total Asset Protection Systems',
  slogan: 'Total Asset Protection Systems',
  url: BASE_URL,
  logo: `${BASE_URL}/assets/logo-elimfilters.png`,
  description: BRAND_DESCRIPTION,
  foundingLocation: 'Frisco, Texas, USA',
  areaServed: 'Worldwide',
  knowsAbout: [
    'Total Asset Protection Systems',
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
  sameAs: ['https://www.linkedin.com/company/133064152/', 'https://www.facebook.com/elimfilters/', 'https://www.instagram.com/elimfilters.global', 'https://x.com/elimfilters', 'https://www.youtube.com/@elimfilters9112'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'ELIMFILTERS Total Asset Protection Platform',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Asset Protection by Industry', url: `${BASE_URL}/industries` },
      { '@type': 'OfferCatalog', name: 'Contamination Control Systems', url: `${BASE_URL}/systems` },
      { '@type': 'OfferCatalog', name: 'Product Families', url: `${BASE_URL}/families` },
      { '@type': 'OfferCatalog', name: 'Proprietary Protection Technologies', url: `${BASE_URL}/technologies` },
      { '@type': 'OfferCatalog', name: 'Knowledge Center', url: `${BASE_URL}/knowledge-center` },
    ],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ELIMFILTERS',
  alternateName: 'ELIMFILTERS Total Asset Protection Systems',
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
        <meta name="theme-color" content="#000000" />
        {/* Build-safe font variables: system fallbacks avoid Google Fonts network fetches during static export. */}
        <style>{`
          :root {
            --font-inter: Barlow, Arial, Helvetica, sans-serif;
            --font-display: 'Chakra Petch', 'Arial Narrow', Impact, sans-serif;
            --font-mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;
          }
        `}</style>
        {/* Cloudflare Turnstile — loaded globally, used by contact/distributor forms and chat widget */}
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
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
        {/* Skip to main content — keyboard/screen reader accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <Analytics />
        <ConsentBanner />
        <ClientProviders>
          <div id="main-content">
            {children}
          </div>
          <ChatBot />
        </ClientProviders>
        {/* ® in headings: wrap as small superscript so it doesn't look oversized */}
        <Script id="reg-in-headings" strategy="afterInteractive">{`
          (function(){
            function wrapReg(root){
              var heads = root.querySelectorAll('h1,h2,h3,h4');
              heads.forEach(function(h){
                h.innerHTML = h.innerHTML.replace(/®/g,'<span class="reg-sup">®</span>');
              });
            }
            wrapReg(document);
            var obs = new MutationObserver(function(muts){
              muts.forEach(function(m){ m.addedNodes.forEach(function(n){ if(n.nodeType===1) wrapReg(n); }); });
            });
            obs.observe(document.body,{childList:true,subtree:true});
          })();
        `}</Script>
      </body>
    </html>
  );
}
